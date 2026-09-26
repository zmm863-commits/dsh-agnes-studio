// src/index.ts
import z from "@deepseek-ai/schemastery";

// src/skill-provider.ts
import { readdir, readFile } from "node:fs/promises";
import { basename, dirname as dirname2, isAbsolute, join as join2, relative, resolve as resolve2 } from "node:path";

// src/drama-adapters.ts
import { createHash } from "node:crypto";
import { access, lstat, mkdir, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
var DRAMA_ADAPTER_CONFIG_ENV = "OH_STORY_DRAMA_ADAPTER_CONFIG";
var PROVIDER_SCRIPT = "short-drama-produce/scripts/provider_adapters.py";
var DRAMA_ADAPTERS = [
  {
    name: "gpt-image-2",
    label: "GPT Image 2",
    modality: "image",
    requiredEnv: ["OPENAI_API_KEY"],
    optionalEnv: ["OPENAI_BASE_URL"],
    timeoutSeconds: 600,
    reference: "short-drama-produce/references/providers/gpt-image-2.md"
  },
  {
    name: "seedance",
    label: "Seedance",
    modality: "video",
    requiredEnv: ["ARK_API_KEY", "SEEDANCE_MODEL"],
    optionalEnv: ["SEEDANCE_BASE_URL", "SEEDANCE_ALLOWED_RATIOS", "SEEDANCE_MIN_DURATION", "SEEDANCE_MAX_DURATION"],
    timeoutSeconds: 3600,
    reference: "short-drama-produce/references/providers/seedance.md"
  },
  {
    name: "minimax-h3",
    label: "MiniMax H3",
    modality: "video",
    // Every H3 job carries an integer duration, and the adapter refuses it without this range.
    requiredEnv: ["MINIMAX_API_KEY", "MINIMAX_VIDEO_MODEL", "MINIMAX_VIDEO_RESOLUTIONS", "MINIMAX_VIDEO_MIN_DURATION", "MINIMAX_VIDEO_MAX_DURATION"],
    optionalEnv: ["MINIMAX_VIDEO_BASE_URL", "MINIMAX_VIDEO_RATIOS"],
    timeoutSeconds: 3600,
    reference: "short-drama-produce/references/providers/minimax-h3-video.md"
  },
  {
    name: "minimax-music",
    label: "MiniMax Music",
    modality: "music",
    requiredEnv: ["MINIMAX_API_KEY"],
    optionalEnv: ["MINIMAX_BASE_URL"],
    timeoutSeconds: 600,
    reference: "short-drama-produce/references/providers/minimax-music.md"
  },
  {
    name: "minimax-speech",
    label: "MiniMax Speech",
    modality: "tts",
    requiredEnv: ["MINIMAX_API_KEY"],
    optionalEnv: ["MINIMAX_BASE_URL"],
    timeoutSeconds: 600,
    reference: "short-drama-produce/references/providers/minimax-speech.md"
  }
];
function generatedDirectory(temporaryRoot) {
  const uid = process.getuid?.();
  return join(temporaryRoot, uid === void 0 ? "oh-story-dsh" : `oh-story-dsh-${String(uid)}`);
}
function dramaAdapterConfigPath(skillRoot, env = process.env, temporaryRoot = tmpdir()) {
  const custom = env[DRAMA_ADAPTER_CONFIG_ENV] ?? "";
  if (custom !== "") return { path: resolve(custom), generated: false };
  const key = createHash("sha256").update(resolve(skillRoot)).digest("hex").slice(0, 12);
  return { path: join(generatedDirectory(temporaryRoot), `drama-adapters-${key}.json`), generated: true };
}
async function privateDirectory(path) {
  await mkdir(path, { recursive: true, mode: 448 });
  const info = await lstat(path);
  if (!info.isDirectory()) return false;
  const uid = process.getuid?.();
  return uid === void 0 || info.uid === uid;
}
function dramaAdapterConfigDocument(skillRoot, python = "python3") {
  const script = resolve(skillRoot, PROVIDER_SCRIPT);
  const adapters = {};
  for (const adapter of DRAMA_ADAPTERS) {
    adapters[adapter.name] = { command: [python, script, adapter.name], timeout_seconds: adapter.timeoutSeconds };
  }
  return { adapters };
}
async function ensureDramaAdapterConfig(skillRoot, options = {}) {
  const location = dramaAdapterConfigPath(skillRoot, options.env ?? process.env, options.temporaryRoot ?? tmpdir());
  if (!location.generated) {
    return { ...location, ok: await access(location.path).then(() => true, () => false) };
  }
  try {
    if (!await privateDirectory(dirname(location.path))) return { ...location, ok: false };
    const existing = await lstat(location.path).catch(() => void 0);
    if (existing !== void 0 && !existing.isFile()) return { ...location, ok: false };
    const staging = `${location.path}.${String(process.pid)}.tmp`;
    await writeFile(staging, `${JSON.stringify(dramaAdapterConfigDocument(skillRoot, options.python ?? "python3"), null, 2)}
`, { encoding: "utf8", mode: 384 });
    await rename(staging, location.path);
    return { ...location, ok: true };
  } catch {
    return { ...location, ok: false };
  }
}
function dramaAdapterStatuses(env = process.env) {
  return DRAMA_ADAPTERS.map((adapter) => {
    const missing = adapter.requiredEnv.filter((name2) => (env[name2] ?? "") === "");
    return { name: adapter.name, label: adapter.label, modality: adapter.modality, configured: missing.length === 0, missing };
  });
}
function dramaAdapterSummary() {
  return DRAMA_ADAPTERS.map((adapter) => `${adapter.name} (${adapter.modality}: ${adapter.requiredEnv.join(" + ")})`).join(", ");
}

// src/skill-provider.ts
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  BUNDLED_SKILL_RANK
} from "@deepseek-ai/dsh-skill";
var STORY_PROVIDER_NAME = "oh-story";
var DRAMA_PROVIDER_NAME = "short-drama";
var GAME_PROVIDER_NAME = "novel-to-game";
var VIDEO_PROVIDER_NAME = "video-recap";
var DSH_SKILL_BRIDGE = [
  "<oh-story-dsh-integration>",
  "This Skill is a native contribution to the current DeepSeek Harness session.",
  "DSH owns the workspace, model, preset, permissions, Session Log, tools, subagents, cancellation, resume, and Agent UI.",
  "Never start another Agent runtime, session transport, Dashboard, SSE stream, polling loop, or model configuration.",
  "All seven upstream Oh Story specialist Roles are bundled. Invoke one with oh_story_role and a self-contained prompt.",
  "Never inspect .claude/agents, .codex/agents, .opencode/agents, .agents/agents, .zcode, or .story-deployed to decide whether a Role is available.",
  "Oh Story Roles are reached only through oh_story_role. Never start one through a generic subagent or Task tool \u2014 not DSH's subagent or subagent_fork tools and not invoke_subagent \u2014 and never pass a Role name as subagent_type, agent_type, agent, or TypeName, even where the upstream text below describes that for another host.",
  "Use only DSH-visible tools. DSH sandbox and permission policy remain authoritative.",
  // Upstream deploys these 「与作者协作」 rules only in its CLAUDE.md/AGENTS.md
  // templates, which DSH does not install.
  "Working with the author: reply and report in the author's writing terms (book, chapter, outline, settings), never in script, field, or state names; attach a raw error only when something failed. A template block marked <!-- author-report --> is only a format reference: output its text directly, without that marker and without a code fence.",
  "Record a writing habit or preference the author asks to remember, forget, or confirm only through the story Skill's author memory, whose scripts/author_memory_commit.py writes .story/\u4F5C\u8005\u8BB0\u5FC6/; never keep it in a host or DSH memory. Simply follow a one-off request without recording it.",
  "Never edit the bundled Skill files (SKILL.md, references/, scripts/). When a Skill script fails, stop and show the author the command you ran and its error instead of patching or working around it.",
  "</oh-story-dsh-integration>"
].join("\n");
var DSH_ANALYSIS_BATCHES = [
  "Stage 2 batches in DSH: dispatch each planned batch with oh_story_role, role chapter-extractor, and a self-contained prompt carrying the batch ID, the input kind, the plan's source_files (per-chapter source_locator for a raw batch) and chapter_chars, the output file {\u62C6\u6587\u76EE\u5F55}/_analysis_cache/\u8F93\u5165-{\u6279\u6B21ID}.md, and the hand-off cache path when there is one.",
  "The extractor reads the source itself, writes or edits only that batch input file (DSH denies any other write or edit by a chapter-extractor child), and replies with one receipt line; do not read the file yourself.",
  "Commit it with manage_analysis_run.py commit, one commit at a time in this session; on rejection hand the error and the file path back to a chapter-extractor to fix in place with edit.",
  "Run manage_analysis_run.py and the other bundled Python 3 scripts through the current DSH execution world, trying python3, python, then py -3. If none is available, stop and tell the author in plain words that this step needs Python 3 on the machine running DSH; never simulate a script's output or hand-write the files it owns.",
  "Keep concurrent oh_story_role calls modest. The default is upstream's \u6709\u9650\u5E76\u884C tier: three batches per round, issued together, the next round only after all three are committed; an unasked, full, multi-book, or import run uses it. DSH runs calls from one step in parallel only up to the host's own limit and may run them one after another, so never promise more. Use \u4E32\u884C or \u4E0D\u9650\u6279\u6B21\u987A\u5E8F only when the author chooses it, and under \u4E0D\u9650\u6279\u6B21\u987A\u5E8F halve the count on any rate limit, timeout, or child error."
].join(" ");
var DSH_SKILL_OVERRIDES = {
  story: "The \u5C0F\u8BF4 workspace is an official DSH conversation view. Never start or open a second web application.",
  "story-setup": "Initialize or validate novel project data only. DSH already supplies Skills, Roles, hooks, tools, permissions, sessions, and UI; never deploy Claude/OpenCode/Codex/Antigravity/ZCode/OpenClaw/Reasonix files or a .story-deployed marker.",
  "story-long-analyze": `Use oh_story_role for chapter extraction or specialist analysis. Never inspect platform agent directories or require a deployed external Agent definition. ${DSH_ANALYSIS_BATCHES}`,
  "story-long-write": "All named Roles are provided through oh_story_role. Do not check platform agent files. Keep the upstream writing, Tracking, lint, outline, revision, and quality workflows. Create and assemble \u6B63\u6587/ chapter files only with the write and edit tools, never through shell redirection, cp, mv, tee, or a script, so that DSH's outline guard, its Tracking reminder, and the \u5C0F\u8BF4 view observe the write; upstream's own in-place chapter fixes such as storyctl.py chapter check --fix-punctuation stay as upstream describes.",
  "story-review": "All named reviewer Roles are provided through oh_story_role. Do not check platform agent files; full/lean review may use the bundled Roles directly. When a review falls back to solo in DSH, the reason is that oh_story_role or DSH's spawn runtime is unavailable in this Session (Fallback agent tool unavailable -> solo) or a Role run failed (Fallback spawn failed -> solo); say that in one plain sentence. Never tell the author that the reviewers are not installed, missing, or outdated, and never tell them to run /story-setup.",
  "story-import": `All named Roles are provided through oh_story_role. Do not require story-setup to deploy them, and never inspect platform agent directories. Phase 2 runs the story-long-analyze pipeline the DSH way below; an import counts as automatic continuation, so it uses the limited-parallel tier without asking. ${DSH_ANALYSIS_BATCHES} Run the Python 3 scripts this Skill needs (storyctl.py wordcount measure, tracking_commit.py init and check) the same way. Keep upstream's Phase 3-L order: Step 2 copies the manuscript into \u6B63\u6587/, Step 6 writes the \u7EC6\u7EB2, Step 7 initialises Tracking. DSH's prose guard mirrors the outline gate of upstream proseBlockReason for books with \u5927\u7EB2/ or \u8FFD\u8E2A/, so open an import window before Step 2 copies any chapter: create .story/work/\u5BFC\u5165\u4E2D.md in the book directory (the workspace root in DSH's usual single-book layout) with one line naming the book being imported, and delete it right after Step 7's tracking_commit.py init and check both succeed. The window only holds while \u8FFD\u8E2A/_tracking-state.json is absent.`,
  "story-deslop": "Use the bundled narrative-writer Role through oh_story_role when specialist review is useful. Never inspect platform agent directories.",
  "story-short-analyze": "Use oh_story_role for specialist analysis. Never inspect platform agent directories or require external Agent deployment.",
  "story-short-write": "All named Roles are provided through oh_story_role. Do not inspect platform agent files; preserve the upstream short-fiction workflow and quality gates.",
  "browser-cdp": "Use only browser or web capabilities visible in the current DSH preset. Do not start a parallel browser host; if no compatible capability is visible, explain the limitation.",
  "story-cover": "Use only image-generation or HTTP capabilities visible in the current DSH preset. Never assume a separate Codex or Claude runtime."
};
var DSH_DRAMA_BRIDGE = [
  "<short-drama-dsh-integration>",
  "This Skill is a native contribution to the current DeepSeek Harness session.",
  "DSH owns the workspace, model, preset, permissions, Session Log, tools, approvals, cancellation, resume, and Agent UI.",
  "The \u77ED\u5267 tab is the creator workspace. Never start dashboard_server.py, another web server, Dashboard, Agent runtime, session transport, or model configuration.",
  "Drama Skills uses a creator-first contract: each episode keeps only the requested documents, up to five creator-facing sources at \u5267\u96C6/<EP>/\u5267\u672C.md, \u89C6\u89C9\u8BBE\u5B9A.md, \u5206\u955C.md, \u56FE\u7247\u63D0\u793A\u8BCD.md, and \u89C6\u9891\u63D0\u793A\u8BCD.md. Never precreate empty documents, backfill nominal stages, or start work the creator did not request. Persisted reviews use creator-readable Markdown under \u5BA1\u67E5/; an oral review writes nothing.",
  "\u5267\u96C6/<EP>/\u526A\u8F91\u5355.md is the v0.7 assembly record, not a sixth creative truth: the five creator documents stay the creative truth. It is written after footage exists and records what reaches the cut \u2014 which footage is kept or left unused and why, each cut's in/out timing, post-processing such as shot-match correction or an external mix, and the delivery spec including optional \u9897\u7C92 grain. It never changes a line, a shot's job, or a declared duration; changing any of those means returning to the document that owns it.",
  "For a v0.6 project, never create a parallel JSON/JSONL lifecycle truth, indexes, fingerprints, coverage tables, or QA records merely because legacy maintenance scripts and templates remain bundled.",
  "Never upgrade a v0.5 structured project in place or mix both contracts in one project root. Keep legacy production/audit artifacts read-only and pinned to v0.5; migrate only into a new creator-first root with manual per-episode creator confirmation.",
  "Use only tools visible in the current DSH preset and preserve the upstream project ownership, freshness, review, and explicit production-confirmation contracts.",
  "Use oh_story_production only for semantic production-view intents (open/focus, explicit shot order, or tracking a job that this Agent is actually executing). Cosmetic canvas layout remains creator-controlled. The tool changes only the Session projection: it does not edit creator documents, generate media, or authorize production.",
  "Production credentials remain outside project files. Never treat a prior acceptance, preview, continuation request, or budget discussion as confirmation for a paid production run.",
  "</short-drama-dsh-integration>"
].join("\n");
var DSH_DRAMA_OVERRIDES = {
  "short-drama": "A dashboard request means focus or use the native \u77ED\u5267 tab in this DSH Session. Do not run the bundled standalone Dashboard script. New projects follow only the v0.6 creator-first contract and create only documents required by the current request.",
  "short-drama-produce": (skillRoot) => `Use an upstream adapter only after the creator explicitly confirms the exact current job. Its source must be the current creator-first Markdown and its output belongs under \u5267\u96C6/<EP>/\u5236\u4F5C\u6210\u679C/. DSH permissions and approval UI remain authoritative. When oh_story_production is visible, register a previewed image or video job with track_job after the confirmation is valid and before run \u2014 never at prepare time \u2014 passing the same job ID, target, modality and count the creator just approved. track_job's jobKind is image, video or composition (the assembled cut), so from this Skill it registers image and video jobs only: speech (tts) and music jobs pass through the same prepare \u2192 explicit creator confirmation \u2192 run gate but are never registered with track_job or relabelled as another kind, and their audio results stay under \u5267\u96C6/<EP>/\u5236\u4F5C\u6210\u679C/. In this DSH integration audio is never bound as a video job's reference: upstream's creator-first path has no audio binding (\u8F93\u5165\u53C2\u8003\u56FE takes png/jpg/webp images only) and documents audio only as an external step, the edit stage's mix. DeepSeek generates no media: every image, video, speech, or music result comes from a provider adapter. The bundled adapters are ${dramaAdapterSummary()}; they are registered for this DSH host in ${dramaAdapterConfigPath(skillRoot).path} \u2014 pass that file as --adapter-config unless the creator names another config (${DRAMA_ADAPTER_CONFIG_ENV}). Credentials are read only from the DSH host process environment. Before preparing a paid job, name the adapter that will run it; if its variables are missing, tell the creator exactly which ones to export before starting DSH instead of failing inside run. Never read, print, or write credential values. A submitted video job is already billed, so an interrupted run is recovered, not resubmitted: when audit reports orphaned_provider_job, recover it with collect, passing --job-id \u2014 the drama job the finding names, not its provider_job_id, which collect reads from the run handle itself. collect spends nothing and does not need the confirmation gate \u2014 the gate exists to stop unintended spending \u2014 but re-running the same job does, and would charge the creator twice.`,
  "short-drama-edit": [
    "Assembly runs inside this DSH Session. Write \u5267\u96C6/<EP>/\u526A\u8F91\u5355.md first, then run edit_tool.py check and render through the current DSH execution world; the rendered cut belongs under \u5267\u96C6/<EP>/\u5236\u4F5C\u6210\u679C/\u6210\u7247/ and the \u77ED\u5267 tab shows it there. ffmpeg and ffprobe come from the DSH host \u2014 when one is missing, say so instead of approximating or reporting an untested measurement as a pass.",
    // edit_tool.py 0.7.1 `_unaccounted_shots`: `- 未采用镜头：` is read only outside CUT blocks, split on `；`, and each item must fullmatch `MOTION-…（理由：<non-empty>）`.
    "check blocks until every `## MOTION-*` heading in \u89C6\u9891\u63D0\u793A\u8BCD.md either backs a CUT's \u6765\u6E90 or is listed in the cut list's opening block, before the first `## CUT-` heading, on one line: `- \u672A\u91C7\u7528\u955C\u5934\uFF1AMOTION-\u2026\uFF08\u7406\u7531\uFF1A\u2026\uFF09\uFF1BMOTION-\u2026\uFF08\u7406\u7531\uFF1A\u2026\uFF09`. Join items with a full-width `\uFF1B`; each reason is non-empty, contains no `\uFF1B`, and names \u6587\u4EF6\u7F3A\u5931, \u8D28\u91CF\u4E0D\u53EF\u7528 or \u53D9\u4E8B\u53D6\u820D.",
    "Every cut must share one width, height and frame rate: render hard-joins the encoded segments and never scales or retimes them. When check reports a mismatch, normalise the odd clips to the delivery spec with ffmpeg in the DSH execution world, under approval, preserving the composition. Write them under \u5267\u96C6/<EP>/\u5236\u4F5C\u6210\u679C/\u6210\u7247/\u89C4\u683C\u7EDF\u4E00/, an edit-owned intermediate, never beside the produce-stage originals and never over produced footage, and name them without the original's job-id token (the MOTION ID will do). Record the crop or pad in that CUT's block (not in its \u753B\u9762 line, which accepts only \u4EAE\u5EA6/\u9971\u548C/\u8272\u6E29), point \u6765\u6E90 at the new file, update \u5165\u70B9/\u51FA\u70B9 if the conversion moved them, and rerun check.",
    "The default burned-subtitle route needs an ffmpeg built with libass; when the host's ffmpeg lacks it, say so instead of silently dropping subtitles. The Remotion route installs Node dependencies and renders every frame through a headless browser, so take it only after the creator approves that install, and never treat it as a second Agent runtime, dashboard, or session transport.",
    "The \u58F0\u97F3 line in \u526A\u8F91\u5355.md is a record, not an instruction the built-in render executes: render only trims, hard-joins, burns subtitles, applies \u753B\u9762 corrections and optional \u9897\u7C92, and normalises loudness. A mix, crossfade, music bed, transition or format conversion is an external ffmpeg step, run under approval, that writes a temporary file, ends as render does with whole-film two-pass loudnorm to the declared \u4EA4\u4ED8\u54CD\u5EA6 (I=<\u4EA4\u4ED8\u54CD\u5EA6>:TP=-1.5:LRA=11, the second pass fed the first pass's measurements with linear=true, audio re-encoded as AAC 192k at 48 kHz), and only then replaces \u5267\u96C6/<EP>/\u5236\u4F5C\u6210\u679C/\u6210\u7247/\u6210\u7247.mp4; record its command in \u526A\u8F91\u5355.md and repeat it after any re-render, which overwrites that file. Run edit_tool.py verify last, on that delivered file, and report every \u672A\u6D4B item as untested, never as passed.",
    "This stage never generates footage and never edits \u5267\u672C.md, \u5206\u955C.md, or \u89C6\u9891\u63D0\u793A\u8BCD.md \u2014 route those back to their owning Skill."
  ].join(" "),
  "short-drama-assets": "Keep one stable `- ID\uFF1AVISUAL-*` line on every \u4EBA\u7269/\u9020\u578B/\u5730\u70B9/\u9053\u5177/\u72B6\u6001 entry in \u89C6\u89C9\u8BBE\u5B9A.md, and never change an existing ID when editing its heading or text. The \u751F\u4EA7 view identifies canvas nodes by that ID; entries without one still render, but the workbench reports their node identity as unstable."
};
var DSH_GAME_BRIDGE = [
  "<novel-to-game-dsh-integration>",
  "This Skill is a native contribution to the current DeepSeek Harness session.",
  "DSH owns the workspace, model, preset, permissions, Session Log, tools, approvals, cancellation, resume, Todo, and Chat UI.",
  "The \u6E38\u620F tab is the playable Game Studio. Never start a second Agent runtime, dashboard, session transport, or model configuration.",
  "Keep the complete upstream seven-Skill pipeline and write adaptation artifacts under game-adaptations/<project>/ exactly as the upstream contracts specify.",
  "For a web target, keep the authoritative playable entry at build/app/index.html so Game Studio can preview it. Do not silently replace a requested non-web runtime with a web build.",
  "Use only DSH-visible tools and approvals. qa/verification.json remains the sole machine QA truth and must cover launch, render, input, coreLoop, outcome, and restart with real execution evidence.",
  "The bundled Jin Ping Mei project is a read-only example, not a template to copy mechanically and not proof that another adaptation passed QA.",
  "</novel-to-game-dsh-integration>"
].join("\n");
var DSH_VIDEO_BRIDGE = [
  "<video-recap-dsh-integration>",
  "This Skill is a native contribution to the current DeepSeek Harness session.",
  "DSH owns the workspace, model, preset, permissions, Session Log, tools, approvals, cancellation, resume, Todo, Chat, and the \u89C6\u9891 preview Studio.",
  "Never start a second Agent runtime, dashboard, session transport, web server, polling loop, or model configuration.",
  "Keep the complete upstream six-Skill pipeline. Put each project under video-recaps/<project>/, copy or import source media under sources/, and use work/ as the upstream work_dir so the Studio can discover authoritative manifests and outputs.",
  "The Video Studio is a preview and artifact surface, not a nonlinear editor. Do not invent a second project-state format, timeline truth, or render queue; recap_run_manifest.json, recap_phase.json, timeline.json, assembly_manifest.json, and the upstream artifacts remain authoritative.",
  "MIMO_API_KEY, FISH_API_KEY, and voice credentials stay in the host environment. Never write secrets into project files, tool arguments shown to the browser, or chat output.",
  "Use only DSH-visible tools and approvals. Run Python and ffmpeg through the current DSH execution world, preserve cancellation, and do not install or upgrade system dependencies without explicit user approval.",
  "When a new edited or final video is ready, tell the user that Video Studio can load it; never interrupt playback by replacing the currently loaded video silently.",
  "</video-recap-dsh-integration>"
].join("\n");
var DSH_NATIVE_SKILLS = {
  story: `# story \u2014 DSH \u5C0F\u8BF4\u6D41\u7A0B\u5165\u53E3

\u5728\u5F53\u524D DSH Session \u5185\u5224\u65AD\u7528\u6237\u610F\u56FE\uFF0C\u5E76\u52A0\u8F7D\u6700\u5339\u914D\u7684 Oh Story Skill\uFF1A

- \u65B0\u5EFA\u6216\u4FEE\u590D\u5C0F\u8BF4\u5DE5\u7A0B\uFF1Astory-setup
- \u957F\u7BC7\u89C4\u5212\u4E0E\u5199\u4F5C\uFF08\u8BA8\u8BBA\u957F\u7BC7\u7ED3\u6784\u3001\u89C4\u5212\u5267\u60C5\u3001\u5F00\u4E66\u3001\u5199\u5927\u7EB2\u3001\u8865\u7EC6\u7EB2\u3001\u5199\u6B63\u6587\u3001\u65E5\u66F4\uFF09\uFF1A
  story-long-write\u3002\u53EA\u8981\u7ED3\u6784\u3001\u5927\u7EB2\u3001\u5377\u7EB2\u6216\u7EC6\u7EB2\u65F6\u53EA\u4EA4\u4ED8\u6240\u8BF7\u6C42\u7684\u89C4\u5212\uFF0C\u4E0D\u5199\u6B63\u6587\uFF1B
  \u7528\u6237\u660E\u786E\u8981\u6C42\u5199\u6B63\u6587\u624D\u8FDB\u5165\u6B63\u6587\u6D41\u7A0B
- \u957F\u7BC7\u9009\u9898/\u626B\u699C\uFF1Astory-long-scan\uFF1B\u957F\u7BC7\u62C6\u6587\uFF1Astory-long-analyze
- \u7075\u611F\u5E93\u3001\u63D0\u70BC\u7075\u611F\u3001\u8DE8\u4E66\u7075\u611F\u805A\u5408\u3001\u66F4\u65B0\u7075\u611F\u5E93\uFF1Astory-long-analyze \u7684\u53EF\u9009\u7075\u611F\u5E93\u7BA1\u9053
  \uFF08\u5355\u4E66\u62C6\u6587\u4E0D\u81EA\u52A8\u5165\u5E93\uFF09
- \u77ED\u7BC7\u9009\u9898/\u62C6\u6587/\u5199\u4F5C\uFF1Astory-short-scan\u3001story-short-analyze\u3001story-short-write
- \u5BFC\u5165\u5DF2\u6709\u4F5C\u54C1\uFF1Astory-import
- \u5BA1\u7A3F\u4E0E\u53BB AI \u5473\uFF1Astory-review\u3001story-deslop
- \u5C01\u9762\uFF1Astory-cover
- \u67E5\u672C\u4E66\u7684\u89D2\u8272\u3001\u4F0F\u7B14\u3001\u8FDB\u5EA6\u6216\u8BBE\u5B9A\uFF1A\u7528 oh_story_role \u8C03\u7528 story-explorer\uFF1B\u67E5\u5916\u90E8\u8D44\u6599\uFF1A
  story-researcher\u3002\u56DE\u7B54\u8BB2\u6545\u4E8B\u91CC\u7684\u4E8B\uFF0C\u7F16\u53F7\u53EA\u8DDF\u7740\u6545\u4E8B\u63CF\u8FF0\u51FA\u73B0
- \u7BA1\u7406\u4F5C\u8005\u4E60\u60EF\uFF08\u8BB0\u4F4F/\u67E5\u770B/\u786E\u8BA4/\u66FF\u6362/\u5FD8\u6389\u5199\u4F5C\u504F\u597D\uFF09\uFF1A\u52A0\u8F7D\u672C skill \u7684
  references/author-memory.md\uFF0C\u53EA\u7528\u672C skill \u7684 scripts/author_memory_commit.py \u7BA1\u7406
  \u4E24\u7EA7\u4F5C\u8005\u8BB0\u5FC6\uFF1A\u5168\u5C40\u3001\u9898\u6750\u3001\u6D41\u7A0B\u6761\u76EE\u5728\u5DE5\u4F5C\u533A .story/\u4F5C\u8005\u8BB0\u5FC6/\uFF08AP \u7F16\u53F7\uFF09\uFF0C\u672C\u4E66\u6761\u76EE\u5728
  \u4E66\u7EA7 store\uFF08BP \u7F16\u53F7\uFF09\u3002--workspace \u5FC5\u987B\u663E\u5F0F\u4F20\u3002DSH \u7684\u5C0F\u8BF4\u5DE5\u4F5C\u533A\u901A\u5E38\u5C31\u662F\u4E66\u6839
  \uFF08\u6B63\u6587/\u3001\u8BBE\u5B9A/ \u76F4\u63A5\u5728\u5DE5\u4F5C\u533A\u6839\uFF09\uFF1A\u6B64\u65F6 --workspace \u4E0E --book-root \u90FD\u4F20\u5DE5\u4F5C\u533A\u672C\u8EAB\uFF0C
  \u4E66\u7EA7 store \u5728 .story/\u4F5C\u8005\u8BB0\u5FC6/\u4E66\u7EA7/\uFF1B\u4E66\u5728\u5B50\u76EE\u5F55\u65F6 --book-root \u4F20\u90A3\u672C\u4E66\u7684\u76EE\u5F55\u3002
  \u5904\u7406\u67D0\u672C\u4E66\u65F6\u6BCF\u6761\u547D\u4EE4\u90FD\u5E26 --book-root\uFF08\u4E66\u7EA7\u64CD\u4F5C\u7F3A\u5B83\u76F4\u63A5\u62A5\u9519\uFF09\uFF0Cquery \u5FC5\u987B\u5E26
  --kind\uFF08\u53EF\u91CD\u590D\uFF09\u3002\u53EA\u8BB0\u4F5C\u8005\u660E\u786E\u8BF4\u51FA\u7684\u504F\u597D\uFF0C\u4E0D\u4ECE\u53CD\u590D\u4FEE\u6539\u6216\u6210\u7A3F\u63A8\u65AD\u3002\u5DE5\u5177\u672A\u8FD4\u56DE
  Author Memory Receipt \u524D\u4E0D\u5F97\u58F0\u79F0\u5DF2\u8BB0\u4F4F\uFF1B\u544A\u8BC9\u4F5C\u8005\u65F6\u5148\u7528\u4E00\u53E5\u4EBA\u8BDD\u8BF4\u8BB0\u4F4F\u4E86\u4EC0\u4E48\uFF0C
  \u56DE\u6267\u653E\u6700\u540E\u4E00\u884C\u3002\u5DE5\u4F5C\u533A\u753B\u50CF\u91CC\u8FD8\u6709\u300C\u672C\u4E66\uFF1A\u300D\u6761\u76EE\uFF08\u5347\u7EA7\u524D\u5199\u5165\u7684\u672C\u4E66\u504F\u597D\uFF0C\u5DF2\u4E0D\u53C2\u4E0E
  \u67E5\u8BE2\uFF09\u65F6\uFF0C\u63D0\u8BAE\u8FD0\u884C\u4E00\u6B21 migrate --workspace {\u5DE5\u4F5C\u533A} --book-root {\u4E66\u76EE\u5F55} \u628A\u5B83\u4EEC\u642C\u8FDB
  \u4E66\u7EA7 store\u3002

\u53EA\u8BF4 /story\u3001\u770B\u4E0D\u51FA\u610F\u56FE\u65F6\uFF0C\u4E0D\u8D34\u8DEF\u7531\u8868\uFF0C\u7ED9\u56DB\u4E2A\u767D\u8BDD\u9009\u9879\uFF1A\u300C\u5F00\u4E00\u672C\u957F\u7BC7\u6216\u63A5\u7740\u5199\u300D\u2192
story-long-write\uFF1B\u300C\u5199\u4E00\u7BC7\u77ED\u7BC7\u300D\u2192 story-short-write\uFF1B\u300C\u628A\u4E00\u7AE0\u6539\u5F97\u4E0D\u90A3\u4E48 AI\u300D\u2192
story-deslop\uFF1B\u300C\u66F4\u591A\uFF08\u62C6\u4E66\u3001\u626B\u699C\u3001\u5BFC\u5165\u65E7\u7A3F\u3001\u5BA1\u7A3F\u3001\u5C01\u9762\uFF09\u300D\u2192 \u518D\u5217\u8FDB\u9636\u9879\u3002\u610F\u56FE\u660E\u786E\u65F6
\u76F4\u63A5\u8FDB\u5165\u5BF9\u5E94 Skill\uFF1B\u53EA\u5DEE\u4E00\u4E2A\u4F1A\u6539\u53D8\u6D41\u7A0B\u7684\u9009\u62E9\u65F6\u53EA\u95EE\u8FD9\u4E00\u4E2A\u95EE\u9898\u3002\u9879\u76EE\u6587\u4EF6\u3001Agent\u3001
\u6A21\u578B\u3001\u6743\u9650\u3001Session Log \u548C UI \u5747\u7531\u5F53\u524D DSH \u4F1A\u8BDD\u7BA1\u7406\u3002\u5C0F\u8BF4\u6587\u4EF6\u901A\u8FC7\u201C\u5C0F\u8BF4\u201D\u89C6\u56FE\u67E5\u770B\uFF0C
Agent \u8FC7\u7A0B\u901A\u8FC7\u53F3\u4FA7\u52A8\u6001\u680F\u6216\u5B98\u65B9 Chat \u67E5\u770B\u3002\u7981\u6B62\u542F\u52A8\u72EC\u7ACB Dashboard\u3002`,
  "story-setup": `# story-setup \u2014 DSH \u539F\u751F\u5C0F\u8BF4\u5DE5\u7A0B\u521D\u59CB\u5316

\u53EA\u521D\u59CB\u5316\u6216\u6821\u9A8C\u5F53\u524D DSH workspace \u4E2D\u7684\u5C0F\u8BF4\u6570\u636E\uFF0C\u4E0D\u90E8\u7F72\u4EFB\u4F55 Agent \u5E73\u53F0\u6587\u4EF6\u3002

1. \u68C0\u67E5\u73B0\u6709\u6B63\u6587\u3001\u8BBE\u5B9A\u3001\u5927\u7EB2\u548C\u8FFD\u8E2A\u6587\u4EF6\uFF0C\u5DF2\u6709\u5185\u5BB9\u7EDD\u4E0D\u8986\u76D6\u3002
2. \u6839\u636E\u7528\u6237\u58F0\u660E\u4E0E\u73B0\u6709\u7ED3\u6784\u5224\u65AD\u957F\u7BC7/\u77ED\u7BC7\uFF1B\u65E0\u6CD5\u53EF\u9760\u5224\u65AD\u65F6\u8BF7\u6C42\u786E\u8BA4\u3002
3. \u957F\u7BC7\u6309\u9700\u5EFA\u7ACB \u6B63\u6587/\u3001\u8BBE\u5B9A/\u3001\u5927\u7EB2/\u3002\u521D\u59CB\u5316\u3001\u5F00\u4E66\u3001\u5927\u7EB2\u548C\u7EC6\u7EB2\u9636\u6BB5\u90FD\u4E0D\u5EFA \u8FFD\u8E2A/\uFF0C
   \u4E5F\u4E0D\u5199 \u8FFD\u8E2A/_tracking-state.json\uFF1A\u8FFD\u8E2A\u5728\u7B2C\u4E00\u7AE0\u6B63\u6587\u52A8\u7B14\u524D\uFF0C\u7531 story-long-write
   \u5355\u7AE0\u6D41\u7A0B\u7528\u5B83\u7684 scripts/tracking_commit.py init \u521D\u59CB\u5316\uFF08\u4E8B\u52A1 JSON \u653E\u4E66\u76EE\u5F55
   .story/work/\uFF0Ccheck \u901A\u8FC7\u540E\u5220\u6389\uFF09\uFF0C\u4E4B\u540E\u6BCF\u7AE0\u7531\u811A\u672C\u63D0\u4EA4\u3002_tracking-state.json \u4E0E
   \u4E0A\u4E0B\u6587.md \u7B49\u6D3E\u751F Tracking \u89C6\u56FE\u53EA\u7531\u811A\u672C\u751F\u6210\uFF0C\u7EDD\u4E0D\u624B\u6539\u3002
   \u7B2C\u4E00\u7AE0\u6B63\u6587\u843D\u76D8\u524D\u5FC5\u987B\u6709\u5BF9\u5E94\u7EC6\u7EB2\u3002\u77ED\u7BC7\u4FDD\u6301\u8F7B\u91CF\u7ED3\u6784\uFF0C\u4E0D\u5F3A\u52A0\u957F\u7BC7 Tracking\u3002
4. \u5DF2\u6709\u6B63\u6587\u5374\u6CA1\u6709 \u8FFD\u8E2A/_tracking-state.json \u65F6\uFF0C\u4E0D\u81EA\u884C\u8865\u5EFA\u8FFD\u8E2A\u6587\u4EF6\uFF1A\u5DF2\u6709\u65E7 \u8FFD\u8E2A/
   \u7684\u662F\u65E7\u8FFD\u8E2A\u7ED3\u6784\uFF0C\u5EFA\u8BAE\u8D70 story-import \u7684\u300C\u65E7\u8FFD\u8E2A\u9879\u76EE\u8FC1\u79FB\u300D\uFF1B\u6CA1\u6709 \u8FFD\u8E2A/ \u7684\u65E2\u6709\u4E66\u7A3F
   \u5EFA\u8BAE\u7528 story-import \u5BFC\u5165\u3002
5. \u9700\u8981\u67B6\u6784\u3001\u89D2\u8272\u6216\u7814\u7A76\u5DE5\u4F5C\u65F6\uFF0C\u901A\u8FC7 oh_story_role \u8C03\u7528\u5DF2\u6253\u5305 Role\uFF1B\u4E0D\u8981\u68C0\u67E5\u6216
   \u751F\u6210 .claude\u3001.codex\u3001.opencode\u3001.agents\u3001.zcode\u3001AGENTS.md \u6216 .story-deployed\u3002
6. \u7ED9\u4F5C\u8005\u7684\u62A5\u544A\u6309\u8FD9\u4E2A\u987A\u5E8F\u5199\uFF1A\u5148\u5199\u300C\u73B0\u5728\u53EF\u4EE5\u505A\u4EC0\u4E48\u300D\uFF0C\u7528\u5199\u4E66\u7684\u8BDD\u5217\u771F\u6B63\u53EF\u7528\u7684\u4E8B
   \uFF08\u5982\u300C\u53EF\u4EE5\u5F00\u65B0\u4E66\u3001\u7EED\u5199\uFF1A\u8BF4 /story-long-write\u300D\uFF09\uFF1B\u518D\u5199\u300C\u4F60\u8FD8\u9700\u8981\u505A\u7684\u4E8B\u300D\uFF0C\u9010\u6761
   \u53EF\u7167\u505A\uFF08\u542B\u9700\u8981\u4F5C\u8005\u786E\u8BA4\u7684\u957F\u7BC7/\u77ED\u7BC7\u5224\u65AD\uFF09\uFF0C\u6CA1\u6709\u5C31\u5199\u300C\u65E0\u9700\u5176\u4ED6\u64CD\u4F5C\u300D\u3002\u8FD9\u4E24\u6BB5\u4E0D\u51FA\u73B0
   \u811A\u672C\u540D\u3001\u5B57\u6BB5\u540D\u3001\u72B6\u6001\u540D\u6216\u6587\u4EF6\u8DEF\u5F84\uFF1B\u6700\u540E\u624D\u7B80\u77ED\u5217\u51FA\u521B\u5EFA\u548C\u4FDD\u7559\u4E86\u54EA\u4E9B\u6587\u4EF6\u3002
   \u4E0D\u8981\u914D\u7F6E\u6A21\u578B\u3001\u6743\u9650\u3001Hooks \u6216 Session\u3002

\u9898\u6750\u3001\u89D2\u8272\u3001\u8282\u594F\u3001\u51B2\u7A81\u3001\u5F00\u7BC7\u548C\u5199\u4F5C\u65B9\u6CD5\u8D44\u6599\u4F4D\u4E8E references/agent-references/\uFF1B
\u53EA\u52A0\u8F7D\u5F53\u524D\u4EFB\u52A1\u9700\u8981\u7684\u6587\u4EF6\u3002`,
  "browser-cdp": `# browser-cdp \u2014 DSH \u6D4F\u89C8\u5668\u80FD\u529B\u9002\u914D

\u672C Skill \u4E0D\u542F\u52A8 Chrome\u3001CDP \u7AEF\u53E3\u3001\u72EC\u7ACB\u6D4F\u89C8\u5668 Host \u6216 setup-cdp-chrome.js\u3002
\u4EC5\u4F7F\u7528\u5F53\u524D DSH Preset \u5DF2\u66B4\u9732\u7684 web_search\u3001web_fetch \u6216\u6D4F\u89C8\u5668\u5DE5\u5177\u5B8C\u6210\u7F51\u9875\u8BFB\u53D6\u3001
\u699C\u5355\u91C7\u96C6\u548C\u8D44\u6599\u6838\u9A8C\u3002\u4FDD\u6301\u4EE5\u4E0B\u539F\u5219\uFF1A

1. \u4F18\u5148\u4F7F\u7528\u7ED3\u6784\u5316\u641C\u7D22/\u6293\u53D6\u5DE5\u5177\uFF1B\u9700\u8981\u767B\u5F55\u6001\u6216\u4EA4\u4E92\u9875\u9762\u65F6\u624D\u4F7F\u7528\u53EF\u89C1\u6D4F\u89C8\u5668\u80FD\u529B\u3002
2. \u5C0A\u91CD\u7AD9\u70B9\u6761\u6B3E\u3001\u8BBF\u95EE\u9891\u7387\u4E0E\u7528\u6237\u6388\u6743\uFF1B\u4E0D\u7ED5\u8FC7\u9A8C\u8BC1\u7801\u3001\u4ED8\u8D39\u5899\u6216\u8BBF\u95EE\u63A7\u5236\u3002
3. \u8BB0\u5F55\u6765\u6E90 URL\u3001\u91C7\u96C6\u65F6\u95F4\u3001\u5931\u8D25\u9879\u548C\u6570\u636E\u8D28\u91CF\uFF0C\u4E0D\u628A\u63A8\u65AD\u5199\u6210\u9875\u9762\u4E8B\u5B9E\u3002
4. \u5F53\u524D Preset \u6CA1\u6709\u517C\u5BB9\u80FD\u529B\u65F6\uFF0C\u8BF4\u660E\u7F3A\u5931\u80FD\u529B\u548C\u53EF\u884C\u7684\u624B\u5DE5\u6B65\u9AA4\uFF0C\u4E0D\u53E6\u8D77\u8FD0\u884C\u65F6\u3002`,
  "story-long-scan": `# story-long-scan \u2014 DSH \u539F\u751F\u957F\u7BC7\u626B\u699C

\u57FA\u4E8E\u53EF\u6838\u9A8C\u6837\u672C\u8BC6\u522B\u957F\u7BC7\u7F51\u6587\u8D8B\u52BF\uFF0C\u4E0D\u8FD0\u884C\u6253\u5305\u811A\u672C\u3001\u4E0D\u63D0\u53D6\u767B\u5F55\u51ED\u636E\uFF0C\u4E5F\u4E0D\u7ED5\u8FC7\u9A8C\u8BC1\u7801\u3001
\u8BBF\u95EE\u63A7\u5236\u6216\u7AD9\u70B9\u9650\u5236\u3002

1. \u660E\u786E\u5E73\u53F0\u3001\u9891\u9053\u548C\u9898\u6750\u65B9\u5411\uFF1B\u53EA\u6709\u7B54\u6848\u4F1A\u6539\u53D8\u91C7\u6837\u8303\u56F4\u65F6\u624D\u95EE\u4E00\u4E2A\u95EE\u9898\u3002
2. \u6570\u636E\u6765\u6E90\u4F9D\u6B21\u4E3A\uFF1A\u7528\u6237\u63D0\u4F9B\u7684\u6570\u636E\u6216\u94FE\u63A5\u3001\u5F53\u524D DSH Preset \u53EF\u89C1\u7684\u7F51\u9875\u5DE5\u5177\u3001
   references/genre-trends.md \u4E2D\u7684\u5386\u53F2\u8D8B\u52BF\u3002\u65E0\u6CD5\u83B7\u53D6\u5B9E\u65F6\u6570\u636E\u65F6\u5FC5\u987B\u660E\u786E\u6807\u4E3A\u5386\u53F2\u5047\u8BBE\u3002
3. \u6BCF\u4E2A\u6837\u672C\u8BB0\u5F55\u6765\u6E90 URL\u3001\u91C7\u96C6\u65E5\u671F\u3001\u699C\u5355\u53E3\u5F84\u3001\u6709\u6548\u6761\u76EE\u6570\u3001\u7F3A\u5931\u5B57\u6BB5\u548C\u5F02\u5E38\u9879\uFF1B
   \u4E0D\u628A\u641C\u7D22\u6458\u8981\u3001\u63A8\u65AD\u6216\u8FC7\u671F\u7F13\u5B58\u5199\u6210\u9875\u9762\u4E8B\u5B9E\u3002
4. \u6309\u9898\u6750\u5206\u5E03\u3001\u65B0\u9898\u6750\u4FE1\u53F7\u3001\u7ECF\u5178\u9898\u6750\u53D8\u5316\u3001\u7BC7\u5E45\u4E0E\u66F4\u65B0\u3001\u4E66\u540D\u6A21\u5F0F\u3001\u5F00\u5934\u5356\u70B9\u548C
   \u5DEE\u5F02\u5316\u5143\u7D20\u5206\u6790\u3002\u9700\u8981\u51B3\u7B56\u95E8\u7981\u65F6\u4F7F\u7528 references/topic-decision.md\u3002
5. \u8F93\u51FA\u5E02\u573A\u6982\u51B5\u3001\u9898\u6750\u70ED\u5EA6\u3001\u8BC1\u636E\u4E0E\u53EF\u4FE1\u5EA6\u3001\u98CE\u9669\u3001\u4E09\u9879\u53EF\u6267\u884C\u65B9\u5411\u548C\u4E0B\u6B21\u590D\u626B\u65F6\u95F4\u3002
6. \u62A5\u544A\u5199\u7ED9\u4F5C\u8005\uFF1A\u8BB2\u5E02\u573A\u7ED3\u8BBA\u548C\u80FD\u5199\u7684\u65B9\u5411\uFF1B\u811A\u672C\u540D\u3001\u547D\u4EE4\u548C\u91C7\u96C6\u72B6\u6001\u7801\u4E0D\u8FDB\u62A5\u544A\u3002
   \u67D0\u4E2A\u699C\u6CA1\u91C7\u5230\uFF0C\u5C31\u7528\u4E00\u53E5\u8BDD\u8BF4\u660E\u300CXX \u699C\u8FD9\u6B21\u6CA1\u62FF\u5230\uFF08\u539F\u56E0\uFF09\uFF0C\u7ED3\u8BBA\u4E0D\u542B\u5B83\u300D\u3002

\u5F53\u524D Preset \u6CA1\u6709\u7F51\u9875\u80FD\u529B\u4E14\u7528\u6237\u4E5F\u672A\u63D0\u4F9B\u6837\u672C\u65F6\uFF0C\u4F7F\u7528\u5185\u7F6E\u53C2\u8003\u5B8C\u6210\u65B9\u6CD5\u8BBA\u5206\u6790\uFF0C
\u5E76\u5217\u51FA\u4ECD\u9700\u6838\u9A8C\u7684\u699C\u5355\uFF1B\u4E0D\u8981\u542F\u52A8 CDP\u3001\u72EC\u7ACB\u6D4F\u89C8\u5668\u6216\u5E76\u884C\u8FD0\u884C\u65F6\u3002`,
  "story-short-scan": `# story-short-scan \u2014 DSH \u539F\u751F\u77ED\u7BC7\u626B\u699C

\u57FA\u4E8E\u53EF\u6838\u9A8C\u6837\u672C\u8BC6\u522B\u77ED\u7BC7\u5E02\u573A\u7684\u60C5\u7EEA\u3001\u9898\u6750\u4E0E\u4F20\u64AD\u4FE1\u53F7\uFF0C\u4E0D\u8FD0\u884C\u6253\u5305\u811A\u672C\u3001\u4E0D\u8BFB\u53D6 Cookie
\u6216 token\uFF0C\u4E5F\u4E0D\u7ED5\u8FC7\u9A8C\u8BC1\u7801\u3001\u767B\u5F55\u6216\u8BBF\u95EE\u63A7\u5236\u3002

1. \u660E\u786E\u5E73\u53F0\u4E0E\u65B9\u5411\uFF1B\u53EA\u6709\u7B54\u6848\u4F1A\u6539\u53D8\u91C7\u6837\u8303\u56F4\u65F6\u624D\u95EE\u4E00\u4E2A\u95EE\u9898\u3002
2. \u6570\u636E\u6765\u6E90\u4F9D\u6B21\u4E3A\uFF1A\u7528\u6237\u63D0\u4F9B\u7684\u6570\u636E\u6216\u94FE\u63A5\u3001\u5F53\u524D DSH Preset \u53EF\u89C1\u7684\u7F51\u9875\u5DE5\u5177\u3001
   references/real-market-data.md \u4E2D\u7684\u5386\u53F2\u8D44\u6599\u3002\u65E0\u6CD5\u8054\u7F51\u65F6\u5FC5\u987B\u628A\u7ED3\u8BBA\u6807\u4E3A\u5019\u9009\u5047\u8BBE\u3002
3. \u8BB0\u5F55\u6765\u6E90 URL\u3001\u91C7\u96C6\u65E5\u671F\u3001\u699C\u5355\u53E3\u5F84\u3001\u6709\u6548\u6837\u672C\u6570\u3001\u7F3A\u5931\u5B57\u6BB5\u548C\u5F02\u5E38\u9879\u3002
4. \u5206\u6790\u60C5\u7EEA\u7C7B\u578B\u3001\u9898\u6750\u70ED\u70B9\u3001\u7BC7\u5E45\u3001\u5F00\u5934\u3001\u7ED3\u5C3E\u3001\u6807\u9898\u3001\u4EBA\u8BBE\u4E0E\u4F20\u64AD\u89E6\u53D1\u70B9\uFF1B
   \u7ED9\u6BCF\u4E2A\u8D8B\u52BF\u6807\u6CE8\u8BC1\u636E\u5F3A\u5EA6\u3001\u9971\u548C\u98CE\u9669\u548C\u6709\u6548\u671F\u3002
5. \u8F93\u51FA\u5E02\u573A\u6982\u51B5\uFF08\u626B\u699C\u65F6\u95F4\u3001\u6838\u5FC3\u53D1\u73B0\u548C\u53EF\u4FE1\u5EA6\uFF1A\u6837\u672C\u591A\u5C11\u7BC7\u3001\u6765\u81EA\u54EA\u51E0\u4E2A\u699C\uFF0C\u5E76\u5EFA\u8BAE
   \u54EA\u5929\u524D\u540E\u518D\u626B\u4E00\u6B21\uFF09\u3001\u60C5\u7EEA\u70ED\u5EA6\u3001\u9898\u6750\u70ED\u70B9\u3001\u5173\u952E\u6570\u636E\u3001\u98CE\u53E3\u9884\u8B66\u3001\u4E09\u9879\u53EF\u5199\u65B9\u5411\u3002
6. \u62A5\u544A\u5199\u7ED9\u4F5C\u8005\uFF1A\u8BB2\u5E02\u573A\u7ED3\u8BBA\u548C\u80FD\u5199\u7684\u65B9\u5411\uFF1B\u811A\u672C\u540D\u3001\u547D\u4EE4\u548C SKIP \u8FD9\u7C7B\u91C7\u96C6\u72B6\u6001\u4E0D\u8FDB\u62A5\u544A\u3002
   \u67D0\u4E2A\u5E73\u53F0\u6CA1\u91C7\u5230\uFF0C\u5C31\u7528\u4E00\u53E5\u8BDD\u8BF4\u660E\u300CXX \u8FD9\u6B21\u6CA1\u62FF\u5230\uFF08\u539F\u56E0\uFF09\uFF0C\u7ED3\u8BBA\u4E0D\u542B\u5B83\u300D\u3002

\u5F53\u524D Preset \u6CA1\u6709\u7F51\u9875\u80FD\u529B\u4E14\u7528\u6237\u4E5F\u672A\u63D0\u4F9B\u6837\u672C\u65F6\uFF0C\u53EA\u505A\u5386\u53F2\u8D44\u6599\u5206\u6790\u5E76\u5217\u51FA\u9A8C\u8BC1\u52A8\u4F5C\uFF1B
\u4E0D\u8981\u542F\u52A8 CDP\u3001\u72EC\u7ACB\u6D4F\u89C8\u5668\u6216\u5E76\u884C\u8FD0\u884C\u65F6\u3002`
};
function frontmatterValue(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/u);
  const index = lines.findIndex((line) => new RegExp(`^${key}:\\s*`, "u").test(line));
  if (index < 0) return void 0;
  const raw = lines[index]?.replace(new RegExp(`^${key}:\\s*`, "u"), "").trim();
  if (raw === void 0) return void 0;
  if (raw === ">" || raw === "|" || raw === ">-" || raw === "|-") {
    const values = [];
    for (const line of lines.slice(index + 1)) {
      if (/^\S/u.test(line)) break;
      values.push(line.trim());
    }
    return (raw.startsWith(">") ? values.join(" ") : values.join("\n")).trim();
  }
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }
  return raw.replace(/^['"]|['"]$/gu, "");
}
function parseBundledSkill(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/u.exec(source);
  if (match?.[1] === void 0) throw new Error("Bundled skill is missing YAML frontmatter.");
  const name2 = frontmatterValue(match[1], "name");
  const description = frontmatterValue(match[1], "description");
  if (!name2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name2)) throw new Error("Bundled skill has an invalid name.");
  if (!description) throw new Error(`Bundled skill "${name2}" has no description.`);
  return {
    name: name2,
    description,
    content: source.slice(match[0].length),
    userInvocable: frontmatterValue(match[1], "user-invocable") !== "false"
  };
}
function dshSkillContent(name2, content) {
  const override = DSH_SKILL_OVERRIDES[name2];
  const native = DSH_NATIVE_SKILLS[name2];
  return `${DSH_SKILL_BRIDGE}${override === void 0 ? "" : `
<skill-specific-dsh-override>${override}</skill-specific-dsh-override>`}

${native ?? content}`;
}
function defaultBundledSkillRoot() {
  const current = dirname2(fileURLToPath(import.meta.url));
  return basename(current) === "src" ? resolve2(current, "../../knowledge/oh-story/skills") : resolve2(current, "oh-story/skills");
}
function defaultDramaSkillRoot() {
  const current = dirname2(fileURLToPath(import.meta.url));
  return basename(current) === "src" ? resolve2(current, "../../knowledge/drama/skills") : resolve2(current, "drama/skills");
}
function defaultNovelToGameSkillRoot() {
  const current = dirname2(fileURLToPath(import.meta.url));
  return basename(current) === "src" ? resolve2(current, "../../knowledge/novel-to-game/skills") : resolve2(current, "novel-to-game/skills");
}
function createBundledSkillProvider(providerName, skillRoot, content) {
  const root = resolve2(skillRoot);
  return {
    name: providerName,
    async list() {
      const directories = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
      return Promise.all(directories.map(async (directory) => {
        const path = join2(root, directory, "SKILL.md");
        const parsed = parseBundledSkill(await readFile(path, "utf8"));
        if (parsed.name !== directory) throw new Error(`Bundled skill directory "${directory}" does not match name "${parsed.name}".`);
        return {
          name: parsed.name,
          description: parsed.description,
          invocation: { modelInvocable: true, userInvocable: parsed.userInvocable },
          provider: providerName,
          source: "bundled",
          resourceBase: { kind: "directory", path: join2(root, directory) },
          rank: BUNDLED_SKILL_RANK,
          locator: pathToFileURL(path),
          path
        };
      }));
    },
    async get(candidate) {
      if (candidate.provider !== providerName || typeof candidate.path !== "string") return void 0;
      const path = resolve2(candidate.path);
      const relativePath = relative(root, path);
      if (relativePath === "" || relativePath.startsWith("..") || isAbsolute(relativePath)) {
        throw new Error("Bundled skill locator escaped the packaged skill root.");
      }
      const parsed = parseBundledSkill(await readFile(path, "utf8"));
      if (parsed.name !== candidate.name) return void 0;
      return {
        name: parsed.name,
        description: parsed.description,
        invocation: { modelInvocable: true, userInvocable: parsed.userInvocable },
        provider: providerName,
        source: "bundled",
        resourceBase: { kind: "directory", path: join2(root, parsed.name) },
        path,
        content: content(parsed.name, parsed.content)
      };
    }
  };
}
function createOhStorySkillProvider(skillRoot = defaultBundledSkillRoot()) {
  return createBundledSkillProvider(STORY_PROVIDER_NAME, skillRoot, dshSkillContent);
}
function dshDramaSkillContent(name2, content, skillRoot = defaultDramaSkillRoot()) {
  const entry = DSH_DRAMA_OVERRIDES[name2];
  const override = typeof entry === "function" ? entry(skillRoot) : entry;
  return `${DSH_DRAMA_BRIDGE}${override === void 0 ? "" : `
<skill-specific-dsh-override>${override}</skill-specific-dsh-override>`}

${content}`;
}
function createDramaSkillProvider(skillRoot = defaultDramaSkillRoot()) {
  return createBundledSkillProvider(DRAMA_PROVIDER_NAME, skillRoot, (name2, content) => dshDramaSkillContent(name2, content, skillRoot));
}
function dshNovelToGameSkillContent(_name, content) {
  return `${DSH_GAME_BRIDGE}

${content}`;
}
function createNovelToGameSkillProvider(skillRoot = defaultNovelToGameSkillRoot()) {
  return createBundledSkillProvider(GAME_PROVIDER_NAME, skillRoot, dshNovelToGameSkillContent);
}
function defaultVideoRecapSkillRoot() {
  const current = dirname2(fileURLToPath(import.meta.url));
  return basename(current) === "src" ? resolve2(current, "../../knowledge/video-recap/skills") : resolve2(current, "video-recap/skills");
}
function dshVideoRecapSkillContent(_name, content) {
  return `${DSH_VIDEO_BRIDGE}

${content}`;
}
function createVideoRecapSkillProvider(skillRoot = defaultVideoRecapSkillRoot()) {
  return createBundledSkillProvider(VIDEO_PROVIDER_NAME, skillRoot, dshVideoRecapSkillContent);
}

