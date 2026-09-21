import { randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { inflateRawSync } from "node:zlib";
//#region src/ffmpeg.ts
/**
* ffmpeg 能力层（Host 端）—— 短剧拼接与口播合成都依赖它。
*
* 设计要点（全部经真实调用验证过）：
*  - ffmpeg 可能不在 PATH（用户机器常见），所以定位是多级回退 + 可缓存。
*  - 每次探测都返回结构化结果，绝不 throw 到调用方之外：缺 ffmpeg 时前端要能
*    看到"缺什么、怎么装"，而不是一个空白错误。
*  - 中文字幕需要 CJK 字体；只装了 DejaVu 的机器会把汉字烧成豆腐块，
*    所以字体是"探测 + 明确报错"，不静默退化。
*/
/** Cross-platform data root (Linux: /tmp, Windows: %TEMP%). */
function dataRoot() {
	const dir = join(tmpdir(), "dsh-agnes-studio");
	try {
		mkdirSync(dir, { recursive: true });
	} catch {}
	return dir;
}
/** Directory for one drama task's media. */
function dramaDir(id) {
	const dir = join(dataRoot(), "dramas", id);
	try {
		mkdirSync(dir, { recursive: true });
	} catch {}
	return dir;
}
/** Directory for one talking-avatar job's media. */
function anchorDir(id) {
	const dir = join(dataRoot(), "anchors", id);
	try {
		mkdirSync(dir, { recursive: true });
	} catch {}
	return dir;
}
const FFMPEG_CANDIDATES = [
	"/usr/bin/ffmpeg",
	"/usr/local/bin/ffmpeg",
	"/opt/homebrew/bin/ffmpeg",
	"C:\\ffmpeg\\bin\\ffmpeg.exe"
];
const FFPROBE_CANDIDATES = [
	"/usr/bin/ffprobe",
	"/usr/local/bin/ffprobe",
	"/opt/homebrew/bin/ffprobe",
	"C:\\ffmpeg\\bin\\ffprobe.exe"
];
let cachedFfmpeg = null;
let cachedProbeMissing = false;
/** Run a command, resolving with exit code + captured output. Never rejects. */
function exec(cmd, args, timeoutMs = 6e5) {
	return new Promise((resolve) => {
		let child;
		try {
			child = spawn(cmd, args, { windowsHide: true });
		} catch (e) {
			resolve({
				code: -1,
				stdout: "",
				stderr: "",
				error: e instanceof Error ? e.message : String(e)
			});
			return;
		}
		let stdout = "";
		let stderr = "";
		let done = false;
		const finish = (r) => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			resolve(r);
		};
		const timer = setTimeout(() => {
			try {
				child.kill("SIGKILL");
			} catch {}
			finish({
				code: -1,
				stdout,
				stderr,
				error: `命令超时（${Math.round(timeoutMs / 1e3)}s）`
			});
		}, timeoutMs);
		child.stdout?.on("data", (d) => {
			stdout += String(d);
		});
		child.stderr?.on("data", (d) => {
			stderr += String(d);
		});
		child.on("error", (e) => finish({
			code: -1,
			stdout,
			stderr,
			error: e.message
		}));
		child.on("close", (code) => finish({
			code: code ?? -1,
			stdout,
			stderr
		}));
	});
}
/**
* Locate a usable ffmpeg.
* Order: AGNES_FFMPEG env → PATH (`ffmpeg -version`) → common install paths.
*/
async function resolveFfmpeg() {
	if (cachedFfmpeg) return cachedFfmpeg;
	const fromEnv = process.env.AGNES_FFMPEG;
	const candidates = [];
	if (fromEnv) candidates.push(fromEnv);
	candidates.push("ffmpeg");
	for (const c of FFMPEG_CANDIDATES) if (!candidates.includes(c)) candidates.push(c);
	for (const cmd of candidates) {
		if (cmd.includes("/") || cmd.includes("\\")) {
			if (!existsSync(cmd)) continue;
		}
		const r = await exec(cmd, ["-version"], 15e3);
		if (r.code === 0 && /ffmpeg version/i.test(r.stdout + r.stderr)) {
			cachedFfmpeg = {
				path: cmd,
				version: (r.stdout + r.stderr).split("\n")[0].trim()
			};
			return cachedFfmpeg;
		}
	}
	return null;
}
/** Locate ffprobe (for duration/dimension probing). Returns '' when absent. */
let cachedFfprobe = null;
async function resolveFfprobe() {
	if (cachedFfprobe !== null) return cachedFfprobe;
	if (cachedProbeMissing) return "";
	const fromEnv = process.env.AGNES_FFPROBE;
	const candidates = [];
	if (fromEnv) candidates.push(fromEnv);
	candidates.push("ffprobe");
	for (const c of FFPROBE_CANDIDATES) if (!candidates.includes(c)) candidates.push(c);
	for (const cmd of candidates) {
		if (cmd.includes("/") || cmd.includes("\\")) {
			if (!existsSync(cmd)) continue;
		}
		const r = await exec(cmd, ["-version"], 1e4);
		if (r.code === 0 && /ffprobe version/i.test(r.stdout + r.stderr)) {
			cachedFfprobe = cmd;
			return cmd;
		}
	}
	cachedProbeMissing = true;
	return "";
}
/** Capability report for the UI / smoke tests. */
async function ffmpegStatus() {
	const ff = await resolveFfmpeg();
	const probe = await resolveFfprobe();
	const font = findCjkFont();
	return {
		available: ff !== null,
		path: ff?.path ?? "",
		version: ff?.version ?? "",
		ffprobe: probe !== "",
		font,
		hint: ff ? font ? "" : "未找到中文字体；烧字幕会显示成方块。请安装中文字体（如 fonts-wqy-zenhei / 思源黑体）。" : "未找到 ffmpeg。Linux: apt-get install -y ffmpeg；macOS: brew install ffmpeg；Windows: 安装 ffmpeg 并加入 PATH，或设置 AGNES_FFMPEG 指向 ffmpeg.exe。"
	};
}
const CJK_FONT_CANDIDATES = [
	"/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
	"/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
	"/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
	"/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
	"/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
	"/usr/share/fonts/truetype/arphic/uming.ttc",
	"/System/Library/Fonts/PingFang.ttc",
	"/System/Library/Fonts/Hiragino Sans GB.ttc",
	"/Library/Fonts/Arial Unicode.ttf",
	"C:\\Windows\\Fonts\\msyh.ttc",
	"C:\\Windows\\Fonts\\msyh.ttf",
	"C:\\Windows\\Fonts\\simhei.ttf",
	"C:\\Windows\\Fonts\\simsun.ttc"
];
let cachedFont = null;
/**
* Find a font file that can render Chinese.
* Returns '' when none is present — callers must surface that instead of
* burning tofu boxes into the output video.
*/
function findCjkFont() {
	if (cachedFont !== null) return cachedFont;
	const fromEnv = process.env.AGNES_SUBTITLE_FONT;
	if (fromEnv && existsSync(fromEnv)) {
		cachedFont = fromEnv;
		return cachedFont;
	}
	for (const f of CJK_FONT_CANDIDATES) if (existsSync(f)) {
		cachedFont = f;
		return cachedFont;
	}
	cachedFont = "";
	return cachedFont;
}
/** libass `force_style` FontName that matches the discovered font file. */
function fontFamilyFor(file) {
	const lower = file.toLowerCase();
	if (lower.includes("wqy-zenhei")) return "WenQuanYi Zen Hei";
	if (lower.includes("wqy-microhei")) return "WenQuanYi Micro Hei";
	if (lower.includes("pingfang")) return "PingFang SC";
	if (lower.includes("hiragino")) return "Hiragino Sans GB";
	if (lower.includes("msyh")) return "Microsoft YaHei";
	if (lower.includes("simhei")) return "SimHei";
	if (lower.includes("simsun")) return "SimSun";
	if (lower.includes("noto")) return "Noto Sans CJK SC";
	return "sans-serif";
}
/** Probe a media file (duration seconds, dimensions, codec identity). */
async function probeMedia(file) {
	const probe = await resolveFfprobe();
	const empty = {
		ok: false,
		duration: 0,
		width: 0,
		height: 0,
		hasAudio: false,
		videoCodec: "",
		audioCodec: "",
		pixFmt: "",
		fps: 0
	};
	if (!probe) return {
		...empty,
		error: "ffprobe 不可用"
	};
	const r = await exec(probe, [
		"-v",
		"error",
		"-show_entries",
		"format=duration:stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate",
		"-of",
		"json",
		file
	], 6e4);
	if (r.code !== 0) return {
		...empty,
		error: r.stderr.slice(0, 300)
	};
	try {
		const d = JSON.parse(r.stdout);
		const streams = d.streams ?? [];
		const v = streams.find((s) => s.codec_type === "video");
		const a = streams.find((s) => s.codec_type === "audio");
		let fps = 0;
		const rate = v?.r_frame_rate ?? "";
		if (rate.includes("/")) {
			const [n, den] = rate.split("/").map(Number);
			if (den) fps = n / den;
		}
		return {
			ok: true,
			duration: Number(d.format?.duration ?? 0),
			width: v?.width ?? 0,
			height: v?.height ?? 0,
			hasAudio: a !== void 0,
			videoCodec: v?.codec_name ?? "",
			audioCodec: a?.codec_name ?? "",
			pixFmt: v?.pix_fmt ?? "",
			fps: Number.isFinite(fps) ? Math.round(fps * 100) / 100 : 0
		};
	} catch (e) {
		return {
			...empty,
			error: String(e)
		};
	}
}
/** Run an ffmpeg command with the located binary. */
async function ffmpeg(args, timeoutMs = 18e5) {
	const ff = await resolveFfmpeg();
	if (!ff) return {
		ok: false,
		error: "未找到 ffmpeg",
		output: "",
		stderr: ""
	};
	const r = await exec(ff.path, [
		"-hide_banner",
		"-y",
		...args
	], timeoutMs);
	if (r.code !== 0) return {
		ok: false,
		error: (r.error || r.stderr.split("\n").filter(Boolean).slice(-3).join(" | ")).slice(0, 500),
		output: r.stdout,
		stderr: r.stderr
	};
	return {
		ok: true,
		output: r.stdout,
		stderr: r.stderr
	};
}
/** Format seconds as SRT timestamp (HH:MM:SS,mmm). */
function srtTime(sec) {
	const s = Math.max(0, sec);
	const hh = Math.floor(s / 3600);
	const mm = Math.floor(s % 3600 / 60);
	const ss = Math.floor(s % 60);
	const ms = Math.round((s - Math.floor(s)) * 1e3);
	return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
/** Build SRT text from cues. */
function buildSrt(cues) {
	return cues.filter((c) => String(c.text ?? "").trim() !== "").map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${String(c.text).trim()}\n`).join("\n");
}
/** ASS timestamp: H:MM:SS.cc */
function assTime(sec) {
	const s = Math.max(0, sec);
	const hh = Math.floor(s / 3600);
	const mm = Math.floor(s % 3600 / 60);
	const ss = Math.floor(s % 60);
	const cs = Math.round((s - Math.floor(s)) * 100);
	return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(Math.min(99, cs)).padStart(2, "0")}`;
}
/** Neutralise characters ASS would interpret as markup. */
/**
* Approximate advance width of one character, in em units.
* CJK/full-width glyphs are ~1em; Latin/digits ~0.55em; space ~0.3em.
*/
function charWidth(ch) {
	const c = ch.codePointAt(0) ?? 0;
	if (c >= 4352 && c <= 4447 || c === 9001 || c === 9002 || c >= 11904 && c <= 42191 && c !== 12351 || c >= 44032 && c <= 55203 || c >= 63744 && c <= 64255 || c >= 65072 && c <= 65135 || c >= 65280 && c <= 65376 || c >= 65504 && c <= 65510) return 1;
	if (c === 32 || c === 12288) return .3;
	return .55;
}
/**
* Break a cue into lines that fit `maxUnits` em-widths.
*
* libass did NOT wrap space-less Chinese even with WrapStyle 0 — a 41-char cue
* rendered straight across the frame and got clipped at both edges — so the
* line breaks are inserted here instead of being delegated to the renderer.
* Returns text with real newlines; escapeAssText turns them into \N.
*/
function wrapForAss(text, maxUnits) {
	const lines = [];
	for (const para of String(text ?? "").split(/\r?\n/)) {
		if (para === "") {
			lines.push("");
			continue;
		}
		let line = "";
		let w = 0;
		for (const ch of Array.from(para)) {
			const cw = charWidth(ch);
			if (w + cw > maxUnits && line !== "") {
				lines.push(line);
				line = "";
				w = 0;
			}
			line += ch;
			w += cw;
		}
		if (line !== "") lines.push(line);
	}
	return lines.join("\n");
}
function escapeAssText(t) {
	return String(t).replace(/\\/g, "\\\\").replace(/\{/g, "(").replace(/\}/g, ")").replace(/\r?\n/g, "\\N").trim();
}
/**
* Build an ASS subtitle script with an explicit resolution.
*
* Why ASS and not SRT: when libass is handed a bare SRT it assumes a 288-line
* script resolution, so FontSize/MarginV are multiplied by (videoHeight / 288)
* — at 720p a "24px" subtitle actually rendered ~60px tall and sat far too high.
* Declaring PlayResX/PlayResY makes those values true pixels.
*/
function buildAss(cues, opts) {
	const { width, height, fontName } = opts;
	const fontSize = opts.fontSize ?? Math.max(18, Math.round(height * .058));
	const marginV = opts.marginV ?? Math.max(18, Math.round(height * .055));
	const outline = Math.max(1, Math.round(height * .004));
	const header = [
		"[Script Info]",
		"ScriptType: v4.00+",
		`PlayResX: ${width}`,
		`PlayResY: ${height}`,
		"WrapStyle: 0",
		"ScaledBorderAndShadow: yes",
		"YCbCr Matrix: None",
		"",
		"[V4+ Styles]",
		"Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
		`Style: Default,${fontName},${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,${outline},0,2,40,40,${marginV},1`,
		"",
		"[Events]",
		"Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"
	].join("\n");
	const usable = Math.max(200, width - 80);
	const maxUnits = Math.max(8, Math.floor(usable / fontSize));
	return `${header}\n${cues.filter((c) => String(c.text ?? "").trim() !== "").map((c) => `Dialogue: 0,${assTime(c.start)},${assTime(c.end)},Default,,0,0,0,,${escapeAssText(wrapForAss(c.text, maxUnits))}`).join("\n")}\n`;
}
/**
* Escape a path for use inside an ffmpeg filter argument.
* Colons and backslashes are filter syntax, so Windows paths need care.
*/
function escapeFilterPath(p) {
	return p.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
}
/**
* Burn subtitles into a video.
*
* `cues` are written to a real .ass file next to the output (libass reads it
* from disk), sized against the input's actual resolution.
*/
async function burnSubtitles(input, cues, output, opts = {}) {
	const font = findCjkFont();
	if (!font) return {
		ok: false,
		error: "缺少中文字体，无法烧录字幕（请安装中文字体或设置 AGNES_SUBTITLE_FONT）",
		output: "",
		stderr: ""
	};
	const probe = await probeMedia(input);
	const width = probe.width || 1280;
	const height = probe.height || 720;
	const assPath = output.replace(/\.[^.]+$/, "") + ".ass";
	try {
		writeFileSync(assPath, buildAss(cues, {
			width,
			height,
			fontName: fontFamilyFor(font),
			fontSize: opts.fontSize,
			marginV: opts.marginV
		}), "utf8");
	} catch (e) {
		return {
			ok: false,
			error: `无法写入字幕文件：${String(e)}`,
			output: "",
			stderr: ""
		};
	}
	return ffmpeg([
		"-i",
		input,
		"-vf",
		`subtitles=${escapeFilterPath(assPath)}`,
		"-c:a",
		"copy",
		output
	]);
}
/**
* Concatenate videos in order.
*
* `-c copy` is lossless and fast, but requires identical codec parameters;
* mixing resolutions/framerates produces a broken file. So we probe first and
* re-encode only when the inputs actually differ.
*/
async function concatVideos(files, output, opts = {}) {
	if (files.length === 0) return {
		ok: false,
		error: "没有可拼接的视频",
		output: "",
		stderr: ""
	};
	if (files.length === 1) return {
		...await ffmpeg([
			"-i",
			files[0],
			"-c",
			"copy",
			output
		]),
		mode: "copy"
	};
	let probes = await Promise.all(files.map((f) => probeMedia(f)));
	if (probes.some((p) => !p.ok)) return {
		ok: false,
		error: "无法探测输入视频（ffprobe 失败）",
		output: "",
		stderr: ""
	};
	let mode = opts.reencode ? "reencode" : "copy";
	const first = probes[0];
	const uniform = probes.every((p) => p.width === first.width && p.height === first.height && p.videoCodec === first.videoCodec && p.pixFmt === first.pixFmt && Math.abs(p.fps - first.fps) < .01 && p.hasAudio === first.hasAudio && (!first.hasAudio || p.audioCodec === first.audioCodec));
	if (!opts.reencode && !uniform) {
		mode = "reencode";
		opts.onProgress?.("检测到镜头参数不一致，正在逐个归一化后拼接（较慢）");
	}
	const listPath = join(dirname(output), `concat-${Date.now()}.txt`);
	const tempFiles = [];
	try {
		let inputs = files;
		if (mode === "reencode") {
			const target = {
				width: first.width || 1280,
				height: first.height || 720,
				fps: first.fps > 0 && first.fps <= 60 ? first.fps : 25
			};
			inputs = [];
			for (const [i, file] of files.entries()) {
				const norm = join(dirname(output), `norm-${Date.now()}-${i}.mp4`);
				const res = await normalizeClip(file, norm, target);
				if (!res.ok) return {
					ok: false,
					error: `镜头 ${i + 1} 归一化失败：${res.error}`,
					output: "",
					stderr: ""
				};
				tempFiles.push(norm);
				inputs.push(norm);
			}
			probes = await Promise.all(inputs.map((f) => probeMedia(f)));
		}
		writeFileSync(listPath, inputs.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n") + "\n", "utf8");
		return {
			...await ffmpeg([
				"-f",
				"concat",
				"-safe",
				"0",
				"-i",
				listPath,
				"-c",
				"copy",
				output
			]),
			mode
		};
	} finally {
		try {
			rmSync(listPath, { force: true });
		} catch {}
		for (const f of tempFiles) try {
			rmSync(f, { force: true });
		} catch {}
	}
}
/**
* Re-encode one clip to a fixed spec (size, fps, h264/yuv420p, aac stereo).
* Missing audio is filled with silence so every clip has the same streams —
* required for a lossless concat afterwards.
*/
async function normalizeClip(input, output, spec) {
	const probe = await probeMedia(input);
	const videoFilter = `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${spec.fps}`;
	const base = ["-i", input];
	if (!probe.hasAudio) base.push("-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100");
	return ffmpeg([
		...base,
		"-vf",
		videoFilter,
		"-c:v",
		"libx264",
		"-pix_fmt",
		"yuv420p",
		"-preset",
		"medium",
		"-crf",
		"20",
		"-c:a",
		"aac",
		"-b:a",
		"128k",
		"-ar",
		"44100",
		"-ac",
		"2",
		"-shortest",
		output
	]);
}
/**
* Mux a narration track over visuals, then burn subtitles.
* Used by the talking-avatar pipeline (B).
*/
async function muxNarration(opts) {
	const filters = [];
	if (opts.cues && opts.cues.length > 0) {
		const font = findCjkFont();
		if (!font) return {
			ok: false,
			error: "缺少中文字体，无法烧录字幕",
			output: "",
			stderr: ""
		};
		const probe = await probeMedia(opts.visualInput);
		const assPath = opts.output.replace(/\.[^.]+$/, "") + ".ass";
		try {
			writeFileSync(assPath, buildAss(opts.cues, {
				width: probe.width || 1280,
				height: probe.height || 720,
				fontName: fontFamilyFor(font),
				fontSize: opts.fontSize
			}), "utf8");
		} catch (e) {
			return {
				ok: false,
				error: `无法写入字幕文件：${String(e)}`,
				output: "",
				stderr: ""
			};
		}
		filters.push(`subtitles=${escapeFilterPath(assPath)}`);
	}
	return ffmpeg([
		"-i",
		opts.visualInput,
		"-i",
		opts.audioInput,
		...filters.length ? ["-vf", filters.join(",")] : [],
		"-map",
		"0:v:0",
		"-map",
		"1:a:0",
		"-c:v",
		"libx264",
		"-pix_fmt",
		"yuv420p",
		"-preset",
		"medium",
		"-crf",
		"20",
		"-c:a",
		"aac",
		"-b:a",
		"128k",
		"-shortest",
		opts.output
	]);
}
/** Build a still-image slideshow video of `duration` seconds from one image. */
async function imageToVideo(image, output, duration, size = {
	width: 1280,
	height: 720
}) {
	return ffmpeg([
		"-loop",
		"1",
		"-t",
		String(Math.max(.5, duration)),
		"-i",
		image,
		"-vf",
		`scale=${size.width}:${size.height}:force_original_aspect_ratio=decrease,pad=${size.width}:${size.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25`,
		"-c:v",
		"libx264",
		"-pix_fmt",
		"yuv420p",
		"-preset",
		"medium",
		"-crf",
		"20",
		output
	]);
}
/** Concatenate audio files with optional silence gaps between them. */
async function concatAudio(segments, output) {
	if (segments.length === 0) return {
		ok: false,
		error: "没有音频段",
		output: "",
		stderr: ""
	};
	if (segments.length === 1 && !segments[0].silenceAfterMs) return ffmpeg([
		"-i",
		segments[0].file,
		"-c",
		"copy",
		output
	]);
	const dir = dirname(output);
	const silenceFiles = [];
	try {
		const inputs = [];
		for (const [i, seg] of segments.entries()) {
			inputs.push(seg.file);
			const gap = seg.silenceAfterMs ?? 0;
			if (gap > 0 && i < segments.length - 1) {
				const sf = join(dir, `sil-${Date.now()}-${i}.wav`);
				if ((await ffmpeg([
					"-f",
					"lavfi",
					"-i",
					"anullsrc=r=24000:cl=mono",
					"-t",
					String(gap / 1e3),
					"-c:a",
					"pcm_s16le",
					sf
				])).ok) {
					silenceFiles.push(sf);
					inputs.push(sf);
				}
			}
		}
		const args = [];
		for (const f of inputs) args.push("-i", f);
		const listPath = join(dir, `acat-${Date.now()}.txt`);
		writeFileSync(listPath, inputs.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n") + "\n", "utf8");
		try {
			return await ffmpeg([
				"-f",
				"concat",
				"-safe",
				"0",
				"-i",
				listPath,
				"-c:a",
				"pcm_s16le",
				"-ar",
				"24000",
				"-ac",
				"1",
				output
			]);
		} finally {
			try {
				rmSync(listPath, { force: true });
			} catch {}
		}
	} finally {
		for (const f of silenceFiles) try {
			rmSync(f, { force: true });
		} catch {}
	}
}
//#endregion
//#region src/drama-engine.ts
/**
* 短剧流水线引擎 — Host 端核心逻辑
* 管理短剧任务的创建、状态、持久化和异步执行。
*/
const dramaTasks = /* @__PURE__ */ new Map();
const runningDramas = /* @__PURE__ */ new Set();
const DRAMA_DIR = join(dataRoot(), "dramas");
function getDramaPath(id) {
	const dir = dramaDir(id);
	return join(dir, "task.json");
}
function saveToDisk(task) {
	try {
		writeFileSync(getDramaPath(task.drama_id), JSON.stringify(task, null, 2), "utf8");
	} catch {}
}
function loadFromDisk(id) {
	try {
		const p = getDramaPath(id);
		return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
	} catch {
		return null;
	}
}
function updateTask(task, patch) {
	Object.assign(task, patch, { updated_at: Date.now() });
	dramaTasks.set(task.drama_id, task);
	saveToDisk(task);
}
const STORY_PROMPT = "你是一位才华横溢的短剧作家。根据用户描述创作一个300～500字的故事梗概。要求：完整起承转合，场景有画面感，包含核心冲突和高潮。直接输出故事正文，不要标题。";
const SCRIPT_PROMPT = "你是专业短剧编剧。将故事1:1精准还原为专业短剧剧本。格式：每场以「编号 日/夜、内/外、场景名」开头，画面用「▲」，旁白用「vo：」。直接输出剧本。";
function storyboardPrompt(dur) {
	return `你是资深分镜师。将剧本转为分镜脚本，每镜约${dur}秒。动作拆分起势→发力→收势，标注运镜和转场。输出JSON：{"shots":[{"shot_index":1,"scene_desc":"画面描述","characters":[],"action":"起势→发力→收势","camera":"景别","camera_movement":{"type":"运镜","intent":"意图"},"dialogue":"","prompt_en":"English prompt","transition":{"type":"转场","description":"说明"}}]}`;
}
const ASSETS_PROMPT = "从剧本和分镜提取角色/场景/道具的视觉特征。输出JSON：{\"characters\":[{\"name\":\"\",\"desc\":\"中文描述\",\"prompt_en\":\"English for three-view\"}],\"scenes\":[{\"name\":\"\",\"desc\":\"\",\"prompt_en\":\"\"}],\"props\":[{\"name\":\"\",\"desc\":\"\",\"prompt_en\":\"\"}]}";
const VENDOR_URLS$1 = {
	agnes: "https://api.agnes-ai.cn/v1",
	deepseek: "https://api.deepseek.com/v1",
	qwen: "https://dashscope.aliuncs.com/compatible-mode/v1",
	doubao: "https://ark.cn-beijing.volces.com/api/v3",
	minimax: "https://api.minimaxi.com/v1",
	ollama: "http://localhost:11434/v1"
};
function getVendor$1(model) {
	if (!model) return "agnes";
	const m = model.toLowerCase();
	if (m.startsWith("ollama:")) return "ollama";
	for (const p of Object.keys(VENDOR_URLS$1)) if (p !== "agnes" && m.startsWith(p)) return p;
	return "agnes";
}
async function callTextModel(sysPrompt, userPrompt, apiKey, model, maxTokens = 4096) {
	const baseUrl = VENDOR_URLS$1[getVendor$1(model)] || VENDOR_URLS$1.agnes;
	const ac = new AbortController();
	const t = setTimeout(() => ac.abort(), 3e5);
	try {
		const r = await fetch(`${baseUrl}/chat/completions`, {
			method: "POST",
			signal: ac.signal,
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model,
				messages: [{
					role: "system",
					content: sysPrompt
				}, {
					role: "user",
					content: userPrompt
				}],
				max_tokens: maxTokens,
				temperature: .7
			})
		});
		if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 300)}`);
		return (await r.json()).choices?.[0]?.message?.content || "";
	} finally {
		clearTimeout(t);
	}
}
function parseJson(text) {
	let c = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
	if (c.startsWith("```")) {
		const lines = c.split("\n");
		let end = lines.length;
		for (let i = lines.length - 1; i > 0; i--) if (lines[i].trim().startsWith("```")) {
			end = i;
			break;
		}
		c = lines.slice(1, end).join("\n").trim();
	}
	try {
		return JSON.parse(c);
	} catch {}
	const i = c.indexOf("{");
	if (i > 0) try {
		return JSON.parse(c.slice(i));
	} catch {}
	return null;
}
function waitConfirm(task, expected) {
	return new Promise((resolve) => {
		const check = () => {
			if (task.status !== expected || task.status === "stopped" || task.status === "failed") {
				resolve();
				return;
			}
			setTimeout(check, 1e3);
		};
		check();
	});
}
function waitAllVideos(task) {
	return new Promise((resolve) => {
		const check = () => {
			if (task.status === "stopped" || task.status === "failed") {
				resolve();
				return;
			}
			const vr = task.video_results || [];
			if (vr.length > 0 && vr.every((r) => r.status === "completed" || r.status === "failed")) {
				resolve();
				return;
			}
			setTimeout(check, 3e3);
		};
		check();
	});
}
async function runPipeline(task, apiKey, startStep) {
	const model = task.text_model;
	try {
		let scriptText = task.script || "";
		if (startStep === "script" && scriptText) updateTask(task, {
			status: "step2",
			step: "step2",
			message: "已导入剧本，正在生成分镜..."
		});
		else {
			updateTask(task, {
				status: "step1",
				step: "step1",
				message: "正在创作故事梗概..."
			});
			updateTask(task, {
				story: await callTextModel(STORY_PROMPT, `请根据以下描述创作一个300～500字的短剧故事：\n${task.prompt}`, apiKey, model, 4096),
				status: "paused_story",
				message: "故事梗概已生成，请确认"
			});
			await waitConfirm(task, "paused_story");
			if (task.status === "stopped" || task.status === "failed") return;
			updateTask(task, {
				status: "step2",
				message: "正在生成剧本..."
			});
			scriptText = await callTextModel(SCRIPT_PROMPT, `请将以下故事改编为专业短剧剧本：\n${task.edited_story || task.story || ""}`, apiKey, model, 16384);
			updateTask(task, {
				script: scriptText,
				status: "paused_script",
				message: "剧本已生成，请确认"
			});
			await waitConfirm(task, "paused_script");
			if (task.status === "stopped" || task.status === "failed") return;
			scriptText = task.edited_script || task.script || scriptText;
		}
		updateTask(task, {
			status: "step2",
			step: "step2",
			message: "正在生成分镜..."
		});
		const shots = parseJson(await callTextModel(storyboardPrompt(task.shot_duration), `请将以下剧本改写为分镜脚本：\n${task.edited_script || scriptText}`, apiKey, model, 16384))?.shots || [];
		updateTask(task, {
			storyboard: { shots },
			shots,
			status: "step3",
			message: `分镜完成，共 ${shots.length} 个镜头`
		});
		updateTask(task, {
			status: "step3",
			message: "正在提取素材..."
		});
		const aData = parseJson(await callTextModel(ASSETS_PROMPT, `请从以下内容提取角色/场景/道具：\n剧本：${task.script || ""}\n分镜：${JSON.stringify({ shots })}`, apiKey, model, 16384));
		const allAssets = [];
		for (const cat of [
			"characters",
			"scenes",
			"props"
		]) for (const item of aData?.[cat] || []) allAssets.push({
			category: cat,
			name: item.name || "",
			desc: item.desc || "",
			prompt_en: item.prompt_en || "",
			status: "pending"
		});
		updateTask(task, {
			assets: allAssets,
			status: "paused_assets",
			message: `提取到 ${allAssets.length} 个素材，请确认`
		});
		await waitConfirm(task, "paused_assets");
		if (task.status === "stopped" || task.status === "failed") return;
		updateTask(task, {
			video_results: shots.map((s) => ({
				shot_index: s.shot_index,
				status: "pending"
			})),
			status: "paused_video",
			message: "素材已就绪，请逐个启动视频生成"
		});
		await waitAllVideos(task);
		updateTask(task, {
			status: "completed",
			message: "短剧制作完成"
		});
	} catch (e) {
		if (task.status === "stopped") return;
		updateTask(task, {
			status: "failed",
			message: `流水线失败: ${e instanceof Error ? e.message : String(e)}`
		});
	} finally {
		runningDramas.delete(task.drama_id);
	}
}
/** Local file path for one shot's generated video. */
function shotFilePath(dramaId, shotIndex) {
	return join(dramaDir(dramaId), `shot-${shotIndex}.mp4`);
}
/** Build the video prompt for a shot (English prompt preferred). */
function shotPrompt(shot) {
	const parts = [
		shot.prompt_en,
		shot.scene_desc,
		shot.action
	].map((s) => String(s ?? "").trim()).filter(Boolean);
	const camera = String(shot.camera ?? "").trim();
	const move = String(shot.camera_movement?.type ?? "").trim();
	let prompt = parts.join(". ");
	if (camera) prompt += `, ${camera} shot`;
	if (move) prompt += `, camera ${move}`;
	return prompt || "cinematic scene";
}
/** Download a URL to a local file. Returns the byte size. */
async function downloadTo(url, dest, timeoutMs = 3e5) {
	const ac = new AbortController();
	const timer = setTimeout(() => ac.abort(), timeoutMs);
	try {
		const r = await fetch(url, { signal: ac.signal });
		if (!r.ok) throw new Error(`下载失败 HTTP ${r.status}`);
		const buf = Buffer.from(await r.arrayBuffer());
		if (buf.length === 0) throw new Error("下载内容为空");
		writeFileSync(dest, buf);
		return buf.length;
	} finally {
		clearTimeout(timer);
	}
}
/**
* Generate one shot's video for real: submit → poll → download.
*
* Agnes video models are verified end-to-end (submit /v1/videos, poll
* /v1/videos/{id}, download metadata.url). Other vendors have different
* contracts, so we fail loudly rather than silently producing nothing.
*/
async function runShotVideo(task, shotIndex, host) {
	const model = task.video_model || "agnes-video-2.5-flash";
	const vr = (task.video_results || []).find((r) => r.shot_index === shotIndex);
	if (!vr) return;
	const shot = (task.shots || task.storyboard?.shots || []).find((s) => s.shot_index === shotIndex);
	const setVr = (patch) => {
		Object.assign(vr, patch);
		updateTask(task, { video_results: task.video_results });
	};
	setVr({
		status: "generating",
		error: void 0,
		prompt: shot ? shotPrompt(shot) : void 0
	});
	if (!model.toLowerCase().startsWith("agnes-video")) {
		setVr({
			status: "failed",
			error: `当前仅支持 Agnes 视频模型（agnes-video-*）自动生成，收到「${model}」。请在短剧设置中改用 agnes-video-2.5-flash。`
		});
		return;
	}
	try {
		const prompt = shot ? shotPrompt(shot) : "cinematic scene";
		const seconds = String(Math.max(1, Math.round(task.shot_duration || 5)));
		const submitted = await host.call("agnes", "/v1/videos", {
			method: "POST",
			body: {
				model,
				prompt,
				mode: "text",
				seconds,
				size: "720P"
			},
			timeoutMs: 12e4
		});
		const videoId = String(submitted?.video_id || submitted?.id || submitted?.task_id || "");
		if (!videoId) throw new Error("视频接口未返回任务 ID");
		const deadline = Date.now() + 12e5;
		let url = "";
		while (Date.now() < deadline) {
			await new Promise((r) => setTimeout(r, 8e3));
			if (task.status === "stopped") return;
			const st = await host.call("agnes", `/v1/videos/${encodeURIComponent(videoId)}`, {
				method: "GET",
				timeoutMs: 6e4
			});
			const status = String(st?.status ?? "");
			if (status === "completed") {
				url = String(st?.metadata?.url || st?.url || "");
				if (!url) throw new Error("任务完成但未返回视频地址");
				break;
			}
			if (status === "failed") throw new Error(String(st?.error?.message || st?.error || "视频生成失败"));
		}
		if (!url) throw new Error("视频生成超时（20 分钟）");
		const dest = shotFilePath(task.drama_id, shotIndex);
		await downloadTo(url, dest);
		const probe = await probeMedia(dest);
		setVr({
			status: "completed",
			video_url: url,
			error: void 0
		});
		updateTask(task, {
			video_results: task.video_results,
			message: `镜头 ${shotIndex} 完成${probe.ok ? `（${probe.duration.toFixed(1)}s）` : ""}`
		});
	} catch (e) {
		setVr({
			status: "failed",
			error: e instanceof Error ? e.message : String(e)
		});
	}
}
/** Kick off every unfinished shot, sequentially (keeps API quota predictable). */
async function runAllShotVideos(task, host) {
	for (const r of task.video_results || []) {
		if (task.status === "stopped") return;
		if (r.status === "completed") continue;
		await runShotVideo(task, r.shot_index, host);
	}
	const remaining = (task.video_results || []).filter((r) => r.status !== "completed");
	if (remaining.length === 0) updateTask(task, {
		status: "completed",
		message: "全部镜头已完成，可合成成片"
	});
	else updateTask(task, {
		status: "paused_video",
		message: `${remaining.length} 个镜头未成功，可重试或先合成已完成的镜头`
	});
}
/** Collect completed shot files in storyboard order. */
function completedShotFiles(task) {
	const shots = task.shots || task.storyboard?.shots || [];
	const order = shots.length > 0 ? shots.map((s) => s.shot_index) : (task.video_results || []).map((r) => r.shot_index);
	const out = [];
	for (const idx of order) {
		const r = (task.video_results || []).find((v) => v.shot_index === idx);
		if (!r || r.status !== "completed") continue;
		const file = shotFilePath(task.drama_id, idx);
		if (!existsSync(file) || statSync(file).size === 0) continue;
		out.push({
			shotIndex: idx,
			file,
			shot: shots.find((s) => s.shot_index === idx)
		});
	}
	return out;
}
/**
* Merge completed shots into a final cut.
* Subtitles are opt-in and come from each shot's dialogue.
*/
async function mergeDrama(task, opts) {
	const items = completedShotFiles(task);
	if (items.length === 0) return {
		ok: false,
		error: "没有已完成的镜头视频可合成。请先生成至少一个镜头。"
	};
	const ff = await ffmpegStatus();
	if (!ff.available) return {
		ok: false,
		error: ff.hint
	};
	const dir = dramaDir(task.drama_id);
	const outFile = join(dir, "final.mp4");
	updateTask(task, {
		status: "merging",
		message: `正在合成 ${items.length} 个镜头...`
	});
	const res = await concatVideos(items.map((i) => i.file), outFile, { reencode: opts.reencode });
	if (!res.ok) {
		updateTask(task, {
			status: "paused_video",
			message: "合成失败"
		});
		return {
			ok: false,
			error: res.error
		};
	}
	if (opts.subtitles) {
		if (!ff.font) {
			updateTask(task, {
				status: "paused_video",
				message: "缺中文字体，未烧字幕"
			});
			return {
				ok: false,
				error: `缺少中文字体，无法烧录字幕。${ff.hint}`
			};
		}
		const cues = [];
		let cursor = 0;
		for (const it of items) {
			const probe = await probeMedia(it.file);
			const dur = probe.ok ? probe.duration : 0;
			const text = String(it.shot?.dialogue ?? "").trim();
			if (text) cues.push({
				start: cursor + .2,
				end: Math.max(cursor + 1.2, cursor + dur - .2),
				text
			});
			cursor += dur;
		}
		if (cues.length > 0) {
			const srtPath = join(dir, "final.srt");
			writeFileSync(srtPath, buildSrt(cues), "utf8");
			const subOut = join(dir, "final-subbed.mp4");
			const burned = await burnSubtitles(outFile, cues, subOut);
			if (!burned.ok) {
				updateTask(task, {
					status: "paused_video",
					message: "字幕烧录失败"
				});
				return {
					ok: false,
					error: `字幕烧录失败：${burned.error}`
				};
			}
			const probe = await probeMedia(subOut);
			updateTask(task, {
				status: "completed",
				message: `成片已生成（含字幕，${items.length} 镜）`
			});
			return {
				ok: true,
				file: subOut,
				duration: probe.duration,
				mode: res.mode,
				shots: items.length
			};
		}
	}
	const probe = await probeMedia(outFile);
	updateTask(task, {
		status: "completed",
		message: `成片已生成（${items.length} 镜）`
	});
	return {
		ok: true,
		file: outFile,
		duration: probe.duration,
		mode: res.mode,
		shots: items.length
	};
}
/** Restrict a media request to files inside a drama's own directory. */
function resolveDramaMedia(dramaId, filename) {
	if (!dramaId || !filename) return null;
	const dir = resolve(dramaDir(dramaId));
	const candidate = resolve(dir, basename(filename));
	if (!candidate.startsWith(dir + "/") && !candidate.startsWith(dir + "\\")) return null;
	return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null;
}
async function handleDramaRoute(method, urlPath, body, host) {
	const dp = urlPath.replace(/^\/agnes-studio\/api\/?/, "").replace(/^drama\/?/, "");
	const resolveApiKey = (v) => host.resolveKey(v);
	if (method === "POST" && dp === "start") {
		const id = randomUUID().slice(0, 12);
		const task = {
			drama_id: id,
			prompt: body.prompt || "",
			status: "started",
			step: "",
			message: "正在启动...",
			text_model: body.text_model || "agnes-3.0-flash",
			image_model: body.image_model || "agnes-image-2.5-flash",
			video_model: body.video_model || "agnes-video-2.5-flash",
			shot_duration: body.shot_duration || 5,
			created_at: Date.now(),
			updated_at: Date.now()
		};
		dramaTasks.set(id, task);
		saveToDisk(task);
		resolveApiKey(getVendor$1(task.text_model)).then((k) => {
			runningDramas.add(id);
			runPipeline(task, k);
		}).catch((e) => updateTask(task, {
			status: "failed",
			message: `API Key 获取失败: ${e}`
		}));
		return {
			status: 200,
			data: {
				drama_id: id,
				status: "started"
			}
		};
	}
	if (method === "POST" && dp === "import") {
		const id = randomUUID().slice(0, 12);
		const scriptContent = body.script || "";
		if (!scriptContent.trim()) return {
			status: 400,
			data: { error: "剧本内容为空" }
		};
		const task = {
			drama_id: id,
			prompt: body.prompt || scriptContent.slice(0, 100),
			status: "started",
			step: "",
			message: "正在从导入的剧本生成分镜...",
			script: scriptContent,
			text_model: body.text_model || "agnes-3.0-flash",
			image_model: body.image_model || "agnes-image-2.5-flash",
			video_model: body.video_model || "agnes-video-2.5-flash",
			shot_duration: body.shot_duration || 5,
			created_at: Date.now(),
			updated_at: Date.now()
		};
		dramaTasks.set(id, task);
		saveToDisk(task);
		resolveApiKey(getVendor$1(task.text_model)).then((k) => {
			runningDramas.add(id);
			runPipeline(task, k, "script");
		}).catch((e) => updateTask(task, {
			status: "failed",
			message: `API Key 获取失败: ${e}`
		}));
		return {
			status: 200,
			data: {
				drama_id: id,
				status: "started"
			}
		};
	}
	if (method === "GET" && dp === "list") return {
		status: 200,
		data: { tasks: Array.from(dramaTasks.values()).slice(0, 20) }
	};
	const statusMatch = /^status\/(.+)$/.exec(dp);
	if (method === "GET" && statusMatch) {
		const statusId = statusMatch[1];
		const statusTask = dramaTasks.get(statusId) || loadFromDisk(statusId);
		if (!statusTask) return {
			status: 404,
			data: { error: "任务不存在" }
		};
		return {
			status: 200,
			data: {
				...statusTask,
				completed: (statusTask.video_results || []).filter((r) => r.status === "completed").length,
				final: existsSync(join(dramaDir(statusTask.drama_id), "final.mp4"))
			}
		};
	}
	const parts = dp.split("/");
	const id = parts[0];
	if (!id) return null;
	let task = dramaTasks.get(id) || loadFromDisk(id);
	if (!task) return {
		status: 404,
		data: { error: "任务不存在" }
	};
	if (method === "GET" && parts.length === 1) return {
		status: 200,
		data: task
	};
	if (method === "POST" && parts[1] === "stop") {
		updateTask(task, {
			status: "stopped",
			message: "已停止"
		});
		runningDramas.delete(id);
		return {
			status: 200,
			data: { ok: true }
		};
	}
	if (method === "POST" && parts[1] === "resume") {
		if (!runningDramas.has(id) && task.status !== "failed" && task.status !== "completed") {
			runningDramas.add(id);
			resolveApiKey(getVendor$1(task.text_model)).then((k) => runPipeline(task, k));
		}
		return {
			status: 200,
			data: { ok: true }
		};
	}
	if (method === "POST" && parts[1] === "confirm") {
		const { field, content, action, shot_index } = body;
		if (field === "story" && content) updateTask(task, {
			edited_story: content,
			story: content
		});
		else if (field === "script" && content) updateTask(task, {
			edited_script: content,
			script: content
		});
		else if (field === "assets" && action === "approve") {
			if (task.status === "paused_assets") updateTask(task, {
				status: "step4",
				message: "素材已确认，准备生成视频..."
			});
		} else if (field === "video") {
			if (shot_index !== void 0) {
				const vr = (task.video_results || []).find((r) => r.shot_index === shot_index);
				if (vr) {
					vr.status = "generating";
					vr.error = void 0;
					updateTask(task, {
						video_results: task.video_results,
						message: `镜头 ${shot_index} 生成中...`
					});
					runShotVideo(task, shot_index, host);
				}
			} else if (action === "complete") {
				const pending = (task.video_results || []).filter((r) => r.status !== "completed");
				if (pending.length > 0) return {
					status: 400,
					data: { error: `还有 ${pending.length} 个镜头未完成，请先生成或等其完成` }
				};
				updateTask(task, {
					status: "completed",
					message: "短剧制作完成"
				});
			}
		}
		return {
			status: 200,
			data: { ok: true }
		};
	}
	if (method === "POST" && parts[1] === "videos") {
		if ((task.video_results || []).length === 0) return {
			status: 400,
			data: { error: "还没有分镜，无法生成视频" }
		};
		updateTask(task, { message: "正在依次生成所有镜头..." });
		runAllShotVideos(task, host);
		return {
			status: 200,
			data: {
				ok: true,
				queued: (task.video_results || []).filter((r) => r.status !== "completed").length
			}
		};
	}
	if (method === "POST" && parts[1] === "merge") {
		const result = await mergeDrama(task, {
			subtitles: body?.subtitles === true,
			reencode: body?.reencode === true
		});
		if (!result.ok) return {
			status: 400,
			data: { error: result.error }
		};
		const file = basename(result.file || "");
		return {
			status: 200,
			data: {
				ok: true,
				shots: result.shots,
				duration: result.duration,
				mode: result.mode,
				file,
				url: `/agnes-studio/api/media/${task.drama_id}/${file}`
			}
		};
	}
	if (method === "GET" && parts[1] === "status") return {
		status: 200,
		data: {
			drama_id: task.drama_id,
			status: task.status,
			message: task.message,
			shots: (task.shots || task.storyboard?.shots || []).length,
			videos: (task.video_results || []).map((r) => ({
				shot_index: r.shot_index,
				status: r.status,
				error: r.error ?? null
			})),
			completed: (task.video_results || []).filter((r) => r.status === "completed").length,
			final: existsSync(join(dramaDir(task.drama_id), "final.mp4"))
		}
	};
	if (method === "POST" && parts[1] === "regenerate") {
		const { step } = body;
		if (step === "story") updateTask(task, {
			story: void 0,
			edited_story: void 0,
			status: "step1"
		});
		else if (step === "script") updateTask(task, {
			script: void 0,
			edited_script: void 0
		});
		return {
			status: 200,
			data: { ok: true }
		};
	}
	return null;
}
function rehydrateDramas() {
	try {
		if (!existsSync(DRAMA_DIR)) return;
		const dirs = readdirSync(DRAMA_DIR);
		let count = 0;
		for (const d of dirs) {
			const t = loadFromDisk(d);
			if (!t) continue;
			dramaTasks.set(d, t);
			if ([
				"started",
				"step1",
				"step2",
				"step3",
				"step4"
			].includes(t.status)) {
				updateTask(t, {
					status: "failed",
					message: "进程重启导致中断"
				});
				count++;
			}
		}
		if (count) console.log(`[短剧] 已恢复 ${count} 个历史任务`);
	} catch (e) {
		console.error("[短剧] 恢复失败:", e);
	}
}
//#endregion
//#region src/anchor-engine.ts
/**
* 数字人口播引擎（Host 端）—— 文稿 → 分段 → TTS 配音 → 画面 → 字幕 → 合成。
*
* 真实验证过的依赖：
*  - MiMo TTS（mimo-v2.5-tts，POST /chat/completions，返回 base64 wav）——已实测
*  - ffmpeg（拼接 / 字幕烧录 / 音画合成）——已实测
*  - 中文 CJK 字体 —— 缺失时明确报错，绝不静默出豆腐块
*
* 画面三种模式：
*  static  静态形象图：任意图片循环展示（最稳、最快，推荐）
*  clip    视频素材：上传视频循环/裁剪到旁白长度
*  ai      AI 生成画面：用 Agnes 文生视频生成一段背景片，再循环铺满旁白
*/
const anchorTasks = /* @__PURE__ */ new Map();
const runningAnchors = /* @__PURE__ */ new Set();
function taskPath(id) {
	const dir = anchorDir(id);
	return join(dir, "task.json");
}
function save(task) {
	task.updated_at = Date.now();
	anchorTasks.set(task.anchor_id, task);
	try {
		writeFileSync(taskPath(task.anchor_id), JSON.stringify(task, null, 2), "utf8");
	} catch {}
}
function load(id) {
	try {
		const p = taskPath(id);
		return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
	} catch {
		return null;
	}
}
function setStatus(task, status, message) {
	task.status = status;
	task.message = message;
	save(task);
}
/** Rough Chinese speech rate used to estimate how long a segment will take. */
const CHARS_PER_SEC = 4.2;
/**
* Split narration into subtitle-sized segments.
* Splits on sentence punctuation, then merges fragments that are too short and
* splits any segment that is too long — so subtitles stay readable and each
* TTS call stays small.
*/
function segmentText(text, minSegSec) {
	const clean = String(text ?? "").replace(/\r\n/g, "\n").trim();
	if (!clean) return [];
	const rough = clean.split(/(?<=[。！？!?；;])|\n+/).map((s) => s.trim()).filter(Boolean);
	const minChars = Math.max(6, Math.round(minSegSec * CHARS_PER_SEC));
	const maxChars = 60;
	const merged = [];
	for (const piece of rough) {
		const last = merged[merged.length - 1];
		if (last !== void 0 && last.length < minChars && (last + piece).length <= maxChars) merged[merged.length - 1] = last + piece;
		else merged.push(piece);
	}
	const out = [];
	for (const seg of merged) {
		if (seg.length <= maxChars) {
			out.push(seg);
			continue;
		}
		const parts = seg.split(/(?<=[，,、])/).map((s) => s.trim()).filter(Boolean);
		let buf = "";
		for (const p of parts) if ((buf + p).length > maxChars && buf) {
			out.push(buf);
			buf = p;
		} else buf += p;
		if (buf) out.push(buf);
	}
	return out.filter((s) => s.trim() !== "");
}
const MIMO_DEFAULT_URL = "https://api.xiaomimimo.com/v1";
const MIMO_TOKEN_PLAN_URL = "https://token-plan-cn.xiaomimimo.com/v1";
/** MiMo routes Token-Plan keys (`tp-`) to a different cluster base URL. */
function mimoBaseUrl(apiKey) {
	return String(apiKey || "").trim().startsWith("tp-") ? MIMO_TOKEN_PLAN_URL : MIMO_DEFAULT_URL;
}
/** Style instruction that makes the delivery sound like a person, not a robot. */
function ttsStyle(minSegSec) {
	return "自然、清晰、适合中文口播解说。语气有感染力、有起伏，像在给观众讲故事，不要平淡机械。语速中等，节奏稳定。";
}
/**
* Synthesize one segment with MiMo TTS.
* Contract verified against the live API: POST /chat/completions with an
* `audio` block; the WAV comes back base64 in choices[0].message.audio.data.
*/
async function synthesize(text, voice, outFile, apiKey, minSegSec) {
	const url = `${mimoBaseUrl(apiKey)}/chat/completions`;
	const ac = new AbortController();
	const timer = setTimeout(() => ac.abort(), 18e4);
	try {
		const r = await fetch(url, {
			method: "POST",
			signal: ac.signal,
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: "mimo-v2.5-tts",
				messages: [{
					role: "user",
					content: ttsStyle(minSegSec)
				}, {
					role: "assistant",
					content: text
				}],
				audio: {
					format: "wav",
					voice: voice || "mimo_default"
				}
			})
		});
		if (!r.ok) {
			const body = await r.text().catch(() => "");
			if (r.status === 401) return {
				ok: false,
				error: "TTS 认证失败（401）：请检查 MIMO_API_KEY"
			};
			return {
				ok: false,
				error: `TTS 失败 HTTP ${r.status}: ${body.slice(0, 200)}`
			};
		}
		const b64 = (await r.json())?.choices?.[0]?.message?.audio?.data;
		if (typeof b64 !== "string" || b64.length === 0) return {
			ok: false,
			error: "TTS 响应缺少 audio.data"
		};
		writeFileSync(outFile, Buffer.from(b64, "base64"));
		return { ok: true };
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : String(e)
		};
	} finally {
		clearTimeout(timer);
	}
}
/**
* Materialise a client-supplied image/video into a local file.
* Accepts data URLs (uploaded files) or http(s) URLs (generated assets).
*/
async function materialize(input, destWithoutExt) {
	try {
		if (input.kind === "data") {
			const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(input.value);
			if (!m) return {
				ok: false,
				error: "无法解析上传的素材（data URL 格式错误）"
			};
			const mime = m[1] || "application/octet-stream";
			const isB64 = Boolean(m[2]);
			const file = destWithoutExt + (mime.includes("png") ? ".png" : mime.includes("jpeg") || mime.includes("jpg") ? ".jpg" : mime.includes("webp") ? ".webp" : mime.includes("quicktime") || mime.includes("mov") ? ".mov" : mime.includes("webm") ? ".webm" : mime.includes("video/mp4") ? ".mp4" : ".bin");
			const buf = isB64 ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3]), "binary");
			if (buf.length === 0) return {
				ok: false,
				error: "上传素材为空"
			};
			writeFileSync(file, buf);
			return {
				ok: true,
				file
			};
		}
		const r = await fetch(input.value);
		if (!r.ok) return {
			ok: false,
			error: `下载素材失败 HTTP ${r.status}`
		};
		const buf = Buffer.from(await r.arrayBuffer());
		const lower = input.value.toLowerCase();
		const file = destWithoutExt + (lower.includes(".png") ? ".png" : lower.includes(".jpg") || lower.includes(".jpeg") ? ".jpg" : lower.includes(".webp") ? ".webp" : lower.includes(".mov") ? ".mov" : lower.includes(".webm") ? ".webm" : lower.includes(".mp4") ? ".mp4" : ".bin");
		writeFileSync(file, buf);
		return {
			ok: true,
			file
		};
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : String(e)
		};
	}
}
/** Generate one background video with Agnes (verified submit → poll → url). */
async function generateAiVisual(prompt, host, seconds = 5) {
	try {
		const submitted = await host.call("agnes", "/v1/videos", {
			method: "POST",
			body: {
				model: "agnes-video-2.5-flash",
				prompt,
				mode: "text",
				seconds: String(seconds),
				size: "720P"
			},
			timeoutMs: 12e4
		});
		const id = String(submitted?.video_id || submitted?.id || "");
		if (!id) return {
			ok: false,
			error: "AI 画面：视频接口未返回任务 ID"
		};
		const deadline = Date.now() + 12e5;
		while (Date.now() < deadline) {
			await new Promise((r) => setTimeout(r, 8e3));
			const st = await host.call("agnes", `/v1/videos/${encodeURIComponent(id)}`, {
				method: "GET",
				timeoutMs: 6e4
			});
			const status = String(st?.status ?? "");
			if (status === "completed") {
				const url = String(st?.metadata?.url || st?.url || "");
				return url ? {
					ok: true,
					url
				} : {
					ok: false,
					error: "AI 画面：完成但无地址"
				};
			}
			if (status === "failed") return {
				ok: false,
				error: `AI 画面生成失败：${st?.error?.message || ""}`
			};
		}
		return {
			ok: false,
			error: "AI 画面生成超时"
		};
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : String(e)
		};
	}
}
/**
* Run the talking-avatar pipeline.
* Every stage reports progress so the panel can show where it is.
*/
async function runAnchor(task, host) {
	const dir = anchorDir(task.anchor_id);
	try {
		setStatus(task, "tts", "正在合成配音...");
		const apiKey = await host.resolveTtsKey();
		let cursor = 0;
		for (const seg of task.segments) {
			if (task.status === "stopped") return;
			const out = join(dir, `seg-${seg.index}.wav`);
			const r = await synthesize(seg.text, task.voice, out, apiKey, task.min_seg_sec);
			if (!r.ok) {
				seg.status = "failed";
				seg.error = r.error;
				save(task);
				setStatus(task, "failed", `第 ${seg.index + 1} 段配音失败：${r.error}`);
				return;
			}
			const probe = await probeMedia(out);
			seg.audioFile = out;
			seg.duration = probe.ok ? probe.duration : Math.max(1, seg.text.length / CHARS_PER_SEC);
			seg.start = cursor;
			seg.end = cursor + seg.duration;
			seg.status = "done";
			cursor = seg.end + .25;
			save(task);
			task.message = `配音 ${task.segments.filter((s) => s.status === "done").length}/${task.segments.length}`;
		}
		task.total_duration = cursor;
		save(task);
		setStatus(task, "visual", "正在拼接音轨...");
		const audioOut = join(dir, "narration.wav");
		const audioRes = await concatAudio(task.segments.map((s) => ({
			file: s.audioFile,
			silenceAfterMs: 250
		})), audioOut);
		if (!audioRes.ok) {
			setStatus(task, "failed", `音轨拼接失败：${audioRes.error}`);
			return;
		}
		setStatus(task, "visual", "正在生成画面...");
		const visualOut = join(dir, "visual.mp4");
		const duration = Math.max(1, task.total_duration);
		let visualInput = "";
		if (task.mode === "static") {
			if (!task.image_path || !existsSync(task.image_path)) {
				setStatus(task, "failed", "静态形象图模式下缺少图片素材");
				return;
			}
			const r = await imageToVideo(task.image_path, visualOut, duration);
			if (!r.ok) {
				setStatus(task, "failed", `画面生成失败：${r.error}`);
				return;
			}
			visualInput = visualOut;
		} else if (task.mode === "clip") {
			if (!task.clip_path || !existsSync(task.clip_path)) {
				setStatus(task, "failed", "视频素材模式下缺少视频素材");
				return;
			}
			const r = await ffmpeg([
				"-stream_loop",
				"-1",
				"-i",
				task.clip_path,
				"-t",
				String(duration),
				"-vf",
				"scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25",
				"-an",
				"-c:v",
				"libx264",
				"-pix_fmt",
				"yuv420p",
				"-preset",
				"medium",
				"-crf",
				"20",
				visualOut
			]);
			if (!r.ok) {
				setStatus(task, "failed", `画面生成失败：${r.error}`);
				return;
			}
			visualInput = visualOut;
		} else if (task.ai_per_segment) {
			const done = task.segments.filter((s) => s.status === "done");
			const pieceFiles = [];
			let ok = true;
			for (const [i, seg] of done.entries()) {
				const nextStart = done[i + 1]?.start ?? duration;
				const segDur = Math.max(1.5, nextStart - seg.start);
				setStatus(task, "visual", `正在生成第 ${i + 1}/${done.length} 段画面（每段约 2-4 分钟）...`);
				const ai = await generateAiVisual(`${task.ai_prompt ? `${task.ai_prompt}。` : ""}${seg.text}`.slice(0, 500), host, 5);
				if (!ai.ok || !ai.url) {
					ok = false;
					setStatus(task, "failed", `第 ${i + 1} 段 AI 画面失败：${ai.error}`);
					break;
				}
				const raw = join(dir, `ai-seg-${seg.index}.mp4`);
				const dl = await fetch(ai.url);
				if (!dl.ok) {
					ok = false;
					setStatus(task, "failed", `第 ${i + 1} 段画面下载失败 HTTP ${dl.status}`);
					break;
				}
				writeFileSync(raw, Buffer.from(await dl.arrayBuffer()));
				const piece = join(dir, `vis-seg-${seg.index}.mp4`);
				const r = await ffmpeg([
					"-stream_loop",
					"-1",
					"-i",
					raw,
					"-t",
					String(segDur),
					"-vf",
					"scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25",
					"-an",
					"-c:v",
					"libx264",
					"-pix_fmt",
					"yuv420p",
					"-preset",
					"medium",
					"-crf",
					"20",
					piece
				]);
				if (!r.ok) {
					ok = false;
					setStatus(task, "failed", `第 ${i + 1} 段画面处理失败：${r.error}`);
					break;
				}
				pieceFiles.push(piece);
			}
			if (!ok) return;
			if (pieceFiles.length === 0) {
				setStatus(task, "failed", "没有可用的画面片段");
				return;
			}
			const concatRes = await concatVideos(pieceFiles, visualOut);
			if (!concatRes.ok) {
				setStatus(task, "failed", `画面拼接失败：${concatRes.error}`);
				return;
			}
			visualInput = visualOut;
		} else {
			const prompt = task.ai_prompt || "cinematic background, soft lighting, no people";
			setStatus(task, "visual", "正在用 AI 生成画面（约 2-4 分钟）...");
			const ai = await generateAiVisual(prompt, host, 5);
			if (!ai.ok || !ai.url) {
				setStatus(task, "failed", `AI 画面失败：${ai.error}`);
				return;
			}
			const raw = join(dir, "ai-raw.mp4");
			const dl = await fetch(ai.url);
			if (!dl.ok) {
				setStatus(task, "failed", `AI 画面下载失败 HTTP ${dl.status}`);
				return;
			}
			writeFileSync(raw, Buffer.from(await dl.arrayBuffer()));
			const r = await ffmpeg([
				"-stream_loop",
				"-1",
				"-i",
				raw,
				"-t",
				String(duration),
				"-vf",
				"scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25",
				"-an",
				"-c:v",
				"libx264",
				"-pix_fmt",
				"yuv420p",
				"-preset",
				"medium",
				"-crf",
				"20",
				visualOut
			]);
			if (!r.ok) {
				setStatus(task, "failed", `画面生成失败：${r.error}`);
				return;
			}
			visualInput = visualOut;
		}
		setStatus(task, "muxing", "正在合成最终视频...");
		let cues;
		if (task.burn_subtitles) {
			if (!findCjkFont()) {
				setStatus(task, "failed", "缺少中文字体，无法烧录字幕（请安装中文字体或设置 AGNES_SUBTITLE_FONT）");
				return;
			}
			cues = task.segments.filter((s) => s.status === "done").map((s) => ({
				start: s.start,
				end: s.end,
				text: s.text
			}));
			writeFileSync(join(dir, "narration.srt"), buildSrt(cues), "utf8");
		}
		const finalOut = join(dir, "final.mp4");
		const mux = await muxNarration({
			visualInput,
			audioInput: audioOut,
			output: finalOut,
			cues
		});
		if (!mux.ok) {
			setStatus(task, "failed", `合成失败：${mux.error}`);
			return;
		}
		const probe = await probeMedia(finalOut);
		task.final_file = finalOut;
		task.total_duration = probe.ok ? probe.duration : duration;
		setStatus(task, "completed", `口播视频已生成（${task.segments.length} 段，${task.total_duration.toFixed(1)}s）`);
	} catch (e) {
		setStatus(task, "failed", e instanceof Error ? e.message : String(e));
	} finally {
		runningAnchors.delete(task.anchor_id);
	}
}
async function handleAnchorRoute(method, urlPath, body, host) {
	const dp = urlPath.replace(/^\/agnes-studio\/api\/?/, "").replace(/^anchor\/?/, "");
	if (method === "POST" && dp === "start") {
		const text = String(body?.text ?? "").trim();
		if (!text) return {
			status: 400,
			data: { error: "文稿内容为空" }
		};
		const mode = body?.mode === "clip" || body?.mode === "ai" ? body.mode : "static";
		const minSegSec = Math.min(20, Math.max(3, Number(body?.min_seg_sec ?? 4)));
		const texts = segmentText(text, minSegSec);
		if (texts.length === 0) return {
			status: 400,
			data: { error: "文稿分段为空" }
		};
		const id = randomUUID().slice(0, 12);
		const dir = anchorDir(id);
		const task = {
			anchor_id: id,
			text,
			mode,
			status: "pending",
			message: "准备中...",
			voice: typeof body?.voice === "string" && body.voice ? body.voice : "mimo_default",
			min_seg_sec: minSegSec,
			burn_subtitles: body?.subtitles !== false,
			segments: texts.map((t, i) => ({
				index: i,
				text: t,
				status: "pending",
				start: 0,
				end: 0,
				duration: 0
			})),
			total_duration: 0,
			created_at: Date.now(),
			updated_at: Date.now()
		};
		if (mode === "static") {
			if (!body?.image?.value) return {
				status: 400,
				data: { error: "静态形象图模式需要提供图片" }
			};
			const m = await materialize(body.image, join(dir, "avatar"));
			if (!m.ok) return {
				status: 400,
				data: { error: m.error }
			};
			task.image_path = m.file;
		} else if (mode === "clip") {
			if (!body?.clip?.value) return {
				status: 400,
				data: { error: "视频素材模式需要提供视频" }
			};
			const m = await materialize(body.clip, join(dir, "source"));
			if (!m.ok) return {
				status: 400,
				data: { error: m.error }
			};
			task.clip_path = m.file;
		} else {
			task.ai_prompt = String(body?.ai_prompt ?? "").trim() || void 0;
			task.ai_per_segment = body?.ai_per_segment === true;
		}
		save(task);
		runningAnchors.add(id);
		runAnchor(task, host);
		return {
			status: 200,
			data: {
				anchor_id: id,
				segments: texts.length,
				status: "pending"
			}
		};
	}
	if (method === "GET" && dp === "list") return {
		status: 200,
		data: { tasks: Array.from(anchorTasks.values()).slice(0, 20) }
	};
	const parts = dp.split("/");
	const id = parts[0];
	if (!id) return null;
	const task = anchorTasks.get(id) || load(id);
	if (!task) return {
		status: 404,
		data: { error: "任务不存在" }
	};
	if (method === "GET" && parts.length === 1) return {
		status: 200,
		data: task
	};
	if (method === "POST" && parts[1] === "stop") {
		task.status = "stopped";
		task.message = "已停止";
		save(task);
		runningAnchors.delete(id);
		return {
			status: 200,
			data: { ok: true }
		};
	}
	if (method === "POST" && parts[1] === "resume") {
		if (!runningAnchors.has(id) && task.status !== "completed") {
			runningAnchors.add(id);
			runAnchor(task, host);
		}
		return {
			status: 200,
			data: { ok: true }
		};
	}
	if (method === "GET" && parts[1] === "status") {
		const done = task.segments.filter((s) => s.status === "done").length;
		return {
			status: 200,
			data: {
				anchor_id: task.anchor_id,
				status: task.status,
				message: task.message,
				segments: task.segments.length,
				done,
				total_duration: task.total_duration,
				error: task.error ?? null,
				final: task.status === "completed" ? `/agnes-studio/api/media/anchor/${task.anchor_id}/final.mp4` : null
			}
		};
	}
	return null;
}
/** Restrict anchor media requests to the anchor's own directory. */
function resolveAnchorMedia(anchorId, filename) {
	if (!anchorId || !filename) return null;
	const dir = resolve(anchorDir(anchorId));
	const candidate = resolve(dir, basename(filename));
	if (!candidate.startsWith(dir + "/") && !candidate.startsWith(dir + "\\")) return null;
	return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null;
}
/** Startup cleanup: mark jobs interrupted by a restart so the UI is not stuck. */
function rehydrateAnchors() {
	try {
		const root = join(dataRoot(), "anchors");
		if (!existsSync(root)) return;
		let count = 0;
		for (const d of readdirSync(root)) {
			const t = load(d);
			if (!t) continue;
			anchorTasks.set(d, t);
			if ([
				"pending",
				"tts",
				"visual",
				"muxing"
			].includes(t.status)) {
				t.status = "failed";
				t.message = "进程重启导致中断，可点击「重新生成」";
				save(t);
				count++;
			}
		}
		if (count) console.log(`[口播] 已恢复 ${count} 个中断任务`);
	} catch {}
}
//#endregion
//#region src/cover-engine.ts
/**
* 小说封面设计引擎（Host 端）
* 解析 TXT / DOCX 抽取书名、作者、简介，供面板生成 3:4 封面。
*
* DOCX 是 ZIP；这里用 node:zlib 手写一个最小 ZIP 读取器，避免引入依赖，
* 只取 word/document.xml 并剥离标签。
*/
/** Parse the ZIP central directory (enough to locate + inflate one entry). */
function readZipEntries(buf) {
	let eocd = -1;
	for (let i = buf.length - 22; i >= 0 && i > buf.length - 66e3; i--) if (buf.readUInt32LE(i) === 101010256) {
		eocd = i;
		break;
	}
	if (eocd < 0) return [];
	const count = buf.readUInt16LE(eocd + 10);
	let ptr = buf.readUInt32LE(eocd + 16);
	const entries = [];
	for (let i = 0; i < count; i++) {
		if (ptr + 46 > buf.length || buf.readUInt32LE(ptr) !== 33639248) break;
		const method = buf.readUInt16LE(ptr + 10);
		const compressedSize = buf.readUInt32LE(ptr + 20);
		const nameLen = buf.readUInt16LE(ptr + 28);
		const extraLen = buf.readUInt16LE(ptr + 30);
		const commentLen = buf.readUInt16LE(ptr + 32);
		const localOffset = buf.readUInt32LE(ptr + 42);
		const name = buf.slice(ptr + 46, ptr + 46 + nameLen).toString("utf8");
		entries.push({
			name,
			offset: localOffset,
			compressedSize,
			method
		});
		ptr += 46 + nameLen + extraLen + commentLen;
	}
	return entries;
}
/** Extract one entry's bytes from the local file header. */
function readZipEntry(buf, entry) {
	const off = entry.offset;
	if (off + 30 > buf.length || buf.readUInt32LE(off) !== 67324752) return null;
	const nameLen = buf.readUInt16LE(off + 26);
	const extraLen = buf.readUInt16LE(off + 28);
	const dataStart = off + 30 + nameLen + extraLen;
	const data = buf.slice(dataStart, dataStart + entry.compressedSize);
	try {
		if (entry.method === 0) return data;
		if (entry.method === 8) return inflateRawSync(data);
	} catch {
		return null;
	}
	return null;
}
/** Pull plain text out of a .docx document body. */
function extractDocxText(buf) {
	const doc = readZipEntries(buf).find((e) => e.name === "word/document.xml");
	if (!doc) return "";
	return decodeXmlEntities((readZipEntry(buf, doc)?.toString("utf8") ?? "").replace(/<w:br\s*\/>/g, "\n").replace(/<\/w:p>/g, "\n").replace(/<w:tab\s*\/>/g, " ").replace(/<[^>]+>/g, ""));
}
function decodeXmlEntities(s) {
	return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&amp;/g, "&");
}
/** Decode a text buffer, honouring UTF-8 BOM and falling back to GBK-ish bytes. */
function decodeText(buf) {
	let b = buf;
	if (b.length >= 3 && b[0] === 239 && b[1] === 187 && b[2] === 191) b = b.slice(3);
	const utf8 = b.toString("utf8");
	const bad = (utf8.match(/\uFFFD/g) ?? []).length;
	if (bad > 0 && bad > utf8.length * .01) try {
		return new TextDecoder("gb18030").decode(b);
	} catch {
		try {
			return new TextDecoder("gbk").decode(b);
		} catch {
			return utf8;
		}
	}
	return utf8;
}
const TITLE_HINTS = [
	/^\s*《(.+?)》\s*$/,
	/^\s*书名[:：]\s*(.+)$/,
	/^\s*title[:：]\s*(.+)$/i
];
const AUTHOR_HINTS = [
	/^\s*作者[:：]\s*(.+)$/,
	/^\s*作\s*者[:：]\s*(.+)$/,
	/^\s*by[:：]?\s*(.+)$/i,
	/^\s*著[:：]\s*(.+)$/
];
/**
* Derive title / author / summary from a novel file.
* Title falls back to the filename; summary is the opening prose with
* chapter headings and metadata lines removed.
*/
function extractNovelMeta(text, filename) {
	const nonEmpty = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	let title = "";
	let author = "";
	for (const line of nonEmpty.slice(0, 30)) {
		if (!title) for (const re of TITLE_HINTS) {
			const m = re.exec(line);
			if (m?.[1]?.trim()) {
				title = m[1].trim();
				break;
			}
		}
		if (!author) for (const re of AUTHOR_HINTS) {
			const m = re.exec(line);
			if (m?.[1]?.trim()) {
				author = m[1].trim();
				break;
			}
		}
		if (title && author) break;
	}
	if (!title) title = basename(filename, extname(filename)).replace(/[《》]/g, "").trim() || "未命名作品";
	const noise = /^(书名|作者|作\s*者|简介|内容简介|摘要|前言|序|第[一二三四五六七八九十百千\d]+[章节回卷]|chapter\s*\d+|[-=*_—]{3,})/i;
	const isJunk = (l) => noise.test(l) || /HYPERLINK|PAGEREF|\\l\s+"|toc_auto/i.test(l) || /^[\d.\s、]+$/.test(l);
	const summary = nonEmpty.filter((l) => !isJunk(l) && l.length > 12).join("").slice(0, 400).trim();
	return {
		title: title.slice(0, 60),
		author: author.slice(0, 40),
		summary,
		charCount: text.length,
		source: filename
	};
}
/** Save an uploaded novel file and return its extracted metadata. */
function analyzeNovelFile(filename, contentBase64) {
	try {
		const buf = Buffer.from(contentBase64, "base64");
		if (buf.length === 0) return {
			ok: false,
			error: "文件内容为空"
		};
		if (buf.length > 41943040) return {
			ok: false,
			error: "文件过大（上限 40MB）"
		};
		const ext = extname(filename).toLowerCase();
		let text = "";
		if (ext === ".docx") {
			text = extractDocxText(buf);
			if (!text.trim()) return {
				ok: false,
				error: "未能从 DOCX 中解析出文字（可能不是标准 .docx，试试另存为 .txt）"
			};
		} else if (ext === ".doc") return {
			ok: false,
			error: "不支持旧版 .doc，请在 Word 中另存为 .docx 或 .txt"
		};
		else {
			text = decodeText(buf);
			if (!text.trim()) return {
				ok: false,
				error: "文件内容为空或不是纯文本"
			};
		}
		const meta = extractNovelMeta(text, filename);
		const dir = join(dataRoot(), "covers");
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, `source${ext === ".docx" ? ".txt" : ext}`), text, "utf8");
		return {
			ok: true,
			meta
		};
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : String(e)
		};
	}
}
const COVER_STYLES = [
	{
		key: "guofeng",
		name: "国风水墨",
		prompt: "Chinese ink-wash painting style, elegant, rice-paper texture, negative space, subtle red seal accent"
	},
	{
		key: "dushi",
		name: "都市写实",
		prompt: "cinematic urban photography, moody lighting, shallow depth of field, modern city atmosphere"
	},
	{
		key: "xianxia",
		name: "仙侠玄幻",
		prompt: "ethereal xianxia fantasy, glowing spiritual energy, misty mountains, dramatic celestial light"
	},
	{
		key: "xuanyi",
		name: "悬疑暗调",
		prompt: "dark suspense thriller mood, high contrast, cold tones, mysterious fog, cinematic tension"
	},
	{
		key: "yanqing",
		name: "言情清新",
		prompt: "soft romantic illustration, pastel palette, warm gentle light, dreamy bokeh"
	},
	{
		key: "kehuan",
		name: "科幻未来",
		prompt: "science-fiction concept art, neon and chrome, futuristic skyline, volumetric light"
	}
];
/** Build the image prompt for a cover. */
function buildCoverPrompt(meta, styleKey, extra) {
	const style = COVER_STYLES.find((s) => s.key === styleKey) ?? COVER_STYLES[0];
	const theme = meta.summary.slice(0, 160);
	return [
		`Book cover artwork for a Chinese web novel titled "${meta.title}".`,
		theme ? `Story theme: ${theme}` : "",
		style.prompt,
		"Vertical portrait composition with clear space at the top for the title and at the bottom for the author name.",
		"No text, no letters, no watermark in the image.",
		extra ? String(extra).slice(0, 200) : ""
	].filter(Boolean).join(" ");
}
//#endregion
//#region src/prompt-expert-engine.ts
const EXPERT_TYPES = [
	{
		key: "t2i",
		icon: "🖼",
		name: "文生图专家",
		desc: "把想法扩写成专业绘图提示词",
		placeholder: "例如：一个穿汉服的女孩在樱花树下弹古筝",
		fields: [
			{
				key: "style",
				label: "画面风格",
				type: "select",
				default: "不限",
				options: [
					"不限",
					"写实摄影",
					"动漫插画",
					"国风水墨",
					"赛博朋克",
					"3D渲染",
					"水彩手绘",
					"电影质感"
				]
			},
			{
				key: "ratio",
				label: "画幅比例",
				type: "select",
				default: "1:1",
				options: [
					"1:1",
					"16:9",
					"9:16",
					"4:3",
					"3:4"
				]
			},
			{
				key: "shot",
				label: "景别",
				type: "select",
				default: "不限",
				options: [
					"不限",
					"特写",
					"半身",
					"全身",
					"远景",
					"鸟瞰"
				]
			}
		]
	},
	{
		key: "i2i",
		icon: "🎨",
		name: "图生图专家",
		desc: "生成精准的改图指令",
		placeholder: "例如：把这张产品图的背景换成海边黄昏，保持产品不变",
		fields: [{
			key: "strength",
			label: "改动幅度",
			type: "select",
			default: "中等",
			options: [
				"轻微",
				"中等",
				"大幅重绘"
			]
		}, {
			key: "style",
			label: "目标风格",
			type: "select",
			default: "不限",
			options: [
				"不限",
				"写实摄影",
				"动漫插画",
				"水彩手绘",
				"3D渲染",
				"电商主图"
			]
		}]
	},
	{
		key: "t2v",
		icon: "🎬",
		name: "文生视频专家",
		desc: "生成含运镜与光线的视频提示词",
		placeholder: "例如：一只猫在夕阳下的海滩散步，海浪轻轻涌来",
		fields: [
			{
				key: "camera",
				label: "镜头运动",
				type: "select",
				default: "缓慢推进",
				options: [
					"固定镜头",
					"缓慢推进",
					"缓慢拉远",
					"左摇",
					"右摇",
					"跟随"
				]
			},
			{
				key: "duration",
				label: "时长",
				type: "select",
				default: "5秒",
				options: ["5秒", "10秒"]
			},
			{
				key: "style",
				label: "画面风格",
				type: "select",
				default: "电影感",
				options: [
					"电影感",
					"写实",
					"动漫",
					"赛博朋克",
					"国风"
				]
			}
		]
	},
	{
		key: "novel",
		icon: "📖",
		name: "小说生成专家",
		desc: "生成设定、大纲与开篇正文",
		placeholder: "例如：都市悬疑，法医女主追查连环失踪案",
		fields: [
			{
				key: "genre",
				label: "题材",
				type: "select",
				default: "都市",
				options: [
					"都市",
					"悬疑",
					"玄幻",
					"言情",
					"科幻",
					"历史",
					"恐怖"
				]
			},
			{
				key: "words",
				label: "开篇字数",
				type: "select",
				default: "800字",
				options: [
					"500字",
					"800字",
					"1500字",
					"3000字"
				]
			},
			{
				key: "tone",
				label: "文风",
				type: "select",
				default: "轻松明快",
				options: [
					"轻松明快",
					"沉稳厚重",
					"紧张刺激",
					"唯美抒情"
				]
			}
		]
	},
	{
		key: "drama",
		icon: "🎭",
		name: "短剧剧本专家",
		desc: "生成带钩子的竖屏短剧剧本",
		placeholder: "例如：外卖员逆袭成集团继承人，第一集被打脸",
		fields: [{
			key: "genre",
			label: "题材",
			type: "select",
			default: "逆袭",
			options: [
				"逆袭",
				"甜宠",
				"悬疑",
				"家庭伦理",
				"职场",
				"古装"
			]
		}, {
			key: "duration",
			label: "单集时长",
			type: "select",
			default: "1-2分钟",
			options: [
				"1分钟",
				"1-2分钟",
				"3分钟"
			]
		}]
	},
	{
		key: "anchor",
		icon: "🎙",
		name: "数字人口播专家",
		desc: "生成适合 TTS 朗读的口播稿",
		placeholder: "例如：介绍一款降噪耳机，突出性价比",
		fields: [{
			key: "length",
			label: "稿件长度",
			type: "select",
			default: "约300字",
			options: [
				"约150字",
				"约300字",
				"约500字"
			]
		}, {
			key: "tone",
			label: "语气",
			type: "select",
			default: "亲切自然",
			options: [
				"亲切自然",
				"专业理性",
				"激情带货",
				"轻松幽默"
			]
		}]
	},
	{
		key: "sheet",
		icon: "🧍",
		name: "角色三视图专家",
		desc: "生成角色设定与三视图提示词",
		placeholder: "例如：28岁职场女性，干练短发，穿深色西装",
		fields: [{
			key: "style",
			label: "画风",
			type: "select",
			default: "动漫插画",
			options: [
				"动漫插画",
				"写实",
				"国风",
				"3D渲染",
				"水彩"
			]
		}, {
			key: "gender",
			label: "性别",
			type: "select",
			default: "不限",
			options: [
				"不限",
				"男性",
				"女性"
			]
		}]
	}
];
const EXPERT_OUTPUT_RULE = `
输出格式（严格遵守，不要有任何前言、解释或 markdown 代码块）：
先输出【中文提示词】，再输出【English Prompt】，两段语义一一对应。
最后另起一行输出【推荐参数】，给出推荐尺寸/时长/风格等。`;
const EXPERT_PROMPTS = {
	t2i: () => `你是一位资深 AI 绘画提示词工程师，擅长把口语化想法改写成高质量绘图提示词。
任务：把用户用中文描述的想法，扩写成可直接投喂文生图模型的专业提示词。
${EXPERT_OUTPUT_RULE}
英文提示词要求：一段式、逗号分隔，顺序为：主体→外观细节→姿态/动作→环境背景→构图景别→光线→风格→画质词。用词具体可视觉化。`,
	i2i: () => `你是一位图生图（Image-to-Image）改图提示词专家。
任务：根据用户想对参考图做的修改，写出精确的改图指令。
${EXPERT_OUTPUT_RULE}
改图指令要求：只描述"需要改变的部分"，明确写 keep everything else unchanged。不要重复描述原图已有的内容。`,
	t2v: () => `你是一位 AI 视频生成提示词专家，熟悉文生视频模型的特性。
任务：把用户想法改写为高质量视频提示词。
${EXPERT_OUTPUT_RULE}
视频提示词要求：顺序为 [主体]+[动作]+[场景]+[镜头运动]+[光线]+[风格]，英文一段式。只写一个连贯镜头能完成的动作。必须在末尾附加：no text, no subtitles, no watermarks。`,
	novel: () => `你是一位中文小说作家与选题策划人。
任务：根据用户想法产出小说方案与开篇正文。
输出格式（严格遵守）：【标题】【故事设定】世界观+核心冲突【章节大纲】3-5章【开篇正文】【English Summary】3-5句英文概要。`,
	drama: () => `你是一位短剧编剧，熟悉竖屏短剧的创作规律。
任务：根据用户想法产出短剧剧本。
输出格式：【剧名】【人物表】2-4个角色【分场剧本】每场含场次标题、画面描述、台词【English Summary】英文概要。开篇15秒必须有强钩子。`,
	anchor: () => `你是一位短视频口播文案策划。
任务：根据用户想法产出可直接配音的口播稿。
输出格式：【标题】【口播正文】分段输出，每段40-60字【English Summary】英文概要。开头3秒必须有钩子，句子短、口语化。`,
	sheet: () => `你是一位角色设定提示词专家。
任务：根据用户描述的角色，产出用于生成"三视图设定图"的专业提示词。
${EXPERT_OUTPUT_RULE}
要求：结构为人物身份/年龄→发型发色→五官特征→服装→配饰→身材比例。画面要求：正面+侧面+背面三视图，纯白背景。`
};
async function handlePromptExpertRoute(method, urlPath, body, resolveApiKey, getVendorFromModel) {
	const ep = urlPath.replace(/^\/agnes-studio\/api\/?/, "").replace(/^prompt-expert\/?/, "");
	if (method === "GET" && ep === "types") return {
		status: 200,
		data: { types: EXPERT_TYPES }
	};
	if (method === "POST" && ep === "generate") {
		const { type: expertKey, idea, params, model } = body || {};
		if (!expertKey || !idea) return {
			status: 400,
			data: { error: "缺少专家类型或想法" }
		};
		if (!EXPERT_PROMPTS[expertKey]) return {
			status: 400,
			data: { error: `未知专家类型: ${expertKey}` }
		};
		const paramLines = [];
		if (params && typeof params === "object") {
			for (const [k, v] of Object.entries(params)) if (v && v !== "不限") paramLines.push(`${k}: ${v}`);
		}
		`${idea}${paramLines.length > 0 ? paramLines.join("；") : "（用户未指定，按专业判断补充）"}`;
		const selectedModel = model || "agnes-3.0-flash";
		const vendor = getVendorFromModel(selectedModel);
		let apiKey = "";
		try {
			apiKey = await resolveApiKey(vendor);
		} catch {
			return {
				status: 401,
				data: { error: "API Key 未配置" }
			};
		}
		try {
			const prompt = await generatePromptExpert(expertKey, idea, params ?? {}, apiKey, selectedModel);
			if (!prompt) return {
				status: 502,
				data: { error: "模型没有返回内容" }
			};
			return {
				status: 200,
				data: {
					prompt,
					model: selectedModel
				}
			};
		} catch (e) {
			return {
				status: 502,
				data: { error: e instanceof Error ? e.message : String(e) }
			};
		}
	}
	return null;
}
const VENDOR_URLS = {
	agnes: "https://api.agnes-ai.cn/v1",
	deepseek: "https://api.deepseek.com/v1",
	qwen: "https://dashscope.aliuncs.com/compatible-mode/v1",
	doubao: "https://ark.cn-beijing.volces.com/api/v3",
	minimax: "https://api.minimaxi.com/v1",
	ollama: "http://localhost:11434/v1"
};
function getVendor(model) {
	if (!model) return "agnes";
	const m = model.toLowerCase();
	if (m.startsWith("ollama:")) return "ollama";
	for (const p of Object.keys(VENDOR_URLS)) if (p !== "agnes" && m.startsWith(p)) return p;
	return "agnes";
}
async function callTextModelLocal(sysPrompt, userPrompt, apiKey, model, maxTokens = 2048) {
	const baseUrl = VENDOR_URLS[getVendor(model)] || VENDOR_URLS.agnes;
	const ac = new AbortController();
	const t = setTimeout(() => ac.abort(), 12e4);
	try {
		const r = await fetch(`${baseUrl}/chat/completions`, {
			method: "POST",
			signal: ac.signal,
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model,
				messages: [{
					role: "system",
					content: sysPrompt
				}, {
					role: "user",
					content: userPrompt
				}],
				max_tokens: maxTokens,
				temperature: .7
			})
		});
		if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 300)}`);
		return (await r.json()).choices?.[0]?.message?.content || "";
	} finally {
		clearTimeout(t);
	}
}
async function generatePromptExpert(expertKey, idea, params, apiKey, model) {
	const promptBuilder = EXPERT_PROMPTS[expertKey];
	if (!promptBuilder) throw new Error(`未知专家类型: ${expertKey}`);
	const paramLines = [];
	for (const [k, v] of Object.entries(params)) if (v && v !== "不限") paramLines.push(`${k}: ${v}`);
	const userPrompt = `用户的想法：${idea}\n\n用户选择的参数：${paramLines.length > 0 ? paramLines.join("；") : "（用户未指定，按专业判断补充）"}\n\n请按系统提示要求的格式输出结果。`;
	return (await callTextModelLocal(promptBuilder(), userPrompt, apiKey, model, 2048)).trim();
}
//#endregion
//#region src/index.ts
/** Stable cordis plugin name. */
const name = "agnes-studio";
/** Required services. */
const inject = [
	"webServer",
	"systemPrompt",
	"credentials"
];
/** Model-facing announcement. */
const AGNES_STUDIO_GUIDANCE = "本机已安装 dsh-agnes-studio 插件（泡泡猫的影视工具）：侧边栏「🎬 泡泡猫的影视工具」入口打开影视工具面板（内部即 Agnes 创意工作站）。能力：文生图、图生图、多图合成、文生视频、图生视频、剧本导入（.txt/.md/.json）、故事板编排。多厂商支持：面板现已支持 Agnes / DeepSeek / Qwen / 豆包(Doubao) / MiniMax / Ollama 六大厂商的文本、图像和视频模型，代理端点自动按模型名路由到对应厂商 API。限制：面板为全局浮层，不影响对话框；API Key 由宿主进程读取，浏览器不接触。首次使用需要对应厂商的 API Key：Agnes 在 https://platform.agnes-ai.cn 注册；其他厂商各自的 Key 写入 .env（如 DEEPSEEK_API_KEY=sk-...）或 DSH 凭据（如 deepseek-api-key）。Ollama 无需 Key，需本地运行 11434 端口。用户提到「泡泡猫的影视工具 / Agnes 创意站 / 创意工作站 / 生图 / 生视频 / agnes studio」时即指本插件，可引导其从侧边栏入口打开。";
const SECTION_ORDER = 310;
/** Vendor Base URL mapping. */
const VENDOR_BASE_URLS = {
	agnes: "https://api.agnes-ai.cn/v1",
	deepseek: "https://api.deepseek.com/v1",
	qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
	doubao: "https://ark.cn-beijing.volces.com/api/v3",
	minimax: "https://api.minimaxi.com/v1",
	ollama: "http://localhost:11434/v1"
};
/** Platform registration URL (Agnes). */
const AGNES_PLATFORM_URL = "https://platform.agnes-ai.cn";
/**
* Infer vendor from model name.
* e.g. "deepseek-v4-flash" → "deepseek", "ollama:llama3" → "ollama"
*/
function getVendorFromModel(model) {
	if (!model) return "agnes";
	const m = model.toLowerCase();
	if (m.startsWith("ollama:")) return "ollama";
	for (const prefix of Object.keys(VENDOR_BASE_URLS)) if (prefix !== "agnes" && m.startsWith(prefix)) return prefix;
	return "agnes";
}
/** Get vendor base URL, with optional custom override. */
function getVendorBaseUrl(vendor, customUrl) {
	if (customUrl) return customUrl;
	return VENDOR_BASE_URLS[vendor] || VENDOR_BASE_URLS.agnes;
}
/**
* Join a vendor base URL with a client endpoint without duplicating or losing
* the API version segment.
*
* The base URLs above already carry a version (`.../v1`, `.../api/v3`), while
* clients also send fully-qualified endpoints (`/v1/images/generations`,
* `/v2/video_generation`). Naive concatenation produced `.../v1/v1/...`, which
* Agnes answered with 404 — every image/video call from the panel failed.
*
* Rules:
*   base .../v1 + /v1/images/...   → .../v1/images/...   (version deduped)
*   base .../v1 + /images/...      → .../v1/images/...
*   base .../v1 + /v2/video_gen    → .../v2/video_gen    (endpoint version wins)
*   base .../v1 + /agnesapi?...    → .../v1/agnesapi?...
*/
function buildUpstreamUrl(baseUrl, endpoint) {
	const base = String(baseUrl || "").replace(/\/+$/, "");
	const ep = "/" + String(endpoint || "").replace(/^\/+/, "");
	const baseVersion = base.match(/\/(v\d+[a-z0-9]*)$/i);
	const endpointVersion = ep.match(/^\/(v\d+[a-z0-9]*)(\/|$)/i);
	if (baseVersion && endpointVersion) return base.slice(0, base.length - baseVersion[0].length) + ep;
	return base + ep;
}
/**
* Resolve the API key for a specific vendor.
* Priority: vendor-specific credential → vendor-specific env → Agnes fallback → error.
*/
async function resolveApiKeyForVendor(ctx, vendor) {
	if (vendor === "ollama") return "ollama";
	const credentialKey = `${vendor}-api-key`;
	try {
		const resolved = await ctx.credentials.resolve(credentialKey);
		if (resolved && typeof resolved === "string" && resolved.length > 0) return resolved;
	} catch {}
	const envKey = `${vendor.toUpperCase()}_API_KEY`;
	if (process.env[envKey]) return process.env[envKey];
	throw new Error(`${vendor} API Key 未配置：请在本机 .env 写入 ${envKey}=... 或在 DSH 凭据(credentials)中新增 ${credentialKey}。` + (vendor === "agnes" ? ` Agnes Key 也可在 ${AGNES_PLATFORM_URL} 注册获取。` : ""));
}
/**
* Get key configuration status for all vendors (never exposes actual keys).
*/
async function getKeyStatus(ctx) {
	const vendors = [
		"agnes",
		"deepseek",
		"qwen",
		"doubao",
		"minimax",
		"ollama"
	];
	const status = {};
	for (const vendor of vendors) {
		if (vendor === "ollama") {
			status[vendor] = {
				configured: true,
				source: "built-in",
				envKey: "",
				credentialKey: ""
			};
			continue;
		}
		try {
			const resolved = await ctx.credentials.resolve(`${vendor}-api-key`);
			if (resolved && typeof resolved === "string" && resolved.length > 0) {
				status[vendor] = {
					configured: true,
					source: "credentials",
					envKey: `${vendor.toUpperCase()}_API_KEY`,
					credentialKey: `${vendor}-api-key`
				};
				continue;
			}
		} catch {}
		if (process.env[`${vendor.toUpperCase()}_API_KEY`]) {
			status[vendor] = {
				configured: true,
				source: "env",
				envKey: `${vendor.toUpperCase()}_API_KEY`,
				credentialKey: `${vendor}-api-key`
			};
			continue;
		}
		status[vendor] = {
			configured: false,
			source: null,
			envKey: `${vendor.toUpperCase()}_API_KEY`,
			credentialKey: `${vendor}-api-key`
		};
	}
	return status;
}
const TEXT_MODEL_OPTIONS = {
	"agnes-3.0-flash": "Agnes 3.0 Flash (推荐)",
	"agnes-2.5-flash": "Agnes 2.5 Flash",
	"MiniMax-M3": "MiniMax M3",
	"deepseek-v4-flash": "DeepSeek V4 Flash",
	"deepseek-chat": "DeepSeek Chat",
	"deepseek-reasoner": "DeepSeek Reasoner",
	"qwen-turbo": "Qwen Turbo",
	"qwen-plus": "Qwen Plus"
};
const IMAGE_MODEL_OPTIONS = {
	"agnes-image-2.5-flash": "Agnes Image 2.5 Flash (推荐)",
	"agnes-image-2.1-flash": "Agnes Image 2.1 Flash",
	"agnes-image-2.0-flash": "Agnes Image 2.0 Flash",
	"doubao-seedream-3-0": "豆包 Seedream 3.0",
	"minimax-image-01": "MiniMax Image 01",
	"qwen-image-plus": "Qwen Image Plus"
};
const VIDEO_MODEL_OPTIONS = {
	"agnes-video-2.5-flash": "Agnes Video 2.5 Flash (推荐)",
	"agnes-video-2.5": "Agnes Video 2.5",
	"MiniMax-H3": "MiniMax H3",
	"agnes-video-v2.0": "Agnes Video 2.0",
	"minimax-video-01": "MiniMax Video 01",
	"doubao-seaweed-t2v": "豆包 Seaweed T2V"
};
/** Supported image sizes per model prefix. */
const IMAGE_MODEL_SIZE_SUPPORTED = {
	"agnes-image": [
		"1024x1024",
		"1024x768",
		"768x1024",
		"1280x720",
		"720x1280"
	],
	"doubao-seedream": [
		"1024x1024",
		"864x1152",
		"1152x864",
		"1280x720",
		"720x1280"
	],
	"minimax-image": [
		"1024x1024",
		"1024x768",
		"768x1024",
		"1280x720",
		"720x1280"
	],
	"qwen-image": [
		"1024x1024",
		"1024x768",
		"768x1024",
		"1280x720",
		"720x1280"
	]
};
const DEFAULT_IMAGE_SIZES = [
	"1024x1024",
	"1024x768",
	"768x1024",
	"1280x720",
	"720x1280"
];
function getImageSizeOptions(model) {
	if (!model) return DEFAULT_IMAGE_SIZES;
	const m = model.toLowerCase();
	for (const [prefix, sizes] of Object.entries(IMAGE_MODEL_SIZE_SUPPORTED)) if (m.startsWith(prefix)) return [...sizes, ...DEFAULT_IMAGE_SIZES.filter((s) => !sizes.includes(s))];
	return DEFAULT_IMAGE_SIZES;
}
/** Read the full request body as a string. */
function readBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on("data", (chunk) => chunks.push(chunk));
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});
}
/**
* Generic fetch with timeout and bounded retries.
*
* Agnes occasionally answers 5xx with "请求上游失败，请稍后重试" — a transient
* upstream hiccup that succeeds on retry. Only clearly transient failures are
* retried, and only when the caller says the call is safe to repeat:
*   - network/abort errors (the request never produced a result)
*   - 5xx / 429 for idempotent endpoints (e.g. image generation)
* Video submission is deliberately NOT retried by default: a duplicate submit
* would create a second task and burn quota.
*/
async function vendorFetch(url, opts = {}) {
	const { timeoutMs = 12e4, retries = 0, ...fetchOpts } = opts;
	const maxAttempts = Math.max(1, retries + 1);
	let lastError = /* @__PURE__ */ new Error("请求失败");
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const resp = await fetch(url, {
				...fetchOpts,
				signal: controller.signal
			});
			if (resp.ok) return await resp.json();
			const text = await resp.text().catch(() => "");
			const err = /* @__PURE__ */ new Error(`API ${resp.status}: ${text.slice(0, 500)}`);
			const transient = resp.status >= 500 || resp.status === 429;
			lastError = err;
			if (!transient || attempt === maxAttempts - 1) throw err;
		} catch (e) {
			const err = e instanceof Error ? e : new Error(String(e));
			lastError = err;
			if (attempt === maxAttempts - 1) throw err;
		} finally {
			clearTimeout(timer);
		}
		await new Promise((r) => setTimeout(r, 1200 * Math.pow(2, attempt)));
	}
	throw lastError;
}
function jsonResponse(res, status, data) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(data));
}
function textResponse(res, status, text) {
	res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
	res.end(text);
}
/**
* Stream a local media file with HTTP Range support.
* Ranges matter: without them the browser cannot seek in the generated video.
*/
function serveMediaFile(req, res, file) {
	let stat;
	try {
		stat = statSync(file);
	} catch {
		textResponse(res, 404, "media not found");
		return;
	}
	if (!stat.isFile()) {
		textResponse(res, 404, "media not found");
		return;
	}
	const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
	const type = ext === ".mp4" ? "video/mp4" : ext === ".webm" ? "video/webm" : ext === ".wav" ? "audio/wav" : ext === ".mp3" ? "audio/mpeg" : ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "application/octet-stream";
	const range = req.headers?.range;
	if (typeof range === "string") {
		const m = /bytes=(\d*)-(\d*)/.exec(range);
		if (m) {
			const start = m[1] === "" ? Math.max(0, stat.size - Number(m[2] || 0)) : Number(m[1]);
			const end = m[2] === "" || m[1] === "" ? stat.size - 1 : Math.min(Number(m[2]), stat.size - 1);
			if (Number.isFinite(start) && start <= end && start < stat.size) {
				res.writeHead(206, {
					"content-type": type,
					"content-length": String(end - start + 1),
					"content-range": `bytes ${start}-${end}/${stat.size}`,
					"accept-ranges": "bytes",
					"cache-control": "no-cache"
				});
				createReadStream(file, {
					start,
					end
				}).pipe(res);
				return;
			}
		}
	}
	res.writeHead(200, {
		"content-type": type,
		"content-length": String(stat.size),
		"accept-ranges": "bytes",
		"cache-control": "no-cache"
	});
	createReadStream(file).pipe(res);
}
/**
* Mount the multi-vendor API proxy routes and agent announcement.
*/
function apply(ctx) {
	rehydrateDramas();
	rehydrateAnchors();
	ctx.effect(() => {
		const handler = async (req, res) => {
			const method = req.method ?? "GET";
			const path = new URL(req.url ?? "/", "http://dsh.invalid").pathname;
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type");
			if (method === "OPTIONS") {
				res.writeHead(204);
				res.end();
				return;
			}
			if (path === "/agnes-studio/api/status") {
				if (method !== "GET" && method !== "POST") return textResponse(res, 405, "method not allowed");
				const vendors = await getKeyStatus(ctx);
				const agnesStatus = vendors.agnes ?? {
					configured: false,
					source: null
				};
				jsonResponse(res, 200, {
					configured: agnesStatus.configured,
					source: agnesStatus.source,
					vendors,
					platformUrl: AGNES_PLATFORM_URL
				});
				return;
			}
			if (path === "/agnes-studio/api/models") {
				if (method !== "GET" && method !== "POST") return textResponse(res, 405, "method not allowed");
				jsonResponse(res, 200, {
					textModels: TEXT_MODEL_OPTIONS,
					imageModels: IMAGE_MODEL_OPTIONS,
					videoModels: VIDEO_MODEL_OPTIONS,
					imageSizes: DEFAULT_IMAGE_SIZES
				});
				return;
			}
			if (path === "/agnes-studio/api/config") {
				if (method !== "POST") return textResponse(res, 405, "method not allowed");
				try {
					const body = await readBody(req);
					jsonResponse(res, 200, {
						ok: true,
						config: JSON.parse(body)
					});
				} catch (error) {
					jsonResponse(res, 400, { error: error instanceof Error ? error.message : String(error) });
				}
				return;
			}
			if (path === "/agnes-studio/api/image-sizes") {
				jsonResponse(res, 200, { sizes: getImageSizeOptions(new URL(req.url ?? "/", "http://dsh.invalid").searchParams.get("model") ?? "") });
				return;
			}
			if (path === "/agnes-studio/api/proxy") {
				if (method !== "POST") return textResponse(res, 405, "method not allowed");
				try {
					const body = await readBody(req);
					const parsed = JSON.parse(body);
					const { endpoint, params, timeoutMs, baseUrl: customUrl } = parsed;
					if (!endpoint) return textResponse(res, 400, "missing endpoint");
					const vendor = parsed.vendor || getVendorFromModel(parsed.model || "");
					const apiKey = await resolveApiKeyForVendor(ctx, vendor);
					const url = buildUpstreamUrl(getVendorBaseUrl(vendor, customUrl), endpoint);
					const upstreamMethod = parsed.method === "GET" ? "GET" : "POST";
					const isImageGen = /\/images\/generations/.test(endpoint);
					const retries = /\/videos\/?$/.test(endpoint) && upstreamMethod === "POST" ? 0 : isImageGen ? 3 : upstreamMethod === "GET" ? 2 : 0;
					jsonResponse(res, 200, await vendorFetch(url, {
						method: upstreamMethod,
						headers: {
							Authorization: `Bearer ${apiKey}`,
							"Content-Type": "application/json"
						},
						body: upstreamMethod === "GET" ? void 0 : JSON.stringify(params || {}),
						timeoutMs: timeoutMs || 12e4,
						retries
					}));
				} catch (error) {
					jsonResponse(res, 502, { error: error instanceof Error ? error.message : String(error) });
				}
				return;
			}
			if (path.startsWith("/agnes-studio/api/drama")) try {
				const result = await handleDramaRoute(method, path, method === "POST" ? JSON.parse(await readBody(req)) : {}, {
					resolveKey: async (vendor) => {
						if (vendor === "ollama") return "ollama";
						return resolveApiKeyForVendor(ctx, vendor);
					},
					call: async (vendor, endpoint, opts = {}) => {
						const apiKey = await resolveApiKeyForVendor(ctx, vendor);
						const url = buildUpstreamUrl(getVendorBaseUrl(vendor), endpoint);
						const upstreamMethod = opts.method === "GET" ? "GET" : "POST";
						return vendorFetch(url, {
							method: upstreamMethod,
							headers: {
								Authorization: `Bearer ${apiKey}`,
								"Content-Type": "application/json"
							},
							body: upstreamMethod === "GET" ? void 0 : JSON.stringify(opts.body ?? {}),
							timeoutMs: opts.timeoutMs || 12e4
						});
					},
					resolveCredential: async (name, envName) => {
						try {
							const v = await ctx.credentials.resolve(name);
							if (v && typeof v === "string" && v.length > 0) return v;
						} catch {}
						if (process.env[envName]) return process.env[envName];
						throw new Error(`未配置 ${envName}（凭据 ${name}）。`);
					}
				});
				if (result) {
					jsonResponse(res, result.status, result.data);
					return;
				}
			} catch (e) {
				jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) });
				return;
			}
			if (path.startsWith("/agnes-studio/api/anchor")) try {
				const result = await handleAnchorRoute(method, path, method === "POST" ? JSON.parse(await readBody(req)) : {}, {
					resolveTtsKey: async () => {
						try {
							const v = await ctx.credentials.resolve("mimo-api-key");
							if (v && typeof v === "string" && v.length > 0) return v;
						} catch {}
						if (process.env.MIMO_API_KEY) return process.env.MIMO_API_KEY;
						throw new Error("未配置 TTS 配音 Key：请在本机 .env 写入 MIMO_API_KEY=... 或在 DSH 凭据中新增 mimo-api-key。");
					},
					call: async (vendor, endpoint, opts = {}) => {
						const apiKey = await resolveApiKeyForVendor(ctx, vendor);
						const url = buildUpstreamUrl(getVendorBaseUrl(vendor), endpoint);
						const upstreamMethod = opts.method === "GET" ? "GET" : "POST";
						return vendorFetch(url, {
							method: upstreamMethod,
							headers: {
								Authorization: `Bearer ${apiKey}`,
								"Content-Type": "application/json"
							},
							body: upstreamMethod === "GET" ? void 0 : JSON.stringify(opts.body ?? {}),
							timeoutMs: opts.timeoutMs || 12e4
						});
					}
				});
				if (result) {
					jsonResponse(res, result.status, result.data);
					return;
				}
			} catch (e) {
				jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) });
				return;
			}
			if (path.startsWith("/agnes-studio/api/media/")) {
				const parts = path.slice(24).split("/").map(decodeURIComponent);
				let file = null;
				if (parts[0] === "anchor" && parts.length >= 3) file = resolveAnchorMedia(parts[1], parts.slice(2).join("/"));
				else if (parts.length >= 2) file = resolveDramaMedia(parts[0], parts.slice(1).join("/"));
				if (!file) {
					textResponse(res, 404, "media not found");
					return;
				}
				serveMediaFile(req, res, file);
				return;
			}
			if (path.startsWith("/agnes-studio/api/cover")) {
				try {
					const body = method === "POST" ? JSON.parse(await readBody(req)) : {};
					const sub = path.slice(23).replace(/^\//, "");
					if (method === "GET" && sub === "styles") {
						jsonResponse(res, 200, { styles: COVER_STYLES.map((s) => ({
							key: s.key,
							name: s.name
						})) });
						return;
					}
					if (method === "POST" && sub === "parse") {
						const result = analyzeNovelFile(String(body?.filename ?? "novel.txt"), String(body?.content ?? ""));
						if (!result.ok) {
							jsonResponse(res, 400, { error: result.error });
							return;
						}
						jsonResponse(res, 200, { meta: result.meta });
						return;
					}
					if (method === "POST" && sub === "build") {
						const meta = {
							title: String(body?.title ?? "").trim(),
							author: String(body?.author ?? "").trim(),
							summary: String(body?.summary ?? "").trim(),
							charCount: 0,
							source: ""
						};
						if (!meta.title) {
							jsonResponse(res, 400, { error: "缺少书名" });
							return;
						}
						jsonResponse(res, 200, { prompt: buildCoverPrompt(meta, String(body?.style ?? ""), String(body?.extra ?? "")) });
						return;
					}
					jsonResponse(res, 404, { error: "not found" });
				} catch (e) {
					jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) });
				}
				return;
			}
			if (path === "/agnes-studio/api/ffmpeg") {
				try {
					jsonResponse(res, 200, await ffmpegStatus());
				} catch (e) {
					jsonResponse(res, 200, {
						available: false,
						hint: e instanceof Error ? e.message : String(e)
					});
				}
				return;
			}
			if (path.startsWith("/agnes-studio/api/prompt-expert")) {
				try {
					const expertResult = await handlePromptExpertRoute(method, path, method === "POST" ? JSON.parse(await readBody(req)) : {}, (v) => v === "ollama" ? Promise.resolve("ollama") : resolveApiKeyForVendor(ctx, v), getVendorFromModel);
					if (expertResult) jsonResponse(res, expertResult.status, expertResult.data);
					else textResponse(res, 405, "method not allowed");
				} catch (e) {
					jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) });
				}
				return;
			}
			textResponse(res, 404, "not found");
		};
		return ctx.webServer.register({
			kind: "prefix",
			path: "/agnes-studio/api",
			handler
		});
	}, "dsh-agnes-studio: api-proxy");
	ctx.effect(() => ctx.systemPrompt.section({
		name: "plugin:dsh-agnes-studio",
		order: SECTION_ORDER,
		text: AGNES_STUDIO_GUIDANCE
	}), "dsh-agnes-studio: prompt section");
}
//#endregion
export { apply, buildUpstreamUrl, inject, name };

//# sourceMappingURL=index.js.map