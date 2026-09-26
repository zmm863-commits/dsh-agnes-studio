import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
//#region src/drama-engine.ts
/**
* 短剧流水线引擎 — Host 端核心逻辑
* 管理短剧任务的创建、状态、持久化和异步执行。
*/
const dramaTasks = /* @__PURE__ */ new Map();
const runningDramas = /* @__PURE__ */ new Set();
const DRAMA_DIR = "/tmp/dsh-agnes-studio/dramas";
function getDramaPath(id) {
	const dir = join(DRAMA_DIR, id);
	mkdirSync(dir, { recursive: true });
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
async function callTextModel(sysPrompt, userPrompt, apiKey, model, maxTokens = 4096) {
	const baseUrl = VENDOR_URLS[getVendor(model)] || VENDOR_URLS.agnes;
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
function handleDramaRoute(method, urlPath, body, resolveApiKey) {
	const dp = urlPath.replace(/^\/agnes-studio\/api\/?/, "").replace(/^drama\/?/, "");
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
		resolveApiKey(getVendor(task.text_model)).then((k) => {
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
		resolveApiKey(getVendor(task.text_model)).then((k) => {
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
			resolveApiKey(getVendor(task.text_model)).then((k) => runPipeline(task, k));
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
					updateTask(task, { video_results: task.video_results });
				}
			} else if (action === "complete") {
				if (task.status === "paused_video") updateTask(task, {
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
		try {
			await resolveApiKey(vendor);
		} catch {
			return {
				status: 401,
				data: { error: "API Key 未配置" }
			};
		}
		return {
			status: 202,
			data: {
				accepted: true,
				model: selectedModel
			}
		};
	}
	return null;
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
	if (vendor !== "agnes") {
		try {
			const resolved = await ctx.credentials.resolve("agnes-api-key");
			if (resolved && typeof resolved === "string" && resolved.length > 0) return resolved;
		} catch {}
		if (process.env.AGNES_API_KEY) return process.env.AGNES_API_KEY;
	}
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
				source: "built-in"
			};
			continue;
		}
		try {
			const resolved = await ctx.credentials.resolve(`${vendor}-api-key`);
			if (resolved && typeof resolved === "string" && resolved.length > 0) {
				status[vendor] = {
					configured: true,
					source: "credentials"
				};
				continue;
			}
		} catch {}
		if (process.env[`${vendor.toUpperCase()}_API_KEY`]) {
			status[vendor] = {
				configured: true,
				source: "env"
			};
			continue;
		}
		try {
			const resolved = await ctx.credentials.resolve("agnes-api-key");
			if (resolved && typeof resolved === "string" && resolved.length > 0) {
				status[vendor] = {
					configured: true,
					source: "agnes-fallback"
				};
				continue;
			}
		} catch {}
		if (process.env.AGNES_API_KEY) {
			status[vendor] = {
				configured: true,
				source: "agnes-env-fallback"
			};
			continue;
		}
		status[vendor] = {
			configured: false,
			source: null
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
/** Generic fetch with timeout. */
async function vendorFetch(url, opts = {}) {
	const { timeoutMs = 12e4, ...fetchOpts } = opts;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const resp = await fetch(url, {
			...fetchOpts,
			signal: controller.signal
		});
		if (!resp.ok) {
			const text = await resp.text().catch(() => "");
			throw new Error(`API ${resp.status}: ${text.slice(0, 500)}`);
		}
		return await resp.json();
	} finally {
		clearTimeout(timer);
	}
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
* Mount the multi-vendor API proxy routes and agent announcement.
*/
function apply(ctx) {
	rehydrateDramas();
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
					const url = `${getVendorBaseUrl(vendor, customUrl)}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
					const upstreamMethod = parsed.method === "GET" ? "GET" : "POST";
					jsonResponse(res, 200, await vendorFetch(url, {
						method: upstreamMethod,
						headers: {
							Authorization: `Bearer ${apiKey}`,
							"Content-Type": "application/json"
						},
						body: upstreamMethod === "GET" ? void 0 : JSON.stringify(params || {}),
						timeoutMs: timeoutMs || 12e4
					}));
				} catch (error) {
					jsonResponse(res, 502, { error: error instanceof Error ? error.message : String(error) });
				}
				return;
			}
			if (path.startsWith("/agnes-studio/api/drama")) try {
				const body = method === "POST" ? JSON.parse(await readBody(req)) : {};
				const dramaResolveKey = async (vendor) => {
					if (vendor === "ollama") return "ollama";
					return resolveApiKeyForVendor(ctx, vendor);
				};
				const result = handleDramaRoute(method, path, body, dramaResolveKey);
				if (result) {
					jsonResponse(res, result.status, result.data);
					return;
				}
			} catch (e) {
				jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) });
				return;
			}
			if (path.startsWith("/agnes-studio/api/prompt-expert")) {
				try {
					const expertResult = await handlePromptExpertRoute(method, path, method === "POST" ? JSON.parse(await readBody(req)) : {}, (v) => resolveApiKey(ctx), getVendorFromModel);
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
export { apply, inject, name };

//# sourceMappingURL=index.js.map