// src/host-python.ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
var execFileAsync = promisify(execFile);
async function commandOutput(command, args) {
  try {
    const { stdout, stderr } = await execFileAsync(command, [...args], { encoding: "utf8", timeout: 5e3, maxBuffer: 4 * 1024 * 1024 });
    return `${stdout}${stderr}`.trim();
  } catch {
    return void 0;
  }
}
function pythonVersion(value) {
  const match = /Python\s+(\d+)\.(\d+)(?:\.(\d+))?/u.exec(value ?? "");
  if (match === null) return { ok: false };
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return { ok: major > 3 || major === 3 && minor >= 10, version: match[0].replace(/^Python\s+/u, "") };
}
async function hostPython(probe = commandOutput) {
  let fallback;
  for (const command of ["python3", "python"]) {
    const parsed = pythonVersion(await probe(command, ["--version"]));
    if (parsed.ok) return { command, probe: parsed };
    if (parsed.version !== void 0) fallback ??= { command, probe: parsed };
  }
  return fallback ?? { command: "python3", probe: { ok: false } };
}

// src/native-hooks.ts
import { boundContextSummary, createUserMessage } from "@deepseek-ai/dsh-llm";

// src/role-provider.ts
import { readFile as readFile2 } from "node:fs/promises";
import { basename as basename2, dirname as dirname3, join as join3, resolve as resolve3 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var OH_STORY_ROLE_NAMES = [
  "chapter-extractor",
  "character-designer",
  "consistency-checker",
  "narrative-writer",
  "story-architect",
  "story-explorer",
  "story-researcher"
];
function roleBody(source) {
  const frontmatter = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/u.exec(source);
  return source.slice(frontmatter?.[0].length ?? 0).trim();
}
function defaultBundledRoleRoot() {
  const current = dirname3(fileURLToPath2(import.meta.url));
  return basename2(current) === "src" ? resolve3(current, "../../knowledge/oh-story/roles") : resolve3(current, "oh-story/roles");
}
async function loadBundledRole(name2, roleRoot = defaultBundledRoleRoot(), execution = "tool-free") {
  const body = roleBody(await readFile2(join3(resolve3(roleRoot), `${name2}.md`), "utf8"));
  if (body.length === 0) throw new Error(`Bundled role "${name2}" is empty.`);
  const integration = execution === "tool-free" ? [
    "You are running inside an Oh Story review-required DSH collaboration. The caller supplies every permitted input in the prompt.",
    "Do not read or write project files, do not call tools, and do not follow legacy .claude/.codex path or deployment instructions in the upstream role text.",
    "Return only the output contract requested by the caller; never claim to have changed the project."
  ] : [
    "You are running as a native oh-story-dsh specialist. The current DSH workspace and visible tool set are your complete authority boundary.",
    "Never inspect or require legacy .claude/.opencode/.codex agent deployment files; this exact pinned Role is already active.",
    "Bundled story-setup references are pinned plugin resources, not project files or project Skills. When the upstream Role marks one mandatory, call oh_story_bundled_reference with the exact story-setup/references/agent-references path, then use only the returned content.",
    "If oh_story_bundled_reference or a required bundled reference is unavailable, report the missing reference to the caller. Never call the generic skill tool, fall back to a legacy platform path, or claim that an unread reference was used.",
    "Use only the tools actually visible to you. Mutate files only when the caller explicitly requests it and your visible DSH tools permit it; otherwise return findings to the caller."
  ];
  return [
    `OH_STORY_DSH_ROLE:${name2}`,
    ...integration,
    "",
    body
  ].join("\n");
}

// src/role-identity.ts
var ROLE_LABEL_PREFIX = "oh-story:";
function ohStoryRoleLabel(role) {
  return `${ROLE_LABEL_PREFIX}${role}`;
}
function roleFromLabel(label) {
  if (typeof label !== "string" || !label.startsWith(ROLE_LABEL_PREFIX)) return void 0;
  const name2 = label.slice(ROLE_LABEL_PREFIX.length);
  return OH_STORY_ROLE_NAMES.find((role) => role === name2);
}
var roleSessions = /* @__PURE__ */ new WeakMap();
function observeOhStoryRoleDescriptor(session, event) {
  if (event.type !== "subagent/descriptor" || roleSessions.has(session)) return;
  const role = roleFromLabel(event.data.label);
  if (role !== void 0) roleSessions.set(session, role);
}
function markOhStoryRoleSession(session, role) {
  if (!roleSessions.has(session)) roleSessions.set(session, role);
}
function ohStoryRoleOfSession(session) {
  return session === void 0 ? void 0 : roleSessions.get(session);
}

// src/native-hooks.ts
var MUTATION_TOOLS = /* @__PURE__ */ new Set(["write", "edit", "str_replace_editor"]);
function argumentRecord(args) {
  return typeof args === "object" && args !== null && !Array.isArray(args) ? args : void 0;
}
function mutationPath(name2, args) {
  const record2 = argumentRecord(args);
  if (!MUTATION_TOOLS.has(name2) || record2 === void 0) return void 0;
  if (name2 === "str_replace_editor") {
    if (!(/* @__PURE__ */ new Set(["create", "str_replace", "insert"])).has(String(record2.command))) return void 0;
    return typeof record2.path === "string" && record2.path.trim() !== "" ? record2.path : void 0;
  }
  return typeof record2.file_path === "string" && record2.file_path.trim() !== "" ? record2.file_path : void 0;
}
function normalizedRelativePath(path) {
  const segments = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (segments.length === 0) return void 0;
      segments.pop();
    } else segments.push(part);
  }
  return segments.join("/");
}
function proseLocation(path) {
  const segments = path.split("/");
  if (segments.length < 2) return void 0;
  const index = segments.lastIndexOf("\u6B63\u6587", segments.length - 2);
  if (index < 0) return void 0;
  return { book: segments.slice(0, index).join("/"), name: segments.at(-1) ?? "" };
}
function inBook(book, path) {
  return book === "" ? path : `${book}/${path}`;
}
function lastSegment(path) {
  return path.replaceAll("\\", "/").split("/").filter((part) => part !== "").at(-1) ?? "";
}
function detectStoryMutation(name2, args, cwd) {
  const rawPath = mutationPath(name2, args);
  if (cwd === void 0 || rawPath === void 0) return void 0;
  const root = cwd.replaceAll("\\", "/").replace(/\/$/u, "");
  const candidate = rawPath.replaceAll("\\", "/");
  const absolute = candidate.startsWith("/") || /^[a-z]:\//iu.test(candidate) || /^[a-z][a-z\d+.-]*:\/\//iu.test(candidate);
  const insideRoot = /^[a-z]:\//iu.test(root) ? candidate.toLowerCase().startsWith(`${root.toLowerCase()}/`) : candidate.startsWith(`${root}/`);
  if (absolute && !insideRoot) return void 0;
  const normalized = normalizedRelativePath(absolute ? candidate.slice(root.length + 1) : candidate);
  if (normalized === void 0) return void 0;
  const location = proseLocation(normalized);
  if (location === void 0) return void 0;
  const chapterText = /^第0*(\d+)章/u.exec(location.name)?.[1];
  return { root, path: normalized, ...chapterText === void 0 ? {} : { chapter: Number(chapterText) } };
}
async function storyMutation(exec, fs) {
  const cwd = exec.agent?.session.header.cwd;
  const path = mutationPath(exec.name, exec.arguments);
  if (cwd === void 0 || path === void 0) return void 0;
  try {
    const [rootTarget, mutationTarget] = await Promise.all([
      fs.resolve(cwd, { signal: exec.signal }),
      fs.resolve(path, { cwd, signal: exec.signal })
    ]);
    if (!fs.contains(rootTarget, mutationTarget)) return void 0;
  } catch {
    return void 0;
  }
  return detectStoryMutation(exec.name, exec.arguments, cwd);
}
async function target(fs, root, path, signal) {
  return fs.resolve(path, { cwd: root, ...signal === void 0 ? {} : { signal } });
}
async function exists(fs, root, path, signal) {
  return target(fs, root, path, signal).then((value) => fs.stat(value, signal)).then((info) => info !== void 0, () => false);
}
async function isLongFormBook(fs, root, book, signal) {
  return await exists(fs, root, inBook(book, "\u5927\u7EB2"), signal) || await exists(fs, root, inBook(book, "\u8FFD\u8E2A"), signal);
}
async function hasChapterOutline(fs, root, book, chapter, signal) {
  const entries = await target(fs, root, inBook(book, "\u5927\u7EB2"), signal).then((directory) => fs.listDir(directory, signal)).catch(() => []);
  return entries.some((entry) => entry.type === "file" && Number(/^细纲_第0*(\d+)章.*\.md$/u.exec(entry.name)?.[1]) === chapter);
}
var TRACKING_STATE = "\u8FFD\u8E2A/_tracking-state.json";
var IMPORT_MARKER = ".story/work/\u5BFC\u5165\u4E2D.md";
async function hasTrackingState(fs, root, book, signal) {
  return exists(fs, root, inBook(book, TRACKING_STATE), signal);
}
async function hasImportSignal(fs, root, book, signal) {
  if (await exists(fs, root, inBook(book, IMPORT_MARKER), signal)) return true;
  const bookName = book === "" ? lastSegment(root) : lastSegment(book);
  return bookName !== "" && await exists(fs, root, `\u62C6\u6587\u5E93/${bookName}`, signal);
}
async function validateStoryMutation(fs, mutation, signal) {
  const location = proseLocation(mutation.path);
  if (mutation.chapter === void 0 || location === void 0) return void 0;
  const { book } = location;
  if (!await isLongFormBook(fs, mutation.root, book, signal)) return void 0;
  if (await exists(fs, mutation.root, mutation.path, signal)) return void 0;
  if (!await hasTrackingState(fs, mutation.root, book, signal) && await hasImportSignal(fs, mutation.root, book, signal)) {
    return void 0;
  }
  if (await hasChapterOutline(fs, mutation.root, book, mutation.chapter, signal)) return void 0;
  const padded = String(mutation.chapter).padStart(3, "0");
  return `Oh Story \u963B\u6B62\u5199\u5165\u7B2C ${String(mutation.chapter)} \u7AE0\uFF1A\u672A\u627E\u5230\u5BF9\u5E94\u7684 ${inBook(book, "\u5927\u7EB2")}/\u7EC6\u7EB2_\u7B2C${padded}\u7AE0*.md\u3002\u5148\u6309 story-long-write \u5355\u7AE0\u6D41\u7A0B\u8865\u5EFA\u7EC6\u7EB2\u518D\u5199\u6B63\u6587\u3002`;
}
async function decideStoryMutation(exec, next) {
  const fs = exec.agent?.ctx.get("fs");
  if (fs === void 0) return next();
  const mutation = await storyMutation(exec, fs);
  if (mutation === void 0) return next();
  const reason = await validateStoryMutation(fs, mutation, exec.signal);
  if (reason !== void 0) return { kind: "deny", reason };
  return next();
}
var ANALYSIS_INPUT = /^输入-(RAW|REUSE)-(\d+)-(\d+)\.md$/u;
var ANALYSIS_INPUT_RULE = "\u53EA\u5141\u8BB8\u5199\u8C03\u7528\u65B9\u7ED9\u7684 {\u62C6\u6587\u76EE\u5F55}/_analysis_cache/\u8F93\u5165-{\u6279\u6B21ID}.md\uFF08\u6279\u6B21 ID \u5982 RAW-4-6\uFF09\uFF0C\u4E0D\u5199\u5176\u4ED6\u6587\u4EF6\u3002";
function isFileMutationCall(name2, args) {
  if (name2 === "write" || name2 === "edit") return true;
  return name2 === "str_replace_editor" && argumentRecord(args)?.command !== "view";
}
function displayParent(path) {
  const index = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return index <= 0 ? path.slice(0, index + 1) : path.slice(0, index);
}
function displayName(path) {
  return path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
}
async function isAnalysisDirectory(fs, directory, signal) {
  return await exists(fs, directory, "chapter_index.csv", signal) || await exists(fs, directory, "_progress.md", signal);
}
async function validateAnalysisInputWrite(fs, cwd, path, signal) {
  const deny = (shown, reasons2) => `Oh Story \u963B\u6B62 chapter-extractor \u5199\u5165 ${shown}\uFF1A${reasons2.join("\uFF1B")}\u3002${ANALYSIS_INPUT_RULE}`;
  if (path === void 0) return deny("\uFF08\u672A\u7ED9\u51FA\u8DEF\u5F84\uFF09", ["\u5199\u5165\u6CA1\u6709\u7ED9\u51FA\u6587\u4EF6\u8DEF\u5F84"]);
  let rootTarget;
  let fileTarget;
  try {
    [rootTarget, fileTarget] = await Promise.all([
      fs.resolve(cwd, signal === void 0 ? {} : { signal }),
      fs.resolve(path, { cwd, ...signal === void 0 ? {} : { signal } })
    ]);
  } catch {
    return deny(path, ["\u8DEF\u5F84\u65E0\u6CD5\u89E3\u6790"]);
  }
  const reasons = [];
  const match = ANALYSIS_INPUT.exec(displayName(fileTarget.displayPath));
  if (match === null) reasons.push("\u6587\u4EF6\u540D\u5FC5\u987B\u662F \u8F93\u5165-{RAW|REUSE}-{\u8D77\u7AE0}-{\u6B62\u7AE0}.md");
  else if (Number(match[2]) < 1 || Number(match[3]) < Number(match[2])) reasons.push("\u6279\u6B21\u7AE0\u53F7\u8303\u56F4\u65E0\u6548");
  const cacheDirectory = displayParent(fileTarget.displayPath);
  if (displayName(cacheDirectory) !== "_analysis_cache") reasons.push("\u53EA\u80FD\u5199\u5728\u62C6\u6587\u76EE\u5F55\u7684 _analysis_cache/ \u4E0B");
  else if (!await isAnalysisDirectory(fs, displayParent(cacheDirectory), signal)) {
    reasons.push("\u4E0A\u7EA7\u76EE\u5F55\u4E0D\u662F\u62C6\u6587\u76EE\u5F55\uFF08\u7F3A chapter_index.csv \u4E0E _progress.md\uFF09");
  }
  if (!fs.contains(rootTarget, fileTarget)) reasons.push("\u8DEF\u5F84\u5728\u9879\u76EE\u76EE\u5F55\u4E4B\u5916");
  return reasons.length === 0 ? void 0 : deny(path, reasons);
}
async function decideChapterExtractorWrite(exec, next) {
  if (ohStoryRoleOfSession(exec.agent?.session) !== "chapter-extractor" || !isFileMutationCall(exec.name, exec.arguments)) {
    return next();
  }
  const fs = exec.agent?.ctx.get("fs");
  const cwd = exec.agent?.session.header.cwd;
  const reason = fs === void 0 || cwd === void 0 ? `Oh Story \u963B\u6B62 chapter-extractor \u5199\u5165\uFF1A\u65E0\u6CD5\u786E\u8BA4\u9879\u76EE\u76EE\u5F55\u3002${ANALYSIS_INPUT_RULE}` : await validateAnalysisInputWrite(fs, cwd, mutationPath(exec.name, exec.arguments), exec.signal);
  return reason === void 0 ? next() : { kind: "deny", reason };
}
function postWriteReminderText(path, options = {}) {
  return [
    `<oh-story-post-write>\u6B63\u6587 ${path} \u5DF2\u53D8\u66F4\u3002`,
    "\u6BCF\u6B21\u5199\u5165\u6B63\u6587\u90FD\u4F1A\u51FA\u73B0\u8FD9\u6761\u63D0\u9192\uFF0C\u4E00\u7AE0\u5199\u5230\u4E00\u534A\u65F6\u4E5F\u4F1A\uFF1B\u5B83\u4E0D\u8868\u793A\u672C\u7AE0\u5DF2\u7ECF\u5B8C\u6210\uFF0C\u4E5F\u4E0D\u662F\u4F5C\u8005\u7684\u65B0\u5199\u4F5C\u8981\u6C42\uFF0C\u7EE7\u7EED\u5F53\u524D\u6B65\u9AA4\u5373\u53EF\u3002",
    ...options.trackingUninitialized === true ? [
      "\u672C\u4E66\u8FD8\u6CA1\u6709 \u8FFD\u8E2A/_tracking-state.json\u3002\u65B0\u4E66\u5199\u7B2C\u4E00\u7AE0\u65F6\uFF0Cdraft \u4E4B\u524D\u5148\u6309 story-long-write workflow-daily \u7684\u300C\u9996\u6B21\u521D\u59CB\u5316\u300D\u5B8C\u6574\u8BFB\u53D6 references/tracking-initialization.md\uFF0C\u6784\u9020 last_chapter=0 \u7684\u521D\u59CB\u5316\u4E8B\u52A1\u5B58\u4E66\u76EE\u5F55 .story/work/init.json\uFF0C\u8FD0\u884C scripts/tracking_commit.py init\uFF0C\u518D\u8FD0\u884C tracking_commit.py check\uFF0C\u901A\u8FC7\u540E\u5220\u6389 init.json\uFF1B",
      "\u4E66\u91CC\u5728\u672C\u7AE0\u4E4B\u524D\u5DF2\u6709\u6B63\u6587\u65F6\u4E0D\u8981\u521D\u59CB\u5316\uFF0C\u505C\u4E0B\u6765\u6539\u8D70 story-import \u7684\u300C\u65E7\u8FFD\u8E2A\u9879\u76EE\u8FC1\u79FB\u300D\u3002"
    ] : [],
    "\u7B49\u672C\u7AE0\u5199\u5B8C\u6536\u5C3E\u65F6\u518D\u63D0\u4EA4\u8FFD\u8E2A\uFF1A\u65B0\u7AE0\u5148\u7528 story-long-write \u7684 scripts/tracking_commit.py draft \u751F\u6210\u672C\u7AE0\u8349\u7A3F\uFF0C\u586B\u597D\u540E\u6267\u884C scripts/storyctl.py chapter commit\uFF08\u4F5C\u8005\u63A5\u53D7\u5F53\u524D\u957F\u5EA6\u65F6\u7528 chapter accept-current-length\uFF09\uFF1B",
    "\u4FEE\u6539\u5DF2\u63D0\u4EA4\u7684\u7AE0\u8282\u6309 workflow-revision \u63D0\u4EA4\u4E00\u6B21 mode=revision \u4E8B\u52A1\uFF1B\u5BFC\u5165\u65E2\u6709\u6B63\u6587\u65F6\u7531 story-import \u5728\u8FC1\u79FB\u540E\u7528 tracking_commit.py init \u7EDF\u4E00\u521D\u59CB\u5316\u3002",
    "\u8FFD\u8E2A/_tracking-state.json \u4EE5\u53CA \u4E0A\u4E0B\u6587.md\u3001\u89D2\u8272\u72B6\u6001/\u3001\u4F0F\u7B14.md\u3001\u65F6\u95F4\u7EBF/\u3001\u9010\u7AE0\u8BB0\u5F55/ \u7B49\u6D3E\u751F Tracking \u89C6\u56FE\u53EA\u7531\u8FD9\u4E9B\u811A\u672C\u5199\u5165\uFF0C\u7EDD\u4E0D\u624B\u6539\u3002</oh-story-post-write>"
  ].join("");
}
function registerOhStoryHooks(context) {
  context.on("session/event", (session, event) => {
    observeOhStoryRoleDescriptor(session, event);
  });
  context.on("tools/pre-execute", decideChapterExtractorWrite);
  context.on("tools/pre-execute", decideStoryMutation);
  context.on("tools/post-execute", async (exec, result, next) => {
    const downstream = await next();
    if (result.isError || downstream.kind !== "accept") return downstream;
    if (ohStoryRoleOfSession(exec.agent?.session) !== void 0) return downstream;
    const fs = exec.agent?.ctx.get("fs");
    const mutation = fs === void 0 ? void 0 : await storyMutation(exec, fs);
    const location = mutation === void 0 ? void 0 : proseLocation(mutation.path);
    if (fs === void 0 || mutation === void 0 || location === void 0) return downstream;
    const { root } = mutation;
    const { book } = location;
    if (!await isLongFormBook(fs, root, book, exec.signal)) return downstream;
    const trackingUninitialized = !await hasTrackingState(fs, root, book, exec.signal) && !await hasImportSignal(fs, root, book, exec.signal);
    const reminder = createUserMessage({
      source: { kind: "oh-story-post-write", form: "notice", summary: boundContextSummary(`\u6B63\u6587 ${mutation.path} \u5DF2\u53D8\u66F4`) },
      content: [{ type: "text", text: postWriteReminderText(mutation.path, { trackingUninitialized }) }]
    });
    return {
      ...downstream,
      additionalContexts: [...downstream.additionalContexts ?? [], reminder]
    };
  });
}

// src/role-tool.ts
import { defineTool as defineTool2 } from "@deepseek-ai/dsh-tools";

// src/reference-tool.ts
import { readdir as readdir2, readFile as readFile3, realpath } from "node:fs/promises";
import { isAbsolute as isAbsolute2, join as join4, relative as relative2, resolve as resolve4 } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
var OH_STORY_REFERENCE_TOOL_NAME = "oh_story_bundled_reference";
async function collectMarkdown(root, directory = root) {
  const entries = await readdir2(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join4(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(root, path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  }));
  return nested.flat();
}
async function bundledReferences(storySetupRoot) {
  const root = await realpath(resolve4(storySetupRoot));
  const referenceRoot = await realpath(join4(root, "references", "agent-references"));
  const referenceDirectory = relative2(root, referenceRoot);
  if (referenceDirectory === "" || referenceDirectory.startsWith("..") || isAbsolute2(referenceDirectory)) {
    throw new Error("Bundled Oh Story reference directory escaped its package root.");
  }
  const values = await Promise.all((await collectMarkdown(referenceRoot)).map(async (path) => {
    const canonicalPath = await realpath(path);
    const inside = relative2(referenceRoot, canonicalPath);
    if (inside === "" || inside.startsWith("..") || isAbsolute2(inside)) {
      throw new Error(`Bundled Oh Story reference escaped its package root: ${path}`);
    }
    return {
      canonicalPath,
      name: `story-setup/references/agent-references/${inside.replaceAll("\\", "/")}`
    };
  }));
  return values.sort((left, right) => left.name.localeCompare(right.name));
}
async function createOhStoryReferenceTool(storySetupRoot = join4(defaultBundledSkillRoot(), "story-setup")) {
  const references = await bundledReferences(storySetupRoot);
  if (references.length === 0) throw new Error("No bundled Oh Story references were found.");
  const paths = references.map((reference) => reference.name);
  const byName = new Map(references.map((reference) => [reference.name, reference.canonicalPath]));
  return defineTool({
    name: OH_STORY_REFERENCE_TOOL_NAME,
    description: "Read one exact, pinned Oh Story story-setup reference bundled with this plugin. This does not resolve project Skills or workspace files.",
    parameters: {
      reference: {
        type: "string",
        required: true,
        enum: paths,
        description: "The exact story-setup reference path named by the active bundled Role."
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          reference: { type: "string", required: true },
          content: { type: "string", required: true }
        }
      },
      render: (_args, value) => [{
        type: "text",
        text: `Bundled Oh Story reference: ${value.reference}

${value.content}`
      }]
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const path = byName.get(args.reference);
      if (path === void 0) throw new Error(`Oh Story reference is not bundled: ${args.reference}`);
      return { reference: args.reference, content: await readFile3(path, "utf8") };
    }
  });
}
function bundledReferenceGuard(definition, tools) {
  return (execution) => execution.name === OH_STORY_REFERENCE_TOOL_NAME && tools.get(OH_STORY_REFERENCE_TOOL_NAME, execution.agent) !== definition ? "The pinned Oh Story reference tool was shadowed in this Agent scope." : void 0;
}

// src/role-tool.ts
var OH_STORY_ROLE_TOOL_NAME = "oh_story_role";
var roleTools = {
  // Oh Story 0.8.0 lets the extractor write its own batch input file (never
  // bash). native-hooks fences write/edit to {拆文目录}/_analysis_cache/输入-*.md.
  "chapter-extractor": ["read", "glob", "grep", "write", "edit"],
  "character-designer": [OH_STORY_REFERENCE_TOOL_NAME, "read", "glob", "grep", "write", "edit"],
  "consistency-checker": [OH_STORY_REFERENCE_TOOL_NAME, "read", "glob", "grep"],
  "narrative-writer": [OH_STORY_REFERENCE_TOOL_NAME, "read", "glob", "grep", "write", "edit", "bash"],
  "story-architect": [OH_STORY_REFERENCE_TOOL_NAME, "read", "glob", "grep", "write", "edit"],
  "story-explorer": ["read", "glob", "grep"],
  "story-researcher": ["read", "glob", "grep", "bash", "write", "web_search", "web_fetch"]
};
function roleToolFilter(role) {
  return { allow: roleTools[role] };
}
function resultText(output) {
  return output.map((block) => block.type === "text" ? block.text : JSON.stringify(block)).join("\n");
}
async function createOhStoryRoleTool(subagents) {
  const personas = /* @__PURE__ */ new Map();
  await Promise.all(OH_STORY_ROLE_NAMES.map(async (role) => {
    personas.set(role, await loadBundledRole(role, void 0, "native-tools"));
  }));
  return defineTool2({
    name: OH_STORY_ROLE_TOOL_NAME,
    description: "Run one focused Oh Story specialist as a child of the current DSH Agent. The child inherits DSH model, workspace, permissions, lifecycle, and UI.",
    parameters: {
      role: {
        type: "string",
        required: true,
        enum: OH_STORY_ROLE_NAMES,
        description: "The exact Oh Story Role to run."
      },
      prompt: {
        type: "string",
        required: true,
        description: "A self-contained task. The child inherits the current DSH workspace but not the current in-flight turn."
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          role: { type: "string", required: true, enum: OH_STORY_ROLE_NAMES },
          runId: { type: "string", required: true },
          content: { type: "array", required: true, items: { type: "json" } }
        }
      },
      render: (_args, value) => [{ type: "text", text: resultText(value.content) }]
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      if (exec.agent === void 0) throw new Error("oh_story_role requires a calling DSH Agent.");
      const persona = personas.get(args.role);
      if (persona === void 0) throw new Error(`Oh Story Role ${args.role} is not bundled.`);
      const allowed = roleToolFilter(args.role).allow.filter((name2) => exec.agent?.ctx.tools.get(name2, exec.agent) !== void 0);
      const runtime = subagents ?? exec.agent.ctx.get("subagents");
      if (runtime === void 0) throw new Error("oh_story_role requires the DSH subagent runtime.");
      const run = await runtime.start("spawn", {
        // DSH persists this label in the child's subagent/descriptor; the
        // native hooks read the Role back from it before the child's first tool call.
        label: ohStoryRoleLabel(args.role),
        prompt: [{ type: "text", text: args.prompt }],
        parent: exec.agent,
        persona,
        toolFilter: { allow: allowed },
        maxDepth: 1,
        signal: exec.signal
      });
      if (run.localAgent !== void 0) markOhStoryRoleSession(run.localAgent.session, args.role);
      try {
        const result = await run.result;
        if (result.stopReason !== "completed") {
          throw new Error(`Oh Story Role ${args.role} ended with ${result.stopReason}${result.diagnostic === void 0 ? "" : `: ${result.diagnostic}`}`);
        }
        return {
          role: args.role,
          runId: run.id,
          content: result.output
        };
      } finally {
        await run.dispose();
      }
    }
  });
}
async function registerOhStoryRoleTool(context) {
  const [definition, referenceDefinition] = await Promise.all([
    createOhStoryRoleTool(context.subagents),
    createOhStoryReferenceTool()
  ]);
  context.tools.register(referenceDefinition);
  context.tools.guard(bundledReferenceGuard(referenceDefinition, context.tools));
  let dispose;
  const mount = () => {
    dispose ??= context.tools.register(definition);
  };
  const unmount = () => {
    dispose?.();
    dispose = void 0;
  };
  context.on("subagent/provider-added", (provider) => {
    if (provider.name === "spawn") mount();
  });
  context.on("subagent/provider-removed", (name2) => {
    if (name2 === "spawn") unmount();
  });
  if (context.subagents.getProvider("spawn") !== void 0) mount();
}

// src/production-tool.ts
import { defineTool as defineTool3 } from "@deepseek-ai/dsh-tools";

// src/production-intent.ts
var OH_STORY_PRODUCTION_TOOL_NAME = "oh_story_production";
var PRODUCTION_INTENT_ACTIONS = [
  "open_section",
  "focus_target",
  "set_sequence",
  "track_job"
];
var PRODUCTION_INTENT_SECTIONS = ["shots", "assets", "tasks", "sequence", "canvas"];
var PRODUCTION_INTENT_JOB_KINDS = ["image", "video", "composition"];
function requiredText(value, field) {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`oh_story_production ${field} is required for this action.`);
  if (normalized.length > 512) throw new Error(`oh_story_production ${field} is too long.`);
  return normalized;
}
function validateProductionIntent(args) {
  const episode = args.episode.trim().replaceAll("\\", "/").replace(/\/$/u, "");
  if (!/^剧集\/EP\d{3,}$/u.test(episode)) {
    throw new Error("oh_story_production episode must use the creator path form \u5267\u96C6/EP001.");
  }
  if (args.action === "open_section") {
    if (args.section === void 0) throw new Error("oh_story_production section is required for open_section.");
    return { action: args.action, episode, section: args.section };
  }
  if (args.action === "focus_target") {
    return { action: args.action, episode, targetId: requiredText(args.targetId, "targetId"), section: args.section };
  }
  if (args.action === "set_sequence") {
    const shotIds = args.shotIds?.map((value) => value.trim()).filter((value) => value !== "") ?? [];
    if (shotIds.length === 0) throw new Error("oh_story_production shotIds must contain at least one shot for set_sequence.");
    if (shotIds.length > 500 || new Set(shotIds).size !== shotIds.length || shotIds.some((value) => !/^SHOT-[A-Z0-9-]+$/u.test(value))) {
      throw new Error("oh_story_production shotIds must be unique canonical SHOT-* identifiers.");
    }
    return { action: args.action, episode, shotIds };
  }
  const expectedOutputs = args.expectedOutputs;
  if (expectedOutputs !== void 0 && (!Number.isInteger(expectedOutputs) || expectedOutputs < 1 || expectedOutputs > 500)) {
    throw new Error("oh_story_production expectedOutputs must be an integer between 1 and 500.");
  }
  if (args.jobKind === void 0) throw new Error("oh_story_production jobKind is required for track_job.");
  const prompt = args.prompt?.trim();
  return {
    action: args.action,
    episode,
    jobId: requiredText(args.jobId, "jobId"),
    targetId: requiredText(args.targetId, "targetId"),
    jobKind: args.jobKind,
    expectedOutputs,
    prompt: prompt === "" ? void 0 : prompt
  };
}

// src/production-tool.ts
function intentMessage(intent) {
  if (intent.action === "track_job") return `\u5DF2\u628A ${intent.targetId ?? "\u751F\u4EA7\u5BF9\u8C61"} \u7684 ${intent.jobKind ?? "\u5A92\u4F53"} \u4EFB\u52A1\u6295\u5F71\u5230 ${intent.episode} \u7684\u4EFB\u52A1\u677F\u3002`;
  if (intent.action === "set_sequence") return `\u5DF2\u628A ${String(intent.shotIds?.length ?? 0)} \u4E2A\u955C\u5934\u7684\u987A\u5E8F\u53D1\u9001\u5230 ${intent.episode} \u6210\u7247\u89C6\u56FE\u3002`;
  if (intent.action === "focus_target") return `\u5DF2\u8BF7\u6C42 ${intent.episode} \u751F\u4EA7\u89C6\u56FE\u805A\u7126 ${intent.targetId ?? "\u76EE\u6807"}\u3002`;
  return `\u5DF2\u628A ${intent.action} \u754C\u9762\u610F\u56FE\u53D1\u9001\u5230 ${intent.episode} \u751F\u4EA7\u5DE5\u4F5C\u53F0\u3002`;
}
function createOhStoryProductionTool() {
  return defineTool3({
    name: OH_STORY_PRODUCTION_TOOL_NAME,
    description: "Operate the native oh-story short-drama production projection in the current DSH Session. It can open or focus semantic production targets, set an explicit shot order, or track a job the Agent is actually executing. It never controls cosmetic canvas layout, generates media, changes creator documents, or counts as creator confirmation for paid production.",
    parameters: {
      action: { type: "string", required: true, enum: PRODUCTION_INTENT_ACTIONS, description: "The exact production UI/task projection operation." },
      episode: { type: "string", required: true, description: "Creator-first episode directory, for example \u5267\u96C6/EP001." },
      section: { type: "string", enum: PRODUCTION_INTENT_SECTIONS },
      targetId: { type: "string" },
      shotIds: { type: "array", items: { type: "string" } },
      jobId: { type: "string", description: "Stable ID that must also appear in produced output filenames." },
      jobKind: { type: "string", enum: PRODUCTION_INTENT_JOB_KINDS },
      expectedOutputs: { type: "integer", description: "Number of media files this job will produce. Repeat the count the creator approved when re-registering a batch; omit it to keep the count the workbench already recorded." },
      prompt: { type: "string", description: "Exact prompt/specification for a tracked job; not a production authorization." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          action: { type: "string", required: true, enum: PRODUCTION_INTENT_ACTIONS },
          episode: { type: "string", required: true },
          message: { type: "string", required: true }
        }
      },
      render: (_args, value) => [{ type: "text", text: value.message }]
    },
    isConcurrencySafe: () => true,
    execute(args) {
      const intent = validateProductionIntent(args);
      return Promise.resolve({ action: intent.action, episode: intent.episode, message: intentMessage(intent) });
    }
  });
}
function registerOhStoryProductionTool(context) {
  context.tools.register(createOhStoryProductionTool());
}

// src/workspace-route.ts
import { createHash as createHash2 } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile as readNodeFile, realpath as nodeRealpath, stat as nodeStat } from "node:fs/promises";
import { extname as extname2, isAbsolute as isAbsolute3, relative as relative3, resolve as resolve5 } from "node:path";
import { FsError } from "@deepseek-ai/dsh-fs";
import { SessionId } from "@deepseek-ai/dsh-session";

// src/game-verification.ts
var WorkspaceVerificationTracker = class {
  #observations = /* @__PURE__ */ new Map();
  observe(key, verificationRevision, previewVersion) {
    const previous = this.#observations.get(key);
    if (previous === void 0) {
      this.#remember(key, { verificationRevision, previewVersion, bound: false });
      return { binding: "UNBOUND" };
    }
    if (verificationRevision !== previous.verificationRevision) {
      const bound = verificationRevision !== void 0;
      this.#remember(key, { verificationRevision, previewVersion, bound });
      return bound ? { binding: "CURRENT", verifiedPreviewVersion: previewVersion } : { binding: "UNBOUND" };
    }
    if (!previous.bound) return { binding: "UNBOUND" };
    return previewVersion === previous.previewVersion ? { binding: "CURRENT", verifiedPreviewVersion: previous.previewVersion } : { binding: "STALE", verifiedPreviewVersion: previous.previewVersion };
  }
  #remember(key, observation) {
    this.#observations.set(key, observation);
    if (this.#observations.size <= 500) return;
    const oldest = this.#observations.keys().next();
    if (!oldest.done) this.#observations.delete(oldest.value);
  }
};

// src/video-project.ts
import { basename as basename3, extname } from "node:path";
var VIDEO_DIRECTORY = "video-recaps";
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([".mp4", ".mov", ".mkv", ".webm"]);
var SKIPPED_DIRECTORIES = /* @__PURE__ */ new Set(["frames", "tts_segments", "asr_chunks", "chunks", "cache", "tmp", ".subtitle_measure"]);
var VISIBLE_TEXT_FILES = /* @__PURE__ */ new Set([
  "project.json",
  "recap_run_manifest.json",
  "recap_phase.json",
  "agent_narration_brief.md",
  "recap_story_plan.json",
  "visual_audio_board.json",
  "clip_plan.json",
  "clip_plan_validated.json",
  "narration.json",
  "narration_review.md",
  "tts_meta.json",
  "timeline.json",
  "assembly_manifest.json",
  "assembly_qc.json",
  "final_qc.json",
  "final_qc.md",
  "delivery_qc.json",
  "subtitles.srt",
  "subtitles.ass"
]);
var ARTIFACT_META = {
  "recap_run_manifest.json": { label: "\u8FD0\u884C\u6E05\u5355", kind: "manifest" },
  "recap_phase.json": { label: "\u9636\u6BB5\u8D26\u672C", kind: "manifest" },
  "agent_narration_brief.md": { label: "\u89E3\u8BF4 Brief", kind: "plan" },
  "recap_story_plan.json": { label: "\u6545\u4E8B\u65B9\u6848", kind: "plan" },
  "visual_audio_board.json": { label: "\u97F3\u753B\u65B9\u6848", kind: "plan" },
  "clip_plan.json": { label: "\u526A\u8F91\u8BA1\u5212", kind: "plan" },
  "clip_plan_validated.json": { label: "\u5DF2\u6821\u9A8C\u526A\u8F91\u8BA1\u5212", kind: "plan" },
  "narration.json": { label: "\u89E3\u8BF4\u8BCD", kind: "script" },
  "narration_review.md": { label: "\u89E3\u8BF4\u590D\u6838", kind: "quality" },
  "timeline.json": { label: "\u6210\u7247\u65F6\u95F4\u7EBF", kind: "plan" },
  "assembly_manifest.json": { label: "\u5408\u6210\u6E05\u5355", kind: "manifest" },
  "assembly_qc.json": { label: "\u5408\u6210\u8D28\u68C0", kind: "quality" },
  "final_qc.json": { label: "\u6700\u7EC8\u8D28\u68C0", kind: "quality" },
  "final_qc.md": { label: "\u6700\u7EC8\u8D28\u68C0\u62A5\u544A", kind: "quality" },
  "delivery_qc.json": { label: "\u4EA4\u4ED8\u8D28\u68C0", kind: "quality" },
  "subtitles.srt": { label: "SRT \u5B57\u5E55", kind: "subtitle" },
  "subtitles.ass": { label: "ASS \u5B57\u5E55", kind: "subtitle" }
};
function videoProjectRoot(path) {
  const parts = path.split("/");
  const name2 = parts[1];
  if (parts[0] !== VIDEO_DIRECTORY || name2 === void 0 || name2 === "" || name2 === "." || name2 === ".." || name2.startsWith(".") || name2.includes("\\") || name2.length > 128) return void 0;
  return `${VIDEO_DIRECTORY}/${name2}`;
}
function skipVideoDirectory(path) {
  const parts = path.split("/");
  return parts[0] === VIDEO_DIRECTORY && parts.length >= 3 && SKIPPED_DIRECTORIES.has(parts.at(-1) ?? "");
}
function visibleVideoPath(path) {
  const root = videoProjectRoot(path);
  if (root === void 0 || path === root) return false;
  const name2 = basename3(path);
  const extension = extname(name2).toLocaleLowerCase();
  if (VISIBLE_TEXT_FILES.has(name2)) return true;
  if (!VIDEO_EXTENSIONS.has(extension)) return false;
  return path.startsWith(`${root}/sources/`) || path.startsWith(`${root}/outputs/`) || name2 === "edited_source.mp4" || /^recap_.+\.(?:mp4|mov|webm)$/iu.test(name2);
}
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function text(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : void 0;
}
function referencedMedia(files, value) {
  const path = text(value)?.replaceAll("\\", "/");
  if (path === void 0) return void 0;
  const direct = files.find((file) => file.path === path || path.endsWith(`/${file.path}`));
  if (direct !== void 0) return direct;
  const name2 = path.split("/").at(-1);
  const matching = files.filter((file) => file.path.split("/").at(-1) === name2);
  return matching.length === 1 ? matching[0] : void 0;
}
function previewAsset(file, role, label) {
  return file.kind === "media" && file.mimeType?.startsWith("video/") === true ? { role, label, path: file.path, bytes: file.bytes, version: file.version, mimeType: file.mimeType } : void 0;
}
function summarizeVideoProject(root, files, metadata2 = {}) {
  const id = root.slice(`${VIDEO_DIRECTORY}/`.length);
  const projectFiles = files.filter((file) => file.path.startsWith(`${root}/`));
  const project = record(metadata2.project);
  const manifest = record(metadata2.runManifest);
  const settings = record(manifest?.settings);
  const assembly = record(metadata2.assembly);
  const source = referencedMedia(projectFiles, manifest?.source_video) ?? projectFiles.find((file) => file.kind === "media" && file.path.startsWith(`${root}/sources/`) && file.mimeType?.startsWith("video/") === true);
  const edited = projectFiles.find((file) => file.path.split("/").at(-1) === "edited_source.mp4");
  const final = referencedMedia(projectFiles, assembly?.final_output) ?? projectFiles.filter((file) => file.kind === "media" && (file.path.startsWith(`${root}/outputs/`) || /^recap_.+\.(?:mp4|mov|webm)$/iu.test(file.path.split("/").at(-1) ?? ""))).at(-1);
  const previews = [
    source === void 0 ? void 0 : previewAsset(source, "source", "\u539F\u7247"),
    edited === void 0 ? void 0 : previewAsset(edited, "edited", "\u526A\u540E\u7247"),
    final === void 0 ? void 0 : previewAsset(final, "final", "\u6700\u7EC8\u6210\u7247")
  ].filter((value) => value !== void 0);
  const names = new Set(projectFiles.map((file) => file.path.split("/").at(-1)));
  const cutMode = settings?.edit_mode === "cut" || names.has("clip_plan.json") || edited !== void 0;
  let state = "not-started";
  let stage = "source";
  let stageLabel = source === void 0 ? "\u7B49\u5F85\u5BFC\u5165\u89C6\u9891" : "\u53EF\u4EE5\u5F00\u59CB";
  let nextArtifact;
  if (final !== void 0) {
    state = "ready";
    stage = "complete";
    stageLabel = "\u6210\u7247\u5DF2\u5C31\u7EEA";
  } else if (names.has("tts_meta.json")) {
    state = "working";
    stage = "assemble";
    stageLabel = "\u6B63\u5728\u5408\u6210";
  } else if (names.has("narration.json")) {
    state = "working";
    stage = "voiceover";
    stageLabel = "\u914D\u97F3\u4E0E\u5408\u6210";
  } else if (cutMode && edited !== void 0) {
    state = "waiting";
    stage = "narration";
    stageLabel = "\u7B49\u5F85\u89E3\u8BF4\u8BCD";
    nextArtifact = "narration.json";
  } else if (cutMode && names.has("clip_plan.json")) {
    state = "working";
    stage = "cut";
    stageLabel = "\u6B63\u5728\u526A\u8F91";
  } else if (manifest !== void 0) {
    state = "waiting";
    stage = cutMode ? "clip-plan" : "narration";
    stageLabel = cutMode ? "\u7B49\u5F85\u526A\u8F91\u8BA1\u5212" : "\u7B49\u5F85\u89E3\u8BF4\u8BCD";
    nextArtifact = cutMode ? "clip_plan.json" : "narration.json";
  }
  const artifacts = projectFiles.flatMap((file) => {
    const name2 = file.path.split("/").at(-1) ?? "";
    const meta = ARTIFACT_META[name2];
    return meta === void 0 ? [] : [{ ...meta, path: file.path, version: file.version }];
  }).sort((left, right) => left.path.localeCompare(right.path, "zh-Hans-CN"));
  return {
    id,
    root,
    title: text(project?.title) ?? id,
    state,
    stage,
    stageLabel,
    nextArtifact,
    previews,
    artifacts
  };
}

// src/workspace-request-trust.ts
function header(headers, name2) {
  if (headers instanceof Headers) return headers.get(name2) ?? void 0;
  const value = headers[name2];
  return typeof value === "string" ? value : void 0;
}
function parseAuthority(authority) {
  try {
    return new URL(`http://${authority}`);
  } catch {
    return void 0;
  }
}
function canonicalAuthority(entry, url) {
  const port = url.port !== "" ? url.port : new URL(`https://${entry}`).port;
  return port === "" ? url.hostname : `${url.hostname}:${port}`;
}
function isLoopbackHostname(hostname) {
  if (hostname === "localhost" || hostname === "[::1]") return true;
  const parts = hostname.split(".");
  return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/u.test(part) && Number(part) <= 255);
}
function isTrustedAuthority(host, trustedHosts) {
  return trustedHosts.some((entry) => {
    const candidate = parseAuthority(entry);
    if (candidate === void 0) return false;
    return canonicalAuthority(entry, candidate) === candidate.hostname ? candidate.hostname === host.hostname : candidate.host === host.host;
  });
}
function assertTrustedWorkspaceAuthority(entry) {
  const url = parseAuthority(entry);
  if (url !== void 0 && canonicalAuthority(entry, url) === entry.toLocaleLowerCase()) return;
  throw new Error(`oh-story: trustedHosts entry ${JSON.stringify(entry)} is not a bare host[:port] authority`);
}
function isTrustedWorkspaceRequest(request, trustedHosts) {
  const authority = header(request.headers, "host");
  if (authority === void 0) return false;
  const host = parseAuthority(authority);
  if (host === void 0) return false;
  if (!isLoopbackHostname(host.hostname) && !isTrustedAuthority(host, trustedHosts)) return false;
  if (header(request.headers, "sec-fetch-site") === "cross-site") return false;
  const origin = header(request.headers, "origin");
  if (origin === void 0) return true;
  try {
    return new URL(origin).host === host.host;
  } catch {
    return false;
  }
}
function isTrustedPreviewNavigation(request, trustedHosts) {
  if (isTrustedWorkspaceRequest(request, trustedHosts)) return true;
  const authority = header(request.headers, "host");
  if (authority === void 0) return false;
  const host = parseAuthority(authority);
  if (host === void 0 || !isLoopbackHostname(host.hostname) && !isTrustedAuthority(host, trustedHosts)) return false;
  return header(request.headers, "origin") === void 0 && header(request.headers, "sec-fetch-site") === "cross-site" && header(request.headers, "sec-fetch-mode") === "navigate" && ["document", "iframe"].includes(header(request.headers, "sec-fetch-dest") ?? "");
}

// src/workspace-route.ts
var STORY_DIRECTORIES = ["\u6B63\u6587", "\u5927\u7EB2", "\u8BBE\u5B9A", "\u8FFD\u8E2A", "\u5BF9\u6807", "\u53C2\u8003\u8D44\u6599"];
var DRAMA_DIRECTORIES = ["\u8F93\u5165", "\u9879\u76EE\u5F00\u53D1", "\u8BBE\u5B9A\u96C6", "\u5267\u96C6", "\u4EA4\u4ED8", "\u521B\u4F5C\u8005\u51B3\u7B56", "\u5BA1\u67E5"];
var GAME_DIRECTORY = "game-adaptations";
var CREATIVE_DIRECTORIES = [VIDEO_DIRECTORY, GAME_DIRECTORY, ...STORY_DIRECTORIES, ...DRAMA_DIRECTORIES];
var ROOT_FILES = /* @__PURE__ */ new Set(["short-drama.json"]);
var EDITABLE_EXTENSIONS = /* @__PURE__ */ new Set([".md", ".txt", ".json", ".jsonl"]);
var GAME_EDITABLE_EXTENSIONS = /* @__PURE__ */ new Set([...EDITABLE_EXTENSIONS, ".html", ".css", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx"]);
var VIDEO_EDITABLE_EXTENSIONS = /* @__PURE__ */ new Set([...EDITABLE_EXTENSIONS, ".srt", ".ass"]);
var MEDIA_TYPES = /* @__PURE__ */ new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".mkv", "video/x-matroska"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".m4a", "audio/mp4"]
]);
var MEDIA_MAX_BYTES = 256 * 1024 * 1024;
var FILE_LIMIT = 1e3;
var PREVIEW_FILE_LIMIT = 32 * 1024 * 1024;
var BUNDLED_GAME_EXAMPLE = "jin-ping-mei";
var workspaceVerificationTracker = new WorkspaceVerificationTracker();
var videoPreflightCache;
var dramaPreflightCache;
var WorkspaceHttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  status;
};
function configured(...names) {
  return names.some((name2) => (process.env[name2] ?? "") !== "");
}
var dramaPreflightInFlight;
async function dramaPreflight() {
  if (dramaPreflightCache !== void 0 && dramaPreflightCache.expires > Date.now()) return dramaPreflightCache.value;
  dramaPreflightInFlight ??= (async () => {
    try {
      const python = await hostPython();
      const adapterConfig = await ensureDramaAdapterConfig(defaultDramaSkillRoot(), { python: python.command });
      const value = { python: python.probe, adapterConfig, adapters: dramaAdapterStatuses() };
      dramaPreflightCache = { expires: Date.now() + 3e4, value };
      return value;
    } finally {
      dramaPreflightInFlight = void 0;
    }
  })();
  return dramaPreflightInFlight;
}
async function videoPreflight() {
  if (videoPreflightCache !== void 0 && videoPreflightCache.expires > Date.now()) return videoPreflightCache.value;
  const python = (await hostPython()).probe;
  const [ffmpegOutput, ffmpegFilters, ffprobeOutput] = await Promise.all([
    commandOutput("ffmpeg", ["-version"]),
    commandOutput("ffmpeg", ["-hide_banner", "-filters"]),
    commandOutput("ffprobe", ["-version"])
  ]);
  const value = {
    python,
    ffmpeg: { ok: ffmpegOutput !== void 0, subtitles: /\bsubtitles\b/u.test(ffmpegFilters ?? "") },
    ffprobe: { ok: ffprobeOutput !== void 0 },
    credentials: {
      // Upstream falls back to the shared MIMO_API_KEY only when a per-service key is unset.
      mimo: configured("MIMO_API_KEY", "MIMO_VIDEO_API_KEY", "MIMO_TTS_API_KEY", "MIMO_ASR_API_KEY"),
      fish: configured("FISH_API_KEY"),
      ttsProvider: process.env.TTS_PROVIDER ?? "mimo"
    }
  };
  videoPreflightCache = { expires: Date.now() + 3e4, value };
  return value;
}
function send(response, status, value) {
  const body = `${JSON.stringify(value)}
`;
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(body);
}
function parseByteRange(value, size) {
  const match = value === void 0 ? null : /^bytes=(\d*)-(\d*)$/u.exec(value.trim());
  if (match === null) return void 0;
  const left = match[1] ?? "";
  const right = match[2] ?? "";
  if (left === "") {
    const suffix = Number(right);
    if (right === "" || !Number.isSafeInteger(suffix)) return void 0;
    return suffix === 0 || size <= 0 ? null : { start: Math.max(0, size - suffix), end: size - 1 };
  }
  const start = Number(left);
  const requestedEnd = right === "" ? Number.MAX_SAFE_INTEGER : Number(right);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || requestedEnd < start) return void 0;
  return start >= size ? null : { start, end: Math.min(requestedEnd, size - 1) };
}
function mediaHeaders(mimeType, size, range) {
  const start = range?.start ?? 0;
  const end = range?.end ?? size - 1;
  return {
    "content-type": mimeType,
    "content-length": Math.max(0, end - start + 1),
    "cache-control": "private, max-age=60",
    "accept-ranges": "bytes",
    ...range === void 0 ? {} : { "content-range": `bytes ${String(start)}-${String(end)}/${String(size)}` },
    "x-content-type-options": "nosniff"
  };
}
function sendMediaBytes(request, response, bytes, mimeType) {
  const range = parseByteRange(typeof request.headers.range === "string" ? request.headers.range : void 0, bytes.byteLength);
  if (range === null) {
    response.writeHead(416, { "content-range": `bytes */${String(bytes.byteLength)}`, "cache-control": "no-store" });
    response.end();
    return;
  }
  const start = range?.start ?? 0;
  const end = range?.end ?? bytes.byteLength - 1;
  const body = bytes.subarray(start, end + 1);
  response.writeHead(range === void 0 ? 200 : 206, mediaHeaders(mimeType, bytes.byteLength, range));
  response.end(request.method === "HEAD" ? void 0 : Buffer.from(body));
}
async function hostWorkspaceFile(realm, target2, expectedSize) {
  const [root, path] = await Promise.all([
    nodeRealpath(realm.fs.processPath(realm.root)),
    nodeRealpath(realm.fs.processPath(target2))
  ]);
  const inside = relative3(root, path);
  if (inside === "" || inside.startsWith("..") || isAbsolute3(inside)) return void 0;
  const local = await nodeStat(path);
  return local.isFile() && local.size === expectedSize ? path : void 0;
}
async function sendWorkspaceMedia(request, response, realm, target2, info, mimeType) {
  const expectedSize = info.size;
  if (expectedSize !== void 0) {
    const processPath = await hostWorkspaceFile(realm, target2, expectedSize).catch(() => void 0);
    if (processPath !== void 0) {
      const range = parseByteRange(typeof request.headers.range === "string" ? request.headers.range : void 0, expectedSize);
      if (range === null) {
        response.writeHead(416, { "content-range": `bytes */${String(expectedSize)}`, "cache-control": "no-store" });
        response.end();
        return;
      }
      response.writeHead(range === void 0 ? 200 : 206, mediaHeaders(mimeType, expectedSize, range));
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      const stream = createReadStream(processPath, range === void 0 ? void 0 : { start: range.start, end: range.end });
      request.once("close", () => {
        if (!response.writableEnded) stream.destroy();
      });
      stream.on("error", () => {
        if (!response.headersSent) response.destroy();
        else response.end();
      });
      stream.pipe(response);
      return;
    }
    if (expectedSize > MEDIA_MAX_BYTES) throw new WorkspaceHttpError(413, "\u8FDC\u7A0B\u5A92\u4F53\u8D85\u8FC7\u5DE5\u4F5C\u53F0\u56DE\u9000\u9884\u89C8\u5927\u5C0F\u9650\u5236\u3002");
  }
  sendMediaBytes(request, response, await realm.fs.readBytes(target2, void 0, MEDIA_MAX_BYTES), mimeType);
}
async function jsonBody(request, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const value = Buffer.from(chunk);
    size += value.byteLength;
    if (size > maxBytes) throw new WorkspaceHttpError(413, "\u8BF7\u6C42\u5185\u5BB9\u8FC7\u5927\u3002");
    chunks.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new WorkspaceHttpError(400, "\u8BF7\u6C42\u5FC5\u987B\u662F JSON \u5BF9\u8C61\u3002");
  }
}
function safeRelativePath(path) {
  return path !== "" && !path.startsWith("/") && !path.includes("\\") && !path.split("/").some((segment) => segment === "" || segment === "." || segment === "..");
}
function editablePath(path) {
  const extensions = path.startsWith(`${GAME_DIRECTORY}/`) ? GAME_EDITABLE_EXTENSIONS : path.startsWith(`${VIDEO_DIRECTORY}/`) ? VIDEO_EDITABLE_EXTENSIONS : EDITABLE_EXTENSIONS;
  return extensions.has(extname2(path).toLocaleLowerCase());
}
function assertCreativePath(path, kind) {
  if (kind === "text" ? !editablePath(path) : !MEDIA_TYPES.has(extname2(path).toLocaleLowerCase())) {
    throw new WorkspaceHttpError(415, kind === "text" ? "\u5DE5\u4F5C\u53F0\u4E0D\u652F\u6301\u7F16\u8F91\u8BE5\u6587\u4EF6\u7C7B\u578B\u3002" : "\u76EE\u6807\u4E0D\u662F\u53D7\u652F\u6301\u7684\u77ED\u5267\u5A92\u4F53\u6587\u4EF6\u3002");
  }
  if (!safeRelativePath(path)) {
    throw new WorkspaceHttpError(403, "\u6587\u4EF6\u8DEF\u5F84\u4E0D\u5728\u521B\u4F5C\u5DE5\u4F5C\u53F0\u4E2D\u3002");
  }
  const root = path.split("/", 1)[0];
  if (!CREATIVE_DIRECTORIES.some((directory) => directory === root) && !ROOT_FILES.has(path)) {
    throw new WorkspaceHttpError(403, "\u6587\u4EF6\u8DEF\u5F84\u4E0D\u5728\u521B\u4F5C\u5DE5\u4F5C\u53F0\u4E2D\u3002");
  }
}
function mediaMimeTypeForPath(path) {
  return MEDIA_TYPES.get(extname2(path).toLocaleLowerCase());
}
async function workspaceRealmForSession(context, rawId) {
  if (rawId === "") throw new WorkspaceHttpError(400, "\u7F3A\u5C11 DSH sessionId\u3002");
  const lookup = context.typert.lookups.get("agent");
  if (lookup === void 0) throw new WorkspaceHttpError(503, "DSH Agent lookup \u5F53\u524D\u4E0D\u53EF\u7528\u3002");
  let agent;
  try {
    agent = await lookup.resolve(SessionId(rawId));
  } catch {
    throw new WorkspaceHttpError(404, "DSH \u4F1A\u8BDD\u4E0D\u53EF\u7528\u3002");
  }
  if (agent === void 0) throw new WorkspaceHttpError(404, "DSH \u4F1A\u8BDD\u4E0D\u53EF\u7528\u3002");
  if (agent.session.header.parentSession !== void 0 || agent.session.header.origin === "subagent") {
    throw new WorkspaceHttpError(403, "\u5B50 Agent \u4F1A\u8BDD\u4E0D\u5F00\u653E\u521B\u4F5C\u7F16\u8F91\u5668\u3002");
  }
  const cwd = agent.session.header.cwd;
  if (cwd === void 0) throw new WorkspaceHttpError(409, "\u5F53\u524D DSH \u4F1A\u8BDD\u6CA1\u6709\u5DE5\u4F5C\u76EE\u5F55\u3002");
  const fs = agent.ctx.get("fs");
  const sandboxPolicy = agent.ctx.get("sandboxPolicy");
  if (fs === void 0 || sandboxPolicy === void 0) throw new WorkspaceHttpError(503, "DSH \u6587\u4EF6\u7CFB\u7EDF\u5F53\u524D\u4E0D\u53EF\u7528\u3002");
  return { agent, fs, sandboxPolicy, cwd, root: await fs.resolve(cwd) };
}
async function workspaceRealm(context, url) {
  const rawId = url.searchParams.get("sessionId");
  if (rawId === null) throw new WorkspaceHttpError(400, "\u7F3A\u5C11 DSH sessionId\u3002");
  return workspaceRealmForSession(context, rawId);
}
async function creativeTarget(realm, path, kind = "text") {
  assertCreativePath(path, kind);
  const target2 = await realm.fs.resolve(path, { cwd: realm.cwd });
  if (!realm.fs.contains(realm.root, target2)) throw new WorkspaceHttpError(403, "\u6587\u4EF6\u8DEF\u5F84\u79BB\u5F00\u4E86 DSH \u5DE5\u4F5C\u76EE\u5F55\u3002");
  return target2;
}
function requireRegularFile(info) {
  if (info === void 0) throw new WorkspaceHttpError(404, "\u6587\u4EF6\u4E0D\u5B58\u5728\u3002");
  if (info.type !== "file") throw new WorkspaceHttpError(415, "\u76EE\u6807\u4E0D\u662F\u53EF\u7F16\u8F91\u7684\u666E\u901A\u6587\u4EF6\u3002");
  return info;
}
async function readVersionedFile(fs, target2, maxBytes) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const before = requireRegularFile(await fs.stat(target2));
    if (before.size !== void 0 && before.size > maxBytes) throw new WorkspaceHttpError(413, "\u6587\u4EF6\u8D85\u8FC7\u5DE5\u4F5C\u53F0\u5927\u5C0F\u9650\u5236\u3002");
    const bytes = await fs.readBytes(target2, void 0, maxBytes);
    const after = requireRegularFile(await fs.stat(target2));
    if (before.version !== after.version) continue;
    let content;
    try {
      content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new WorkspaceHttpError(415, "\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684 UTF-8 \u6587\u672C\u3002");
    }
    return { content, bytes: bytes.byteLength, version: after.version };
  }
  throw new WorkspaceHttpError(409, "\u6587\u4EF6\u6B63\u5728\u88AB\u4FEE\u6539\uFF0C\u8BF7\u91CD\u8BD5\u3002");
}
async function listFiles(realm) {
  const files = [];
  const walk = async (path, directory) => {
    for (const entry of await realm.fs.listDir(directory)) {
      if (entry.name.startsWith(".") || !realm.fs.contains(realm.root, entry.target)) continue;
      const childPath = `${path}/${entry.name}`;
      if (entry.type === "directory") {
        if (!skipVideoDirectory(childPath)) await walk(childPath, entry.target);
      } else if (entry.type === "file" && (editablePath(childPath) || MEDIA_TYPES.has(extname2(entry.name).toLocaleLowerCase()))) {
        const info = entry.version === void 0 || entry.size === void 0 ? await realm.fs.stat(entry.target) : void 0;
        const version = entry.version ?? info?.version;
        const mimeType = MEDIA_TYPES.get(extname2(entry.name).toLocaleLowerCase());
        if (version !== void 0 && (!childPath.startsWith(`${VIDEO_DIRECTORY}/`) || visibleVideoPath(childPath))) {
          files.push({ path: childPath, bytes: entry.size ?? info?.size ?? 0, version, kind: mimeType === void 0 ? "text" : "media", mimeType });
        }
      }
      if (files.length >= FILE_LIMIT) return;
    }
  };
  for (const directory of CREATIVE_DIRECTORIES) {
    const target2 = await realm.fs.resolve(directory, { cwd: realm.cwd });
    if (!realm.fs.contains(realm.root, target2)) continue;
    const info = await realm.fs.stat(target2);
    if (info?.type === "directory") await walk(directory, target2);
    if (files.length >= FILE_LIMIT) break;
  }
  for (const path of ROOT_FILES) {
    const target2 = await creativeTarget(realm, path);
    const info = await realm.fs.stat(target2);
    if (info?.type === "file") files.push({ path, bytes: info.size ?? 0, version: info.version, kind: "text" });
  }
  return files.sort((left, right) => left.path.localeCompare(right.path, "zh-Hans-CN"));
}
async function metadata(realm, files, path, maxBytes) {
  if (!files.some((file) => file.path === path)) return { value: null };
  try {
    const target2 = await creativeTarget(realm, path);
    return { value: JSON.parse((await readVersionedFile(realm.fs, target2, maxBytes)).content) };
  } catch (error) {
    return { value: null, error: error instanceof SyntaxError ? `${path} \u4E0D\u662F\u6709\u6548\u7684 JSON\u3002` : `${path} \u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6\u3002` };
  }
}
function token(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}
function untoken(value) {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    throw new WorkspaceHttpError(400, "\u6E38\u620F\u9884\u89C8\u6807\u8BC6\u65E0\u6548\u3002");
  }
}
function gameRoot(path) {
  const parts = path.split("/");
  const name2 = parts[1];
  return parts.length === 2 && parts[0] === GAME_DIRECTORY && name2 !== void 0 && name2 !== "" && name2 !== "." && name2 !== ".." && name2.length <= 128 && !name2.startsWith(".") && !name2.includes("\\");
}
function normalizedVerification(value, binding, verifiedPreviewVersion) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { status: "NOT_RUN", checks: {}, limitations: [], binding };
  }
  const record2 = value;
  const status = record2.status === "PASS" || record2.status === "FAIL" ? record2.status : "NOT_RUN";
  const rawChecks = typeof record2.checks === "object" && record2.checks !== null && !Array.isArray(record2.checks) ? record2.checks : {};
  const checks = {};
  for (const name2 of ["launch", "render", "input", "coreLoop", "outcome", "restart"]) {
    const check = rawChecks[name2];
    checks[name2] = check === "PASS" || check === "FAIL" ? check : "NOT_RUN";
  }
  const completeRun = typeof record2.completeRun === "object" && record2.completeRun !== null && !Array.isArray(record2.completeRun) ? record2.completeRun : {};
  const limitations = Array.isArray(record2.limitations) ? record2.limitations.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const item = entry;
    return typeof item.scope === "string" && typeof item.reason === "string" ? [{ scope: item.scope, reason: item.reason }] : [];
  }) : [];
  return {
    status,
    checks,
    runId: typeof completeRun.id === "string" ? completeRun.id : void 0,
    limitations,
    binding,
    verifiedPreviewVersion
  };
}
async function workspaceText(realm, path, maxBytes) {
  const target2 = await realm.fs.resolve(path, { cwd: realm.cwd });
  if (!realm.fs.contains(realm.root, target2) || (await realm.fs.stat(target2))?.type !== "file") return void 0;
  return (await readVersionedFile(realm.fs, target2, maxBytes)).content;
}
async function previewDigest(realm, projectRoot) {
  const appPath = `${projectRoot}/build/app`;
  const app = await realm.fs.resolve(appPath, { cwd: realm.cwd });
  if (!realm.fs.contains(realm.root, app) || (await realm.fs.stat(app))?.type !== "directory") return { ready: false, version: "missing" };
  const entries = [];
  let ready = false;
  const visit = async (directory, path) => {
    for (const entry of await realm.fs.listDir(directory)) {
      if (entry.name.startsWith(".") || !realm.fs.contains(app, entry.target)) continue;
      const childPath = path === "" ? entry.name : `${path}/${entry.name}`;
      if (entry.type === "directory") await visit(entry.target, childPath);
      else if (entry.type === "file") {
        const info = entry.version === void 0 ? await realm.fs.stat(entry.target) : void 0;
        const version = entry.version ?? info?.version;
        if (version !== void 0) entries.push(`${childPath}\0${version}`);
        if (childPath === "index.html") ready = true;
      }
      if (entries.length >= 5e3) return;
    }
  };
  await visit(app, "");
  return { ready, version: createHash2("sha256").update(entries.sort().join("\n")).digest("hex").slice(0, 16) };
}
function headingTitle(content, fallback) {
  const heading = content?.split(/\r?\n/u).find((line) => /^#\s+/u.test(line));
  return heading?.replace(/^#\s+/u, "").replace(/^PRODUCT_BRIEF\s*[·・:]?\s*/iu, "").trim() || fallback;
}
async function workspaceGameProjects(realm, files, sessionId, maxBytes) {
  const roots = [...new Set(files.flatMap((file) => {
    const parts = file.path.split("/");
    return parts[0] === GAME_DIRECTORY && parts[1] !== void 0 ? [`${GAME_DIRECTORY}/${parts[1]}`] : [];
  }))].filter(gameRoot).sort();
  return Promise.all(roots.map(async (root) => {
    const id = root.slice(`${GAME_DIRECTORY}/`.length);
    const qaPath = `${root}/qa/verification.json`;
    const qaFile = files.find((file) => file.path === qaPath);
    const [brief, qa, preview] = await Promise.all([
      workspaceText(realm, `${root}/PRODUCT_BRIEF.md`, maxBytes).catch(() => void 0),
      workspaceText(realm, qaPath, maxBytes).catch(() => void 0),
      previewDigest(realm, root).catch(() => ({ ready: false, version: "unavailable" }))
    ]);
    let verification;
    try {
      verification = qa === void 0 ? void 0 : JSON.parse(qa);
    } catch {
      verification = void 0;
    }
    const freshness = workspaceVerificationTracker.observe(`${sessionId}\0${root}`, qaFile?.version, preview.version);
    return {
      id: `workspace:${id}`,
      root,
      title: headingTitle(brief, id),
      source: "workspace",
      previewReady: preview.ready,
      previewUrl: preview.ready ? `/oh-story/game-preview/workspace/${token(sessionId)}/${token(root)}/index.html` : void 0,
      previewVersion: preview.version,
      verification: normalizedVerification(verification, freshness.binding, freshness.verifiedPreviewVersion)
    };
  }));
}
async function workspaceVideoProjects(realm, files, maxBytes) {
  const roots = [...new Set(files.flatMap((file) => {
    const root = videoProjectRoot(file.path);
    return root === void 0 ? [] : [root];
  }))].sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
  return Promise.all(roots.map(async (root) => {
    const findPath = (name2) => files.find((file) => file.path.startsWith(`${root}/`) && file.path.split("/").at(-1) === name2)?.path;
    const readJson = async (name2) => {
      const path = findPath(name2);
      if (path === void 0) return void 0;
      const content = await workspaceText(realm, path, maxBytes).catch(() => void 0);
      if (content === void 0) return void 0;
      try {
        return JSON.parse(content);
      } catch {
        return void 0;
      }
    };
    const [project, runManifest, assembly] = await Promise.all([
      readJson("project.json"),
      readJson("recap_run_manifest.json"),
      readJson("assembly_manifest.json")
    ]);
    return summarizeVideoProject(root, files, { project, runManifest, assembly });
  }));
}
function bundledExampleRoot() {
  return resolve5(defaultNovelToGameSkillRoot(), `../examples/${BUNDLED_GAME_EXAMPLE}`);
}
async function bundledGameExample() {
  const root = bundledExampleRoot();
  const [example, verification, manifest] = await Promise.all([
    readNodeFile(resolve5(root, "example.json"), "utf8"),
    readNodeFile(resolve5(root, "qa/verification.json"), "utf8"),
    readNodeFile(resolve5(defaultNovelToGameSkillRoot(), "../manifest.json"), "utf8")
  ]);
  const exampleJson = JSON.parse(example);
  const manifestJson = JSON.parse(manifest);
  const previewVersion = typeof manifestJson.upstream?.commit === "string" ? manifestJson.upstream.commit.slice(0, 16) : "bundled";
  return {
    id: `example:${BUNDLED_GAME_EXAMPLE}`,
    root: `examples/${BUNDLED_GAME_EXAMPLE}`,
    title: typeof exampleJson.title === "string" ? exampleJson.title : "\u91D1\u74F6\u6885 \xB7 \u98CE\u6708\u603B\u8D26",
    source: "example",
    previewReady: true,
    previewUrl: `/oh-story/game-preview/example/${BUNDLED_GAME_EXAMPLE}/index.html`,
    previewVersion,
    verification: normalizedVerification(JSON.parse(verification), "PINNED", previewVersion)
  };
}
function previewContentType(path) {
  switch (extname2(path).toLocaleLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".wasm":
      return "application/wasm";
    case ".mp3":
      return "audio/mpeg";
    case ".ogg":
      return "audio/ogg";
    default:
      return "application/octet-stream";
  }
}
function previewAssetSources(request) {
  const authority = request.headers.host;
  if (authority === void 0) return "'none'";
  const prefix = `${authority}/oh-story/game-preview/`;
  return `http://${prefix} https://${prefix}`;
}
function previewContentSecurityPolicy(assets) {
  return [
    "sandbox allow-scripts allow-forms allow-modals allow-downloads allow-same-origin",
    "default-src 'none'",
    `script-src 'unsafe-inline' 'wasm-unsafe-eval' blob: ${assets}`,
    `style-src 'unsafe-inline' ${assets}`,
    `img-src data: blob: ${assets}`,
    `media-src data: blob: ${assets}`,
    `font-src data: ${assets}`,
    `connect-src ${assets}`,
    `worker-src blob: ${assets}`,
    `manifest-src ${assets}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'self' http://127.0.0.1:* http://localhost:*"
  ].join("; ");
}
function sendPreview(request, response, path, bytes) {
  const assets = previewAssetSources(request);
  response.writeHead(200, {
    "content-type": previewContentType(path),
    "content-length": bytes.byteLength,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "cross-origin-resource-policy": "cross-origin",
    "access-control-allow-origin": "*",
    "content-security-policy": previewContentSecurityPolicy(assets)
  });
  response.end(bytes);
}
async function previewBytes(context, pathname) {
  let segments;
  try {
    segments = pathname.split("/").slice(3).map((segment) => decodeURIComponent(segment));
  } catch {
    throw new WorkspaceHttpError(400, "\u6E38\u620F\u9884\u89C8\u5730\u5740\u65E0\u6548\u3002");
  }
  const kind = segments.shift();
  if (kind === "example") {
    const id = segments.shift();
    const path = segments.join("/") || "index.html";
    if (id !== BUNDLED_GAME_EXAMPLE || !safeRelativePath(path)) throw new WorkspaceHttpError(404, "\u6E38\u620F\u793A\u4F8B\u4E0D\u5B58\u5728\u3002");
    const appRoot = resolve5(bundledExampleRoot(), "build/app");
    const target2 = resolve5(appRoot, path);
    const escaped = relative3(appRoot, target2);
    if (escaped.startsWith("..") || isAbsolute3(escaped)) throw new WorkspaceHttpError(403, "\u9884\u89C8\u8D44\u6E90\u79BB\u5F00\u4E86\u6E38\u620F\u76EE\u5F55\u3002");
    const info = await nodeStat(target2).catch(() => void 0);
    if (!info?.isFile()) throw new WorkspaceHttpError(404, "\u9884\u89C8\u8D44\u6E90\u4E0D\u5B58\u5728\u3002");
    if (info.size > PREVIEW_FILE_LIMIT) throw new WorkspaceHttpError(413, "\u9884\u89C8\u8D44\u6E90\u8FC7\u5927\u3002");
    return { path, bytes: await readNodeFile(target2) };
  }
  if (kind === "workspace") {
    const session = segments.shift();
    const project = segments.shift();
    const path = segments.join("/") || "index.html";
    if (session === void 0 || project === void 0 || !safeRelativePath(path)) throw new WorkspaceHttpError(400, "\u6E38\u620F\u9884\u89C8\u5730\u5740\u65E0\u6548\u3002");
    const realm = await workspaceRealmForSession(context, untoken(session));
    const root = untoken(project);
    if (!gameRoot(root)) throw new WorkspaceHttpError(403, "\u6E38\u620F\u9879\u76EE\u8DEF\u5F84\u65E0\u6548\u3002");
    const appRoot = await realm.fs.resolve(`${root}/build/app`, { cwd: realm.cwd });
    const target2 = await realm.fs.resolve(`${root}/build/app/${path}`, { cwd: realm.cwd });
    if (!realm.fs.contains(realm.root, appRoot) || !realm.fs.contains(appRoot, target2)) {
      throw new WorkspaceHttpError(403, "\u9884\u89C8\u8D44\u6E90\u79BB\u5F00\u4E86\u6E38\u620F\u76EE\u5F55\u3002");
    }
    const info = requireRegularFile(await realm.fs.stat(target2));
    if (info.size !== void 0 && info.size > PREVIEW_FILE_LIMIT) throw new WorkspaceHttpError(413, "\u9884\u89C8\u8D44\u6E90\u8FC7\u5927\u3002");
    return { path, bytes: await realm.fs.readBytes(target2, void 0, PREVIEW_FILE_LIMIT) };
  }
  throw new WorkspaceHttpError(404, "\u6E38\u620F\u9884\u89C8\u4E0D\u5B58\u5728\u3002");
}
function mapFsError(error) {
  if (!(error instanceof FsError)) return void 0;
  switch (error.code) {
    case "FS_NOT_FOUND":
      return new WorkspaceHttpError(404, "\u6587\u4EF6\u4E0D\u5B58\u5728\u3002");
    case "FS_TOO_LARGE":
      return new WorkspaceHttpError(413, "\u6587\u4EF6\u8D85\u8FC7\u5DE5\u4F5C\u53F0\u5927\u5C0F\u9650\u5236\u3002");
    case "FS_NOT_TEXT":
    case "FS_NOT_REGULAR_FILE":
      return new WorkspaceHttpError(415, "\u76EE\u6807\u4E0D\u662F\u53EF\u7F16\u8F91\u7684\u6587\u672C\u6587\u4EF6\u3002");
    case "FS_PERMISSION_DENIED":
    case "FS_SANDBOX_DENIED":
      return new WorkspaceHttpError(403, "\u5F53\u524D DSH \u6743\u9650\u4E0D\u5141\u8BB8\u4FEE\u6539\u8BE5\u6587\u4EF6\u3002");
    case "FS_STALE_VERSION":
    case "FS_NOT_OBSERVED":
      return new WorkspaceHttpError(412, "\u6587\u4EF6\u5DF2\u5728\u78C1\u76D8\u4E0A\u66F4\u65B0\u3002\u8BF7\u5904\u7406\u51B2\u7A81\u540E\u518D\u4FDD\u5B58\u3002");
    case "FS_ABORTED":
      return new WorkspaceHttpError(409, "\u6587\u4EF6\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
    default:
      return new WorkspaceHttpError(500, "DSH \u6587\u4EF6\u7CFB\u7EDF\u64CD\u4F5C\u5931\u8D25\u3002");
  }
}
async function handle(context, request, response, options) {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const gamePreview = url.pathname.startsWith("/oh-story/game-preview/");
    const trusted = gamePreview ? isTrustedPreviewNavigation(request, options.trustedHosts ?? []) : isTrustedWorkspaceRequest(request, options.trustedHosts ?? []);
    if (!trusted) throw new WorkspaceHttpError(403, "\u8BF7\u6C42\u6765\u6E90\u4E0D\u53D7\u4FE1\u4EFB\u3002");
    if (gamePreview && request.method === "GET") {
      const preview = await previewBytes(context, url.pathname);
      sendPreview(request, response, preview.path, preview.bytes);
      return;
    }
    if (url.pathname === "/oh-story/workspace" && request.method === "GET") {
      const realm = await workspaceRealm(context, url);
      const files = await listFiles(realm);
      const tracking = await metadata(realm, files, "\u8FFD\u8E2A/_tracking-state.json", options.maxBytes);
      const shortDrama = await metadata(realm, files, "short-drama.json", options.maxBytes);
      const metadataErrors = [tracking.error, shortDrama.error].filter((value) => value !== void 0);
      const sessionId = url.searchParams.get("sessionId");
      if (sessionId === null) throw new WorkspaceHttpError(400, "\u7F3A\u5C11 DSH sessionId\u3002");
      const games = [
        ...await workspaceGameProjects(realm, files, sessionId, options.maxBytes),
        await bundledGameExample()
      ];
      const videos = await workspaceVideoProjects(realm, files, options.maxBytes);
      send(response, 200, { cwd: realm.cwd, files, games, videos, tracking: tracking.value, shortDrama: shortDrama.value, metadataErrors, mode: "dsh-session" });
      return;
    }
    if (url.pathname === "/oh-story/video-preflight" && request.method === "GET") {
      send(response, 200, await videoPreflight());
      return;
    }
    if (url.pathname === "/oh-story/drama-preflight" && request.method === "GET") {
      send(response, 200, await dramaPreflight());
      return;
    }
    if (url.pathname === "/oh-story/file" && request.method === "GET") {
      const realm = await workspaceRealm(context, url);
      const path = url.searchParams.get("path");
      if (path === null) throw new WorkspaceHttpError(400, "\u7F3A\u5C11\u6587\u4EF6\u8DEF\u5F84\u3002");
      const file = await readVersionedFile(realm.fs, await creativeTarget(realm, path), options.maxBytes);
      send(response, 200, { path, ...file });
      return;
    }
    if (url.pathname === "/oh-story/media" && (request.method === "GET" || request.method === "HEAD")) {
      const realm = await workspaceRealm(context, url);
      const path = url.searchParams.get("path");
      if (path === null) throw new WorkspaceHttpError(400, "\u7F3A\u5C11\u5A92\u4F53\u6587\u4EF6\u8DEF\u5F84\u3002");
      const mimeType = mediaMimeTypeForPath(path);
      if (mimeType === void 0) throw new WorkspaceHttpError(415, "\u76EE\u6807\u4E0D\u662F\u53D7\u652F\u6301\u7684\u77ED\u5267\u5A92\u4F53\u6587\u4EF6\u3002");
      const target2 = await creativeTarget(realm, path, "media");
      const info = requireRegularFile(await realm.fs.stat(target2));
      await sendWorkspaceMedia(request, response, realm, target2, info, mimeType);
      return;
    }
    if (url.pathname === "/oh-story/file" && request.method === "PUT") {
      const realm = await workspaceRealm(context, url);
      const path = url.searchParams.get("path");
      if (path === null) throw new WorkspaceHttpError(400, "\u7F3A\u5C11\u6587\u4EF6\u8DEF\u5F84\u3002");
      const input = await jsonBody(request, options.maxBytes * 6 + 1024);
      if (typeof input.content !== "string") throw new WorkspaceHttpError(400, "content \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002");
      if (typeof input.baseVersion !== "string" || input.baseVersion === "") throw new WorkspaceHttpError(400, "baseVersion \u5FC5\u987B\u662F\u6709\u6548\u7248\u672C\u3002");
      if (Buffer.byteLength(input.content) > options.maxBytes) throw new WorkspaceHttpError(413, "\u6587\u4EF6\u8D85\u8FC7\u5DE5\u4F5C\u53F0\u5927\u5C0F\u9650\u5236\u3002");
      const outcome = await realm.fs.writeText(
        await creativeTarget(realm, path),
        input.content,
        { kind: "replaceIfVersion", version: input.baseVersion },
        void 0,
        realm.sandboxPolicy.resolve({ session: realm.agent.session })
      );
      send(response, 200, { path, content: outcome.after, bytes: Buffer.byteLength(outcome.after), version: outcome.version });
      return;
    }
    send(response, 404, { error: "Oh Story route not found." });
  } catch (error) {
    const mapped = error instanceof WorkspaceHttpError ? error : mapFsError(error);
    if (mapped === void 0) context.logger("oh-story").error("workspace route failed", error);
    send(response, mapped?.status ?? 500, { error: mapped?.message ?? "Oh Story workspace operation failed." });
  }
}
function registerWorkspaceRoute(context, options) {
  context.effect(() => context.webServer.register({
    kind: "prefix",
    path: "/oh-story",
    handler: (request, response) => handle(context, request, response, options)
  }), "oh-story: DSH-session workspace API");
}

// src/index.ts
var name = "oh-story";
var inject = ["skills", "subagents", "tools", "typert", "webServer"];
var Config = z.object({
  editorMaxBytes: z.natural().min(65536).max(8388608).default(2097152),
  trustedHosts: z.array(String).default([])
});
async function apply(context, config = {}) {
  const trustedHosts = config.trustedHosts ?? [];
  for (const entry of trustedHosts) assertTrustedWorkspaceAuthority(entry);
  context.skills.registerProvider(() => createOhStorySkillProvider());
  context.skills.registerProvider(() => createDramaSkillProvider());
  context.skills.registerProvider(() => createNovelToGameSkillProvider());
  context.skills.registerProvider(() => createVideoRecapSkillProvider());
  registerOhStoryHooks(context);
  registerOhStoryProductionTool(context);
  await registerOhStoryRoleTool(context);
  registerWorkspaceRoute(context, { maxBytes: config.editorMaxBytes ?? 2097152, trustedHosts });
  await ensureDramaAdapterConfig(defaultDramaSkillRoot(), { python: (await hostPython()).command });
}
var index_default = { name, inject, Config, apply };
export {
  Config,
  DRAMA_ADAPTERS,
  DRAMA_ADAPTER_CONFIG_ENV,
  OH_STORY_PRODUCTION_TOOL_NAME,
  OH_STORY_REFERENCE_TOOL_NAME,
  OH_STORY_ROLE_NAMES,
  OH_STORY_ROLE_TOOL_NAME,
  apply,
  bundledReferenceGuard,
  createDramaSkillProvider,
  createNovelToGameSkillProvider,
  createOhStoryProductionTool,
  createOhStoryReferenceTool,
  createOhStoryRoleTool,
  createOhStorySkillProvider,
  createVideoRecapSkillProvider,
  index_default as default,
  dramaAdapterConfigPath,
  dramaAdapterStatuses,
  ensureDramaAdapterConfig,
  inject,
  loadBundledRole,
  name,
  parseBundledSkill,
  registerOhStoryHooks,
  registerOhStoryProductionTool,
  registerOhStoryRoleTool,
  registerWorkspaceRoute,
  roleToolFilter,
  validateProductionIntent
};
//# sourceMappingURL=index.js.map
