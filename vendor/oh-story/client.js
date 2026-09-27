window.__ModuleLoader__.load({id:"@oh-story/dsh",factory:(require)=>{var module={exports:{}};var exports=module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  default: () => index_default,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_dsh_client_store = require("@deepseek-ai/dsh-client-store"), import_react3 = require("react"), import_react_dom = require("react-dom");

// src/client/file-activity.ts
var WORKBENCH_LABELS = {
  story: "\u5C0F\u8BF4",
  drama: "\u77ED\u5267",
  game: "\u6E38\u620F",
  video: "\u89C6\u9891"
};
function workbenchLabel(mode) {
  return WORKBENCH_LABELS[mode];
}
var STORY_DIRECTORIES = /* @__PURE__ */ new Set(["\u6B63\u6587", "\u5927\u7EB2", "\u8BBE\u5B9A", "\u8FFD\u8E2A", "\u5BF9\u6807", "\u53C2\u8003\u8D44\u6599"]), DRAMA_DIRECTORIES = /* @__PURE__ */ new Set(["\u8F93\u5165", "\u9879\u76EE\u5F00\u53D1", "\u8BBE\u5B9A\u96C6", "\u5267\u96C6", "\u4EA4\u4ED8", "\u521B\u4F5C\u8005\u51B3\u7B56", "\u5BA1\u67E5"]), GAME_DIRECTORY = "game-adaptations", VIDEO_DIRECTORY = "video-recaps", EDITABLE_EXTENSION = /\.(?:md|txt|json|jsonl|html|css|[cm]?js|tsx?|jsx)$/iu, MUTATING_CALLS = /* @__PURE__ */ new Set(["write", "edit", "str_replace_editor", "bash", "run_code", "oh_story_role"]);
function streamingAssistant(timeline) {
  for (let turnNumber of timeline.turnOrder.toReversed()) {
    let turn = timeline.turns.get(turnNumber);
    if (turn !== void 0)
      for (let step of turn.steps.toReversed()) {
        let assistant = step.data.get("assistant-step");
        if (assistant?.status === "running") return assistant;
      }
  }
  return null;
}
function decodeEscape(character) {
  switch (character) {
    case '"':
      return '"';
    case "\\":
      return "\\";
    case "/":
      return "/";
    case "b":
      return "\b";
    case "f":
      return "\f";
    case "n":
      return `
`;
    case "r":
      return "\r";
    case "t":
      return "	";
    default:
      return;
  }
}
function jsonStringPrefix(raw, key) {
  let match = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}"\\s*:\\s*"`, "u").exec(raw);
  if (match === null) return;
  let value = "";
  for (let index = match.index + match[0].length; index < raw.length; index += 1) {
    let character = raw[index] ?? "";
    if (character === '"') return { value, complete: !0 };
    if (character !== "\\") {
      value += character;
      continue;
    }
    let escape = raw[index + 1];
    if (escape === void 0) return { value, complete: !1 };
    if (escape === "u") {
      let hex = raw.slice(index + 2, index + 6);
      if (!/^[\da-f]{4}$/iu.test(hex)) return { value, complete: !1 };
      value += String.fromCharCode(Number.parseInt(hex, 16)), index += 5;
      continue;
    }
    let decoded = decodeEscape(escape);
    if (decoded === void 0) return { value, complete: !1 };
    value += decoded, index += 1;
  }
  return { value, complete: !1 };
}
function completedString(raw, key) {
  let value = jsonStringPrefix(raw, key);
  return value?.complete === !0 ? value.value : void 0;
}
function parsedArgs(raw) {
  try {
    let value = JSON.parse(raw);
    return typeof value == "object" && value !== null && !Array.isArray(value) ? value : void 0;
  } catch {
    return;
  }
}
function mutationFromArgs(name2, callId, argsRaw, stage) {
  let complete = parsedArgs(argsRaw);
  if (name2 === "write")
    return {
      callId,
      name: name2,
      argsRaw,
      stage,
      path: jsonStringPrefix(argsRaw, "file_path")?.value,
      operation: "replace-file",
      oldText: void 0,
      newText: jsonStringPrefix(argsRaw, "content")?.value,
      replaceAll: !1
    };
  if (name2 === "edit")
    return {
      callId,
      name: name2,
      argsRaw,
      stage,
      path: jsonStringPrefix(argsRaw, "file_path")?.value,
      operation: "replace-text",
      oldText: completedString(argsRaw, "old_string"),
      newText: jsonStringPrefix(argsRaw, "new_string")?.value,
      replaceAll: complete?.replace_all === !0
    };
  if (name2 !== "str_replace_editor") return;
  let command = completedString(argsRaw, "command");
  if (command === "view") return;
  let path = jsonStringPrefix(argsRaw, "path")?.value;
  return command === "create" ? {
    callId,
    name: name2,
    argsRaw,
    stage,
    path,
    operation: "replace-file",
    oldText: void 0,
    newText: jsonStringPrefix(argsRaw, "file_text")?.value,
    replaceAll: !1
  } : command === "str_replace" ? {
    callId,
    name: name2,
    argsRaw,
    stage,
    path,
    operation: "replace-text",
    oldText: completedString(argsRaw, "old_str"),
    newText: jsonStringPrefix(argsRaw, "new_str")?.value ?? (complete !== void 0 ? "" : void 0),
    replaceAll: complete?.replace_all === !0
  } : command === "insert" ? {
    callId,
    name: name2,
    argsRaw,
    stage,
    path,
    operation: "insert-text",
    oldText: void 0,
    newText: jsonStringPrefix(argsRaw, "new_str")?.value,
    replaceAll: !1
  } : { callId, name: name2, argsRaw, stage, path, operation: void 0, oldText: void 0, newText: void 0, replaceAll: !1 };
}
function visitRunning(blocks, visit2) {
  for (let block of blocks)
    "kind" in block || visit2(block), visitRunning(block.subCalls, visit2);
}
function undispatchedCalls(chat) {
  let turnNumber = chat.timeline.turnOrder.at(-1), turn = turnNumber === void 0 ? void 0 : chat.timeline.turns.get(turnNumber);
  if (turn === void 0 || turn.status === "closed") return [];
  let calls = [];
  for (let step of turn.steps) {
    let assistant = step.data.get("assistant-step");
    if (assistant?.status === "settled")
      for (let block of assistant.blocks)
        block.kind === "tool-call" && calls.push({ callId: block.callId, name: block.name, argsRaw: block.argsRaw });
  }
  if (calls.length === 0) return calls;
  let settled = /* @__PURE__ */ new Set();
  for (let node of chat.legacy.nodes) {
    let value = node;
    value.kind === "tool-result" && typeof value.callId == "string" && settled.add(value.callId);
  }
  return calls.filter((call) => !settled.has(call.callId));
}
function sameUndispatchedCalls(left, right) {
  return left.length === right.length && left.every((call, index) => call.callId === right[index]?.callId && call.argsRaw === right[index].argsRaw);
}
function fileMutations(runningCalls, partial = null, undispatched = []) {
  let values = [];
  visitRunning(runningCalls, (call) => {
    if (call.phase !== "start") return;
    let mutation = mutationFromArgs(call.name, call.callId, call.argsRaw, "running");
    mutation !== void 0 && values.push(mutation);
  });
  for (let call of undispatched) {
    if (values.some((candidate) => candidate.callId === call.callId)) continue;
    let mutation = mutationFromArgs(call.name, call.callId, call.argsRaw, "running");
    mutation !== void 0 && values.push(mutation);
  }
  for (let block of partial?.blocks ?? []) {
    if (block.kind !== "tool-call") continue;
    let value = mutationFromArgs(block.name, block.callId, block.argsRaw, "streaming");
    value !== void 0 && !values.some((candidate) => candidate.callId === value.callId) && values.push(value);
  }
  return values;
}
function mutatingCallIds(runningCalls) {
  let ids = /* @__PURE__ */ new Set();
  return visitRunning(runningCalls, (call) => {
    MUTATING_CALLS.has(call.name) && ids.add(call.callId);
  }), ids;
}
function settledMutationSignals(block) {
  let nested = block.subCalls.flatMap(settledMutationSignals);
  if (!("kind" in block) || block.isError || block.call === null) return nested;
  let mutation = mutationFromArgs(block.call.name, block.callId, block.call.argsRaw, "running");
  return mutation?.path === void 0 ? nested : [`${block.callId}\0${mutation.path}`, ...nested];
}
function latestSettledWrite(chat) {
  for (let key of chat.order.toReversed()) {
    let node = chat.nodes.get(key);
    if (node?.kind !== "tool-call") continue;
    let root = node.data.root, signal = root === void 0 ? void 0 : settledMutationSignals(root).at(-1);
    if (signal === void 0) continue;
    let location = node.location;
    return { signal, turn: location.kind === "turn" || location.kind === "step" ? location.turn.turn : void 0 };
  }
}
function latestSettledMutation(chat) {
  return latestSettledWrite(chat)?.signal;
}
function latestSettledMutationTurn(chat) {
  return latestSettledWrite(chat)?.turn;
}
function openTurn(chat) {
  let turnNumber = chat.timeline.turnOrder.at(-1);
  if (turnNumber !== void 0)
    return chat.timeline.turns.get(turnNumber)?.status === "open" ? turnNumber : void 0;
}
function creativeRelativePath(path, cwd) {
  if (path === void 0 || path === "") return;
  let normalized = path.replaceAll("\\", "/"), root = cwd?.replaceAll("\\", "/").replace(/\/$/u, ""), insideRoot = root !== void 0 && normalized.startsWith(`${root}/`);
  if ((normalized.startsWith("/") || /^[a-z]:\//iu.test(normalized) || normalized.startsWith("file:")) && !insideRoot) return;
  let relative = insideRoot ? normalized.slice(root.length + 1) : normalized.replace(/^\.\//u, ""), [directory2] = relative.split("/", 1);
  if (!(!(directory2 !== void 0 && (STORY_DIRECTORIES.has(directory2) || DRAMA_DIRECTORIES.has(directory2) || directory2 === GAME_DIRECTORY || directory2 === VIDEO_DIRECTORY)) && relative !== "short-drama.json" || !EDITABLE_EXTENSION.test(relative)) && !relative.split("/").some((part) => part === ".." || part === "." || part === ""))
    return relative;
}
function workbenchModeForPath(path) {
  if (path === "short-drama.json") return "drama";
  let directory2 = path?.split("/", 1)[0];
  if (directory2 !== void 0 && STORY_DIRECTORIES.has(directory2)) return "story";
  if (directory2 !== void 0 && DRAMA_DIRECTORIES.has(directory2)) return "drama";
  if (directory2 === GAME_DIRECTORY) return "game";
  if (directory2 === VIDEO_DIRECTORY) return "video";
}
function preferredWorkbenchFile(files, mode) {
  let matching = files.filter((file) => workbenchModeForPath(file.path) === mode), preferences = mode === "story" ? [/^正文\/.*\.md$/u, /^大纲\/.*\.md$/u, /\.md$/u] : mode === "drama" ? [
    /^剧集\/EP0*1\/剧本\.md$/u,
    /^剧集\/.*\/剧本\.md$/u,
    /^剧集\/EP0*1\/screenplay\.md$/iu,
    /^剧集\/.*\/screenplay\.md$/iu,
    /^项目开发\/creative-brief\.md$/u,
    /^输入\/.*\.md$/u,
    /\.md$/u,
    /^short-drama\.json$/u
  ] : mode === "game" ? [
    /^game-adaptations\/[^/]+\/PRODUCT_BRIEF\.md$/u,
    /^game-adaptations\/[^/]+\/design\/GAME_DESIGN\.md$/u,
    /^game-adaptations\/[^/]+\/qa\/verification\.json$/u,
    /^game-adaptations\/[^/]+\/build\/app\/index\.html$/u,
    /\.md$/u
  ] : [
    /^video-recaps\/[^/]+\/work\/recap_story_plan\.json$/u,
    /^video-recaps\/[^/]+\/work\/narration\.json$/u,
    /^video-recaps\/[^/]+\/work\/assembly_manifest\.json$/u
  ];
  for (let pattern of preferences) {
    let match = matching.find((file) => pattern.test(file.path));
    if (match !== void 0) return match.path;
  }
  return matching[0]?.path;
}
function previewMutation(activity, base) {
  if (activity.operation === "replace-file") return activity.newText;
  if (activity.operation === "replace-text") {
    if (activity.oldText === void 0 || activity.newText === void 0 || activity.oldText === "") return;
    if (activity.replaceAll) return base.includes(activity.oldText) ? base.split(activity.oldText).join(activity.newText) : void 0;
    let at = base.indexOf(activity.oldText);
    return at < 0 ? void 0 : `${base.slice(0, at)}${activity.newText}${base.slice(at + activity.oldText.length)}`;
  }
  if (activity.operation === "insert-text") {
    if (activity.newText === void 0) return;
    let rawLine = /"insert_line"\s*:\s*(\d+)/u.exec(activity.argsRaw)?.[1];
    if (rawLine === void 0) return;
    let line = Number.parseInt(rawLine, 10), parts = base.split(`
`), at = Math.max(0, Math.min(parts.length, line));
    return parts.splice(at, 0, activity.newText), parts.join(`
`);
  }
}

// src/client/file-tree.ts
function directory(name2, path) {
  return { name: name2, path, directories: /* @__PURE__ */ new Map(), files: [] };
}
function compareNames(left, right) {
  return left.name.localeCompare(right.name, "zh-Hans-CN", { numeric: !0 });
}
function freezeDirectory(value) {
  let directories = [...value.directories.values()].map(freezeDirectory).sort(compareNames), files = [...value.files].sort(compareNames);
  return {
    kind: "directory",
    name: value.name,
    path: value.path,
    fileCount: files.length + directories.reduce((sum, child) => sum + child.fileCount, 0),
    children: [...directories, ...files]
  };
}
function buildFileTree(files, group) {
  let root = directory(group, group);
  for (let file of files) {
    let segments = (file.path.startsWith(`${group}/`) ? file.path.slice(group.length + 1) : file.path).split("/").filter((segment) => segment !== ""), name2 = segments.pop();
    if (name2 === void 0) continue;
    let parent = root;
    for (let segment of segments) {
      let path = `${parent.path}/${segment}`, child = parent.directories.get(segment) ?? directory(segment, path);
      parent.directories.set(segment, child), parent = child;
    }
    parent.files.push({ kind: "file", name: name2, path: file.path, bytes: file.bytes });
  }
  return freezeDirectory(root).children;
}

// src/client/jsonl-preview.tsx
var import_jsx_runtime = require("react/jsx-runtime"), TITLE_KEYS = [
  "display_name",
  "title",
  "name",
  "shot_id",
  "scene_id",
  "episode_id",
  "character_id",
  "location_id",
  "view_id",
  "prop_id",
  "state_id",
  "decision_id",
  "occurrence_id",
  "record_id",
  "id"
];
function objectRecord(value) {
  return typeof value == "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function stringField(record2, keys) {
  for (let key of keys) {
    let value = record2[key];
    if (typeof value == "string" && value.trim() !== "") return value;
  }
}
function metadata(value, line) {
  let record2 = objectRecord(value);
  if (record2 === void 0) return { title: typeof value == "string" ? value : JSON.stringify(value) ?? `\u7B2C ${String(line)} \u884C` };
  let type = stringField(record2, ["record_type", "type", "kind"]), acceptance = objectRecord(record2.creator_acceptance), status = stringField(record2, ["status"]) ?? (acceptance === void 0 ? void 0 : stringField(acceptance, ["status"]));
  return {
    title: stringField(record2, TITLE_KEYS) ?? `\u8BB0\u5F55 ${String(line)}`,
    ...type === void 0 ? {} : { type },
    ...status === void 0 ? {} : { status }
  };
}
function parseJsonl(content) {
  let records = [], lines = content.replaceAll(`\r
`, `
`).split(`
`);
  for (let [index, raw] of lines.entries())
    if (raw.trim() !== "")
      try {
        let value = JSON.parse(raw);
        records.push({ line: index + 1, raw, value, ...metadata(value, index + 1) });
      } catch (error) {
        records.push({
          line: index + 1,
          raw,
          title: `\u7B2C ${String(index + 1)} \u884C\u683C\u5F0F\u9519\u8BEF`,
          error: error instanceof Error ? error.message : String(error)
        });
      }
  return records;
}
var PREVIEW_LIMIT = 200;
function JsonlPreview({ content, label }) {
  let records = parseJsonl(content);
  if (records.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "oh-story-markdown-empty", children: "\u8FD9\u4E2A JSONL \u6587\u4EF6\u8FD8\u662F\u7A7A\u7684\u3002" });
  let valid = records.filter((record2) => record2.error === void 0).length, errors = records.length - valid, visible = records.slice(0, PREVIEW_LIMIT);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "oh-story-jsonl", "aria-label": `${label} \u7ED3\u6784\u5316\u9884\u89C8`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "oh-story-jsonl-summary", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: errors === 0 ? `${String(valid)} \u6761\u8BB0\u5F55` : `${String(valid)} \u6761\u6709\u6548\u8BB0\u5F55` }),
      errors > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        String(errors),
        " \u6761\u683C\u5F0F\u9519\u8BEF"
      ] }),
      records.length > PREVIEW_LIMIT && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        "\u4EC5\u663E\u793A\u524D ",
        String(PREVIEW_LIMIT),
        " \u6761"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "oh-story-jsonl-records", children: visible.map((record2) => record2.error === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { open: records.length <= 2, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          "\u7B2C ",
          String(record2.line),
          " \u884C"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: record2.title }),
        record2.type !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: record2.type }),
        record2.status !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: record2.status })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: JSON.stringify(record2.value, null, 2) }) })
    ] }, record2.line) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "oh-story-jsonl-error", role: "alert", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: record2.title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: record2.error }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: record2.raw })
    ] }, record2.line)) })
  ] });
}

// src/client/markdown-preview.tsx
var import_jsx_runtime2 = require("react/jsx-runtime"), INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|~~[^~\n]+~~|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)|\*[^*\n]+\*)/gu;
function inline(source, key) {
  let nodes = [], cursor = 0;
  for (let match of source.matchAll(INLINE)) {
    let token = match[0], index = match.index;
    if (index > cursor && nodes.push(source.slice(cursor, index)), token.startsWith("`")) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { children: token.slice(1, -1) }, `${key}-${String(index)}`));
    else if (token.startsWith("**")) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: token.slice(2, -2) }, `${key}-${String(index)}`));
    else if (token.startsWith("~~")) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("del", { children: token.slice(2, -2) }, `${key}-${String(index)}`));
    else if (token.startsWith("*")) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("em", { children: token.slice(1, -1) }, `${key}-${String(index)}`));
    else {
      let link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/u.exec(token);
      nodes.push(link === null ? token : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { href: link[2], target: "_blank", rel: "noreferrer", children: link[1] }, `${key}-${String(index)}`));
    }
    cursor = index + token.length;
  }
  return cursor < source.length && nodes.push(source.slice(cursor)), nodes;
}
function splitTableRow(line) {
  let source = line.trim();
  source.startsWith("|") && (source = source.slice(1)), source.endsWith("|") && (source = source.slice(0, -1));
  let cells = [], cell = "";
  for (let index = 0; index < source.length; index += 1) {
    let character = source[index] ?? "";
    character === "\\" && source[index + 1] === "|" ? (cell += "|", index += 1) : character === "|" ? (cells.push(cell.trim()), cell = "") : cell += character;
  }
  return cells.push(cell.trim()), cells;
}
function tableAlignments(line) {
  let cells = splitTableRow(line);
  if (!(cells.length === 0 || !cells.every((cell) => /^:?-{3,}:?$/u.test(cell))))
    return cells.map((cell) => {
      if (cell.startsWith(":") && cell.endsWith(":")) return "center";
      if (cell.endsWith(":")) return "right";
      if (cell.startsWith(":")) return "left";
    });
}
function beginsBlock(lines, index) {
  let line = lines[index] ?? "";
  return /^(`{3,}|~{3,})\s*[\w-]*\s*$/u.test(line) || /^#{1,6}\s+/u.test(line) || /^(?:-{3,}|\*{3,}|_{3,})\s*$/u.test(line) || /^>\s?/u.test(line) || /^[-*+]\s+/u.test(line) || /^\d+[.)]\s+/u.test(line) || line.includes("|") && tableAlignments(lines[index + 1] ?? "") !== void 0;
}
function parseMarkdownBlocks(markdown) {
  let lines = markdown.replaceAll(`\r
`, `
`).split(`
`), result = [];
  for (let index = 0; index < lines.length; ) {
    let line = lines[index] ?? "";
    if (line.trim() === "") {
      index += 1;
      continue;
    }
    let fence = /^(`{3,}|~{3,})\s*([\w-]*)\s*$/u.exec(line);
    if (fence !== null) {
      let marker = fence[1] ?? "```", markerCharacter = marker[0] ?? "`", closing = new RegExp(`^${markerCharacter}{${String(marker.length)},}\\s*$`, "u"), code = [];
      for (index += 1; index < lines.length && !closing.test(lines[index] ?? ""); )
        code.push(lines[index] ?? ""), index += 1;
      index < lines.length && (index += 1), result.push({ kind: "code", lines: code, ...fence[2] === void 0 || fence[2] === "" ? {} : { language: fence[2] } });
      continue;
    }
    let heading = /^(#{1,6})\s+(.+)$/u.exec(line);
    if (heading !== null) {
      result.push({ kind: "heading", text: heading[2] ?? "", level: heading[1]?.length ?? 1 }), index += 1;
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})\s*$/u.test(line)) {
      result.push({ kind: "rule" }), index += 1;
      continue;
    }
    let alignments = line.includes("|") ? tableAlignments(lines[index + 1] ?? "") : void 0;
    if (alignments !== void 0) {
      let headers = splitTableRow(line), rows = [];
      for (index += 2; index < lines.length && (lines[index] ?? "").includes("|") && (lines[index] ?? "").trim() !== ""; )
        rows.push(splitTableRow(lines[index] ?? "")), index += 1;
      result.push({ kind: "table", headers, rows, alignments });
      continue;
    }
    if (/^>\s?/u.test(line)) {
      let quote = [];
      for (; index < lines.length && /^>\s?/u.test(lines[index] ?? ""); )
        quote.push((lines[index] ?? "").replace(/^>\s?/u, "")), index += 1;
      result.push({ kind: "quote", lines: quote });
      continue;
    }
    let unordered = /^[-*+]\s+(.+)$/u.exec(line), ordered = /^(\d+)[.)]\s+(.+)$/u.exec(line);
    if (unordered !== null || ordered !== null) {
      let kind = unordered !== null ? "ul" : "ol", items = [], pattern = kind === "ul" ? /^[-*+]\s+(.+)$/u : /^\d+[.)]\s+(.+)$/u, start = ordered === null ? void 0 : Number(ordered[1]);
      for (; index < lines.length; ) {
        let item = pattern.exec(lines[index] ?? "");
        if (item === null) break;
        let source = item[1] ?? "", task = /^\[([ xX])\]\s+(.+)$/u.exec(source);
        items.push(task === null ? { text: source } : { text: task[2] ?? "", checked: task[1]?.toLocaleLowerCase() === "x" }), index += 1;
      }
      result.push({ kind, items, ...start === void 0 ? {} : { start } });
      continue;
    }
    let paragraph = [line];
    for (index += 1; index < lines.length; ) {
      let next = lines[index] ?? "";
      if (next.trim() === "" || beginsBlock(lines, index)) break;
      paragraph.push(next), index += 1;
    }
    result.push({ kind: "paragraph", lines: paragraph });
  }
  return result;
}
function Heading({ block, blockKey }) {
  let children = inline(block.text, blockKey);
  switch (block.level) {
    case 1:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { children });
    case 2:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { children });
    case 3:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children });
    case 4:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children });
    case 5:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h5", { children });
    default:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h6", { children });
  }
}
function MarkdownPreview({ content, label }) {
  let parsed = parseMarkdownBlocks(content);
  return parsed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "oh-story-markdown-empty", children: "\u8FD9\u4E2A Markdown \u6587\u4EF6\u8FD8\u662F\u7A7A\u7684\u3002" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("article", { className: "oh-story-markdown", "aria-label": `${label} \u6E32\u67D3\u9884\u89C8`, children: parsed.map((block, index) => {
    let key = `block-${String(index)}`;
    if (block.kind === "code") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { "data-language": block.language, children: block.lines.join(`
`) }) }, key);
    if (block.kind === "rule") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("hr", {}, key);
    if (block.kind === "quote") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("blockquote", { children: block.lines.map((line, lineIndex) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: inline(line, `${key}-${String(lineIndex)}`) }, `${key}-${String(lineIndex)}`)) }, key);
    if (block.kind === "ul" || block.kind === "ol") {
      let items = block.items.map((item, itemIndex) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { className: item.checked === void 0 ? void 0 : "oh-story-task-item", children: [
        item.checked === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("input", { type: "checkbox", checked: item.checked, readOnly: !0, disabled: !0, "aria-label": item.checked ? "\u5DF2\u5B8C\u6210" : "\u672A\u5B8C\u6210" }),
        inline(item.text, `${key}-${String(itemIndex)}`)
      ] }, `${key}-${String(itemIndex)}`));
      return block.kind === "ul" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { children: items }, key) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ol", { start: block.start, children: items }, key);
    }
    return block.kind === "table" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "oh-story-markdown-table", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("table", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tr", { children: block.headers.map((cell, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { style: { textAlign: block.alignments[cellIndex] }, children: inline(cell, `${key}-h-${String(cellIndex)}`) }, `${key}-h-${String(cellIndex)}`)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tbody", { children: block.rows.map((row, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tr", { children: block.headers.map((_, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { style: { textAlign: block.alignments[cellIndex] }, children: inline(row[cellIndex] ?? "", `${key}-r-${String(rowIndex)}-${String(cellIndex)}`) }, `${key}-r-${String(rowIndex)}-${String(cellIndex)}`)) }, `${key}-r-${String(rowIndex)}`)) })
    ] }) }, key) : block.kind === "heading" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Heading, { block, blockKey: key }, key) : block.kind === "paragraph" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: block.lines.map((line, lineIndex) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
      lineIndex === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("br", {}),
      inline(line, `${key}-${String(lineIndex)}`)
    ] }, `${key}-${String(lineIndex)}`)) }, key) : null;
  }) });
}

// src/client/drama-production.ts
var PRODUCTION_PROTOCOL_VERSION = "short-drama/v1", CREATOR_DOCUMENT_NAMES = /* @__PURE__ */ new Set(["\u5267\u672C.md", "\u89C6\u89C9\u8BBE\u5B9A.md", "\u5206\u955C.md", "\u56FE\u7247\u63D0\u793A\u8BCD.md", "\u89C6\u9891\u63D0\u793A\u8BCD.md"]);
function episodeDirectoryForPath(path) {
  return path === void 0 ? void 0 : /^(剧集\/[^/]+)\/[^/]+$/u.exec(path)?.[1];
}
function isCreatorDocumentPath(path) {
  let directory2 = episodeDirectoryForPath(path), name2 = path.split("/").at(-1);
  return directory2 !== void 0 && name2 !== void 0 && CREATOR_DOCUMENT_NAMES.has(name2);
}
function creatorDocumentPaths(files, episodeDirectory) {
  return files.map((file) => file.path).filter((path) => path.startsWith(`${episodeDirectory}/`) && CREATOR_DOCUMENT_NAMES.has(path.slice(episodeDirectory.length + 1))).sort((left, right) => creatorDocumentOrder(left) - creatorDocumentOrder(right) || left.localeCompare(right, "zh-Hans-CN"));
}
function parseEpisodeProduction(documents, episodeDirectory) {
  let storyboardPath = `${episodeDirectory}/\u5206\u955C.md`, imagePromptPath = `${episodeDirectory}/\u56FE\u7247\u63D0\u793A\u8BCD.md`, videoPromptPath = `${episodeDirectory}/\u89C6\u9891\u63D0\u793A\u8BCD.md`, visualPath = `${episodeDirectory}/\u89C6\u89C9\u8BBE\u5B9A.md`, shots = parseStoryboard(storyboardPath, documents[storyboardPath] ?? ""), assets = parseImagePrompts(imagePromptPath, documents[imagePromptPath] ?? ""), motions = parseVideoPrompts(videoPromptPath, documents[videoPromptPath] ?? ""), visualAssets = parseVisualAssets(visualPath, documents[visualPath] ?? ""), motionByShot = new Map(motions.flatMap((motion) => motion.shotId === void 0 ? [] : [[motion.shotId, motion]])), linkedShots = shots.map((shot) => ({ ...shot, motion: motionByShot.get(shot.id) })), targets = /* @__PURE__ */ new Map();
  for (let item of [...linkedShots, ...assets, ...motions, ...visualAssets])
    targets.set(item.id, { path: item.path, offset: item.offset, id: item.id });
  let screenplayPath = `${episodeDirectory}/\u5267\u672C.md`;
  for (let shot of linkedShots)
    for (let id of sourceKeys(shot)) {
      let target = sectionTarget(screenplayPath, documents[screenplayPath] ?? "", id);
      target !== void 0 && targets.set(id, target);
    }
  let diagnostics = validateProductionProtocol({
    documents,
    episodeDirectory,
    shots: linkedShots,
    assets,
    visualAssets,
    motions
  });
  return {
    protocolVersion: PRODUCTION_PROTOCOL_VERSION,
    episodeDirectory,
    shots: linkedShots,
    assets,
    visualAssets,
    motions,
    targets,
    documentPaths: Object.keys(documents).filter((path) => path.startsWith(`${episodeDirectory}/`)),
    diagnostics
  };
}
function parseStoryboard(path, content) {
  return levelTwoSections(content).flatMap((section) => {
    let match = /^(SHOT-[A-Z0-9-]+)\s*(?:[·｜|]\s*)?(.*)$/iu.exec(section.heading.trim());
    if (match === null || match[1] === void 0) return [];
    let fields = bulletFields(section.body), id = match[1].toLocaleUpperCase(), source = firstField(fields, "\u6765\u6E90", "\u573A\u6B21");
    return [{
      id,
      title: match[2]?.trim() || id,
      path,
      offset: section.offset,
      source,
      sceneIds: sourceSceneIds(source),
      durationSeconds: seconds(firstField(fields, "\u65F6\u957F")),
      purpose: firstField(fields, "\u76EE\u7684", "\u955C\u5934\u76EE\u7684"),
      shotSpec: firstField(fields, "\u666F\u522B/\u673A\u4F4D", "\u666F\u522B", "\u955C\u5934\u89C4\u683C"),
      start: firstField(fields, "\u8D77\u70B9", "\u8D77\u59CB"),
      end: firstField(fields, "\u7EC8\u70B9", "\u7ED3\u675F"),
      references: splitReferences(firstField(fields, "\u56FE\u7247\u63D0\u793A\u8BCD\u9879", "\u53C2\u8003", "\u5173\u8054\u8D44\u4EA7")),
      keyframePrompt: quoteUnderHeading(section.body, "\u51BB\u7ED3\u5173\u952E\u5E27\u63D0\u793A\u8BCD")
    }];
  });
}
function parseImagePrompts(path, content) {
  return levelTwoSections(content).flatMap((section) => {
    let match = /^(IMG-[A-Z0-9-]+)\s*(?:[·｜|]\s*)?(.*)$/iu.exec(section.heading.trim());
    if (match === null || match[1] === void 0) return [];
    let fields = bulletFields(section.body), id = match[1].toLocaleUpperCase(), title = match[2]?.trim() || id;
    return [{
      id,
      title,
      kind: inferAssetKind(`${id} ${title} ${firstField(fields, "\u7528\u9014") ?? ""}`),
      path,
      offset: section.offset,
      purpose: firstField(fields, "\u7528\u9014"),
      reference: firstField(fields, "\u53C2\u8003", "\u53C2\u8003\u7EA6\u675F"),
      prompt: quoteUnderHeading(section.body, "\u53EF\u590D\u5236\u63D0\u793A\u8BCD")
    }];
  });
}
function parseVideoPrompts(path, content) {
  return levelTwoSections(content).flatMap((section) => {
    let match = /^(MOTION-[A-Z0-9-]+)\s*(?:[·｜|]\s*)?(.*)$/iu.exec(section.heading.trim());
    if (match === null || match[1] === void 0) return [];
    let fields = bulletFields(section.body), id = match[1].toLocaleUpperCase(), shotId = firstField(fields, "\u5206\u955C", "\u955C\u5934")?.match(/SHOT-[A-Z0-9-]+/iu)?.[0]?.toLocaleUpperCase();
    return [{
      id,
      title: match[2]?.trim() || id,
      path,
      offset: section.offset,
      shotId,
      durationSeconds: seconds(firstField(fields, "\u65F6\u957F")),
      startFrame: firstField(fields, "\u8D77\u59CB\u5E27", "\u8D77\u70B9"),
      end: firstField(fields, "\u7EC8\u70B9", "\u7ED3\u675F"),
      prompt: quoteUnderHeading(section.body, "\u53EF\u590D\u5236\u63D0\u793A\u8BCD")
    }];
  });
}
function parseVisualAssets(path, content) {
  return levelTwoSections(content).flatMap((section) => {
    let match = /^(人物|角色|造型|地点|场景|道具|状态)\s*(?:[·｜|:]\s*)?(.*)$/u.exec(section.heading.trim());
    if (match === null || match[1] === void 0) return [];
    let fields = bulletFields(section.body), title = match[2]?.trim() || section.heading.trim(), declaredId = firstField(fields, "ID", "\u8D44\u4EA7 ID", "\u8D44\u4EA7ID")?.trim().toLocaleUpperCase(), stableId = declaredId !== void 0 && /^VISUAL-[A-Z0-9-]+$/u.test(declaredId);
    return [{ id: stableId ? declaredId : `VISUAL-${slug(`${match[1]}-${title}`)}`, title, kind: inferAssetKind(`${match[1]} ${title}`), path, offset: section.offset, description: section.body.trim(), stableId, declaredId }];
  });
}
function validateProductionProtocol(input) {
  let diagnostics = [], add = (value) => {
    diagnostics.push({ ...value, line: lineAt(input.documents[value.path] ?? "", value.offset) });
  }, all = [...input.shots, ...input.assets, ...input.visualAssets, ...input.motions], byId = /* @__PURE__ */ new Map();
  for (let item of all) byId.set(item.id, [...byId.get(item.id) ?? [], item]);
  for (let [id, items] of byId)
    if (!(items.length < 2))
      for (let item of items) add({ severity: "error", code: "duplicate_id", path: item.path, offset: item.offset, targetId: id, message: `${id} \u5728\u5F53\u524D\u96C6\u5185\u91CD\u590D\uFF0C\u540E\u51FA\u73B0\u7684\u6761\u76EE\u4F1A\u906E\u853D\u524D\u4E00\u6761\u3002` });
  for (let visual of input.visualAssets)
    visual.stableId || add(visual.declaredId === void 0 ? { severity: "warning", code: "generated_visual_id", path: visual.path, offset: visual.offset, targetId: visual.id, message: `${visual.title} \u7F3A\u5C11\u7A33\u5B9A\u7684 \u201C- ID\uFF1AVISUAL-*\u201D\uFF1B\u4FEE\u6539\u6807\u9898\u4F1A\u6539\u53D8\u753B\u5E03\u8282\u70B9\u8EAB\u4EFD\u3002` } : { severity: "warning", code: "invalid_visual_id", path: visual.path, offset: visual.offset, targetId: visual.id, message: `${visual.title} \u7684 \u201C- ID\uFF1A${visual.declaredId}\u201D \u4E0D\u662F\u53EF\u7528\u5F62\u5F0F\uFF0C\u5DF2\u56DE\u9000\u5230\u6807\u9898\u6D3E\u751F ID\uFF1B\u8BF7\u5199\u6210 VISUAL- \u52A0\u5927\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u6216\u8FDE\u5B57\u7B26\u3002` });
  let knownReferences = new Set([...input.assets, ...input.visualAssets, ...input.shots, ...input.motions].map((item) => item.id)), screenplayPath = `${input.episodeDirectory}/\u5267\u672C.md`;
  for (let shot of input.shots) {
    for (let reference of shot.references)
      knownReferences.has(reference) || add({ severity: "warning", code: "unknown_reference", path: shot.path, offset: shot.offset, targetId: shot.id, message: `${shot.id} \u5F15\u7528\u4E86\u672A\u89E3\u6790\u7684 ${reference}\u3002` });
    for (let id of sourceKeys(shot))
      sectionTarget(screenplayPath, input.documents[screenplayPath] ?? "", id) === void 0 && add({ severity: "warning", code: "unknown_source", path: shot.path, offset: shot.offset, targetId: shot.id, message: `${shot.id} \u7684\u6765\u6E90 ${id} \u5728\u5267\u672C\u4E2D\u4E0D\u5B58\u5728\u3002` });
  }
  let shots = new Set(input.shots.map((shot) => shot.id)), motionsByShot = /* @__PURE__ */ new Map();
  for (let motion of input.motions) {
    if (motion.shotId === void 0) {
      add({ severity: "warning", code: "motion_without_shot", path: motion.path, offset: motion.offset, targetId: motion.id, message: `${motion.id} \u6CA1\u6709\u53EF\u89E3\u6790\u7684 SHOT-* \u5206\u955C\u5B57\u6BB5\u3002` });
      continue;
    }
    shots.has(motion.shotId) || add({ severity: "error", code: "unknown_motion_shot", path: motion.path, offset: motion.offset, targetId: motion.id, message: `${motion.id} \u6307\u5411\u4E0D\u5B58\u5728\u7684 ${motion.shotId}\u3002` }), motionsByShot.set(motion.shotId, [...motionsByShot.get(motion.shotId) ?? [], motion]);
  }
  for (let [shotId, motions] of motionsByShot)
    if (!(motions.length < 2))
      for (let motion of motions) add({ severity: "error", code: "multiple_motions", path: motion.path, offset: motion.offset, targetId: motion.id, message: `${shotId} \u540C\u65F6\u7ED1\u5B9A\u4E86\u591A\u4E2A MOTION\uFF0C\u753B\u5E03\u53EA\u80FD\u786E\u5B9A\u4E00\u4E2A\u3002` });
  let parsedOffsets = new Set([...input.shots, ...input.assets, ...input.motions].map((item) => `${item.path}:${String(item.offset)}`));
  for (let [path, prefix] of [
    [`${input.episodeDirectory}/\u5206\u955C.md`, "SHOT"],
    [`${input.episodeDirectory}/\u56FE\u7247\u63D0\u793A\u8BCD.md`, "IMG"],
    [`${input.episodeDirectory}/\u89C6\u9891\u63D0\u793A\u8BCD.md`, "MOTION"]
  ])
    for (let section of levelTwoSections(input.documents[path] ?? ""))
      section.heading.toLocaleUpperCase().startsWith(prefix) && !parsedOffsets.has(`${path}:${String(section.offset)}`) && add({ severity: "error", code: "malformed_heading", path, offset: section.offset, message: `\u65E0\u6CD5\u89E3\u6790\u6807\u9898 \u201C${section.heading.trim()}\u201D\uFF0C\u9700\u8981\u7A33\u5B9A\u7684 ${prefix}-* ID\u3002` });
  return diagnostics.sort((left, right) => left.path.localeCompare(right.path, "zh-Hans-CN") || left.offset - right.offset || left.code.localeCompare(right.code));
}
function productionCompleteness(shot) {
  let keyframe = !!shot.keyframePrompt?.trim(), motion = !!shot.motion?.prompt?.trim(), references = shot.references.length > 0;
  return { keyframe, motion, references, complete: keyframe && motion };
}
function levelTwoSections(content) {
  let matches = [...content.matchAll(/^##\s+(.+)\s*$/gmu)];
  return matches.map((match, index) => {
    let start = (match.index ?? 0) + match[0].length, end = matches[index + 1]?.index ?? content.length;
    return { heading: match[1] ?? "", body: content.slice(start, end), offset: match.index ?? 0 };
  });
}
function bulletFields(body) {
  let fields = /* @__PURE__ */ new Map();
  for (let match of body.matchAll(/^\s*[-*]\s+([^：:\n]+)[：:]\s*(.+?)\s*$/gmu)) {
    let key = match[1]?.trim(), value = match[2]?.trim();
    key !== void 0 && value !== void 0 && fields.set(key, value);
  }
  return fields;
}
function firstField(fields, ...names) {
  for (let name2 of names) {
    let value = fields.get(name2);
    if (value !== void 0 && value !== "") return value;
  }
}
function quoteUnderHeading(body, heading) {
  let escaped = heading.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), match = new RegExp(`^###\\s+${escaped}\\s*$([\\s\\S]*?)(?=^###\\s+|(?![\\s\\S]))`, "imu").exec(body);
  if (match?.[1] === void 0) return;
  let value = match[1].split(/\r?\n/u).filter((line) => /^\s*>/u.test(line)).map((line) => line.replace(/^\s*>\s?/u, "").trimEnd()).join(`
`).trim();
  return value === "" ? void 0 : value;
}
function seconds(value) {
  if (value === void 0) return;
  let match = /([0-9]+(?:\.[0-9]+)?)\s*(?:s|秒)/iu.exec(value);
  if (match?.[1] === void 0) return;
  let parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
}
function splitReferences(value) {
  if (value === void 0) return [];
  let ids = value.match(/(?:IMG|SHOT|MOTION)-[A-Z0-9-]+/giu) ?? [];
  return [...new Set(ids.map((id) => id.toLocaleUpperCase()))];
}
function inferAssetKind(value) {
  return /(人物|角色|造型|character|portrait|sheet)/iu.test(value) ? "character" : /(地点|场景|环境|scene|location|corridor|room)/iu.test(value) ? "scene" : /(道具|物件|prop|object)/iu.test(value) ? "prop" : /(状态|state|look)/iu.test(value) ? "state" : "unknown";
}
function slug(value) {
  return value.trim().toLocaleUpperCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/gu, "") || "ITEM";
}
function lineAt(content, offset) {
  return content.slice(0, Math.max(0, offset)).split(/\r?\n/u).length;
}
function sourceSceneIds(source) {
  return source === void 0 ? [] : [...new Set([...source.matchAll(/(?:[A-Za-z0-9]+-)+SC[0-9]+/gu)].map((match) => match[0]))];
}
function sourceKeys(shot) {
  return shot.sceneIds.length > 0 ? shot.sceneIds : shot.source === void 0 ? [] : [shot.source];
}
function sectionTarget(path, content, id) {
  let offset = content.search(new RegExp(`^##\\s+${id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}(?:\\s|$)`, "imu"));
  return offset < 0 ? void 0 : { path, offset, id };
}
function creatorDocumentOrder(path) {
  let name2 = path.split("/").at(-1);
  return ["\u5267\u672C.md", "\u89C6\u89C9\u8BBE\u5B9A.md", "\u5206\u955C.md", "\u56FE\u7247\u63D0\u793A\u8BCD.md", "\u89C6\u9891\u63D0\u793A\u8BCD.md"].indexOf(name2 ?? "");
}

// src/client/drama-production-view.tsx
var import_react = require("react");

// src/client/workbench-ui.ts
function handleTabKey(event, values, current, select) {
  let index;
  if (event.key === "Home" ? index = 0 : event.key === "End" ? index = values.length - 1 : event.key === "ArrowRight" ? index = (values.indexOf(current) + 1) % values.length : event.key === "ArrowLeft" && (index = (values.indexOf(current) - 1 + values.length) % values.length), index === void 0) return;
  event.preventDefault();
  let value = values[index];
  value !== void 0 && (select(value), event.currentTarget.parentElement?.querySelectorAll("[role='tab']")[index]?.focus());
}
function endpoint(path, sessionId, file) {
  let url = new URL(`/oh-story/${path}`, globalThis.location.origin);
  return url.searchParams.set("sessionId", sessionId), file !== void 0 && url.searchParams.set("path", file), url.toString();
}

// src/client/production-prompts.ts
var authorityBoundary = "\u53EA\u4F7F\u7528\u5F53\u524D DSH Preset \u53EF\u89C1\u7684\u5DE5\u5177\uFF1B\u6240\u6709\u6587\u4EF6\u3001\u7F51\u7EDC\u3001\u751F\u6210\u548C\u547D\u4EE4\u64CD\u4F5C\u7EE7\u7EED\u9075\u5B88 DSH \u6743\u9650\u4E0E\u5BA1\u6279\u3002", referenceRules = "\u53C2\u8003\u56FE\u4EE5\u6765\u6E90\u6761\u76EE\u81EA\u5DF1\u7684\u58F0\u660E\u4E3A\u51C6\uFF08IMG-* \u7684\u300C\u53C2\u8003\u300D\uFF0CSHOT-*\uFF0FMOTION-* \u7684\u300C\u8F93\u5165\u53C2\u8003\u56FE\u300D\uFF09\uFF1Areference_bindings \u5FC5\u987B\u4E0E\u8BE5\u6761\u76EE\u9010\u69FD\u4E00\u81F4\uFF0C\u5DE5\u4F5C\u53F0\u5217\u51FA\u7684\u8865\u5145\u53C2\u8003\u53EA\u4F5C\u6838\u5BF9\uFF0C\u6761\u76EE\u91CC\u6CA1\u6709\u58F0\u660E\u7684\u4E0D\u8981\u76F4\u63A5\u52A0\u8FDB job\uFF0C\u786E\u9700\u4F7F\u7528\u65F6\u5148\u8BF7\u62E5\u6709\u8BE5\u6761\u76EE\u7684\u9636\u6BB5\u4FEE\u8BA2\u6587\u6863\u3002\u8D77\u59CB\u5E27\u4E0E\u7ED3\u675F\u5E27\u7684\u89D2\u8272\u53EA\u53D6\u81EA\u6765\u6E90\u6761\u76EE\u81EA\u5DF1\u300C\u8F93\u5165\u53C2\u8003\u56FE\u300D\u5404\u69FD\u4F4D\u8BB0\u5F55\u7684\u7528\u9014\uFF08\u8D77\u59CB\u5E27\uFF0F\u7ED3\u675F\u5E27\uFF09\uFF1ASHOT-* \u770B\u300A\u5206\u955C.md\u300B\uFF0CMOTION-* \u770B\u300A\u89C6\u9891\u63D0\u793A\u8BCD.md\u300B\uFF1B\u518D\u7531\u76EE\u6807\u6A21\u578B\u65B9\u8A00\u7FFB\u6210 adapter \u7684 role\uFF0C\u4E0D\u6309\u6587\u4EF6\u540D\u6216\u5DE5\u4F5C\u53F0\u6E05\u5355\u63A8\u65AD\u3002\u76EE\u6807\u65B9\u8A00\u7528 first_frame\uFF0Flast_frame \u4F4D\u7F6E\u627F\u63A5\u8FD9\u7EC4\u8F93\u5165\u65F6\uFF0C\u7ED3\u675F\u5E27\u53EA\u8FDB last_frame\uFF0C\u7EDD\u4E0D\u964D\u7EA7\u6210\u666E\u901A\u53C2\u8003\u56FE\uFF1B\u65B9\u8A00\u8981\u6C42\u6574\u7EC4\u8D70\u591A\u69FD\u53C2\u8003\u65F6\uFF08\u5982 MiniMax H3 \u7684 full-reference\uFF1A\u9996\u5C3E\u5E27\u8F93\u5165\u4E0E\u53C2\u8003\u8F93\u5165\u4E92\u65A5\uFF0C\u8D77\u59CB\u5E27\u3001\u7ED3\u675F\u5E27\u90FD\u968F\u6574\u7EC4\u4EE5 reference_image \u9001\u5165\uFF09\uFF0C\u6309\u65B9\u8A00\u7FFB\u8BD1\uFF0C\u5E76\u5728\u9884\u89C8\u91CC\u5199\u660E\u7ED3\u675F\u5E27\u5C06\u4F5C\u4E3A\u53C2\u8003\u56FE\u9001\u5165\uFF0C\u6216\u5148\u8BF7\u5206\u955C owner \u53D6\u820D\u3002", shotStartFrameNote = "\u5206\u955C.md \u7684 SHOT-* \u53EA\u4EA7\u51FA\u8D77\u59CB\u5E27\uFF1B\u8981\u4EA7\u51FA\u7ED3\u675F\u5E27\uFF0C\u5148\u7531\u56FE\u7247\u63D0\u793A\u8BCD\u9636\u6BB5\u5EFA\u7ACB\u72EC\u7ACB\u7684 IMG-* \u6761\u76EE\u518D\u6295\u4EA7\u3002";
function referenceParagraph(kind) {
  return kind === "image" ? `${referenceRules}${shotStartFrameNote}` : referenceRules;
}
function nativeProductionPrompt(production, job, references) {
  let referenceText = references.length === 0 ? "\u65E0" : references.map((item) => `${item.targetId}: ${item.path ?? item.url}`).join(`
`);
  return `/short-drama-produce

\u53EA\u51C6\u5907\u5F53\u524D\u5355\u9879\u751F\u4EA7\u4EFB\u52A1\uFF0C\u4E0D\u8FD0\u884C Provider\u3002
- \u4EFB\u52A1 ID\uFF1A${job.id}
- \u4EFB\u52A1\u7C7B\u578B\uFF1A${job.kind === "image" ? "\u56FE\u7247/\u5173\u952E\u5E27" : "\u955C\u5934\u89C6\u9891"}
- \u5EFA\u8BAE adapter \u5951\u7EA6\uFF1A${job.kind === "image" ? "gpt-image-2" : "seedance"}\uFF08\u5B9E\u9645\u914D\u7F6E\u4E0E\u6A21\u578B\u4EE5\u5F53\u524D DSH \u8FD0\u884C\u73AF\u5883\u4E3A\u51C6\uFF09
- \u6295\u4EA7\u5BF9\u8C61\uFF1A${job.targetId}
- \u521B\u4F5C\u6587\u6863\u76EE\u5F55\uFF1A${production.episodeDirectory}
- \u5DE5\u4F5C\u53F0\u5217\u51FA\u7684\u8865\u5145\u53C2\u8003\uFF08\u4E0D\u662F\u751F\u4EA7\u8F93\u5165\u5FEB\u7167\uFF09\uFF1A
${referenceText}
- \u8F93\u51FA\u76EE\u5F55\uFF1A${production.episodeDirectory}/\u5236\u4F5C\u6210\u679C/${job.targetId}
- \u8F93\u51FA\u6587\u4EF6\u540D\u5FC5\u987B\u540C\u65F6\u5305\u542B\u6295\u4EA7\u5BF9\u8C61 ID \u4E0E\u4EFB\u52A1 ID ${job.id}\uFF0C\u4EE5\u4FBF DSH \u5DE5\u4F5C\u53F0\u5173\u8054\u7248\u672C\u3002

\u5F85\u9884\u68C0\u63D0\u793A\u8BCD\uFF1A
${job.prompt}

${referenceParagraph(job.kind)}

\u6309 short-drama-produce \u7684\u786C\u95F8\u95E8\u5EFA\u7ACB\u4E34\u65F6 job \u5E76\u6267\u884C prepare\uFF0C\u5728 Chat \u4E2D\u5B8C\u6574\u5C55\u793A adapter\u3001\u6A21\u578B/profile\u3001\u6570\u91CF\u3001\u53C2\u6570\u3001references\u3001outputs \u4E0E overwrite\u3002\u6B64\u6309\u94AE\u53EA\u8868\u8FBE\u201C\u51C6\u5907\u9884\u89C8\u201D\uFF0C\u4E0D\u6784\u6210\u770B\u5230\u9884\u89C8\u540E\u7684\u751F\u4EA7\u786E\u8BA4\uFF1B\u4E0D\u5F97 confirm \u6216 run\u3002\u7528\u6237\u5728\u540E\u7EED\u6D88\u606F\u660E\u786E\u786E\u8BA4\u8FD9\u4EFD\u9884\u89C8\u540E\uFF0C\u624D\u53EF\u8C03\u7528 oh_story_production track_job \u767B\u8BB0\u540C\u4E00\u4E2A\u4EFB\u52A1 ID\uFF0C\u5E76\u8FD0\u884C Provider\u3002${authorityBoundary}`;
}
function nativeBatchPrompt(production, job, candidates) {
  return `/short-drama-produce

\u53EA\u51C6\u5907\u5F53\u524D\u6279\u91CF\u751F\u4EA7\u4EFB\u52A1\uFF0C\u4E0D\u8FD0\u884C Provider\u3002
- \u6279\u6B21\u4EFB\u52A1 ID\uFF1A${job.id}
- \u4EFB\u52A1\u7C7B\u578B\uFF1A${job.kind === "image" ? "\u6279\u91CF\u5173\u952E\u5E27" : "\u6279\u91CF\u955C\u5934\u89C6\u9891"}
- \u5EFA\u8BAE adapter \u5951\u7EA6\uFF1A${job.kind === "image" ? "gpt-image-2" : "seedance"}\uFF08\u5B9E\u9645\u914D\u7F6E\u4E0E\u6A21\u578B\u4EE5\u5F53\u524D DSH \u8FD0\u884C\u73AF\u5883\u4E3A\u51C6\uFF09
- \u521B\u4F5C\u6587\u6863\u76EE\u5F55\uFF1A${production.episodeDirectory}
- \u8F93\u51FA\u6839\u76EE\u5F55\uFF1A${production.episodeDirectory}/\u5236\u4F5C\u6210\u679C
- \u6BCF\u4E2A\u8F93\u51FA\u6587\u4EF6\u540D\u5FC5\u987B\u5305\u542B\u5BF9\u5E94\u955C\u5934 ID \u4E0E\u6279\u6B21\u4EFB\u52A1 ID ${job.id}\u3002

${candidates.map((item) => `## ${item.id}
${item.prompt}`).join(`

`)}

${referenceParagraph(job.kind)}

\u628A\u6570\u91CF\u3001\u9010\u9879\u8F93\u51FA\u548C\u6210\u672C\u8FB9\u754C\u5B8C\u6574\u5C55\u793A\u7ED9\u521B\u4F5C\u8005\u3002\u6B64\u6309\u94AE\u53EA\u8868\u8FBE\u201C\u51C6\u5907\u9884\u89C8\u201D\uFF0C\u4E0D\u6784\u6210\u770B\u5230\u9884\u89C8\u540E\u7684\u751F\u4EA7\u786E\u8BA4\uFF1B\u4E0D\u5F97 confirm \u6216 run\u3002\u7528\u6237\u5728\u540E\u7EED\u6D88\u606F\u660E\u786E\u786E\u8BA4\u8FD9\u4EFD\u9884\u89C8\u540E\uFF0C\u624D\u53EF\u8C03\u7528 oh_story_production track_job \u767B\u8BB0\u540C\u4E00\u4E2A\u6279\u6B21\u4EFB\u52A1 ID\uFF0C\u5E76\u8FD0\u884C Provider\u3002${authorityBoundary}`;
}
function nativeCompositionPrompt(production, job, orderedPaths) {
  return `/short-drama-edit

\u6267\u884C\u521B\u4F5C\u8005\u5DF2\u660E\u786E\u786E\u8BA4\u7684\u6210\u7247\u88C5\u914D\u4EFB\u52A1\u3002
- \u4EFB\u52A1 ID\uFF1A${job.id}
- \u5267\u96C6\uFF1A${production.episodeDirectory}
- \u521B\u4F5C\u8005\u5728\u6210\u7247\u89C6\u56FE\u6392\u5B9A\u7684\u955C\u5E8F\uFF0C\u4E0D\u5F97\u81EA\u884C\u6362\u5E8F\uFF1A
${orderedPaths.map((path, index) => `${String(index + 1)}. ${path}`).join(`
`)}
- \u526A\u8F91\u5355\uFF1A${production.episodeDirectory}/\u526A\u8F91\u5355.md
- \u8F93\u51FA\uFF1A${production.episodeDirectory}/\u5236\u4F5C\u6210\u679C/\u6210\u7247/

\u5148\u5199\u526A\u8F91\u5355\u518D\u6E32\u67D3\u3002\u9010\u6BB5\u770B\u5B8C\u7D20\u6750\u540E\u5199\u4E0B\u771F\u5B9E\u7684\u5165\u51FA\u70B9\u3001\u53D6\u820D\u7406\u7531\u3001\u58F0\u97F3\u5904\u7406\u4E0E\u5B57\u5E55\uFF0C\u4E0D\u8981\u6309\u955C\u5E8F\u51ED\u7A7A\u586B\u65F6\u95F4\uFF1B\u5B57\u5E55\u9010\u5B57\u53D6\u81EA\u5267\u672C.md\u3002\u526A\u8F91\u5355\u8BB0\u5F55\u7D20\u6750\u53D6\u820D\u3001\u5165\u51FA\u70B9\u3001\u540E\u671F\u5904\u7406\u4E0E\u4EA4\u4ED8\u89C4\u683C\uFF0C\u4E0D\u6539\u5199\u5267\u672C\u3001\u5206\u955C\u6216\u89C6\u9891\u63D0\u793A\u8BCD\u7684\u8BED\u4E49\uFF1B\u4E0D\u8981\u9000\u56DE\u53BB\u751F\u6210\u65B0\u7D20\u6750\u3002

\u89C6\u9891\u63D0\u793A\u8BCD.md \u91CC\u7684\u6BCF\u4E2A\u300C## MOTION-*\u300D\u90FD\u5FC5\u987B\u4F5C\u4E3A\u67D0\u4E2A CUT \u7684\u300C\u6765\u6E90\u300D\uFF0C\u5426\u5219\u5199\u8FDB\u526A\u8F91\u5355\u5F00\u5934\uFF08\u4EA4\u4ED8\u89C4\u683C\u6240\u5728\u5904\u3001\u7B2C\u4E00\u4E2A\u300C## CUT-\u300D\u4E4B\u524D\uFF09\u7684\u4E00\u884C\uFF1A\u300C- \u672A\u91C7\u7528\u955C\u5934\uFF1AMOTION-\u2026\uFF08\u7406\u7531\uFF1A\u6587\u4EF6\u7F3A\u5931\u2014\u2014\u2026\uFF09\uFF1BMOTION-\u2026\uFF08\u7406\u7531\uFF1A\u8D28\u91CF\u4E0D\u53EF\u7528\u2014\u2014\u2026\uFF09\u300D\u3002\u591A\u9879\u7528\u5168\u89D2\u300C\uFF1B\u300D\u8FDE\u63A5\uFF0C\u7406\u7531\u4E0D\u80FD\u4E3A\u7A7A\u3001\u81EA\u8EAB\u4E0D\u542B\u300C\uFF1B\u300D\uFF0C\u5E76\u5199\u660E\u5C5E\u4E8E\u6587\u4EF6\u7F3A\u5931\u3001\u8D28\u91CF\u4E0D\u53EF\u7528\u8FD8\u662F\u53D9\u4E8B\u53D6\u820D\uFF1B\u6F0F\u6389\u4EFB\u4F55\u4E00\u4E2A\uFF0Ccheck \u90FD\u4F1A\u963B\u65AD\u3002

\u526A\u8F91\u5355\u843D\u76D8\u540E\u4F9D\u6B21\u8FD0\u884C edit_tool.py \u7684 check \u4E0E render\uFF0Ccheck \u62A5\u51FA\u7684\u95EE\u9898\u5148\u6539\u6587\u6863\u518D\u91CD\u8DD1\u3002\u6240\u6709 CUT \u7684\u7D20\u6750\u5FC5\u987B\u540C\u5BBD\u3001\u540C\u9AD8\u3001\u540C\u5E27\u7387\uFF1Arender \u53EA\u786C\u62FC\u63A5\uFF0C\u4E0D\u7F29\u653E\u4E5F\u4E0D\u6539\u5E27\u7387\u3002check \u62A5\u51FA\u753B\u5E45\u6216\u5E27\u7387\u4E0D\u4E00\u81F4\u65F6\uFF0C\u5728\u5F53\u524D DSH \u6267\u884C\u73AF\u5883\u91CC\u7ECF\u5BA1\u6279\u7528 ffmpeg \u6309\u4EA4\u4ED8\u89C4\u683C\u7EDF\u4E00\u3001\u4FDD\u7559\u6784\u56FE\uFF0C\u65B0\u6587\u4EF6\u5199\u5230 ${production.episodeDirectory}/\u5236\u4F5C\u6210\u679C/\u6210\u7247/\u89C4\u683C\u7EDF\u4E00/\u2014\u2014\u8FD9\u662F\u526A\u8F91\u9636\u6BB5\u81EA\u5DF1\u7684\u4E2D\u95F4\u6587\u4EF6\uFF0C\u4E0D\u653E\u5728\u751F\u4EA7\u9636\u6BB5\u7684\u539F\u7D20\u6750\u65C1\u8FB9\u3001\u4E0D\u8986\u76D6\u5DF2\u751F\u4EA7\u7684\u7D20\u6750\uFF0C\u6587\u4EF6\u540D\u4E5F\u4E0D\u6CBF\u7528\u539F\u6587\u4EF6\u91CC\u7684\u4EFB\u52A1 ID\uFF08\u53EF\u76F4\u63A5\u7528 MOTION ID\uFF09\uFF1B\u5728\u8BE5 CUT \u4E0B\u8BB0\u5F55\u88C1\u5207\u6216\u7559\u8FB9\uFF08\u4E0D\u8981\u5199\u8FDB\u300C\u753B\u9762\u300D\u884C\uFF0C\u5B83\u53EA\u8BA4\u4EAE\u5EA6\u3001\u9971\u548C\u3001\u8272\u6E29\uFF09\uFF0C\u628A\u300C\u6765\u6E90\u300D\u6539\u6307\u65B0\u6587\u4EF6\uFF0C\u5165\u51FA\u70B9\u968F\u8F6C\u6362\u53D8\u5316\u65F6\u540C\u6B65\u4FEE\u6539\uFF0C\u518D\u91CD\u8DD1 check\u3002

\u9ED8\u8BA4\u7684\u786C\u5B57\u5E55\u8DEF\u7EBF\u9700\u8981\u5E26 libass \u7684 ffmpeg\uFF0C\u7F3A libass \u65F6\u5982\u5B9E\u62A5\u51FA\uFF0C\u4E0D\u8981\u6084\u6084\u53BB\u6389\u5B57\u5E55\uFF1B\u6539\u7528 Remotion \u9700\u8981\u5148\u5B89\u88C5 Node \u4F9D\u8D56\u5E76\u9010\u5E27\u8FC7\u65E0\u5934\u6D4F\u89C8\u5668\uFF0C\u53EA\u6709\u521B\u4F5C\u8005\u660E\u786E\u540C\u610F\u8FD9\u6B21\u5B89\u88C5\u65F6\u624D\u8D70\u3002\u526A\u8F91\u5355\u7684\u300C\u58F0\u97F3\u300D\u884C\u53EA\u662F\u8BB0\u5F55\uFF0Crender \u4E0D\u6267\u884C\u5B83\uFF1Arender \u53EA\u5207\u6BB5\u3001\u786C\u62FC\u63A5\u3001\u70E7\u5B57\u5E55\u3001\u505A\u300C\u753B\u9762\u300D\u6821\u6B63\u4E0E\u53EF\u9009\u9897\u7C92\u3001\u7EDF\u4E00\u54CD\u5EA6\u3002\u6DF7\u97F3\u3001\u4EA4\u53C9\u6DE1\u5165\u3001\u914D\u4E50\u3001\u8F6C\u573A\u6216\u683C\u5F0F\u8F6C\u6362\u90FD\u662F\u53E6\u4E00\u6B65\u7ECF\u5BA1\u6279\u7684\u5916\u90E8 ffmpeg \u5904\u7406\uFF0C\u5148\u5199\u5230\u4E34\u65F6\u6587\u4EF6\uFF1B\u8FD9\u4E00\u6B65\u6700\u540E\u8981\u50CF render \u4E00\u6837\u6309\u526A\u8F91\u5355\u7684\u300C\u4EA4\u4ED8\u54CD\u5EA6\u300D\u5BF9\u6574\u7247\u505A\u4E24\u904D loudnorm\uFF08I=\u4EA4\u4ED8\u54CD\u5EA6\u3001TP=-1.5\u3001LRA=11\uFF0C\u7B2C\u4E8C\u904D\u4EE3\u5165\u7B2C\u4E00\u904D\u7684\u5B9E\u6D4B\u503C\u5E76\u7528 linear=true\uFF09\uFF0C\u97F3\u9891\u7F16\u7801\u4E3A AAC 192k\u300148 kHz\uFF0C\u7136\u540E\u624D\u66FF\u6362 ${production.episodeDirectory}/\u5236\u4F5C\u6210\u679C/\u6210\u7247/\u6210\u7247.mp4\uFF0C\u5E76\u628A\u547D\u4EE4\u8BB0\u8FDB\u526A\u8F91\u5355\uFF1B\u91CD\u65B0 render \u4F1A\u8986\u76D6\u6210\u7247\uFF0C\u8FD9\u4E9B\u6B65\u9AA4\u8981\u91CD\u505A\u3002\u6700\u540E\u5BF9\u4EA4\u4ED8\u7684\u8FD9\u4EFD\u6210\u7247.mp4 \u8FD0\u884C edit_tool.py verify \u5E76\u62A5\u544A\u5B9E\u6D4B\u6570\u5B57\uFF0C\u300C\u672A\u6D4B\u300D\u9879\u7167\u5B9E\u5199\u672A\u6D4B\u3002

ffmpeg \u4E0E ffprobe \u901A\u8FC7\u5F53\u524D DSH \u6267\u884C\u73AF\u5883\u8C03\u7528\uFF0C\u4E0D\u53EF\u7528\u65F6\u5982\u5B9E\u62A5\u51FA\u6765\uFF0C\u4E0D\u8981\u628A\u300C\u6CA1\u6D4B\u300D\u5199\u6210\u300C\u901A\u8FC7\u300D\u3002\u6240\u6709\u547D\u4EE4\u548C\u5199\u5165\u7EE7\u7EED\u9075\u5B88 DSH \u6743\u9650\u4E0E\u5BA1\u6279\uFF0C\u4E0D\u5F97\u4F2A\u9020\u6210\u529F\u3002`;
}

// src/client/production-runtime.ts
function record(value) {
  return typeof value == "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function productionQueueFromInbox(rows, claimedRequestIds = /* @__PURE__ */ new Set()) {
  return Array.isArray(rows) ? rows.flatMap((row) => {
    let item = record(row);
    if (item === void 0 || typeof item.id != "string" || !Array.isArray(item.content)) return [];
    let source = record(item.source);
    if (source?.kind === "user" && typeof source.rpcId == "string" && claimedRequestIds.has(source.rpcId)) return [];
    let preview = item.content.flatMap((block) => {
      let value = record(block);
      return value?.type === "text" && typeof value.text == "string" ? [value.text] : [];
    }).join(" ");
    return [{ id: item.id, preview }];
  }) : [];
}
function createPendingJob(input) {
  return {
    id: input.id,
    targetId: input.targetId,
    kind: input.kind,
    status: "pending",
    progress: 0,
    prompt: input.prompt,
    expectedOutputs: Math.max(1, Math.floor(input.expectedOutputs ?? 1)),
    completedOutputs: 0,
    outputPath: input.outputPath,
    supersededOutputIds: input.supersededOutputIds
  };
}
function selectedVersionForTarget(targetId, versions, selections, kind) {
  let candidates = versions.filter((version) => version.targetId === targetId && (kind === void 0 || version.kind === kind));
  return candidates.find((version) => version.id === selections[targetId]) ?? candidates.at(-1);
}
var EDIT_OUTPUT_DIRECTORY = /(?:^|\/)制作成果\/成片\//u;
function mediaTargetFromPath(path, knownTargets) {
  if (EDIT_OUTPUT_DIRECTORY.test(path)) return;
  let segments = path.toLocaleUpperCase().split("/"), filename = segments.at(-1) ?? "";
  return [...knownTargets].sort((left, right) => right.length - left.length).find((target) => {
    let canonical = target.toLocaleUpperCase();
    return segments.includes(canonical) || filename === canonical || filename.startsWith(`${canonical}.`) || filename.startsWith(`${canonical}-`);
  });
}
function mediaVersionMatchesJob(version, jobId) {
  if (version.path === void 0 || jobId.trim() === "") return !1;
  let escaped = jobId.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), basename = version.path.split("/").at(-1) ?? "";
  return new RegExp(`(?:^|[-_.])${escaped}(?:[-_.]|$)`, "u").test(basename);
}
function outputsForJob(job, versions) {
  if (job.outputPath === void 0) return versions.filter((version) => mediaVersionMatchesJob(version, job.id));
  let superseded = new Set(job.supersededOutputIds ?? []);
  return versions.filter((version) => version.path === job.outputPath && !superseded.has(version.id));
}
function compositionInFlight(jobs) {
  return jobs.some((job) => job.kind === "composition" && (job.status === "awaiting_confirmation" || job.status === "pending" || job.status === "running"));
}
function settleSupersededCompositions(jobs, next) {
  return next.kind !== "composition" ? [...jobs] : jobs.map((job) => job.id !== next.id && job.kind === "composition" && job.status === "dispatched_unknown" && (job.targetId === next.targetId || job.outputPath !== void 0 && job.outputPath === next.outputPath) ? { ...job, status: "failed" } : job);
}
function referencesForTarget(targetId, production, versions, selections, libraryVersions = versions, manualReferences = {}) {
  let shot = production.shots.find((item) => item.id === targetId);
  if (shot === void 0) return [];
  let declared = shot.references.flatMap((id) => {
    let version = selectedVersionForTarget(id, versions, selections, "image");
    return version === void 0 ? [] : [version];
  }), manual = (manualReferences[targetId] ?? []).flatMap((id) => {
    let version = libraryVersions.find((item) => item.id === id && item.kind === "image");
    return version === void 0 ? [] : [version];
  });
  return [...new Map([...declared, ...manual].map((version) => [version.id, version])).values()];
}
function queuedItemForJob(jobId, queue) {
  if (jobId.trim() === "") return;
  let escaped = jobId.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), labelled = new RegExp(`\u4EFB\u52A1\\s*ID\\s*[\uFF1A:]\\s*${escaped}(?:[\\s.,;\u3001\u3002]|$)`, "u");
  return queue.find((item) => labelled.test(item.preview));
}
function activeProductionJobId(jobs, queue, sessionRunning) {
  if (sessionRunning)
    return [...jobs].reverse().find((job) => (job.status === "awaiting_confirmation" || job.status === "pending" || job.status === "running") && queuedItemForJob(job.id, queue) === void 0)?.id;
}
function reconcileProductionJobs(jobs, queue, sessionRunning, versions) {
  let latestPending = [...jobs].reverse().find((job) => job.status === "pending" && queuedItemForJob(job.id, queue) === void 0), settleCompositions = (list) => list.filter((job) => job.kind === "composition" && job.status === "running").reduce((current, running) => settleSupersededCompositions(current, running), [...list]), reconciled = settleCompositions(jobs).map((job) => {
    let queued = queuedItemForJob(job.id, queue) !== void 0;
    if (job.status === "canceled" || job.status === "succeeded" || job.status === "failed" && job.outputPath !== void 0) return job;
    let outputs = outputsForJob(job, versions);
    return outputs.length >= job.expectedOutputs ? {
      ...job,
      status: "succeeded",
      progress: 100,
      completedOutputs: outputs.length,
      output: outputs[0],
      error: void 0
    } : job.status === "awaiting_confirmation" && outputs.length === 0 ? job : job.status === "running" && queued ? { ...job, status: "pending", progress: 0 } : job.status === "pending" && sessionRunning && !queued && job === latestPending ? { ...job, status: "running", progress: Math.max(10, job.progress), error: void 0 } : !sessionRunning && !queued && (job.status === "running" || job.status === "dispatched_unknown") ? {
      ...job,
      status: "dispatched_unknown",
      progress: Math.round(outputs.length / job.expectedOutputs * 100),
      completedOutputs: outputs.length,
      // Assembly is local ffmpeg, so nothing was billed: a missing cut usually means edit_tool
      // check blocked the render, and those findings — not a billing warning — are what to show.
      error: outputs.length > 0 ? `DSH Turn \u5DF2\u7ED3\u675F\uFF0C\u5DF2\u53D1\u73B0 ${String(outputs.length)}/${String(job.expectedOutputs)} \u9879\u6210\u679C\uFF1B\u8BF7\u5237\u65B0\u6838\u5BF9\u5269\u4F59\u8F93\u51FA\u3002` : job.kind === "composition" ? "\u6210\u7247\u672A\u751F\u6210\uFF1A\u8BF7\u5728 Chat \u67E5\u770B edit_tool check \u7684\u963B\u65AD\u9879\uFF08\u672A\u91C7\u7528\u955C\u5934\u7406\u7531\u3001\u753B\u5E45/\u5E27\u7387\u4E0D\u4E00\u81F4\u7B49\uFF09\uFF0C\u4FEE\u6B63\u540E\u518D\u5408\u6210\u3002" : "DSH Turn \u5DF2\u7ED3\u675F\uFF0C\u5C1A\u672A\u53D1\u73B0\u5173\u8054\u6210\u679C\u3002\u4EFB\u52A1\u53EF\u80FD\u5DF2\u6D3E\u53D1\uFF0C\u8BF7\u5148\u5237\u65B0\u6210\u679C\uFF0C\u907F\u514D\u91CD\u590D\u8BA1\u8D39\u3002"
    } : outputs.length > 0 ? {
      ...job,
      status: job.status === "failed" ? "failed" : "running",
      progress: Math.max(10, Math.round(outputs.length / job.expectedOutputs * 100)),
      completedOutputs: outputs.length,
      error: job.status === "failed" ? job.error : void 0
    } : job;
  });
  return settleCompositions(reconciled);
}
function reconcileSequence(shotIds, current, versions, selections) {
  let shotSet = new Set(shotIds), preserved = current.filter((item) => shotSet.has(item.shotId)), present = new Set(preserved.map((item) => item.shotId)), appended = shotIds.filter((shotId) => !present.has(shotId)).map((shotId) => ({ shotId }));
  return [...preserved, ...appended].map((item) => ({
    shotId: item.shotId,
    versionId: selectedVersionForTarget(item.shotId, versions, selections, "video")?.id
  }));
}
function sequenceIssues(sequence, versions) {
  let versionById = new Map(versions.map((version) => [version.id, version])), issues = [];
  for (let item of sequence) {
    let version = item.versionId === void 0 ? void 0 : versionById.get(item.versionId);
    version === void 0 || version.kind !== "video" ? issues.push(`${item.shotId} \u7F3A\u5C11\u5DF2\u9009\u89C6\u9891\u7248\u672C`) : version.path === void 0 && issues.push(`${item.shotId} \u7684\u89C6\u9891\u6CA1\u6709\u53EF\u4F9B DSH \u8BFB\u53D6\u7684\u5DE5\u4F5C\u533A\u8DEF\u5F84`);
  }
  return issues;
}
function reorderSequence(sequence, source, target) {
  if (!Number.isInteger(source) || !Number.isInteger(target)) return [...sequence];
  if (source < 0 || target < 0 || source >= sequence.length || target >= sequence.length || source === target) return [...sequence];
  let next = [...sequence], [item] = next.splice(source, 1);
  return item !== void 0 && next.splice(target, 0, item), next;
}

// src/client/drama-production-view.tsx
var import_jsx_runtime3 = require("react/jsx-runtime"), SECTION_LABELS = { shots: "\u955C\u5934", assets: "\u7D20\u6750", tasks: "\u4EFB\u52A1", sequence: "\u6210\u7247", canvas: "\u753B\u5E03" }, SECTION_ORDER = Object.keys(SECTION_LABELS), STATUS_LABELS = { awaiting_confirmation: "\u7B49\u5F85\u786E\u8BA4", pending: "\u5DF2\u63D0\u4EA4", running: "DSH \u6267\u884C\u4E2D", dispatched_unknown: "\u5F85\u6838\u5BF9", succeeded: "\u5DF2\u5B8C\u6210", failed: "\u5931\u8D25", canceled: "\u5DF2\u53D6\u6D88" }, ASSET_KIND_LABEL = { character: "\u4EBA\u7269", scene: "\u573A\u666F", prop: "\u9053\u5177", state: "\u72B6\u6001", unknown: "\u8BBE\u5B9A" }, JOB_KIND_LABEL = { image: "\u56FE\u7247", video: "\u89C6\u9891", composition: "\u6210\u7247" }, ASSEMBLED_CUT_PATH = "\u5236\u4F5C\u6210\u679C/\u6210\u7247/\u6210\u7247.mp4", MODALITY_LABEL = { image: "\u56FE\u7247", video: "\u89C6\u9891", tts: "\u8BED\u97F3", music: "\u97F3\u4E50" };
function ProductionEnvironment({ sessionId }) {
  let [preflight, setPreflight] = (0, import_react.useState)(), [attempt, setAttempt] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    let controller = new AbortController();
    return fetch(endpoint("drama-preflight", sessionId), { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
      let summary = await response.json();
      controller.signal.aborted || setPreflight(summary);
    }).catch(() => {
      controller.signal.aborted || setPreflight("failed");
    }), () => {
      controller.abort();
    };
  }, [attempt, sessionId]);
  let unconfigured = typeof preflight == "object" ? preflight.adapters.filter((adapter) => !adapter.configured) : [];
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-production-environment", role: "status", "aria-label": "\u5A92\u4F53\u751F\u6210\u73AF\u5883", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: "\u751F\u6210\u73AF\u5883" }),
    preflight === void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "data-pending": !0, children: "\u68C0\u67E5\u4E2D\u2026" }),
    preflight === "failed" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
      setPreflight(void 0), setAttempt((value) => value + 1);
    }, children: "\u73AF\u5883\u68C0\u67E5\u5931\u8D25 \xB7 \u91CD\u8BD5" }),
    typeof preflight == "object" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { "data-ready": preflight.python.ok || void 0, children: [
        "Python ",
        preflight.python.version ?? "\u672A\u627E\u5230"
      ] }),
      preflight.adapters.map((adapter) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { "data-ready": adapter.configured || void 0, title: adapter.configured ? `${adapter.name} \u5DF2\u914D\u7F6E` : `\u7F3A\u5C11\u73AF\u5883\u53D8\u91CF ${adapter.missing.join("\u3001")}`, children: [
        MODALITY_LABEL[adapter.modality],
        " ",
        adapter.label,
        adapter.configured ? "" : ` \xB7 \u7F3A ${adapter.missing.join("\u3001")}`
      ] }, adapter.name)),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("em", { children: [
        "DeepSeek \u53EA\u8D1F\u8D23\u5199\u63D0\u793A\u8BCD\uFF1B\u56FE\u7247\u3001\u89C6\u9891\u3001\u8BED\u97F3\u3001\u97F3\u4E50\u7531\u4E0A\u9762\u7684\u4F9B\u5E94\u5546 API \u751F\u6210\uFF0CKey \u5728\u542F\u52A8 DSH \u524D\u5199\u5165\u5BBF\u4E3B\u673A\u73AF\u5883\u53D8\u91CF\u3002",
        unconfigured.length === preflight.adapters.length && " \u5F53\u524D\u4E00\u4E2A\u90FD\u6CA1\u914D\u7F6E\uFF0C\u751F\u4EA7\u4EFB\u52A1\u4F1A\u505C\u5728 adapter \u4E4B\u524D\u3002",
        " ",
        "Adapter \u914D\u7F6E",
        preflight.adapterConfig.generated ? "\u5DF2\u81EA\u52A8\u767B\u8BB0" : "\u4F7F\u7528\u81EA\u5B9A\u4E49\u6587\u4EF6",
        preflight.adapterConfig.ok ? "" : "\uFF08\u5199\u5165\u5931\u8D25\uFF09",
        "\uFF1A",
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: preflight.adapterConfig.path }),
        "\u3002\u8BE6\u89C1 README\u300C\u5A92\u4F53\u751F\u6210 API\u300D\u3002"
      ] })
    ] })
  ] });
}
function handleSectionKey(event, current, onChange) {
  let index = SECTION_ORDER.indexOf(current), next = event.key === "Home" ? 0 : event.key === "End" ? SECTION_ORDER.length - 1 : event.key === "ArrowRight" ? (index + 1) % SECTION_ORDER.length : event.key === "ArrowLeft" ? (index - 1 + SECTION_ORDER.length) % SECTION_ORDER.length : void 0;
  next !== void 0 && (event.preventDefault(), onChange(SECTION_ORDER[next]), event.currentTarget.parentElement?.querySelectorAll("[role='tab']")[next]?.focus());
}
function DramaProductionView(props) {
  let [notice, setNotice] = (0, import_react.useState)(), protocolErrors = props.production.diagnostics.filter((item) => item.severity === "error").length, jobsRef = (0, import_react.useRef)(props.jobs), commitJobs = (0, import_react.useCallback)((next) => {
    jobsRef.current = next, props.onJobsChange(next);
  }, [props.onJobsChange]);
  (0, import_react.useEffect)(() => {
    jobsRef.current = props.jobs;
  }, [props.jobs]), (0, import_react.useEffect)(() => {
    let next = reconcileSequence(props.production.shots.map((shot) => shot.id), props.sequence, props.versions, props.selections);
    JSON.stringify(next) !== JSON.stringify(props.sequence) && props.onSequenceChange(next);
  }, [props.production.shots, props.selections, props.sequence, props.versions]), (0, import_react.useEffect)(() => {
    let next = reconcileProductionJobs(props.jobs, props.queue, props.sessionRunning, props.versions);
    JSON.stringify(next) !== JSON.stringify(props.jobs) && commitJobs(next);
  }, [commitJobs, props.jobs, props.queue, props.sessionRunning, props.versions]);
  let dispatchJob = async (job, references = []) => {
    commitJobs([...jobsRef.current, { ...job, status: "awaiting_confirmation" }]), props.onSectionChange("tasks");
    try {
      await props.onDispatchPrompt(nativeProductionPrompt(props.production, job, references)), setNotice(`${job.targetId} \u6B63\u5728\u51C6\u5907\u5B8C\u6574\u9884\u68C0\uFF1B\u8BF7\u5728 Chat \u67E5\u770B\u5E76\u660E\u786E\u786E\u8BA4\u540E\u518D\u751F\u4EA7\u3002`);
    } catch (error) {
      commitJobs(jobsRef.current.map((item) => item.id === job.id ? { ...item, status: "failed", error: error instanceof Error ? error.message : String(error) } : item));
    }
  }, createJob = async (targetId, kind, prompt) => {
    if (prompt.trim() === "") {
      setNotice(`${targetId} \u6CA1\u6709\u53EF\u6295\u4EA7\u63D0\u793A\u8BCD\u3002`);
      return;
    }
    let job = createPendingJob({ id: crypto.randomUUID(), targetId, kind, prompt });
    await dispatchJob(job, kind === "video" ? referencesForTarget(targetId, props.production, props.versions, props.selections, props.libraryVersions, props.manualReferences) : []);
  }, createBatch = async (kind) => {
    let candidates = props.production.shots.flatMap((shot) => {
      let prompt = kind === "image" ? shot.keyframePrompt : shot.motion?.prompt;
      return prompt === void 0 ? [] : [{ id: shot.id, prompt }];
    });
    if (candidates.length === 0) {
      setNotice(kind === "image" ? "\u6CA1\u6709\u53EF\u6295\u4EA7\u7684\u5173\u952E\u5E27\u63D0\u793A\u8BCD\u3002" : "\u6CA1\u6709\u53EF\u6295\u4EA7\u7684\u89C6\u9891\u63D0\u793A\u8BCD\u3002");
      return;
    }
    let job = createPendingJob({ id: crypto.randomUUID(), targetId: kind === "image" ? "BATCH-KEYFRAMES" : "BATCH-VIDEOS", kind, prompt: candidates.map((item) => `${item.id}
${item.prompt}`).join(`

`), expectedOutputs: candidates.length });
    commitJobs([...jobsRef.current, { ...job, status: "awaiting_confirmation" }]), props.onSectionChange("tasks");
    try {
      await props.onDispatchPrompt(nativeBatchPrompt(props.production, job, candidates)), setNotice(`${String(candidates.length)} \u4E2A\u955C\u5934\u6B63\u5728\u51C6\u5907\u540C\u4E00\u6279\u6B21\u9884\u68C0\uFF1B\u8BF7\u5728 Chat \u6838\u5BF9\u540E\u660E\u786E\u786E\u8BA4\u3002`);
    } catch (error) {
      commitJobs(jobsRef.current.map((item) => item.id === job.id ? { ...item, status: "failed", error: error instanceof Error ? error.message : String(error) } : item));
    }
  }, dispatchComposition = async (job) => {
    let versionById = new Map(props.versions.map((version) => [version.id, version])), ordered = props.sequence.flatMap((item) => {
      let version = item.versionId === void 0 ? void 0 : versionById.get(item.versionId);
      return version === void 0 ? [] : [version.path ?? version.url];
    });
    commitJobs([...jobsRef.current, job]), props.onSectionChange("tasks");
    try {
      await props.onDispatchPrompt(nativeCompositionPrompt(props.production, job, ordered)), setNotice("\u6210\u7247\u4EFB\u52A1\u5DF2\u8FDB\u5165 DSH \u539F\u751F\u961F\u5217\uFF1B\u6587\u4EF6\u3001FFmpeg \u548C\u5199\u5165\u7EE7\u7EED\u53D7 DSH \u6743\u9650\u4E0E\u5BA1\u6279\u63A7\u5236\u3002");
    } catch (error) {
      commitJobs(jobsRef.current.map((item) => item.id === job.id ? { ...item, status: "failed", error: error instanceof Error ? error.message : String(error) } : item));
    }
  }, cancelJob = async (job) => {
    try {
      await props.onCancelTurn(), commitJobs(jobsRef.current.map((item) => item.id === job.id ? { ...item, status: "canceled", progress: 0 } : item)), setNotice("\u5DF2\u8BF7\u6C42\u505C\u6B62\u5F53\u524D DSH Turn\uFF1BDSH Queue \u4E2D\u7684\u5176\u4ED6\u4EFB\u52A1\u4F1A\u4FDD\u7559\u3002");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error));
    }
  }, removeQueuedJob = async (job, itemId) => {
    try {
      await props.onRemoveQueued(itemId), commitJobs(jobsRef.current.map((item) => item.id === job.id ? { ...item, status: "canceled", progress: 0 } : item)), setNotice(`${job.targetId} \u5DF2\u4ECE DSH Queue \u79FB\u9664\u3002`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error));
    }
  }, composeSequence = () => {
    let issues = sequenceIssues(props.sequence, props.versions);
    if (issues.length > 0) {
      setNotice(issues[0]);
      return;
    }
    let outputPath = `${props.production.episodeDirectory}/${ASSEMBLED_CUT_PATH}`;
    dispatchComposition(createPendingJob({
      id: crypto.randomUUID(),
      targetId: props.production.episodeDirectory,
      kind: "composition",
      prompt: "\u6309\u6210\u7247\u987A\u5E8F\u5408\u6210",
      outputPath,
      supersededOutputIds: props.libraryVersions.flatMap((version) => version.path === outputPath ? [version.id] : [])
    }));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-production", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-production-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-production-tabs", role: "tablist", "aria-label": "\u77ED\u5267\u751F\u4EA7\u89C6\u56FE", children: SECTION_ORDER.map((item) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", role: "tab", tabIndex: props.section === item ? 0 : -1, "aria-selected": props.section === item, onKeyDown: (event) => {
        handleSectionKey(event, item, props.onSectionChange);
      }, onClick: () => {
        props.onSectionChange(item);
      }, children: SECTION_LABELS[item] }, item)) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-production-meta", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "oh-story-production-summary", children: [
          props.production.shots.length,
          " \u955C \xB7 ",
          props.production.assets.length + props.production.visualAssets.length,
          " \u7D20\u6750 \xB7 ",
          props.jobs.filter((job) => job.status === "awaiting_confirmation" || job.status === "running" || job.status === "pending").length,
          " \u4EFB\u52A1"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: props.onRefresh, children: "\u5237\u65B0" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProductionEnvironment, { sessionId: props.sessionId }),
    notice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-production-notice", role: "status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: notice }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", "aria-label": "\u5173\u95ED\u63D0\u793A", onClick: () => {
        setNotice(void 0);
      }, children: "\xD7" })
    ] }),
    props.production.diagnostics.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { className: "oh-story-production-diagnostics", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: protocolErrors > 0 ? `${String(protocolErrors)} \u4E2A\u534F\u8BAE\u9519\u8BEF` : `${String(props.production.diagnostics.length)} \u4E2A\u683C\u5F0F\u63D0\u9192` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { children: props.production.diagnostics.slice(0, 8).map((item) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { "data-severity": item.severity, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", onClick: () => {
          props.onNavigate({ path: item.path, offset: item.offset, id: item.targetId ?? item.code });
        }, children: [
          item.path.split("/").at(-1),
          ":",
          item.line
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: item.message })
      ] }, `${item.path}:${String(item.offset)}:${item.code}`)) }),
      props.production.diagnostics.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { children: [
        "\u53E6\u6709 ",
        props.production.diagnostics.length - 8,
        " \u9879\uFF0C\u8BF7\u6309\u6587\u6863\u4F4D\u7F6E\u4FEE\u590D\u3002"
      ] })
    ] }),
    props.section === "shots" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ShotBoard, { ...props, onCreateJob: createJob, onBatch: createBatch }),
    props.section === "assets" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AssetBoard, { ...props, onCreateJob: createJob }),
    props.section === "tasks" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TaskBoard, { jobs: props.jobs, queue: props.queue, sessionRunning: props.sessionRunning, onCancel: cancelJob, onRemoveQueued: removeQueuedJob }),
    props.section === "sequence" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SequenceBoard, { ...props, onCompose: composeSequence }),
    props.section === "canvas" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProductionCanvas, { ...props })
  ] });
}
function ShotBoard(props) {
  let selectedRef = useScrollIntoView(props.selectedId);
  return props.production.shots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("section", { className: "oh-story-shot-board", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MissingDocument, { document: `${props.production.episodeDirectory}/\u5206\u955C.md`, documentPaths: props.production.documentPaths, what: "\u955C\u5934", skill: "/short-drama-storyboard", onNavigate: props.onNavigate }) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "oh-story-shot-board", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-production-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
        props.onBatch("image");
      }, children: "\u51C6\u5907\u6279\u91CF\u5173\u952E\u5E27" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
        props.onBatch("video");
      }, children: "\u51C6\u5907\u6279\u91CF\u89C6\u9891" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-shot-grid", children: props.production.shots.map((shot) => {
      let completeness = productionCompleteness(shot), versions = props.versions.filter((version) => version.targetId === shot.id), selected = selectedVersionForTarget(shot.id, props.versions, props.selections, "image") ?? selectedVersionForTarget(shot.id, props.versions, props.selections, "video");
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("article", { className: "oh-story-shot-card", role: "button", tabIndex: 0, "aria-pressed": props.selectedId === shot.id, "aria-label": `\u9009\u4E2D\u955C\u5934 ${shot.id} ${shot.title}`, ref: props.selectedId === shot.id ? selectedRef : void 0, "data-selected": props.selectedId === shot.id || void 0, onKeyDown: (event) => {
        (event.key === "Enter" || event.key === " ") && (event.preventDefault(), props.onSelect(shot.id));
      }, onClick: () => {
        props.onSelect(shot.id);
      }, children: [
        selected === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-shot-placeholder", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: shot.id.split("-").at(-1) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "\u7B49\u5F85\u5173\u952E\u5E27\u6210\u679C" })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MediaPreview, { version: selected }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: (event) => {
            event.stopPropagation(), props.onNavigate({ path: shot.path, offset: shot.offset, id: shot.id });
          }, children: shot.id }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: shot.durationSeconds === void 0 ? "\u2014" : `${String(shot.durationSeconds)}s` })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: shot.title }),
        shot.shotSpec !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: shot.shotSpec }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("dl", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("dt", { children: "\u8D77" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("dd", { children: shot.start ?? "\u672A\u586B\u5199" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("dt", { children: "\u7EC8" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("dd", { children: shot.end ?? "\u672A\u586B\u5199" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-shot-status", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReadinessBadge, { label: "\u5173\u952E\u5E27", ready: completeness.keyframe }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReadinessBadge, { label: "\u8FD0\u52A8", ready: completeness.motion }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReadinessBadge, { label: "\u53C2\u8003", ready: completeness.references }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
            versions.length,
            " \u7248\u672C"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-reference-links", children: [
          shot.sceneIds.length > 0 ? shot.sceneIds.map((sceneId) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReferenceButton, { id: sceneId, production: props.production, onNavigate: props.onNavigate }, sceneId)) : shot.source !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReferenceButton, { id: shot.source, production: props.production, onNavigate: props.onNavigate }),
          shot.references.map((id) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReferenceButton, { id, production: props.production, onNavigate: props.onNavigate }, id))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-card-actions", children: [
          shot.keyframePrompt !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: (event) => {
            event.stopPropagation(), props.onCreateJob(shot.id, "image", shot.keyframePrompt ?? "");
          }, children: "\u51C6\u5907\u5173\u952E\u5E27" }),
          shot.motion?.prompt !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: (event) => {
            event.stopPropagation(), props.onCreateJob(shot.id, "video", shot.motion?.prompt ?? "");
          }, children: "\u51C6\u5907\u89C6\u9891" })
        ] }),
        versions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(VersionStrip, { targetId: shot.id, versions, selections: props.selections, onSelectionsChange: props.onSelectionsChange })
      ] }, shot.id);
    }) })
  ] });
}
function AssetBoard(props) {
  let [query, setQuery] = (0, import_react.useState)(""), [kind, setKind] = (0, import_react.useState)("all"), assets = [...props.production.assets, ...props.production.visualAssets.filter((visual) => !props.production.assets.some((asset) => asset.title === visual.title))], needle = query.trim().toLocaleLowerCase(), library = props.libraryVersions.filter((version) => (kind === "all" || version.kind === kind) && (needle === "" || `${version.targetId} ${version.path ?? ""}`.toLocaleLowerCase().includes(needle))), selectedRef = useScrollIntoView(props.selectedId), referenceTarget = props.selectedId?.startsWith("SHOT-") === !0 ? props.selectedId : void 0, toggleReference = (versionId) => {
    if (referenceTarget === void 0) return;
    let current = props.manualReferences[referenceTarget] ?? [], next = current.includes(versionId) ? current.filter((id) => id !== versionId) : [...current, versionId], mutable = Object.fromEntries(Object.entries(props.manualReferences).map(([target, ids]) => [target, [...ids]]));
    props.onManualReferencesChange({ ...mutable, [referenceTarget]: next });
  };
  return assets.length === 0 && props.libraryVersions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("section", { className: "oh-story-assets", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MissingDocument, { document: `${props.production.episodeDirectory}/\u56FE\u7247\u63D0\u793A\u8BCD.md`, documentPaths: props.production.documentPaths, what: "\u7D20\u6750", skill: "/short-drama-image-prompts", onNavigate: props.onNavigate }) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "oh-story-assets", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-asset-grid", children: assets.map((asset) => {
      let prompt = "prompt" in asset ? asset.prompt : asset.description, versions = props.versions.filter((version) => version.targetId === asset.id), selected = selectedVersionForTarget(asset.id, props.versions, props.selections, "image");
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("article", { className: "oh-story-asset-card", ref: props.selectedId === asset.id ? selectedRef : void 0, "data-selected": props.selectedId === asset.id || void 0, children: [
        selected === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-asset-placeholder", children: asset.kind === "character" ? "\u4EBA" : asset.kind === "scene" ? "\u666F" : asset.kind === "prop" ? "\u7269" : "\u8BBE" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MediaPreview, { version: selected }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("small", { children: ASSET_KIND_LABEL[asset.kind] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: asset.title }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
            props.onNavigate({ path: asset.path, offset: asset.offset, id: asset.id });
          }, children: asset.id })
        ] }),
        prompt !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "oh-story-asset-description", children: prompt }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-card-actions", children: prompt !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
          props.onCreateJob(asset.id, "image", prompt);
        }, children: "\u51C6\u5907\u7D20\u6750" }) }),
        versions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(VersionStrip, { targetId: asset.id, versions, selections: props.selections, onSelectionsChange: props.onSelectionsChange })
      ] }, asset.id);
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-media-library", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("header", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: "\u9879\u76EE\u5A92\u4F53\u5E93" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
            library.length,
            "/",
            props.libraryVersions.length,
            " \u9879 \xB7 \u53EF\u8DE8\u96C6\u590D\u7528"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { "aria-label": "\u641C\u7D22\u9879\u76EE\u5A92\u4F53", value: query, placeholder: "\u641C\u7D22 ID \u6216\u8DEF\u5F84", onChange: (event) => {
            setQuery(event.target.value);
          } }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("select", { "aria-label": "\u7B5B\u9009\u5A92\u4F53\u7C7B\u578B", value: kind, onChange: (event) => {
            setKind(event.target.value);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "all", children: "\u5168\u90E8" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "image", children: "\u56FE\u7247" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "video", children: "\u89C6\u9891" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "oh-story-projection-note", children: [
        referenceTarget === void 0 ? "\u5148\u5728\u955C\u5934\u9875\u9009\u4E2D\u4E00\u4E2A\u955C\u5934\uFF0C\u518D\u56DE\u5230\u8FD9\u91CC\u628A\u5DF2\u6709\u56FE\u7247\u8BBE\u4E3A\u8BE5\u955C\u5934\u7684\u8865\u5145\u53C2\u8003\u3002" : `\u53EF\u628A\u4E0B\u9762\u7684\u56FE\u7247\u8BBE\u4E3A ${referenceTarget} \u7684\u8865\u5145\u53C2\u8003\u3002`,
        "\u8865\u5145\u53C2\u8003\u53EA\u63D0\u793A Agent \u6838\u5BF9\uFF1B\u5199\u8FDB\u6765\u6E90\u6761\u76EE\u7684\u300C\u8F93\u5165\u53C2\u8003\u56FE\u300D\u540E\u624D\u4F1A\u9001\u8FDB\u751F\u4EA7\u3002"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-media-library-grid", children: library.map((version) => {
        let selected = referenceTarget !== void 0 && (props.manualReferences[referenceTarget] ?? []).includes(version.id);
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("article", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MediaPreview, { version }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: version.targetId }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { title: version.path, children: version.path }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("footer", { children: [
            version.path !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
              props.onOpenMedia(version.path);
            }, children: "\u6253\u5F00\u6587\u4EF6" }),
            referenceTarget !== void 0 && version.kind === "image" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", "aria-pressed": selected, "aria-label": `${selected ? "\u53D6\u6D88" : "\u8BBE\u4E3A"} ${referenceTarget} \u53C2\u8003 ${version.targetId}`, title: "\u63D0\u793A Agent \u6838\u5BF9\uFF1B\u5199\u8FDB\u300C\u8F93\u5165\u53C2\u8003\u56FE\u300D\u540E\u624D\u4F1A\u9001\u8FDB\u751F\u4EA7", onClick: () => {
              toggleReference(version.id);
            }, children: selected ? "\u5DF2\u8BBE\u8865\u5145\u53C2\u8003" : "\u8BBE\u4E3A\u8865\u5145\u53C2\u8003" })
          ] })
        ] }, version.id);
      }) })
    ] })
  ] });
}
function TaskBoard({ jobs, queue, sessionRunning, onCancel, onRemoveQueued }) {
  let activeJobId = activeProductionJobId(jobs, queue, sessionRunning);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "oh-story-task-board", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-projection-note", children: "\u56FE\u7247\u3001\u89C6\u9891\u3001\u8BED\u97F3\u3001\u97F3\u4E50\u90FD\u5148\u9884\u68C0\u3001\u540E\u786E\u8BA4\u3002\u8FD9\u91CC\u8DDF\u8E2A\u56FE\u7247\u3001\u89C6\u9891\u4E0E\u6210\u7247\u4EFB\u52A1\uFF1B\u8BED\u97F3\u548C\u97F3\u4E50\u5728 Chat \u91CC\u5B8C\u6210\uFF0C\u7ED3\u679C\u76F4\u63A5\u843D\u5728\u5236\u4F5C\u6210\u679C\u76EE\u5F55\u3002\u4F9B\u5E94\u5546\u89C1\u4E0A\u65B9\u300C\u751F\u6210\u73AF\u5883\u300D\uFF0C\u5B9E\u9645\u8D26\u53F7\u3001\u6A21\u578B\u4E0E\u53EF\u7528\u6027\u7531\u5F53\u524D DSH \u8FD0\u884C\u73AF\u5883\u51B3\u5B9A\u3002" }),
    jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-production-empty", children: "\u8FD8\u6CA1\u6709\u751F\u4EA7\u4EFB\u52A1\u3002\u53EF\u4ECE\u955C\u5934\u6216\u7D20\u6750\u9875\u63D0\u4EA4\u5355\u4E2A\u6216\u6279\u91CF\u4EFB\u52A1\u3002" }) : [...jobs].reverse().map((job) => {
      let queued = queuedItemForJob(job.id, queue), displayStatus = queued === void 0 ? STATUS_LABELS[job.status] : "DSH Queue";
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("article", { "data-job-id": job.id, "data-status": job.status, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { title: job.targetId, children: job.targetId }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: JOB_KIND_LABEL[job.kind] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: displayStatus })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-task-progress", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { style: { width: `${String(job.progress)}%` } }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: "\u67E5\u770B\u6295\u4EA7\u63D0\u793A\u8BCD" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: job.prompt })
        ] }),
        job.expectedOutputs > 1 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("small", { children: [
          job.completedOutputs,
          "/",
          job.expectedOutputs,
          " \u9879\u6210\u679C"
        ] }),
        job.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-error", children: job.error }),
        job.output !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MediaPreview, { version: job.output }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("footer", { children: [
          queued !== void 0 && (job.status === "awaiting_confirmation" || job.status === "pending" || job.status === "running") && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
            onRemoveQueued(job, queued.id);
          }, children: "\u4ECE DSH Queue \u79FB\u9664" }),
          activeJobId === job.id && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
            onCancel(job);
          }, children: "\u505C\u6B62\u5F53\u524D DSH Turn" })
        ] })
      ] }, job.id);
    })
  ] });
}
function SequenceBoard(props) {
  let composing = compositionInFlight(props.jobs), issues = sequenceIssues(props.sequence, props.versions), versionById = new Map(props.versions.map((version) => [version.id, version])), move = (index, delta) => {
    let source = props.sequence[index], target = props.sequence[index + delta];
    source !== void 0 && target !== void 0 && props.onSequenceChange(reorderSequence(props.sequence, index, index + delta));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "oh-story-sequence", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-sequence-summary", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("strong", { children: [
        props.sequence.length,
        " \u4E2A\u955C\u5934"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: props.sequence.length === 0 ? "\u8FD8\u6CA1\u6709\u955C\u5934" : composing ? "\u6210\u7247\u4EFB\u52A1\u8FDB\u884C\u4E2D" : issues.length === 0 ? "\u5DF2\u53EF\u5408\u6210" : `${String(issues.length)} \u4E2A\u963B\u585E\u9879` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled: composing || issues.length > 0 || props.sequence.length < 2, onClick: props.onCompose, children: "\u5408\u6210\u6210\u7247" })
    ] }),
    issues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("ul", { className: "oh-story-sequence-issues", children: [
      issues.slice(0, 3).map((issue) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("li", { children: issue }, issue)),
      issues.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
        "\u53E6\u6709 ",
        issues.length - 3,
        " \u4E2A\u963B\u585E\u9879\uFF0C\u8BF7\u5728\u4E0B\u65B9\u955C\u5934\u884C\u8865\u9F50\u89C6\u9891\u3002"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ol", { children: props.sequence.map((item, index) => {
      let version = item.versionId === void 0 ? void 0 : versionById.get(item.versionId);
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: String(index + 1).padStart(2, "0") }),
        version === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-sequence-missing", children: "\u7F3A\u5C11\u89C6\u9891" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MediaPreview, { version, interactive: !1 }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: item.shotId }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", "aria-label": `\u4E0A\u79FB ${item.shotId}`, disabled: index === 0, onClick: () => {
            move(index, -1);
          }, children: "\u2191" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", "aria-label": `\u4E0B\u79FB ${item.shotId}`, disabled: index === props.sequence.length - 1, onClick: () => {
            move(index, 1);
          }, children: "\u2193" })
        ] })
      ] }, item.shotId);
    }) })
  ] });
}
function ProductionCanvas(props) {
  let nodes = (0, import_react.useMemo)(() => {
    let assets = [...props.production.assets, ...props.production.visualAssets].map((asset, index) => ({ id: asset.id, label: asset.title, type: "asset", initial: { x: 80, y: 80 + index * 150 } })), shots = props.production.shots.map((shot, index) => ({ id: shot.id, label: shot.title, type: "shot", initial: { x: 640, y: 80 + index * 180 } }));
    return [...assets, ...shots];
  }, [props.production.assets, props.production.shots, props.production.visualAssets]), positions = Object.fromEntries(nodes.map((node) => [node.id, props.canvas[node.id] ?? node.initial])), startDrag = (event, id) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    let origin = positions[id] ?? { x: 0, y: 0 }, start = { x: event.clientX, y: event.clientY }, move = (moveEvent) => {
      props.onCanvasChange({ ...props.canvas, [id]: { x: origin.x + (moveEvent.clientX - start.x) / props.zoom, y: origin.y + (moveEvent.clientY - start.y) / props.zoom } });
    }, end = () => {
      globalThis.removeEventListener("pointermove", move), globalThis.removeEventListener("pointerup", end);
    };
    globalThis.addEventListener("pointermove", move), globalThis.addEventListener("pointerup", end);
  }, moveNode = (id, x, y) => {
    let origin = positions[id] ?? { x: 0, y: 0 };
    props.onCanvasChange({ ...props.canvas, [id]: { x: origin.x + x, y: origin.y + y } });
  }, connections = props.production.shots.flatMap((shot) => shot.references.map((reference) => [reference, shot.id]));
  return nodes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("section", { className: "oh-story-canvas-shell", "aria-label": "\u77ED\u5267\u7D20\u6750\u4E0E\u955C\u5934\u5173\u7CFB\u753B\u5E03", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MissingDocument, { document: `${props.production.episodeDirectory}/\u5206\u955C.md`, documentPaths: props.production.documentPaths, what: "\u5173\u7CFB", skill: "/short-drama-storyboard", onNavigate: props.onNavigate }) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "oh-story-canvas-shell", "aria-label": "\u77ED\u5267\u7D20\u6750\u4E0E\u955C\u5934\u5173\u7CFB\u753B\u5E03", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-projection-note", children: "\u6587\u6863\u5173\u7CFB \xB7 \u5E03\u5C40\u4EC5\u4FDD\u5B58\u5728\u5F53\u524D DSH Session" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-canvas-controls", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", "aria-label": "\u7F29\u5C0F\u753B\u5E03", onClick: () => {
        props.onZoomChange(Math.max(0.5, props.zoom - 0.1));
      }, children: "\u2212" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
        Math.round(props.zoom * 100),
        "%"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", "aria-label": "\u653E\u5927\u753B\u5E03", onClick: () => {
        props.onZoomChange(Math.min(1.8, props.zoom + 0.1));
      }, children: "\uFF0B" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
        props.onCanvasChange({}), props.onZoomChange(0.65);
      }, children: "\u590D\u4F4D" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-canvas-viewport", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-canvas", style: { transform: `scale(${String(props.zoom)})` }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { "aria-hidden": "true", children: connections.map(([from, to]) => {
        let a = positions[from], b = positions[to];
        return a === void 0 || b === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { "data-active": to === props.selectedId || void 0, d: `M ${String(a.x + 180)} ${String(a.y + 50)} C ${String(a.x + 360)} ${String(a.y + 50)}, ${String(b.x - 180)} ${String(b.y + 50)}, ${String(b.x)} ${String(b.y + 50)}` }, `${from}:${to}`);
      }) }),
      nodes.map((node) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("article", { tabIndex: 0, "aria-label": `${node.type === "asset" ? "\u7D20\u6750" : "\u955C\u5934"} ${node.label}`, "data-node-type": node.type, "data-selected": node.id === props.selectedId || void 0, style: { left: positions[node.id]?.x, top: positions[node.id]?.y }, onKeyDown: (event) => {
        let step = event.shiftKey ? 40 : 10, delta = event.key === "ArrowLeft" ? [-step, 0] : event.key === "ArrowRight" ? [step, 0] : event.key === "ArrowUp" ? [0, -step] : event.key === "ArrowDown" ? [0, step] : void 0;
        delta !== void 0 && (event.preventDefault(), moveNode(node.id, delta[0], delta[1]));
      }, onPointerDown: (event) => {
        startDrag(event, node.id);
      }, onDoubleClick: () => {
        let target = props.production.targets.get(node.id);
        target !== void 0 && props.onNavigate(target);
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("small", { children: node.type === "asset" ? "\u7D20\u6750" : "\u955C\u5934" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: node.label }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: node.id })
      ] }, node.id))
    ] }) })
  ] });
}
function useScrollIntoView(selectedId) {
  let ref = (0, import_react.useRef)(null);
  return (0, import_react.useEffect)(() => {
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId]), ref;
}
function ReadinessBadge({ label, ready }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { "data-ready": ready, "aria-label": `${label}${ready ? "\u5DF2\u5907" : "\u5F85\u8865"}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { "aria-hidden": "true", children: ready ? "\u2713" : "\u2014" }),
    label
  ] });
}
function MissingDocument({ document, documentPaths, what, skill, onNavigate }) {
  let present = documentPaths.includes(document);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "oh-story-production-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("strong", { children: [
      "\u8FD8\u6CA1\u6709\u53EF\u6295\u5F71\u7684",
      what,
      "\u3002"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: present ? `${document} \u5DF2\u5B58\u5728\uFF0C\u4F46\u6CA1\u6709\u89E3\u6790\u51FA\u6761\u76EE\u3002\u8BF7\u68C0\u67E5\u4E8C\u7EA7\u6807\u9898\u662F\u5426\u4E3A\u7A33\u5B9A\u7684 ID \u5F62\u5F0F\u3002` : `\u672C\u96C6\u8FD8\u6CA1\u6709 ${document}\u3002\u5728\u53F3\u4FA7 Chat \u7528 ${skill} \u5199\u597D\u8FD9\u4EFD\u6587\u6863\u540E\uFF0C\u8FD9\u91CC\u4F1A\u81EA\u52A8\u51FA\u73B0\u3002` }),
    present && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", onClick: () => {
      onNavigate({ path: document, offset: 0, id: document });
    }, children: [
      "\u6253\u5F00 ",
      document.split("/").at(-1)
    ] })
  ] });
}
function ReferenceButton({ id, production, onNavigate }) {
  let target = production.targets.get(id);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled: target === void 0, onClick: (event) => {
    event.stopPropagation(), target !== void 0 && onNavigate(target);
  }, children: id });
}
function MediaPreview({ version, interactive = !0 }) {
  return version.kind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { className: "oh-story-media-preview", src: version.url, alt: version.targetId, loading: "lazy" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("video", { className: "oh-story-media-preview", src: version.url, controls: interactive, muted: !interactive, preload: "metadata" });
}
function VersionStrip({ targetId, versions, selections, onSelectionsChange }) {
  let selected = selectedVersionForTarget(targetId, versions, selections)?.id;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oh-story-version-strip", "aria-label": `${targetId} \u6210\u679C\u7248\u672C`, children: versions.map((version, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", "aria-pressed": version.id === selected, "aria-label": `\u9009\u62E9 ${targetId} \u7248\u672C ${String(index + 1)}`, "data-selected": version.id === selected || void 0, onClick: (event) => {
    event.stopPropagation(), onSelectionsChange({ ...selections, [targetId]: version.id });
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MediaPreview, { version, interactive: !1 }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
      "V",
      String(index + 1)
    ] })
  ] }, version.id)) });
}

// src/production-intent.ts
var OH_STORY_PRODUCTION_TOOL_NAME = "oh_story_production";
function requiredText(value, field) {
  let normalized = value?.trim();
  if (!normalized) throw new Error(`oh_story_production ${field} is required for this action.`);
  if (normalized.length > 512) throw new Error(`oh_story_production ${field} is too long.`);
  return normalized;
}
function validateProductionIntent(args) {
  let episode = args.episode.trim().replaceAll("\\", "/").replace(/\/$/u, "");
  if (!/^剧集\/EP\d{3,}$/u.test(episode))
    throw new Error("oh_story_production episode must use the creator path form \u5267\u96C6/EP001.");
  if (args.action === "open_section") {
    if (args.section === void 0) throw new Error("oh_story_production section is required for open_section.");
    return { action: args.action, episode, section: args.section };
  }
  if (args.action === "focus_target")
    return { action: args.action, episode, targetId: requiredText(args.targetId, "targetId"), section: args.section };
  if (args.action === "set_sequence") {
    let shotIds = args.shotIds?.map((value) => value.trim()).filter((value) => value !== "") ?? [];
    if (shotIds.length === 0) throw new Error("oh_story_production shotIds must contain at least one shot for set_sequence.");
    if (shotIds.length > 500 || new Set(shotIds).size !== shotIds.length || shotIds.some((value) => !/^SHOT-[A-Z0-9-]+$/u.test(value)))
      throw new Error("oh_story_production shotIds must be unique canonical SHOT-* identifiers.");
    return { action: args.action, episode, shotIds };
  }
  let expectedOutputs = args.expectedOutputs;
  if (expectedOutputs !== void 0 && (!Number.isInteger(expectedOutputs) || expectedOutputs < 1 || expectedOutputs > 500))
    throw new Error("oh_story_production expectedOutputs must be an integer between 1 and 500.");
  if (args.jobKind === void 0) throw new Error("oh_story_production jobKind is required for track_job.");
  let prompt = args.prompt?.trim();
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

// src/client/production-intents.ts
function parsedIntent(block) {
  if (!(!("kind" in block) || block.isError || block.call?.name !== OH_STORY_PRODUCTION_TOOL_NAME))
    try {
      let args = JSON.parse(block.call.argsRaw);
      return { callId: block.callId, intent: validateProductionIntent(args) };
    } catch {
      return;
    }
}
function visit(block, output) {
  let direct = parsedIntent(block);
  direct !== void 0 && output.push(direct);
  for (let child of block.subCalls) visit(child, output);
}
function settledProductionIntents(chat) {
  let output = [];
  for (let key of chat.order) {
    let node = chat.nodes.get(key);
    if (node?.kind !== "tool-call") continue;
    let root = node.data.root;
    root !== void 0 && visit(root, output);
  }
  return output;
}

// src/client/video-studio.tsx
var import_react2 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function preferredPreview(project) {
  return project.previews.find((item) => item.role === "final") ?? project.previews.find((item) => item.role === "edited") ?? project.previews.find((item) => item.role === "source");
}
function readableBytes(bytes) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : bytes < 1024 * 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function ActionIcon({ name: name2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { "aria-hidden": !0, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: {
    reload: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M20 11a8 8 0 1 0-2.34 5.66" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M20 4v7h-7" })
    ] }),
    fullscreen: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_jsx_runtime4.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" }) }),
    external: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M14 3h7v7M21 3l-9 9" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" })
    ] })
  }[name2] });
}
function preferredArtifact(project) {
  return project.artifacts.find((item) => item.path.endsWith("final_qc.json")) ?? project.artifacts.find((item) => item.path.endsWith("assembly_qc.json")) ?? project.artifacts.find((item) => item.kind === "quality") ?? project.artifacts.at(-1);
}
function artifactKindLabel(kind) {
  return { plan: "\u65B9\u6848", script: "\u6587\u7A3F", subtitle: "\u5B57\u5E55", quality: "\u8D28\u68C0", manifest: "\u6E05\u5355" }[kind];
}
function VideoPreview({ project, sessionId, running }) {
  let shellRef = (0, import_react2.useRef)(null), initial = preferredPreview(project), [role, setRole] = (0, import_react2.useState)(initial?.role), selected = project.previews.find((item) => item.role === role) ?? preferredPreview(project), [loaded, setLoaded] = (0, import_react2.useState)(initial), [revision, setRevision] = (0, import_react2.useState)(0), [ready, setReady] = (0, import_react2.useState)(!1), [error, setError] = (0, import_react2.useState)(!1);
  if (selected === void 0 || loaded === void 0) return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-preview-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { "aria-hidden": !0, children: "\u25B6" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: "\u8FD8\u6CA1\u6709\u53EF\u9884\u89C8\u7684\u89C6\u9891" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { children: [
      "\u628A\u539F\u7247\u5BFC\u5165 ",
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("code", { children: "video-recaps/<\u9879\u76EE>/sources/" }),
      "\uFF0C\u7136\u540E\u5728\u53F3\u4FA7 Chat \u4F7F\u7528 ",
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("code", { children: "/video-recap" }),
      "\u3002\u526A\u540E\u7247\u548C\u6700\u7EC8\u6210\u7247\u4F1A\u81EA\u52A8\u51FA\u73B0\u5728\u8FD9\u91CC\u3002"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-prompt-example", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u63CF\u8FF0\u793A\u4F8B" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("q", { children: "\u628A\u8FD9\u6BB5\u89C6\u9891\u505A\u6210 3 \u5206\u949F\u4E2D\u6587\u89E3\u8BF4\uFF0C\u4FDD\u7559\u5173\u952E\u539F\u58F0\uFF0C\u5B57\u5E55\u70E7\u8FDB\u753B\u9762\u3002" })
    ] })
  ] });
  let pending = selected.path !== loaded.path || selected.version !== loaded.version, load = (asset) => {
    setRole(asset.role), setLoaded(asset), setReady(!1), setError(!1), setRevision((value) => value + 1);
  }, runtimeState = error ? "\u89C6\u9891\u8F7D\u5165\u5931\u8D25 \xB7 \u53EF\u91CD\u65B0\u8F7D\u5165" : running ? "Agent \u6B63\u5728\u66F4\u65B0\u9879\u76EE \xB7 \u5F53\u524D\u64AD\u653E\u4FDD\u6301\u4E0D\u53D8" : pending ? "\u65B0\u7248\u672C\u5DF2\u5C31\u7EEA \xB7 \u7531\u4F60\u51B3\u5B9A\u4F55\u65F6\u8F7D\u5165" : ready ? `${loaded.label}\u5DF2\u8F7D\u5165 \xB7 ${readableBytes(loaded.bytes)}` : "\u6B63\u5728\u8BFB\u53D6\u89C6\u9891\u4FE1\u606F\u2026", mediaUrl = `${endpoint("media", sessionId, loaded.path)}&version=${encodeURIComponent(loaded.version)}&reload=${String(revision)}`;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { ref: shellRef, className: "oh-video-preview-shell", "data-state": error ? "error" : running ? "building" : ready ? "ready" : "loading", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-stagebar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-video-version-tabs", role: "tablist", "aria-label": "\u9884\u89C8\u7248\u672C", children: project.previews.map((asset) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": asset.role === selected.role,
          tabIndex: asset.role === selected.role ? 0 : -1,
          onKeyDown: (event) => {
            handleTabKey(event, project.previews.map((item) => item.role), selected.role, (next) => {
              let asset2 = project.previews.find((item) => item.role === next);
              asset2 !== void 0 && load(asset2);
            });
          },
          onClick: () => {
            load(asset);
          },
          children: asset.label
        },
        asset.role
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "oh-video-runtime-state", role: "status", "aria-live": "polite", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { "aria-hidden": !0 }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("em", { children: runtimeState })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-preview-actions", children: [
        pending && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", onClick: () => {
          load(selected);
        }, children: "\u8F7D\u5165\u65B0\u7248\u672C" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", title: "\u91CD\u65B0\u8F7D\u5165", "aria-label": "\u91CD\u65B0\u8F7D\u5165\u89C6\u9891", onClick: () => {
          load(loaded);
        }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ActionIcon, { name: "reload" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", title: "\u5168\u5C4F", "aria-label": "\u5168\u5C4F\u9884\u89C8", onClick: () => {
          shellRef.current?.requestFullscreen();
        }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ActionIcon, { name: "fullscreen" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("a", { href: mediaUrl, target: "_blank", rel: "noreferrer", title: "\u5728\u65B0\u7A97\u53E3\u6253\u5F00", "aria-label": "\u5728\u65B0\u7A97\u53E3\u6253\u5F00\u89C6\u9891", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ActionIcon, { name: "external" }) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-video-player-stage", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "video",
      {
        src: mediaUrl,
        controls: !0,
        preload: "metadata",
        playsInline: !0,
        onLoadedMetadata: () => {
          setReady(!0), setError(!1);
        },
        onError: () => {
          setError(!0), setReady(!1);
        }
      },
      `${loaded.path}:${loaded.version}:${String(revision)}`
    ) })
  ] });
}
function VideoArtifacts({ project, sessionId }) {
  let [selected, setSelected] = (0, import_react2.useState)(preferredArtifact(project)?.path), [content, setContent] = (0, import_react2.useState)(), [error, setError] = (0, import_react2.useState)(), [preflight, setPreflight] = (0, import_react2.useState)();
  (0, import_react2.useEffect)(() => {
    setSelected(preferredArtifact(project)?.path);
  }, [project.id]), (0, import_react2.useEffect)(() => {
    if (selected === void 0) {
      setContent(void 0);
      return;
    }
    let controller = new AbortController();
    return setContent(void 0), setError(void 0), fetch(endpoint("file", sessionId, selected), { signal: controller.signal }).then(async (response) => {
      let payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${String(response.status)}`);
      setContent(payload.content);
    }).catch((reason) => {
      controller.signal.aborted || setError(reason instanceof Error ? reason.message : String(reason));
    }), () => {
      controller.abort();
    };
  }, [selected, sessionId]);
  let selectedArtifact = project.artifacts.find((item) => item.path === selected);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-artifacts", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("aside", { "aria-label": "\u89C6\u9891\u9879\u76EE\u4EA7\u7269", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-artifacts-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: "\u9879\u76EE\u4EA7\u7269" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: project.artifacts.length })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-environment", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: "\u8FD0\u884C\u73AF\u5883" }),
        typeof preflight == "object" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { "data-ready": preflight.python.ok || void 0, children: [
            "Python ",
            preflight.python.version ?? "\u672A\u627E\u5230"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { "data-ready": preflight.ffmpeg.ok && preflight.ffmpeg.subtitles || void 0, children: [
            "ffmpeg ",
            preflight.ffmpeg.subtitles ? "\xB7 libass" : "\xB7 \u7F3A\u5B57\u5E55\u6EE4\u955C"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { "data-ready": preflight.ffprobe.ok || void 0, children: [
            "ffprobe ",
            preflight.ffprobe.ok ? "\u53EF\u7528" : "\u672A\u627E\u5230"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { "data-ready": preflight.credentials.mimo || void 0, children: [
            "MiMo Key ",
            preflight.credentials.mimo ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E"
          ] }),
          preflight.credentials.ttsProvider === "fish" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { "data-ready": preflight.credentials.fish || void 0, children: [
            "Fish Key ",
            preflight.credentials.fish ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("em", { children: [
            "DSH Host \u8FDB\u7A0B\u73AF\u5883\uFF1BAgent \u6267\u884C\u4E16\u754C\u4EE5 ",
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("code", { children: "video-recap --doctor" }),
            " \u4E3A\u51C6\u3002"
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", onClick: () => {
          fetch(endpoint("video-preflight", sessionId)).then(async (response) => {
            if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
            setPreflight(await response.json());
          }).catch(() => {
            setPreflight("failed");
          });
        }, children: preflight === "failed" ? "\u73AF\u5883\u68C0\u67E5\u5931\u8D25 \xB7 \u91CD\u8BD5" : "\u68C0\u67E5\u73AF\u5883" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("nav", { children: [
        project.artifacts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { children: "\u6D41\u6C34\u7EBF\u542F\u52A8\u540E\uFF0C\u5173\u952E\u4EA7\u7269\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002" }),
        project.artifacts.map((artifact) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "button",
          {
            type: "button",
            "aria-current": artifact.path === selected ? "page" : void 0,
            onClick: () => {
              setSelected(artifact.path);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: artifact.label }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("small", { children: artifact.path.split("/").at(-1) })
            ]
          },
          artifact.path
        ))
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { children: [
      selectedArtifact !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("header", { className: "oh-video-artifact-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: selectedArtifact.label }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: selectedArtifact.path.split("/").at(-1) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("em", { children: artifactKindLabel(selectedArtifact.kind) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-video-artifact-content", children: project.artifacts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-video-artifacts-empty", children: "\u6545\u4E8B\u65B9\u6848\u3001\u89E3\u8BF4\u8BCD\u3001\u5B57\u5E55\u548C\u8D28\u68C0\u62A5\u544A\u4F1A\u6309\u4E0A\u6E38\u6D41\u6C34\u7EBF\u5199\u5165\u8FD9\u91CC\u3002" }) : error !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-story-error", children: error }) : content === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-video-artifacts-empty", children: "\u6B63\u5728\u8F7D\u5165\u4EA7\u7269\u2026" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("pre", { children: content }) })
    ] })
  ] });
}
function VideoStudio({
  sessionId,
  projects,
  running,
  projectId,
  tab,
  hidden,
  workbenches,
  paneId,
  labelledBy,
  onProject,
  onTab,
  onWorkbench,
  onCollapse
}) {
  let project = projects.find((item) => item.id === projectId) ?? projects[0], tabsId = (0, import_react2.useId)();
  (0, import_react2.useEffect)(() => {
    project !== void 0 && project.id !== projectId && onProject(project.id);
  }, [onProject, project, projectId]);
  let tabs = ["preview", "artifacts"];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("main", { id: paneId, className: "oh-video-studio", role: "tabpanel", "aria-labelledby": labelledBy, hidden, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("header", { className: "oh-video-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-workbench-cluster", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-video-mode-tabs", role: "tablist", "aria-label": "\u521B\u4F5C\u5DE5\u4F5C\u53F0", children: workbenches.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": mode === "video",
            tabIndex: mode === "video" ? 0 : -1,
            onKeyDown: (event) => {
              handleTabKey(event, workbenches, "video", onWorkbench);
            },
            onClick: () => {
              onWorkbench(mode);
            },
            children: workbenchLabel(mode)
          },
          mode
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { className: "oh-workbench-collapse", type: "button", title: "\u6536\u8D77\u521B\u4F5C\u5DE5\u4F5C\u53F0", "aria-label": "\u6536\u8D77\u521B\u4F5C\u5DE5\u4F5C\u53F0", onClick: onCollapse, children: "\xD7" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "oh-video-project", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u89C6\u9891\u9879\u76EE" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("select", { "aria-label": "\u89C6\u9891\u9879\u76EE", value: project?.id ?? "", disabled: project === void 0, onChange: (event) => {
          onProject(event.target.value);
        }, children: projects.map((item) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: item.id, children: item.title }, item.id)) })
      ] }),
      project !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "oh-video-stage", "data-state": project.state, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { "aria-hidden": !0 }),
        project.stageLabel
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "oh-video-tabs", role: "tablist", "aria-label": "\u89C6\u9891\u5DE5\u4F5C\u53F0", children: tabs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          role: "tab",
          id: `${tabsId}-${item}-tab`,
          "aria-controls": `${tabsId}-${item}-panel`,
          "aria-selected": tab === item,
          tabIndex: tab === item ? 0 : -1,
          onKeyDown: (event) => {
            handleTabKey(event, tabs, tab, onTab);
          },
          onClick: () => {
            onTab(item);
          },
          children: item === "preview" ? "\u9884\u89C8" : "\u4EA7\u7269"
        },
        item
      )) })
    ] }),
    project === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-preview-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { "aria-hidden": !0, children: "\u25B6" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: "\u8FD8\u6CA1\u6709\u89C6\u9891\u9879\u76EE" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { children: [
        "\u5728\u53F3\u4FA7 Chat \u544A\u8BC9 Agent \u8981\u5904\u7406\u7684\u89C6\u9891\uFF1B\u9879\u76EE\u4F1A\u521B\u5EFA\u5728 ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("code", { children: "video-recaps/<\u9879\u76EE>/" }),
        "\u3002"
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "oh-video-panels", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { role: "tabpanel", id: `${tabsId}-preview-panel`, "aria-labelledby": `${tabsId}-preview-tab`, hidden: tab !== "preview", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(VideoPreview, { project, sessionId, running }, project.id) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { role: "tabpanel", id: `${tabsId}-artifacts-panel`, "aria-labelledby": `${tabsId}-artifacts-tab`, hidden: tab !== "artifacts", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(VideoArtifacts, { project, sessionId }) })
    ] })
  ] });
}

// src/client/workbench-presence.ts
function hasCreativeProject(workspace) {
  return workspace === void 0 ? !1 : workspace.files.length > 0 || workspace.videos.length > 0 || workspace.games.some((game) => game.source === "workspace");
}
function resolveWorkbenchOpen(preference, creativeProject) {
  return preference === void 0 ? creativeProject : preference === "open";
}
function workbenchPreferenceKey(cwd) {
  return `oh-story.workbench.${cwd}`;
}
function readWorkbenchPreference(storage, cwd) {
  if (storage === void 0 || cwd === void 0) return;
  let value;
  try {
    value = storage.getItem(workbenchPreferenceKey(cwd));
  } catch {
    return;
  }
  return value === "open" || value === "closed" ? value : void 0;
}
function writeWorkbenchPreference(storage, cwd, preference) {
  if (!(storage === void 0 || cwd === void 0))
    try {
      storage.setItem(workbenchPreferenceKey(cwd), preference);
    } catch {
    }
}
function workbenchPreferenceStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return;
  }
}

// inline-css:/home/runner/work/oh-story-dsh/oh-story-dsh/packages/dsh-plugin/src/client/plugin.css
var plugin_default = `.oh-story-bridge-marker { display: none; }
.oh-story-welcome {
  box-sizing: border-box;
  order: -1;
  flex-shrink: 0;
  width: min(640px, calc(100% - 32px));
  margin: 24px auto;
  padding: 20px 24px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font: 14px/1.7 var(--dsw-font-family);
  overflow-wrap: anywhere;
}
.oh-story-welcome h2 { margin: 0 0 8px; font-size: 20px; }
.oh-story-welcome p { margin: 8px 0 0; }
.oh-story-welcome ol { margin: 12px 0; padding-left: 24px; }
.oh-story-split-surface { display: contents; font-family: var(--dsw-font-family); }

/* Collapsed, the plugin owns nothing but this control: DSH renders the
   conversation exactly as it does without the plugin installed. The launcher is
   fixed to the conversation column's own corner, which the bridge publishes,
   because the surrounding shell is not ours to place things in. */
.oh-story-launcher {
  box-sizing: border-box;
  display: flex;
  position: fixed;
  z-index: 9;
  top: calc(var(--oh-story-seam-top, 0px) + 10px);
  right: calc(var(--oh-story-seam-right, 0px) + 14px);
  min-height: 28px;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-base);
  padding: 3px 11px;
  cursor: pointer;
  font-family: var(--dsw-font-family);
  font-size: 12px;
  line-height: 20px;
}
.oh-story-launcher b { font-weight: 500; }
.oh-story-launcher:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.oh-story-launcher:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }

/* DSH documents every [data-slot] wrapper as a stable addressable styling
   seam. The official Session body and composer stay mounted; this only turns
   their scroll host into a three-column writing surface. */
[data-conversation-scroll]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) {
  --os-border: var(--dsw-alias-border-l2);
  --os-muted: var(--dsw-alias-label-secondary);
  display: grid;
  grid-template-columns: clamp(184px, 16%, 200px) minmax(240px, 1fr) clamp(408px, 40%, 520px);
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  scrollbar-gutter: stable;
  scroll-padding-bottom: calc(max(var(--dsh-composer-height, 152px), var(--oh-story-composer-height, 0px)) + 16px);
}

/* Keep the final Chat flow above the overlapping official Composer. */
[data-conversation-scroll]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"])
  > [data-slot="conversation.session"] > :not(.oh-story-split-surface) {
  grid-column: 3;
  grid-row: 1;
  min-width: 0;
  min-height: 100%;
  border-left: 1px solid var(--os-border);
}

/* DSH 0.1.7 nests a data-chat-flow inside every step-process group; only the top-level flow needs room. */
[data-conversation-scroll]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"])
  [data-chat-flow]:not([data-step-process-content]) {
  padding-bottom: calc(max(var(--dsh-composer-height, 152px), var(--oh-story-composer-height, 0px)) + 16px);
}

[data-conversation-scroll]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"])
  > [data-composer-seat] {
  grid-column: 3;
  grid-row: 1;
  align-self: start;
  min-width: 0;
  width: 100%;
  position: sticky;
  top: calc(var(--oh-story-scroll-height, 720px) - max(var(--dsh-composer-height, 152px), var(--oh-story-composer-height, 0px)));
  bottom: auto;
}

/* Game mode keeps the official Conversation on the right but merges the two
   creator columns into one playable Studio. */
[data-conversation-scroll][data-oh-story-workbench="game"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) {
  --game-stage: #0d100e;
  --game-stage-raised: #161a17;
  --game-accent: var(--dsw-alias-state-business-primary);
  --game-warning: #f4bd55;
  --game-danger: #f06b63;
  grid-template-columns: minmax(0, 1fr) clamp(400px, 34%, 520px);
  overflow: hidden;
}

[data-conversation-scroll][data-oh-story-workbench="game"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"])
  > [data-slot="conversation.session"] > :not(.oh-story-split-surface),
[data-conversation-scroll][data-oh-story-workbench="game"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"])
  > [data-composer-seat] { grid-column: 2; }

/* DSH 0.1.2 lays two 40px column-resize strips (z-index 8) over the whole
   conversation area. The workbench replaces that column geometry, so the strip
   no longer marks a real column seam here \u2014 it just swallows clicks on the
   right edge of the file tree. The creator panes take the clicks back. */
.oh-story-tree,
.oh-story-editor {
  box-sizing: border-box;
  grid-row: 1;
  position: sticky;
  z-index: 9;
  top: 0;
  align-self: start;
  min-width: 0;
  min-height: 0;
  height: 100%;
  color: inherit;
  background: var(--dsw-alias-bg-base);
}

.oh-game-studio {
  box-sizing: border-box;
  display: flex;
  grid-column: 1;
  grid-row: 1;
  position: sticky;
  z-index: 9;
  top: 0;
  min-width: 0;
  min-height: 0;
  height: 100%;
  align-self: start;
  overflow: hidden;
  flex-direction: column;
  border-right: 1px solid var(--os-border);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
}
.oh-game-studio[hidden] { display: none; }

.oh-game-toolbar {
  box-sizing: border-box;
  display: grid;
  min-height: 56px;
  flex: none;
  grid-template-columns: auto minmax(160px, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--os-border);
  background: var(--dsw-alias-bg-base);
}

.oh-game-mode-tabs {
  display: flex;
  margin-right: 2px;
  padding-right: 9px;
  border-right: 1px solid var(--os-border);
}
.oh-game-mode-tabs button {
  min-width: 42px;
  min-height: 36px;
  border: 0;
  border-radius: 5px;
  color: var(--os-muted);
  background: transparent;
  padding: 4px 7px;
  cursor: pointer;
  white-space: nowrap;
  font: 11px/1 var(--dsw-font-family);
}
.oh-game-mode-tabs button:hover { color: var(--dsw-alias-label-primary); }
.oh-game-mode-tabs button[aria-selected="true"] { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-button-ghost-active-fill); font-weight: 500; }

.oh-game-project { display: flex; min-width: 0; align-items: center; gap: 7px; color: var(--os-muted); font-size: 11px; }
.oh-game-project > span { flex: none; }
.oh-game-project select,
.oh-game-design select {
  min-width: 0;
  border: 1px solid var(--os-border);
  border-radius: 8px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  padding: 6px 28px 6px 9px;
  font: inherit;
}
.oh-game-project select { max-width: 360px; min-height: 36px; flex: 1; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.oh-game-design select { min-height: 36px; }
.oh-game-project select:focus-visible,
.oh-game-design select:focus-visible,
.oh-game-mode-tabs button:focus-visible,
.oh-game-tabs button:focus-visible,
.oh-game-preview-status button:focus-visible,
.oh-game-mobile-switcher button:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }

.oh-game-tabs,
.oh-game-mobile-switcher {
  display: flex;
  padding: 2px;
  border: 1px solid var(--os-border);
  border-radius: 9px;
  background: var(--dsw-alias-bg-base);
}
.oh-game-tabs button,
.oh-game-mobile-switcher button {
  min-width: 56px;
  min-height: 36px;
  border: 0;
  border-radius: 6px;
  color: var(--os-muted);
  background: transparent;
  cursor: pointer;
  font: 12px/1 var(--dsw-font-family);
}
.oh-game-tabs button:hover,
.oh-game-mobile-switcher button:hover { color: var(--dsw-alias-label-primary); }
.oh-game-tabs button[aria-selected="true"],
.oh-game-mobile-switcher button[aria-selected="true"] { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-button-ghost-active-fill); box-shadow: 0 1px 2px rgb(0 0 0 / 7%); font-weight: 600; }
.oh-game-panels,
.oh-game-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  flex-direction: column;
}
.oh-game-panel[hidden] { display: none; }

.oh-game-preview-shell {
  display: grid;
  min-width: 0;
  min-height: 0;
  flex: 1;
  grid-template-rows: 40px minmax(0, 1fr);
  position: relative;
  overflow: hidden;
  border-top: 2px solid var(--game-accent);
  background-color: var(--game-stage);
}
.oh-game-preview-shell[data-state="building"] { border-top-color: var(--game-warning); animation: oh-game-build-line 1.4s linear infinite; }
.oh-game-preview-shell[data-state="error"] { border-top-color: var(--game-danger); }
.oh-game-preview-status {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 10px 0 12px;
  color: rgb(244 248 240 / 76%);
  background: var(--game-stage-raised);
  font-size: 11px;
}
.oh-game-runtime-state { display: inline-flex; overflow: hidden; min-width: 0; align-items: center; gap: 7px; text-overflow: ellipsis; white-space: nowrap; }
.oh-game-runtime-state > i { width: 6px; height: 6px; flex: none; border-radius: 50%; background: var(--dsw-alias-state-success-primary, #45b96f); }
.oh-game-preview-shell[data-state="loading"] .oh-game-runtime-state > i { background: rgb(255 255 255 / 42%); box-shadow: none; }
.oh-game-preview-shell[data-state="building"] .oh-game-runtime-state > i { background: var(--game-warning); }
.oh-game-preview-shell[data-state="error"] .oh-game-runtime-state > i { background: var(--game-danger); }
.oh-game-preview-status > div { display: flex; flex: none; gap: 6px; }
.oh-game-preview-status button {
  min-height: 36px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 6px;
  color: rgb(255 255 255 / 84%);
  background: rgb(255 255 255 / 5%);
  padding: 3px 8px;
  cursor: pointer;
  font: inherit;
}
.oh-game-preview-status button:hover { background: rgb(255 255 255 / 11%); }
.oh-game-reload { display: inline-flex; align-items: center; gap: 5px; }
.oh-game-reload b { font: inherit; font-weight: 500; }
.oh-game-preview-shell iframe { width: 100%; height: 100%; min-width: 0; min-height: 0; border: 0; background: var(--game-stage); }
.oh-game-focus-hint {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  padding: 4px 8px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 6px;
  color: rgb(255 255 255 / 62%);
  background: rgb(8 10 9 / 82%);
  pointer-events: none;
  font-size: 10px;
}
.oh-game-focus-hint[data-focused] { color: var(--game-accent); }

.oh-game-preview-empty,
.oh-game-design-empty {
  display: grid;
  max-width: 560px;
  margin: auto;
  padding: 36px;
  place-items: center;
  gap: 8px;
  color: var(--os-muted);
  text-align: center;
  line-height: 1.65;
}
.oh-game-preview-empty { width: 100%; max-width: none; min-height: 0; flex: 1; box-sizing: border-box; align-content: center; color: rgb(244 248 240 / 70%); background: var(--game-stage); }
.oh-game-preview-empty > span { color: var(--game-accent); font-size: 30px; }
.oh-game-preview-empty strong,
.oh-game-design-empty strong { color: inherit; font-size: 15px; }
.oh-game-preview-empty p,
.oh-game-design-empty p { margin: 0; }
.oh-game-preview-empty code,
.oh-game-design-empty code { font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.oh-game-prompt-example { display: grid; max-width: 560px; gap: 4px; margin-top: 8px; padding: 10px 12px; border: 1px solid rgb(255 255 255 / 12%); border-radius: 8px; text-align: left; }
.oh-game-prompt-example span { color: var(--game-accent); font-size: 10px; font-weight: 600; }
.oh-game-prompt-example q { color: rgb(244 248 240 / 72%); quotes: none; font-size: 11px; }

.oh-game-design { display: flex; min-height: 0; flex: 1; overflow: hidden; flex-direction: column; }
.oh-game-design > label { display: flex; min-height: 42px; flex: none; align-items: center; gap: 10px; padding: 0 14px; border-bottom: 1px solid var(--os-border); color: var(--os-muted); font-size: 11px; }
.oh-game-design select { max-width: min(560px, 75%); }
.oh-game-source { box-sizing: border-box; min-height: 0; flex: 1; overflow: auto; margin: 0; padding: 18px 22px 48px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-markdown-code-block); white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.65 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

.oh-game-mobile-switcher { display: none; }

@keyframes oh-game-build-line { 50% { border-top-color: var(--game-accent); } }

.oh-story-tree {
  grid-column: 1;
  overflow: auto;
  padding: 14px 10px 24px;
  border-right: 1px solid var(--os-border);
  background: var(--dsw-specific-sidebar-fill);
}

.oh-story-editor {
  display: flex;
  grid-column: 2;
  overflow: hidden;
  flex-direction: column;
}

.oh-story-brand,
.oh-story-editor header,
.oh-story-role summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.oh-story-brand { min-height: 28px; gap: 8px; padding: 0 5px 8px 7px; font-size: 14px; font-weight: 500; white-space: nowrap; }
.oh-story-brand-cluster { display: flex; min-width: 0; align-items: center; gap: 6px; }
.oh-story-brand-cluster strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: inherit; }
.oh-story-kind { flex: none; padding: 1px 6px; border-radius: 5px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-button-ghost-active-fill); font-size: 11px; line-height: 16px; font-weight: 500; }

.oh-story-brand button,
.oh-story-save,
.oh-story-role button {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-base);
  padding: 3px 9px;
  cursor: pointer;
  font: inherit;
}

.oh-story-brand button { display: grid; width: 28px; height: 28px; place-items: center; border: 0; padding: 0; background: transparent; font-size: 16px; }
.oh-story-brand button:hover,
.oh-story-save:hover:not(:disabled),
.oh-story-role button:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.oh-story-brand button:focus-visible,
.oh-story-save:focus-visible,
.oh-story-mode-tabs button:focus-visible,
.oh-story-editor-tabs button:focus-visible,
.oh-story-tree nav button:focus-visible,
.oh-story-role button:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: -2px; }
.oh-story-save:disabled { opacity: .48; cursor: default; }

.oh-story-brand-actions { display: flex; flex: none; align-items: center; gap: 2px; }

.oh-workbench-cluster { display: flex; min-width: 0; align-items: center; gap: 6px; }
.oh-workbench-collapse {
  display: grid;
  width: 28px;
  height: 28px;
  flex: none;
  place-items: center;
  border: 0;
  border-radius: 5px;
  color: var(--os-muted);
  background: transparent;
  padding: 0;
  cursor: pointer;
  font: inherit;
  font-size: 16px;
}
.oh-workbench-collapse:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.oh-workbench-collapse:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: -2px; }

.oh-story-mode-tabs { display: flex; margin: 0 4px 8px; padding: 2px; border: 1px solid var(--os-border); border-radius: 7px; background: var(--dsw-alias-bg-layer-1); }

.oh-story-mode-tabs button,
.oh-story-editor-tabs button {
  position: relative;
  min-height: 24px;
  flex: 1;
  border: 0;
  color: var(--os-muted);
  background: transparent;
  border-radius: 5px;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
}

.oh-story-mode-tabs button:hover,
.oh-story-editor-tabs button:hover { color: var(--dsw-alias-label-primary); }
.oh-story-mode-tabs button[aria-selected="true"],
.oh-story-editor-tabs button[aria-selected="true"] { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); box-shadow: 0 1px 2px rgb(0 0 0 / 8%); font-weight: 500; }

.oh-story-file-group,
.oh-story-file-folder { margin: 0; }
.oh-story-file-group > summary,
.oh-story-file-folder > summary {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 26px;
  padding: 0 7px;
  border-radius: 6px;
  color: var(--os-muted);
  cursor: pointer;
  list-style: none;
  font-size: 11px;
  font-weight: 600;
}
.oh-story-file-folder > summary { padding-left: min(calc(7px + var(--oh-story-indent, 0px)), 49px); }
.oh-story-file-group > summary { margin-top: 3px; }
.oh-story-file-group > summary::-webkit-details-marker,
.oh-story-file-folder > summary::-webkit-details-marker { display: none; }
.oh-story-file-group > summary::before,
.oh-story-file-folder > summary::before { width: 8px; content: "\u203A"; transform: rotate(0); transition: transform .12s ease; }
.oh-story-file-group[open] > summary::before,
.oh-story-file-folder[open] > summary::before { transform: rotate(90deg); }
.oh-story-file-group > summary:hover,
.oh-story-file-folder > summary:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.oh-story-file-group > summary span,
.oh-story-file-folder > summary span { margin-left: auto; color: var(--dsw-alias-label-secondary); font-weight: 400; }

.oh-story-tree nav button {
  display: block;
  width: 100%;
  overflow: hidden;
  padding: 6px 8px 6px min(calc(14px + var(--oh-story-indent, 0px)), 56px);
  border: 0;
  border-radius: 6px;
  color: inherit;
  background: transparent;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}
.oh-story-tree nav button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.oh-story-tree nav button[aria-current="page"] { background: var(--dsw-alias-button-ghost-active-fill); color: var(--dsw-alias-label-primary); }
.oh-story-tree nav button[data-agent-target] { box-shadow: inset 2px 0 var(--dsw-alias-state-business-primary); }

.oh-story-editor > header {
  min-height: 44px;
  flex: none;
  padding: 0 14px;
  border-bottom: 1px solid var(--os-border);
}

.oh-story-editor-path {
  overflow: hidden;
  min-width: 0;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--os-muted);
}
.oh-story-editor-path > span { overflow: hidden; display: block; text-overflow: ellipsis; }
.oh-story-editor-path > strong { display: none; overflow: hidden; text-overflow: ellipsis; font: inherit; }

.oh-story-editor-actions { display: flex; flex: none; align-items: center; gap: 8px; }
.oh-story-editor-tabs {
  display: flex;
  padding: 2px;
  border: 1px solid var(--os-border);
  border-radius: 7px;
  background: var(--dsw-alias-bg-layer-1);
}
.oh-story-editor-tabs button { min-height: 24px; padding: 0 9px; border-radius: 5px; font-size: 11px; }
.oh-story-save { min-height: 28px; }

.oh-story-editor textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  padding: clamp(20px, 6%, 48px) clamp(22px, 10%, 84px) 48px;
  color: var(--dsw-alias-label-primary);
  background: transparent;
  font: 16px/1.9 ui-serif, "Songti SC", "STSong", Georgia, serif;
}
.oh-story-editor textarea[data-format="structured"] {
  tab-size: 2;
  font: 13px/1.65 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.oh-story-markdown {
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: clamp(24px, 8%, 56px) clamp(24px, 10%, 92px) 64px;
  color: var(--dsw-alias-label-primary);
  font: 16px/1.85 ui-serif, "Songti SC", "STSong", Georgia, serif;
  overflow-wrap: anywhere;
}
.oh-story-markdown > :first-child { margin-top: 0; }
.oh-story-markdown > :last-child { margin-bottom: 0; }
.oh-story-markdown h1,
.oh-story-markdown h2,
.oh-story-markdown h3,
.oh-story-markdown h4,
.oh-story-markdown h5,
.oh-story-markdown h6 { margin: 1.45em 0 .6em; font-family: var(--dsw-font-family); line-height: 1.35; letter-spacing: -.01em; }
.oh-story-markdown h1 { font-size: 1.75em; }
.oh-story-markdown h2 { padding-bottom: .35em; border-bottom: 1px solid var(--os-border); font-size: 1.35em; }
.oh-story-markdown h3 { font-size: 1.15em; }
.oh-story-markdown p { margin: .75em 0; }
.oh-story-markdown ul,
.oh-story-markdown ol { margin: .75em 0; padding-left: 1.6em; }
.oh-story-markdown li { margin: .28em 0; }
.oh-story-markdown .oh-story-task-item { list-style: none; margin-left: -1.35em; }
.oh-story-task-item input { margin: 0 .55em 0 0; accent-color: var(--dsw-alias-state-business-primary); }
.oh-story-markdown blockquote { margin: 1em 0; padding: .1em 1em; border-left: 3px solid var(--dsw-alias-state-business-primary); color: var(--dsw-alias-label-secondary); }
/* DSH gives inline code its own alias; the block fill is a different surface. */
.oh-story-markdown code { padding: .15em .4em; border-radius: 4px; background: var(--dsw-alias-markdown-inline-code); font: .86em/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; }
.oh-story-markdown pre { overflow: auto; margin: 1em 0; padding: 14px 16px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-markdown-code-block); }
.oh-story-markdown pre code { padding: 0; background: transparent; }
.oh-story-markdown a { color: var(--dsw-alias-state-business-primary); text-decoration-thickness: 1px; text-underline-offset: 3px; }
.oh-story-markdown del { color: var(--os-muted); }
.oh-story-markdown-table { overflow-x: auto; margin: 1em 0; border: 1px solid var(--os-border); border-radius: 10px; }
.oh-story-markdown table { width: 100%; border-collapse: collapse; font-family: ui-sans-serif, system-ui, "PingFang SC", sans-serif; font-size: 13px; line-height: 1.55; }
.oh-story-markdown th,
.oh-story-markdown td { min-width: 96px; padding: 9px 12px; border-right: 1px solid var(--os-border); border-bottom: 1px solid var(--os-border); vertical-align: top; }
.oh-story-markdown th:last-child,
.oh-story-markdown td:last-child { border-right: 0; }
.oh-story-markdown tbody tr:last-child td { border-bottom: 0; }
.oh-story-markdown th { background: var(--dsw-alias-bg-layer-1); font-weight: 600; }
.oh-story-markdown hr { margin: 2em 0; border: 0; border-top: 1px solid var(--os-border); }
.oh-story-markdown-empty { margin: auto; color: var(--os-muted); font-size: 13px; }

.oh-story-jsonl {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  flex-direction: column;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
}
.oh-story-jsonl-summary { display: flex; min-height: 42px; flex: none; align-items: center; gap: 10px; padding: 0 18px; border-bottom: 1px solid var(--os-border); font-size: 12px; }
.oh-story-jsonl-summary strong { font-weight: 600; }
.oh-story-jsonl-summary span { color: var(--os-muted); }
.oh-story-jsonl-records { overflow: auto; padding: 14px 18px 36px; }
.oh-story-jsonl details,
.oh-story-jsonl-error { overflow: hidden; margin-bottom: 10px; border: 1px solid var(--os-border); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.oh-story-jsonl summary { display: flex; min-height: 42px; align-items: center; gap: 9px; padding: 0 12px; cursor: pointer; list-style: none; font: 12px/1.4 var(--dsw-font-family); }
.oh-story-jsonl summary::-webkit-details-marker { display: none; }
.oh-story-jsonl summary::before { content: "\u203A"; color: var(--os-muted); font-size: 16px; transition: transform .12s ease; }
.oh-story-jsonl details[open] summary::before { transform: rotate(90deg); }
.oh-story-jsonl summary > span { flex: none; color: var(--os-muted); font-variant-numeric: tabular-nums; }
.oh-story-jsonl summary > strong { overflow: hidden; min-width: 80px; flex: 1; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.oh-story-jsonl summary > code,
.oh-story-jsonl summary > em { flex: none; padding: 2px 6px; border-radius: 5px; background: var(--dsw-alias-button-ghost-active-fill); color: var(--dsw-alias-label-secondary); font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace; font-style: normal; }
.oh-story-jsonl pre { overflow: auto; max-height: 520px; margin: 0; padding: 14px 16px; border-top: 1px solid var(--os-border); background: var(--dsw-alias-markdown-code-block); color: var(--dsw-alias-label-secondary); white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.oh-story-jsonl-error { display: grid; gap: 5px; padding: 12px; border-color: var(--dsw-alias-state-error-primary); font-size: 12px; }
.oh-story-jsonl-error > strong { color: var(--dsw-alias-state-error-primary); }
.oh-story-jsonl-error > span { color: var(--os-muted); }
.oh-story-jsonl-error pre { margin: 3px -12px -12px; }

.oh-story-stream,
.oh-story-conflict,
.oh-story-warning {
  flex: none;
  padding: 7px 12px;
  border-bottom: 1px solid var(--os-border);
  font-size: 11px;
  line-height: 1.4;
}

.oh-story-stream { color: var(--dsw-alias-state-business-primary); background: var(--dsw-alias-button-ghost-active-fill); }
.oh-story-stream[data-stage="streaming"] { animation: oh-story-pulse 1.2s ease-in-out infinite alternate; }
.oh-story-conflict { color: var(--dsw-alias-state-warn-label); background: var(--dsw-specific-tip); }
.oh-story-conflict > div { display: flex; gap: 6px; margin-top: 6px; }
.oh-story-conflict button,
.oh-story-empty button {
  border: 1px solid var(--os-border);
  border-radius: 6px;
  color: inherit;
  background: var(--dsw-alias-bg-base);
  padding: 3px 8px;
  cursor: pointer;
  font: inherit;
}
.oh-story-warning { color: var(--dsw-alias-state-warn-label); background: var(--dsw-specific-tip); }

@keyframes oh-story-pulse { to { opacity: .62; } }
@media (prefers-reduced-motion: reduce) { .oh-story-stream[data-stage="streaming"] { animation: none; } }

.oh-story-empty { margin: auto; max-width: 480px; padding: 30px; color: var(--os-muted); line-height: 1.7; text-align: center; }
.oh-story-error { margin: 8px; padding: 8px 10px; border-radius: 8px; color: var(--dsw-alias-state-error-primary); background: var(--dsw-specific-tip); font-size: 12px; }

.oh-story-role { display: flex; flex-direction: column; margin: 0; overflow: hidden; }
.oh-story-role summary { min-height: 24px; padding: 0; cursor: pointer; list-style: none; font-size: 14px; line-height: 24px; }
.oh-story-role summary::-webkit-details-marker { display: none; }
.oh-story-role summary span { color: var(--dsw-alias-state-business-primary); }
.oh-story-role summary strong { margin-right: auto; color: var(--dsw-alias-label-secondary); font-weight: 500; }
.oh-story-role summary em { color: var(--dsw-alias-label-caption); font-style: normal; font-size: 12px; }
.oh-story-role[data-state="error"] summary em { color: var(--dsw-alias-state-error-primary); }
.oh-story-role pre { max-height: 260px; overflow: auto; margin: 4px 0 4px 4px; padding: 12px 16px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-markdown-code-block); white-space: pre-wrap; font: var(--dsw-font-markdown-code-block-small); }
.oh-story-role > button { align-self: flex-start; margin: 4px 0 2px 4px; font-size: 11px; }

/* Short-drama production views are projections of the creator Markdown and
   DSH Session state. They intentionally use only DSH semantic tokens. */
.oh-story-production { min-height: 0; flex: 1; overflow: auto; background: var(--dsw-alias-bg-base); font: 12px/1.5 var(--dsw-font-family); }
.oh-story-production button,
.oh-story-production select { border: 1px solid var(--os-border); border-radius: 6px; color: inherit; background: var(--dsw-alias-bg-base); padding: 4px 8px; cursor: pointer; font: inherit; }
.oh-story-production button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.oh-story-production button:disabled { opacity: .45; cursor: default; }
.oh-story-production button:focus-visible,
.oh-story-canvas article:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.oh-story-production-bar,
.oh-story-production-notice,
.oh-story-production-actions,
.oh-story-sequence-summary { display: flex; align-items: center; gap: 8px; }
.oh-story-production-bar { position: sticky; z-index: 5; top: 0; justify-content: space-between; min-height: 44px; box-sizing: border-box; padding: 6px 12px; border-bottom: 1px solid var(--os-border); background: color-mix(in srgb, var(--dsw-alias-bg-base) 94%, transparent); backdrop-filter: blur(12px); }
.oh-story-production-tabs { display: flex; align-self: stretch; gap: 16px; }
.oh-story-production-tabs button { position: relative; border: 0; border-radius: 0; padding: 0; background: transparent; color: var(--os-muted); }
.oh-story-production-tabs button[aria-selected="true"] { color: var(--dsw-alias-label-primary); }
.oh-story-production-tabs button[aria-selected="true"]::after { position: absolute; right: 0; bottom: -6px; left: 0; height: 2px; border-radius: 2px; background: var(--dsw-alias-state-business-primary); content: ""; }
.oh-story-production-meta { display: flex; align-items: center; gap: 8px; }
.oh-story-production-meta > button { padding-block: 2px; color: var(--os-muted); }
.oh-story-production-summary { color: var(--os-muted); white-space: nowrap; }
.oh-story-production-notice { justify-content: space-between; margin: 8px 12px 0; padding: 7px 9px; border: 1px solid var(--os-border); border-radius: 7px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); }
.oh-story-production-notice button { border: 0; background: transparent; }
.oh-story-production-environment { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; gap: 5px 10px; margin: 8px 12px 0; padding: 7px 9px; border: 1px solid var(--os-border); border-radius: 7px; color: var(--os-muted); background: var(--dsw-alias-bg-layer-1); font-size: 10px; }
/* Environment names such as MINIMAX_VIDEO_RESOLUTIONS and the temp-dir path are longer than the 500 px editor column; let them break rather than widen the view. */
.oh-story-production-environment > * { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.oh-story-production-environment strong { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.oh-story-production-environment span::before { content: "\u25CF"; margin-right: 4px; color: var(--video-danger, #d9534f); }
.oh-story-production-environment span[data-ready]::before { color: var(--dsw-alias-state-success-primary, #45b96f); }
.oh-story-production-environment span[data-pending]::before { color: var(--os-muted); }
.oh-story-production-environment em { flex-basis: 100%; font-style: normal; line-height: 1.5; }
.oh-story-production-environment code { font-size: 10px; overflow-wrap: anywhere; }
.oh-story-production-environment button { min-height: 24px; border: 1px solid var(--os-border); border-radius: 6px; padding: 0 8px; color: inherit; background: var(--dsw-alias-bg-base); cursor: pointer; font: inherit; }
.oh-story-production-diagnostics { margin: 8px 12px 0; padding: 7px 9px; border: 1px solid var(--dsw-alias-state-warn-label); border-radius: 7px; background: var(--dsw-specific-tip); }
.oh-story-production-diagnostics summary { color: var(--dsw-alias-state-warn-label); cursor: pointer; }
.oh-story-production-diagnostics ul { display: grid; gap: 4px; margin: 8px 0 0; padding: 0; list-style: none; }
.oh-story-production-diagnostics li { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: 6px; color: var(--dsw-alias-label-secondary); }
.oh-story-production-diagnostics li[data-severity="error"] { color: var(--dsw-alias-state-error-primary); }
.oh-story-production-diagnostics li button { border: 0; padding: 0; color: inherit; background: transparent; text-align: left; }
.oh-story-production-diagnostics p { margin: 6px 0 0; color: var(--os-muted); }
.oh-story-production-actions { justify-content: flex-end; margin-bottom: 12px; }
.oh-story-production-actions button:last-child,
.oh-story-sequence-summary button { color: var(--dsw-alias-state-business-primary); border-color: var(--dsw-alias-state-business-primary); }
.oh-story-shot-board { padding: 16px 12px; }
.oh-story-shot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); align-items: start; gap: 12px; }
.oh-story-shot-card,
.oh-story-asset-card,
.oh-story-task-board > article { min-width: 0; overflow: hidden; border: 1px solid var(--os-border); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.oh-story-shot-card { padding: 10px; cursor: default; transition: border-color .15s ease, background-color .15s ease; }
.oh-story-shot-card:hover { border-color: var(--dsw-alias-border-l2); }
.oh-story-shot-card { cursor: pointer; }
.oh-story-shot-card:focus-visible,
.oh-story-asset-card:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.oh-story-shot-card[data-selected],
.oh-story-asset-card[data-selected] { border-color: var(--dsw-alias-state-business-primary); background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 4%, var(--dsw-alias-bg-layer-1)); }
.oh-story-shot-card > header,
.oh-story-task-board article > header { display: flex; min-height: 0; align-items: center; gap: 8px; padding: 0; border: 0; }
.oh-story-shot-card > header > button { overflow: hidden; min-width: 0; flex: 1; border: 0; padding: 0; color: var(--dsw-alias-state-business-primary); background: transparent; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
.oh-story-shot-card > header > span { color: var(--os-muted); font-variant-numeric: tabular-nums; }
.oh-story-shot-card h3,
.oh-story-asset-card h3 { margin: 7px 0 4px; font-size: 13px; font-weight: 600; }
.oh-story-shot-card > p,
.oh-story-asset-card > p,
.oh-story-task-board article > p { margin: 5px 0; color: var(--os-muted); }
.oh-story-shot-placeholder { display: grid; height: 132px; place-content: center; gap: 3px; margin-bottom: 8px; border-radius: 7px; color: var(--os-muted); background: var(--dsw-alias-button-ghost-active-fill); text-align: center; }
.oh-story-shot-placeholder strong { color: var(--dsw-alias-label-secondary); font-size: 22px; font-variant-numeric: tabular-nums; }
.oh-story-shot-card dl { display: grid; grid-template-columns: 20px minmax(0, 1fr); margin: 7px 0; }
.oh-story-shot-card dt { color: var(--dsw-alias-state-business-primary); }
.oh-story-shot-card dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
.oh-story-shot-status,
.oh-story-reference-links,
.oh-story-card-actions { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
.oh-story-shot-status span { padding: 1px 5px; border-radius: 5px; color: var(--os-muted); background: var(--dsw-alias-button-ghost-active-fill); }
.oh-story-shot-status span[data-ready="true"] { color: var(--dsw-alias-state-business-primary); }
.oh-story-shot-status span > i { margin-right: 3px; font-style: normal; }
.oh-story-reference-links button { max-width: 100%; overflow: hidden; padding: 1px 5px; border: 0; color: var(--dsw-alias-state-business-primary); background: transparent; text-overflow: ellipsis; }
.oh-story-card-actions { padding-top: 8px; border-top: 1px solid var(--os-border); }
.oh-story-card-actions button { flex: 1; padding-block: 4px; }
.oh-story-card-actions button:last-child { color: var(--dsw-alias-state-business-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, var(--os-border)); }
.oh-story-media-preview { display: block; width: 100%; height: 168px; border-radius: 7px; background: var(--dsw-alias-bg-base); object-fit: contain; }
.oh-story-media-document { display: grid; min-height: 0; flex: 1; overflow: auto; place-items: center; padding: 24px; }
.oh-story-media-document img,
.oh-story-media-document video { display: block; max-width: 100%; max-height: 100%; object-fit: contain; }
.oh-story-media-document audio { width: min(520px, 100%); }
.oh-story-version-strip { display: flex; gap: 5px; overflow-x: auto; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--os-border); }
.oh-story-version-strip > button { position: relative; width: 64px; min-width: 64px; padding: 2px; }
.oh-story-version-strip > button[data-selected] { border-color: var(--dsw-alias-state-business-primary); }
.oh-story-version-strip .oh-story-media-preview { height: 72px; }
.oh-story-version-strip span { position: absolute; right: 3px; bottom: 3px; padding: 0 3px; border-radius: 3px; background: var(--dsw-alias-bg-base); font-size: 10px; }
.oh-story-asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; padding: 16px 12px; }
.oh-story-asset-card { padding: 10px; }
.oh-story-asset-card > div:nth-child(2) > button { overflow: hidden; max-width: 100%; border: 0; padding: 0; color: var(--dsw-alias-state-business-primary); background: transparent; text-overflow: ellipsis; }
.oh-story-asset-card small { color: var(--os-muted); text-transform: uppercase; }
.oh-story-asset-placeholder { display: grid; height: 112px; place-items: center; border-radius: 7px; color: var(--os-muted); background: var(--dsw-alias-button-ghost-active-fill); font-size: 28px; }
.oh-story-asset-description { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 5; line-clamp: 5; }
.oh-story-media-library { margin: 0 12px 14px; padding-top: 12px; border-top: 1px solid var(--os-border); }
.oh-story-media-library > header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.oh-story-media-library > header > div { display: flex; align-items: center; gap: 7px; }
.oh-story-media-library > header span { color: var(--os-muted); }
.oh-story-media-library input { width: 180px; box-sizing: border-box; border: 1px solid var(--os-border); border-radius: 6px; padding: 5px 8px; color: inherit; background: var(--dsw-alias-bg-base); font: inherit; }
.oh-story-media-library > .oh-story-projection-note { margin-bottom: 10px; }
.oh-story-media-library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
.oh-story-media-library-grid > article { display: flex; min-width: 0; flex-direction: column; gap: 5px; padding: 7px; border: 1px solid var(--os-border); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.oh-story-media-library-grid .oh-story-media-preview { height: 116px; }
.oh-story-media-library-grid > article > span { overflow: hidden; color: var(--os-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.oh-story-media-library-grid footer { display: flex; gap: 4px; margin-top: auto; }
.oh-story-media-library-grid footer button { min-width: 0; flex: 1; padding-inline: 4px; }
.oh-story-media-library-grid footer button[aria-pressed="true"] { color: var(--dsw-alias-state-business-primary); border-color: var(--dsw-alias-state-business-primary); }
.oh-story-task-board { display: grid; gap: 10px; padding: 12px; }
.oh-story-task-board > article { padding: 11px; }
.oh-story-task-board > article[data-status="dispatched_unknown"] { border-color: var(--dsw-alias-state-warn-label); }
.oh-story-task-board > article[data-status="dispatched_unknown"] .oh-story-error { color: var(--dsw-alias-state-warn-label); background: var(--dsw-specific-tip); }
.oh-story-task-board article > header strong { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; }
.oh-story-task-board article > header span { padding: 1px 5px; border-radius: 5px; color: var(--os-muted); background: var(--dsw-alias-button-ghost-active-fill); }
.oh-story-task-progress { height: 3px; overflow: hidden; margin-top: 8px; border-radius: 3px; background: var(--os-border); }
.oh-story-task-progress i { display: block; height: 100%; background: var(--dsw-alias-state-business-primary); transition: width .2s ease; }
.oh-story-task-board details { margin-top: 8px; color: var(--os-muted); }
.oh-story-task-board details summary { cursor: pointer; }
.oh-story-task-board details p { max-height: 120px; overflow: auto; margin: 6px 0; padding: 8px; border-radius: 6px; background: var(--dsw-alias-bg-base); white-space: pre-wrap; }
.oh-story-task-board footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; margin-top: 8px; }
.oh-story-projection-note { padding: 7px 10px; border: 1px solid var(--os-border); border-radius: 7px; color: var(--os-muted); background: var(--dsw-alias-bg-layer-1); }
.oh-story-task-board > .oh-story-projection-note { margin-bottom: 0; }
.oh-story-production-empty { padding: 48px 20px; color: var(--os-muted); text-align: center; }
.oh-story-production-empty strong { display: block; margin-bottom: 6px; color: var(--dsw-alias-text-1); font-size: 13px; }
.oh-story-production-empty p { margin: 0 auto; max-width: 44em; line-height: 1.6; }
.oh-story-production-empty button { margin-top: 12px; }
.oh-story-sequence { padding: 12px; }
.oh-story-sequence-summary { justify-content: space-between; margin-bottom: 10px; }
.oh-story-sequence-summary span { margin-left: auto; color: var(--os-muted); }
.oh-story-sequence-issues { margin: 0 0 10px; padding: 8px 8px 8px 28px; border-radius: 7px; color: var(--dsw-alias-state-warn-label); background: var(--dsw-specific-tip); }
.oh-story-sequence-issues li + li { margin-top: 2px; }
.oh-story-sequence ol { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.oh-story-sequence > ol > li { display: grid; min-height: 70px; grid-template-columns: 28px 96px minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 7px; border: 1px solid var(--os-border); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.oh-story-sequence > ol > li > span { color: var(--os-muted); font-variant-numeric: tabular-nums; }
.oh-story-sequence > ol > li .oh-story-media-preview,
.oh-story-sequence-missing { width: 96px; height: 54px; }
.oh-story-sequence-missing { display: grid; place-items: center; border-radius: 5px; color: var(--os-muted); background: var(--dsw-alias-button-ghost-active-fill); }
.oh-story-sequence > ol > li > div:last-child { display: flex; gap: 3px; }
.oh-story-canvas-shell { position: relative; display: flex; height: max(580px, calc(100% - 84px)); min-height: 580px; flex-direction: column; overflow: hidden; }
.oh-story-canvas-shell > .oh-story-projection-note { z-index: 3; flex: none; margin: 8px 168px 8px 8px; }
.oh-story-canvas-controls { position: absolute; z-index: 4; top: 8px; right: 8px; display: flex; align-items: center; gap: 3px; padding: 3px; border: 1px solid var(--os-border); border-radius: 8px; background: var(--dsw-alias-bg-base); }
.oh-story-canvas-controls span { min-width: 44px; color: var(--os-muted); text-align: center; }
.oh-story-canvas-viewport { width: 100%; min-height: 0; flex: 1; overflow: auto; background-color: var(--dsw-alias-bg-base); background-image: radial-gradient(var(--os-border) 1px, transparent 1px); background-size: 20px 20px; }
.oh-story-canvas { position: relative; width: 1800px; height: 1800px; transform-origin: 0 0; }
.oh-story-canvas svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.oh-story-canvas path { fill: none; opacity: .35; stroke: var(--dsw-alias-border-l2); stroke-width: 1.5; }
.oh-story-canvas path[data-active] { opacity: .8; stroke: var(--dsw-alias-state-business-primary); }
.oh-story-canvas article { position: absolute; display: flex; width: 180px; min-height: 76px; box-sizing: border-box; flex-direction: column; gap: 4px; padding: 10px; border: 1px solid var(--os-border); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); box-shadow: 0 4px 14px rgb(0 0 0 / 8%); cursor: grab; user-select: none; touch-action: none; }
.oh-story-canvas article:active { cursor: grabbing; }
.oh-story-canvas article[data-node-type="shot"] { border-color: var(--dsw-alias-state-business-primary); }
.oh-story-canvas article[data-selected] { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 28%, transparent), 0 4px 14px rgb(0 0 0 / 8%); }
.oh-story-canvas article small { color: var(--os-muted); text-transform: uppercase; }
.oh-story-canvas article strong,
.oh-story-canvas article span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oh-story-canvas article span { color: var(--os-muted); font-size: 10px; }

[data-conversation-scroll][data-oh-story-layout="medium"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) {
  grid-template-columns: clamp(104px, 18%, 184px) minmax(200px, 1fr) clamp(300px, 45%, 408px);
}

[data-conversation-scroll][data-oh-story-layout="compact"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) {
  grid-template-columns: clamp(80px, 16%, 104px) minmax(0, 1fr) clamp(228px, 48%, 300px);
}

[data-oh-story-layout="medium"] .oh-story-file-folder > summary { padding-left: min(calc(7px + var(--oh-story-indent, 0px)), 35px); }
[data-oh-story-layout="medium"] .oh-story-tree nav button { padding-left: min(calc(14px + var(--oh-story-indent, 0px)), 42px); }
[data-oh-story-layout="medium"] .oh-story-editor textarea { padding-right: 28px; padding-left: 28px; }

[data-oh-story-layout="compact"] .oh-story-tree { padding-inline: 4px; }
[data-oh-story-layout="compact"] .oh-story-brand { gap: 4px; padding-inline: 2px; font-size: 11px; }
[data-oh-story-layout="compact"] .oh-story-brand-cluster { gap: 4px; }
[data-oh-story-layout="compact"] .oh-story-brand-cluster strong > span { display: none; }
[data-oh-story-layout="compact"] .oh-story-kind { padding-inline: 4px; font-size: 11px; }
[data-oh-story-layout="compact"] .oh-story-brand button { width: 24px; height: 24px; }
[data-oh-story-layout="compact"] .oh-story-mode-tabs { margin-inline: 0; }
[data-oh-story-layout="compact"] .oh-story-mode-tabs button { padding-inline: 3px; font-size: 11px; }
[data-oh-story-layout="compact"] .oh-story-file-folder > summary { padding-left: min(calc(5px + var(--oh-story-indent, 0px)), 19px); }
[data-oh-story-layout="compact"] .oh-story-tree nav button { padding-right: 4px; padding-left: min(calc(7px + var(--oh-story-indent, 0px)), 21px); }
[data-oh-story-layout="compact"] .oh-story-editor > header {
  display: grid;
  min-height: 68px;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 24px 36px;
  align-content: center;
  gap: 0;
  padding: 4px 3px;
}
[data-oh-story-layout="compact"] .oh-story-editor-path > span { display: none; }
[data-oh-story-layout="compact"] .oh-story-editor-path > strong { display: block; font-size: 11px; line-height: 24px; }
[data-oh-story-layout="compact"] .oh-story-editor-actions { width: 100%; min-width: 0; justify-content: flex-end; gap: 4px; }
[data-oh-story-layout="compact"] .oh-story-editor-tabs { min-width: 0; flex: 1; }
[data-oh-story-layout="compact"] .oh-story-editor-tabs button { min-width: 0; padding-inline: 2px; white-space: nowrap; }
[data-oh-story-layout="compact"] .oh-story-save { flex: none; padding-inline: 4px; white-space: nowrap; font-size: 11px; }
[data-oh-story-layout="compact"] .oh-story-editor textarea { padding: 16px 12px 40px; }
[data-oh-story-layout="compact"] .oh-story-markdown { padding: 18px 12px 48px; }
[data-oh-story-layout="compact"] .oh-story-jsonl-summary { padding-inline: 10px; }
[data-oh-story-layout="compact"] .oh-story-jsonl-records { padding: 8px 7px 28px; }
[data-oh-story-layout="compact"] .oh-story-jsonl summary { gap: 6px; padding-inline: 7px; }
[data-oh-story-layout="compact"] .oh-story-jsonl summary > span { display: none; }
[data-oh-story-layout="compact"] .oh-story-jsonl summary > strong { min-width: 32px; }
[data-oh-story-layout="compact"] .oh-story-jsonl summary > code,
[data-oh-story-layout="compact"] .oh-story-jsonl summary > em { display: none; }

[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="medium"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) {
  grid-template-columns: minmax(0, 1fr) clamp(360px, 42%, 440px);
}
[data-oh-story-workbench="game"][data-oh-story-layout="medium"] .oh-game-toolbar { grid-template-columns: auto minmax(140px, 1fr) auto; }

[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"]
  > [data-slot="conversation.session"] > :not(.oh-story-split-surface),
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"]
  > [data-composer-seat],
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio {
  grid-column: 1;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"][data-oh-studio-pane="studio"]
  > [data-slot="conversation.session"] > :not(.oh-story-split-surface),
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"][data-oh-studio-pane="studio"]
  > [data-composer-seat],
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"][data-oh-studio-pane="chat"] .oh-game-studio { display: none; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-mobile-switcher {
  display: flex;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 20;
  border-color: var(--dsw-alias-border-l1);
  box-shadow: 0 4px 14px rgb(0 0 0 / 12%);
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-mobile-switcher button { min-width: 52px; min-height: 32px; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-toolbar {
  min-height: 101px;
  grid-template-columns: auto minmax(0, 1fr) 112px;
  grid-template-rows: 44px 44px;
  align-content: center;
  gap: 5px;
  padding: 4px 8px;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-toolbar > .oh-workbench-cluster { grid-column: 1; grid-row: 1; width: fit-content; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-project > span { display: none; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-project { grid-column: 1 / -1; grid-row: 2; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-project select { max-width: none; width: 100%; min-height: 44px; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-tabs { grid-column: 2; grid-row: 1; width: fit-content; justify-self: end; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-mode-tabs button,
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-tabs button,
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-mobile-switcher button { min-height: 44px; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-preview-shell { grid-template-rows: 46px minmax(0, 1fr); }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-preview-status button { min-height: 36px; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-reload b { display: none; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-preview-status { padding-left: 8px; }
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-preview-status > span { max-width: 40%; }
.oh-game-runtime-state > em { display: block; overflow: hidden; min-width: 0; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }

/* DSH may keep its navigation drawer open at a 500 px browser viewport,
   leaving the conversation center close to 212 px wide. The Studio publishes
   its measured width because a container style query cannot style the
   container itself. Row one stays clear for the \u5236\u4F5C / \u5BF9\u8BDD switch. */
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio[data-oh-game-narrow] .oh-game-toolbar {
  min-height: 193px;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: repeat(4, 44px);
  align-content: center;
  padding: 4px 8px;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio[data-oh-game-narrow] .oh-game-toolbar > .oh-workbench-cluster {
  grid-column: 1;
  grid-row: 2;
  justify-self: start;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio[data-oh-game-narrow] .oh-game-tabs {
  grid-column: 1;
  grid-row: 3;
  justify-self: start;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio[data-oh-game-narrow] .oh-game-project {
  grid-column: 1;
  grid-row: 4;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio[data-oh-game-narrow] .oh-game-project select {
  width: 100%;
  max-width: none;
  min-height: 44px;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio[data-oh-game-narrow] .oh-game-preview-status {
  gap: 4px;
  padding-right: 6px;
  padding-left: 6px;
}
[data-conversation-scroll][data-oh-story-workbench="game"][data-oh-story-layout="compact"] .oh-game-studio[data-oh-game-narrow] .oh-game-preview-status > span { max-width: 36%; }

@media (prefers-reduced-motion: reduce) {
  .oh-game-preview-shell[data-state="building"] { animation: none; }
}

@media (prefers-contrast: more) {
  .oh-game-preview-status button,
  .oh-game-tabs,
  .oh-game-mode-tabs,
  .oh-game-mobile-switcher { border-width: 2px; }
}
[data-oh-story-layout="compact"] .oh-story-production-summary { display: none; }
[data-oh-story-layout="compact"] .oh-story-production-bar { flex-wrap: wrap; padding-inline: 4px; }
[data-oh-story-layout="compact"] .oh-story-production-tabs { width: 100%; gap: 0; }
[data-oh-story-layout="compact"] .oh-story-production-tabs button { min-width: 0; flex: 1; padding-inline: 0; font-size: 11px; }
[data-oh-story-layout="compact"] .oh-story-production-meta { width: 100%; justify-content: flex-end; }
[data-oh-story-layout="compact"] .oh-story-shot-grid,
[data-oh-story-layout="compact"] .oh-story-asset-grid { grid-template-columns: minmax(0, 1fr); }
[data-oh-story-layout="compact"] .oh-story-media-library > header { align-items: stretch; flex-direction: column; }
[data-oh-story-layout="compact"] .oh-story-media-library > header > div:last-child { display: grid; grid-template-columns: minmax(0, 1fr) auto; }
[data-oh-story-layout="compact"] .oh-story-media-library input { width: 100%; }
[data-oh-story-layout="compact"] .oh-story-sequence { padding-inline: 6px; }
[data-oh-story-layout="compact"] .oh-story-sequence-summary { flex-wrap: wrap; }
[data-oh-story-layout="compact"] .oh-story-sequence-summary span { display: none; }
[data-oh-story-layout="compact"] .oh-story-sequence > ol > li { grid-template-columns: 24px 64px minmax(0, 1fr); gap: 5px; }
[data-oh-story-layout="compact"] .oh-story-sequence > ol > li .oh-story-media-preview,
[data-oh-story-layout="compact"] .oh-story-sequence-missing { width: 64px; height: 40px; }
[data-oh-story-layout="compact"] .oh-story-sequence > ol > li > div:last-child { grid-column: 2 / 4; justify-content: flex-end; }
[data-oh-story-layout="compact"] .oh-story-canvas-shell > .oh-story-projection-note { overflow: hidden; max-height: 48px; margin: 8px; }
[data-oh-story-layout="compact"] .oh-story-canvas-controls { position: static; flex: none; align-self: flex-end; margin: 0 8px 8px; }

/* Video mode intentionally stays a preview surface: one player, a read-only artifact view,
   and the official DSH Conversation. It shares no nonlinear-editor or timeline runtime. */
[data-conversation-scroll][data-oh-story-workbench="video"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) {
  --video-stage: #0b0d10;
  --video-stage-raised: #15181d;
  --video-accent: var(--dsw-alias-state-business-primary);
  --video-warning: #f4bd55;
  --video-danger: #f06b63;
  grid-template-columns: minmax(0, 1fr) clamp(400px, 34%, 520px);
  overflow: hidden;
}
[data-conversation-scroll][data-oh-story-workbench="video"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"])
  > [data-slot="conversation.session"] > :not(.oh-story-split-surface),
[data-conversation-scroll][data-oh-story-workbench="video"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"])
  > [data-composer-seat] { grid-column: 2; }

.oh-video-studio {
  box-sizing: border-box;
  display: flex;
  grid-column: 1;
  grid-row: 1;
  position: sticky;
  top: 0;
  min-width: 0;
  min-height: 0;
  height: 100%;
  align-self: start;
  overflow: hidden;
  flex-direction: column;
  border-right: 1px solid var(--os-border);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
}
.oh-video-studio[hidden] { display: none; }
.oh-video-toolbar {
  box-sizing: border-box;
  display: grid;
  min-height: 100px;
  flex: none;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: 40px 40px;
  align-items: center;
  gap: 4px 12px;
  padding: 8px 12px 9px;
  border-bottom: 1px solid var(--os-border);
  background: var(--dsw-alias-bg-base);
}
.oh-video-mode-tabs { display: flex; width: fit-content; grid-column: 1; grid-row: 1; padding: 2px; border: 1px solid var(--os-border); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); }
.oh-video-mode-tabs button,
.oh-video-tabs button,
.oh-video-version-tabs button {
  min-height: 36px;
  border: 0;
  border-radius: 6px;
  padding: 4px 8px;
  color: var(--os-muted);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  font: 12px/1 var(--dsw-font-family);
}
.oh-video-mode-tabs button { min-width: 48px; }
.oh-video-mode-tabs button:hover,
.oh-video-tabs button:hover,
.oh-video-version-tabs button:hover { color: var(--dsw-alias-label-primary); }
.oh-video-mode-tabs button[aria-selected="true"],
.oh-video-tabs button[aria-selected="true"],
.oh-video-version-tabs button[aria-selected="true"] { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); box-shadow: 0 1px 2px rgb(0 0 0 / 9%); font-weight: 600; }
.oh-video-project { display: flex; min-width: 0; grid-column: 1; grid-row: 2; align-items: center; gap: 9px; color: var(--os-muted); font-size: 11px; }
.oh-video-project > span { flex: none; }
.oh-video-project select {
  width: min(100%, 440px);
  min-width: 0;
  min-height: 36px;
  border: 1px solid var(--os-border);
  border-radius: 8px;
  padding: 6px 28px 6px 9px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  overflow: hidden;
  text-overflow: ellipsis;
  font: inherit;
  font-weight: 500;
}
.oh-video-stage { display: inline-flex; grid-column: 2; grid-row: 2; align-items: center; gap: 7px; border: 1px solid var(--os-border); border-radius: 999px; padding: 5px 9px; color: var(--os-muted); background: var(--dsw-alias-bg-layer-1); white-space: nowrap; font-size: 11px; }
.oh-video-stage > i { width: 7px; height: 7px; border-radius: 50%; background: var(--video-warning); }
.oh-video-stage[data-state="ready"] > i { background: var(--dsw-alias-state-success-primary, #45b96f); }
.oh-video-stage[data-state="not-started"] > i { background: var(--os-muted); }
.oh-video-tabs,
.oh-video-version-tabs { display: flex; padding: 2px; border: 1px solid var(--os-border); border-radius: 9px; }
.oh-video-tabs { grid-column: 2; grid-row: 1; }
.oh-video-tabs button { min-width: 56px; }
.oh-video-panels,
.oh-video-panels > [role="tabpanel"] { display: flex; min-width: 0; min-height: 0; flex: 1; overflow: hidden; flex-direction: column; }
.oh-video-panels > [hidden] { display: none; }

.oh-video-preview-shell { display: grid; min-width: 0; min-height: 0; flex: 1; grid-template-rows: 48px minmax(0, 1fr); overflow: hidden; border-top: 2px solid var(--video-accent); background: var(--video-stage); }
.oh-video-preview-shell[data-state="building"] { border-top-color: var(--video-warning); }
.oh-video-preview-shell[data-state="error"] { border-top-color: var(--video-danger); }
.oh-video-stagebar { display: grid; min-width: 0; grid-template-columns: auto minmax(80px, 1fr) auto; align-items: center; gap: 10px; padding: 0 10px; color: rgb(244 248 255 / 74%); background: var(--video-stage-raised); font-size: 11px; }
.oh-video-version-tabs { border-color: rgb(255 255 255 / 13%); }
.oh-video-version-tabs button[aria-selected="true"] { color: #fff; background: rgb(255 255 255 / 12%); }
.oh-video-runtime-state { display: flex; min-width: 0; align-items: center; justify-content: center; gap: 7px; overflow: hidden; }
.oh-video-runtime-state > i { width: 6px; height: 6px; flex: none; border-radius: 50%; background: var(--dsw-alias-state-success-primary, #45b96f); }
.oh-video-preview-shell[data-state="building"] .oh-video-runtime-state > i { background: var(--video-warning); }
.oh-video-preview-shell[data-state="error"] .oh-video-runtime-state > i { background: var(--video-danger); }
.oh-video-runtime-state > em { overflow: hidden; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.oh-video-preview-actions { display: flex; gap: 5px; }
.oh-video-preview-actions button,
.oh-video-preview-actions a { display: grid; min-width: 34px; min-height: 34px; box-sizing: border-box; place-items: center; border: 1px solid rgb(255 255 255 / 14%); border-radius: 6px; padding: 3px 8px; color: rgb(255 255 255 / 84%); background: rgb(255 255 255 / 5%); cursor: pointer; text-decoration: none; font: inherit; }
.oh-video-preview-actions svg { width: 16px; height: 16px; }
.oh-video-preview-actions button:hover,
.oh-video-preview-actions a:hover { background: rgb(255 255 255 / 11%); }
.oh-video-player-stage { display: grid; min-width: 0; min-height: 0; place-items: center; overflow: hidden; padding: 14px; background: radial-gradient(circle at 50% 40%, #1b2027, var(--video-stage) 62%); }
.oh-video-player-stage video { display: block; width: min(100%, 1200px); height: auto; max-width: 100%; max-height: 100%; border-radius: 4px; object-fit: contain; background: #000; box-shadow: 0 16px 50px rgb(0 0 0 / 32%); }
.oh-video-preview-shell:fullscreen { width: 100vw; height: 100vh; }

.oh-video-preview-empty,
.oh-video-artifacts-empty { display: grid; max-width: 620px; margin: auto; place-items: center; gap: 9px; padding: 36px; color: var(--os-muted); text-align: center; line-height: 1.65; }
.oh-video-preview-empty { width: 100%; max-width: none; min-height: 0; box-sizing: border-box; flex: 1; align-content: center; color: rgb(244 248 255 / 70%); background: var(--video-stage); }
.oh-video-preview-empty > span { color: var(--video-accent); font-size: 32px; }
.oh-video-preview-empty strong { color: rgb(255 255 255 / 92%); }
.oh-video-preview-empty p { max-width: 560px; margin: 0; }
.oh-video-preview-empty code { color: rgb(255 255 255 / 88%); }
.oh-video-prompt-example { max-width: 560px; margin-top: 10px; padding: 12px 14px; border: 1px solid rgb(255 255 255 / 11%); border-radius: 9px; background: rgb(255 255 255 / 4%); text-align: left; }
.oh-video-prompt-example span { display: block; margin-bottom: 4px; color: var(--video-accent); font-size: 10px; font-weight: 600; }
.oh-video-prompt-example q { quotes: none; }

.oh-video-artifacts { display: grid; min-width: 0; min-height: 0; flex: 1; grid-template-columns: minmax(150px, 220px) minmax(0, 1fr); overflow: hidden; }
.oh-video-artifacts > aside { display: flex; min-height: 0; flex-direction: column; overflow: hidden; padding: 8px; border-right: 1px solid var(--os-border); background: var(--dsw-alias-bg-layer-1); }
.oh-video-artifacts-heading { display: flex; min-height: 30px; flex: none; align-items: center; justify-content: space-between; padding: 0 7px; }
.oh-video-artifacts-heading strong { font-size: 11px; }
.oh-video-artifacts-heading span { min-width: 20px; border-radius: 999px; padding: 1px 5px; color: var(--os-muted); background: var(--dsw-alias-button-ghost-active-fill); text-align: center; font-size: 10px; }
.oh-video-artifacts > aside nav { min-height: 0; flex: 1; overflow: auto; }
.oh-video-artifacts > aside nav button { display: flex; width: 100%; min-width: 0; position: relative; flex-direction: column; align-items: flex-start; gap: 3px; border: 0; border-radius: 7px; padding: 9px; color: inherit; background: transparent; cursor: pointer; text-align: left; }
.oh-video-artifacts > aside nav button:hover,
.oh-video-artifacts > aside nav button[aria-current="page"] { background: var(--dsw-alias-button-ghost-active-fill); }
.oh-video-artifacts > aside nav button[aria-current="page"]::before { content: ""; width: 2px; position: absolute; inset-block: 8px; left: 2px; border-radius: 2px; background: var(--video-accent); }
.oh-video-artifacts > aside nav small { width: 100%; overflow: hidden; color: var(--os-muted); text-overflow: ellipsis; white-space: nowrap; }
.oh-video-artifacts > aside nav > p { margin: 10px 4px; color: var(--os-muted); font-size: 11px; line-height: 1.5; }
.oh-video-environment { display: grid; gap: 5px; margin-bottom: 8px; padding: 8px; border: 1px solid var(--os-border); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.oh-video-environment strong { font-size: 11px; }
.oh-video-environment span { color: var(--os-muted); font-size: 10px; }
.oh-video-environment em { color: var(--os-muted); font-size: 10px; font-style: normal; line-height: 1.5; }
.oh-video-environment code { font-size: 10px; }
.oh-video-environment span::before { content: "\u25CF"; margin-right: 5px; color: var(--video-danger); }
.oh-video-environment span[data-ready]::before { color: var(--dsw-alias-state-success-primary, #45b96f); }
.oh-video-environment button { min-height: 30px; border: 1px solid var(--os-border); border-radius: 6px; color: inherit; background: var(--dsw-alias-bg-base); cursor: pointer; font: inherit; }
.oh-video-artifacts > section { display: flex; min-width: 0; min-height: 0; overflow: hidden; flex-direction: column; }
.oh-video-artifact-header { display: flex; min-height: 54px; box-sizing: border-box; flex: none; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 16px; border-bottom: 1px solid var(--os-border); }
.oh-video-artifact-header > div { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.oh-video-artifact-header strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.oh-video-artifact-header span { overflow: hidden; color: var(--os-muted); text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
.oh-video-artifact-header em { flex: none; border: 1px solid var(--os-border); border-radius: 999px; padding: 3px 7px; color: var(--os-muted); background: var(--dsw-alias-bg-layer-1); font-size: 10px; font-style: normal; }
.oh-video-artifact-content { min-width: 0; min-height: 0; flex: 1; overflow: auto; }
.oh-video-artifact-content pre { min-width: 0; min-height: 100%; box-sizing: border-box; margin: 0; padding: 20px; color: inherit; background: var(--dsw-alias-bg-base); white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.65 var(--dsw-font-family-mono, ui-monospace, monospace); }

[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="medium"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) { grid-template-columns: minmax(0, 1fr) clamp(360px, 42%, 440px); }
[data-oh-story-workbench="video"][data-oh-story-layout="medium"] .oh-video-project select { width: 100%; }

[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"]:has(> [data-slot="conversation.session"] > .oh-story-split-surface[data-open="true"]) { display: grid; grid-template-columns: minmax(0, 1fr); overflow: hidden; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"]
  > [data-slot="conversation.session"] > :not(.oh-story-split-surface),
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"]
  > [data-composer-seat],
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-studio { grid-column: 1; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"][data-oh-studio-pane="studio"]
  > [data-slot="conversation.session"] > :not(.oh-story-split-surface),
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"][data-oh-studio-pane="studio"]
  > [data-composer-seat],
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"][data-oh-studio-pane="chat"] .oh-video-studio { display: none; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-game-mobile-switcher { display: flex; position: absolute; top: 8px; right: 8px; z-index: 20; border-color: var(--dsw-alias-border-l1); box-shadow: 0 4px 14px rgb(0 0 0 / 12%); }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-toolbar { min-height: 142px; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: 44px 44px 38px; align-content: center; gap: 2px 6px; padding: 4px 8px; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-toolbar > .oh-workbench-cluster { grid-column: 1 / -1; grid-row: 1; width: fit-content; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-tabs { grid-column: 2; grid-row: 2; justify-self: end; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-project { grid-column: 1; grid-row: 2; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-project > span { display: none; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-stage { grid-column: 1 / -1; grid-row: 3; justify-self: start; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-stagebar { grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: 42px 38px; gap: 2px 6px; padding: 3px 7px; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-preview-shell { grid-template-rows: 86px minmax(0, 1fr); }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-version-tabs { grid-column: 1; grid-row: 1; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-runtime-state { grid-column: 1; grid-row: 2; justify-content: flex-start; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-preview-actions { grid-column: 2; grid-row: 1 / 3; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-preview-actions button:first-child { max-width: 70px; }
[data-conversation-scroll][data-oh-story-workbench="video"][data-oh-story-layout="compact"] .oh-video-artifacts { grid-template-columns: minmax(105px, 35%) minmax(0, 1fr); }
`;

// src/client/index.tsx
var import_jsx_runtime5 = require("react/jsx-runtime"), name = "oh-story", inject = ["slots", "sessions", "conversation"];
function applyUpdate(current, update) {
  return typeof update == "function" ? update(current) : update;
}
var workbenchMemoryBySession = /* @__PURE__ */ new Map(), NO_UNDISPATCHED_CALLS = [];
function createWorkbenchStore() {
  return (0, import_dsh_client_store.defineStore)({
    init: () => ({
      buffers: {},
      workbenchPreference: void 0,
      editorMode: "preview",
      expanded: {},
      selected: void 0,
      workbench: "story",
      gameTab: "preview",
      gameProjectId: void 0,
      gamePane: "studio",
      videoTab: "preview",
      videoProjectId: void 0,
      videoPane: "studio",
      productionSection: "shots",
      productionSelectedIds: {},
      productionJobs: {},
      productionSelections: {},
      productionReferences: {},
      productionSequence: {},
      productionCanvas: {},
      productionZoom: {},
      productionIntentCalls: {},
      settledMutation: void 0,
      hydrated: !1
    }),
    actions: {
      restore: (draft, memory) => {
        memory !== void 0 && (Object.assign(draft, memory), draft.buffers = Object.fromEntries(Object.entries(memory.buffers).map(([path, buffer]) => [path, { ...buffer, saving: void 0 }]))), draft.hydrated = !0;
      },
      setSettledMutation: (draft, value) => {
        draft.settledMutation = value;
      },
      setBuffers: (draft, update) => {
        draft.buffers = applyUpdate(draft.buffers, update);
      },
      setWorkbenchPreference: (draft, update) => {
        draft.workbenchPreference = applyUpdate(draft.workbenchPreference, update);
      },
      setEditorMode: (draft, update) => {
        draft.editorMode = applyUpdate(draft.editorMode, update);
      },
      setExpanded: (draft, update) => {
        draft.expanded = applyUpdate(draft.expanded, update);
      },
      setSelected: (draft, update) => {
        draft.selected = applyUpdate(draft.selected, update);
      },
      setWorkbench: (draft, update) => {
        draft.workbench = applyUpdate(draft.workbench, update);
      },
      setGameTab: (draft, update) => {
        draft.gameTab = applyUpdate(draft.gameTab, update);
      },
      setGameProjectId: (draft, update) => {
        draft.gameProjectId = applyUpdate(draft.gameProjectId, update);
      },
      setGamePane: (draft, update) => {
        draft.gamePane = applyUpdate(draft.gamePane, update);
      },
      setVideoTab: (draft, update) => {
        draft.videoTab = applyUpdate(draft.videoTab, update);
      },
      setVideoProjectId: (draft, update) => {
        draft.videoProjectId = applyUpdate(draft.videoProjectId, update);
      },
      setVideoPane: (draft, update) => {
        draft.videoPane = applyUpdate(draft.videoPane, update);
      },
      setProductionSection: (draft, update) => {
        draft.productionSection = applyUpdate(draft.productionSection, update);
      },
      setProductionSelectedIds: (draft, update) => {
        draft.productionSelectedIds = applyUpdate(draft.productionSelectedIds, update);
      },
      setProductionJobs: (draft, update) => {
        draft.productionJobs = applyUpdate(draft.productionJobs, update);
      },
      setProductionSelections: (draft, update) => {
        draft.productionSelections = applyUpdate(draft.productionSelections, update);
      },
      setProductionReferences: (draft, update) => {
        draft.productionReferences = applyUpdate(draft.productionReferences, update);
      },
      setProductionSequence: (draft, update) => {
        draft.productionSequence = applyUpdate(draft.productionSequence, update);
      },
      setProductionCanvas: (draft, update) => {
        draft.productionCanvas = applyUpdate(draft.productionCanvas, update);
      },
      setProductionZoom: (draft, update) => {
        draft.productionZoom = applyUpdate(draft.productionZoom, update);
      },
      setProductionIntentCalls: (draft, update) => {
        draft.productionIntentCalls = applyUpdate(draft.productionIntentCalls, update);
      }
    }
  });
}
var WorkspaceRequestError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  status;
}, GROUP_ORDER = {
  story: ["\u6B63\u6587", "\u5927\u7EB2", "\u8BBE\u5B9A", "\u8FFD\u8E2A", "\u5BF9\u6807", "\u53C2\u8003\u8D44\u6599"],
  drama: ["\u9879\u76EE", "\u8F93\u5165", "\u9879\u76EE\u5F00\u53D1", "\u8BBE\u5B9A\u96C6", "\u5267\u96C6", "\u5BA1\u67E5", "\u521B\u4F5C\u8005\u51B3\u7B56", "\u4EA4\u4ED8"],
  game: ["game-adaptations"],
  video: ["video-recaps"]
}, WORKBENCH_MODES = ["story", "drama", "game", "video"], EDITOR_MODES = ["preview", "source", "production"];
function groupForPath(path) {
  return path === "short-drama.json" ? "\u9879\u76EE" : path.split("/", 1)[0] ?? "\u5176\u4ED6";
}
async function json(response) {
  let value = await response.json();
  if (!response.ok) throw new WorkspaceRequestError(response.status, value.error ?? `HTTP ${String(response.status)}`);
  return value;
}
function FileTreeNodes({
  nodes,
  depth,
  expanded,
  selected,
  activityPath,
  onToggle,
  onSelect
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, { children: nodes.map((node) => {
    if (node.kind === "file") return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        type: "button",
        style: { "--oh-story-indent": `${String(depth * 14)}px` },
        title: node.path,
        "aria-label": node.path,
        "data-file-path": node.path,
        "data-agent-target": node.path === activityPath || void 0,
        "aria-current": node.path === selected ? "page" : void 0,
        onClick: () => {
          onSelect(node.path);
        },
        children: node.name
      },
      node.path
    );
    let open = selected?.startsWith(`${node.path}/`) === !0 || expanded[node.path] === !0;
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { className: "oh-story-file-folder", open, onToggle: (event) => {
      onToggle(node.path, event.currentTarget.open);
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("summary", { style: { "--oh-story-indent": `${String(depth * 14)}px` }, title: node.path, children: [
        node.name,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: node.fileCount })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        FileTreeNodes,
        {
          nodes: node.children,
          depth: depth + 1,
          expanded,
          selected,
          activityPath,
          onToggle,
          onSelect
        }
      )
    ] }, node.path);
  }) });
}
function useWorkspace(sessionId) {
  let [version, setVersion] = (0, import_react3.useState)(0), [workspace, setWorkspace] = (0, import_react3.useState)(), [error, setError] = (0, import_react3.useState)(), [loading, setLoading] = (0, import_react3.useState)(!0), reload = (0, import_react3.useCallback)(() => {
    setLoading(!0), setVersion((value) => value + 1);
  }, []);
  return (0, import_react3.useEffect)(() => {
    let controller = new AbortController();
    return setError(void 0), fetch(endpoint("workspace", sessionId), { signal: controller.signal }).then((response) => json(response)).then(setWorkspace).catch((reason) => {
      controller.signal.aborted || setError(reason instanceof Error ? reason.message : String(reason));
    }).finally(() => {
      controller.signal.aborted || setLoading(!1);
    }), () => {
      controller.abort();
    };
  }, [sessionId, version]), { workspace, error, loading, reload };
}
function isolatedPreviewUrl(path, version, revision) {
  let url = new URL(path, globalThis.location.origin);
  return url.hostname === "127.0.0.1" ? url.hostname = "localhost" : url.hostname === "localhost" && (url.hostname = "127.0.0.1"), url.searchParams.set("build", version), url.searchParams.set("reload", String(revision)), { href: url.toString(), isolated: url.origin !== globalThis.location.origin };
}
function PreviewProbe({ href, onFailed }) {
  let failedRef = (0, import_react3.useRef)(onFailed);
  return (0, import_react3.useEffect)(() => {
    failedRef.current = onFailed;
  }, [onFailed]), (0, import_react3.useEffect)(() => {
    let controller = new AbortController();
    return fetch(href, { signal: controller.signal }).then((response) => {
      if (controller.signal.aborted) return;
      let type = response.headers.get("content-type") ?? "";
      (!response.ok || !type.includes("text/html")) && failedRef.current();
    }).catch(() => {
      controller.signal.aborted || failedRef.current();
    }), () => {
      controller.abort();
    };
  }, [href]), null;
}
function GamePreview({ project, building }) {
  let shellRef = (0, import_react3.useRef)(null), fullscreenButtonRef = (0, import_react3.useRef)(null), restoreFullscreenFocus = (0, import_react3.useRef)(!1), [focused, setFocused] = (0, import_react3.useState)(!1), [loaded, setLoaded] = (0, import_react3.useState)(!1), [loadError, setLoadError] = (0, import_react3.useState)(!1), [revision, setRevision] = (0, import_react3.useState)(0), [loadedVersion, setLoadedVersion] = (0, import_react3.useState)(project.previewVersion);
  if ((0, import_react3.useEffect)(() => {
    let document = shellRef.current?.ownerDocument;
    if (document === void 0) return;
    let restore = () => {
      document.fullscreenElement !== null || !restoreFullscreenFocus.current || (restoreFullscreenFocus.current = !1, fullscreenButtonRef.current?.focus());
    };
    return document.addEventListener("fullscreenchange", restore), () => {
      document.removeEventListener("fullscreenchange", restore);
    };
  }, []), !project.previewReady || project.previewUrl === void 0) return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-game-preview-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { "aria-hidden": !0, children: "\u25EB" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: "\u8FD8\u6CA1\u6709\u53EF\u8BD5\u73A9\u7248\u672C" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { children: [
      "\u5728\u53F3\u4FA7 Chat \u4F7F\u7528 ",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "/novel-to-game quick" }),
      "\uFF0C\u4EA7\u7269\u5199\u5165 ",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "game-adaptations/<project>/build/app/" }),
      " \u540E\u4F1A\u81EA\u52A8\u51FA\u73B0\u5728\u8FD9\u91CC\u3002"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-game-prompt-example", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "\u63CF\u8FF0\u793A\u4F8B" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("q", { children: "\u628A\u300A\u4F5C\u54C1\u540D\u300B\u6539\u7F16\u6210\u7F51\u9875\u4E92\u52A8\u6E38\u620F\uFF0C\u76EE\u6807\u73A9\u5BB6\u662F\u2026\u2026\uFF0C\u6838\u5FC3\u73A9\u6CD5\u662F\u2026\u2026\uFF0C\u5E0C\u671B\u6574\u4F53\u98CE\u683C\u2026\u2026" })
    ] })
  ] });
  let preview = isolatedPreviewUrl(project.previewUrl, loadedVersion, revision), pending = project.previewVersion !== loadedVersion, reload = () => {
    setLoaded(!1), setLoadError(!1), setLoadedVersion(project.previewVersion), setRevision((value) => value + 1);
  }, refresh = () => {
    setLoaded(!1), setLoadError(!1), setRevision((value) => value + 1);
  }, runtimeState = loadError ? "\u9884\u89C8\u8F7D\u5165\u5931\u8D25 \xB7 \u53EF\u91CD\u65B0\u8F7D\u5165" : building ? "Agent \u6B63\u5728\u66F4\u65B0\u6E38\u620F\u6587\u4EF6 \xB7 \u5F53\u524D\u9884\u89C8\u4FDD\u6301\u4E0D\u53D8" : pending ? "\u65B0\u7248\u672C\u5DF2\u5C31\u7EEA \xB7 \u7531\u4F60\u51B3\u5B9A\u4F55\u65F6\u8F7D\u5165" : loaded ? preview.isolated ? "\u9884\u89C8\u5DF2\u8F7D\u5165" : "\u9884\u89C8\u5DF2\u8F7D\u5165 \xB7 \u5F53\u524D\u90E8\u7F72\u65E0\u6CD5\u9694\u79BB\u6765\u6E90\uFF0C\u5B58\u6863\u529F\u80FD\u4E0D\u53EF\u7528" : "\u6B63\u5728\u8F7D\u5165\u9884\u89C8\u2026";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { ref: shellRef, className: "oh-game-preview-shell", "data-state": loadError ? "error" : building ? "building" : loaded ? "ready" : "loading", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-game-preview-status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "oh-game-runtime-state", role: "status", "aria-live": "polite", title: runtimeState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("i", { "aria-hidden": !0 }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("em", { children: runtimeState })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        pending && !building && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: reload, children: "\u8F7D\u5165\u65B0\u7248\u672C" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { className: "oh-game-reload", type: "button", onClick: refresh, "aria-label": "\u91CD\u65B0\u8F7D\u5165\u6E38\u620F", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { "aria-hidden": !0, children: "\u21BB" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("b", { children: "\u5237\u65B0" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { ref: fullscreenButtonRef, type: "button", onClick: () => {
          let shell = shellRef.current;
          shell !== null && (restoreFullscreenFocus.current = !0, shell.requestFullscreen().catch(() => {
            restoreFullscreenFocus.current = !1;
          }));
        }, children: "\u5168\u5C4F\u8BD5\u73A9" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PreviewProbe, { href: preview.href, onFailed: () => {
      setLoaded(!1), setLoadError(!0);
    } }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "iframe",
      {
        src: preview.href,
        title: `\u300A${project.title}\u300B\u53EF\u8BD5\u73A9\u9884\u89C8`,
        sandbox: preview.isolated ? "allow-scripts allow-same-origin allow-forms allow-modals allow-downloads" : "allow-scripts allow-forms allow-modals allow-downloads",
        allow: "autoplay; fullscreen; gamepad",
        allowFullScreen: !0,
        referrerPolicy: "no-referrer",
        onLoad: () => {
          setLoadError(!1), setLoaded(!0);
        },
        onError: () => {
          setLoaded(!1), setLoadError(!0);
        },
        onFocus: () => {
          setFocused(!0);
        },
        onBlur: () => {
          setFocused(!1);
        }
      },
      `${project.id}:${loadedVersion}:${String(revision)}`
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-focus-hint", "data-focused": focused || void 0, children: focused ? "\u6E38\u620F\u6B63\u5728\u63A5\u6536\u952E\u9F20\u8F93\u5165" : "\u70B9\u51FB\u753B\u9762\u8FDB\u5165\u8BD5\u73A9" })
  ] });
}
function GameDesign({
  project,
  files,
  selected,
  sessionId,
  onSelect
}) {
  let documents = (0, import_react3.useMemo)(() => files.filter((file) => file.path.startsWith(`${project.root}/`) && /\.(?:md|txt|json|jsonl|html|css|[cm]?js|tsx?|jsx)$/iu.test(file.path)), [files, project.root]), preferred = selected !== void 0 && documents.some((file) => file.path === selected) ? selected : documents.find((file) => file.path === `${project.root}/PRODUCT_BRIEF.md`)?.path ?? documents[0]?.path, [path, setPath] = (0, import_react3.useState)(preferred), [content, setContent] = (0, import_react3.useState)(), [error, setError] = (0, import_react3.useState)();
  if ((0, import_react3.useEffect)(() => {
    setPath(preferred);
  }, [preferred, project.id]), (0, import_react3.useEffect)(() => {
    if (path === void 0 || project.source === "example") {
      setContent(void 0);
      return;
    }
    let controller = new AbortController();
    return setContent(void 0), setError(void 0), fetch(endpoint("file", sessionId, path), { signal: controller.signal }).then((response) => json(response)).then((file) => {
      setContent(file.content);
    }).catch((reason) => {
      controller.signal.aborted || setError(reason instanceof Error ? reason.message : String(reason));
    }), () => {
      controller.abort();
    };
  }, [path, project.source, sessionId]), project.source === "example") return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-game-design-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: "\u5185\u7F6E\u5B8C\u6574\u793A\u4F8B" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: "\u300A\u91D1\u74F6\u6885 \xB7 \u98CE\u6708\u603B\u8D26\u300B\u7684\u5B8C\u6574\u53EF\u73A9\u6784\u5EFA\u4E0E QA \u6821\u9A8C\u7ED3\u679C\u968F\u63D2\u4EF6\u6253\u5305\uFF0C\u53EF\u76F4\u63A5\u5728\u5DE6\u4FA7\u8BD5\u73A9\u3002\u4E0A\u6E38\u7684\u4EA7\u54C1\u7B80\u62A5\u3001\u5206\u6790\u3001\u6982\u5FF5\u3001\u8BBE\u8BA1\u4E0E\u6E90\u5C0F\u8BF4\u4E0D\u968F\u5305\u5206\u53D1\uFF0C\u53EF\u5728 novel-to-game \u4ED3\u5E93\u67E5\u770B\u5B8C\u6574\u521B\u4F5C\u8FC7\u7A0B\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "novel-to-game/examples/jin-ping-mei" })
  ] });
  if (documents.length === 0 || path === void 0) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-design-empty", children: "\u5F53\u524D\u9879\u76EE\u8FD8\u6CA1\u6709\u53EF\u68C0\u67E5\u7684\u8BBE\u8BA1\u6216\u6E90\u6587\u4EF6\u3002" });
  let markdown = path.toLocaleLowerCase().endsWith(".md");
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-game-design", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
      "\u9879\u76EE\u6587\u4EF6",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("select", { value: path, onChange: (event) => {
        setPath(event.target.value), onSelect(event.target.value);
      }, children: documents.map((file) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: file.path, children: file.path.slice(project.root.length + 1) }, file.path)) })
    ] }),
    error !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-error", children: error }) : content === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-design-empty", children: "\u6B63\u5728\u8F7D\u5165\u6587\u4EF6\u2026" }) : markdown ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(MarkdownPreview, { content, label: path }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { className: "oh-game-source", "aria-label": `${path} \u6E90\u7801`, children: content })
  ] });
}
function GameStudio({
  sessionId,
  workspace,
  building,
  selected,
  gameTab,
  gameProjectId,
  hidden,
  onGameTab,
  onGameProject,
  workbenches,
  paneId,
  labelledBy,
  onWorkbench,
  onCollapse,
  onSelect
}) {
  let project = workspace.games.find((value) => value.id === gameProjectId) ?? workspace.games[0], studioRef = (0, import_react3.useRef)(null), tabsId = (0, import_react3.useId)();
  if ((0, import_react3.useLayoutEffect)(() => {
    let studio = studioRef.current;
    if (studio === null) return;
    let publishWidth = () => {
      studio.toggleAttribute("data-oh-game-narrow", studio.clientWidth <= 300);
    };
    publishWidth();
    let observer = new ResizeObserver(publishWidth);
    return observer.observe(studio), () => {
      observer.disconnect();
    };
  }, []), (0, import_react3.useEffect)(() => {
    project !== void 0 && project.id !== gameProjectId && onGameProject(project.id);
  }, [gameProjectId, onGameProject, project]), project === void 0) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("main", { ref: studioRef, id: paneId, className: "oh-game-studio", role: "tabpanel", "aria-labelledby": labelledBy, hidden, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-design-empty", children: "\u6E38\u620F\u80FD\u529B\u6B63\u5728\u8F7D\u5165\u2026" }) });
  let tabs = ["preview", "design"];
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("main", { ref: studioRef, id: paneId, className: "oh-game-studio", "data-source": project.source, role: "tabpanel", "aria-labelledby": labelledBy, hidden, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { className: "oh-game-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-workbench-cluster", children: [
        workbenches.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-mode-tabs", role: "tablist", "aria-label": "\u521B\u4F5C\u5DE5\u4F5C\u53F0", children: workbenches.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": mode === "game",
            tabIndex: mode === "game" ? 0 : -1,
            onKeyDown: (event) => {
              handleTabKey(event, workbenches, "game", onWorkbench);
            },
            onClick: () => {
              onWorkbench(mode);
            },
            children: workbenchLabel(mode)
          },
          mode
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "oh-workbench-collapse", type: "button", title: "\u6536\u8D77\u521B\u4F5C\u5DE5\u4F5C\u53F0", "aria-label": "\u6536\u8D77\u521B\u4F5C\u5DE5\u4F5C\u53F0", onClick: onCollapse, children: "\xD7" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "oh-game-project", title: "\u5207\u6362\u9879\u76EE\u5C06\u91CD\u65B0\u8F7D\u5165\u8BD5\u73A9", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "\u6E38\u620F\u9879\u76EE" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { "aria-label": "\u6E38\u620F\u9879\u76EE\uFF1B\u5207\u6362\u5C06\u91CD\u65B0\u8F7D\u5165\u8BD5\u73A9", value: project.id, onChange: (event) => {
          onGameProject(event.target.value);
        }, children: [
          workspace.games.some((item) => item.source === "workspace") && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("optgroup", { label: "\u6211\u7684\u9879\u76EE", children: workspace.games.filter((item) => item.source === "workspace").map((item) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: item.id, children: `\u6211\u7684\u9879\u76EE \xB7 ${item.title}` }, item.id)) }),
          workspace.games.some((item) => item.source === "example") && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("optgroup", { label: "\u5185\u7F6E\u793A\u4F8B", children: workspace.games.filter((item) => item.source === "example").map((item) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: item.id, children: `\u5185\u7F6E\u793A\u4F8B \xB7 ${item.title}` }, item.id)) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-tabs", role: "tablist", "aria-label": "\u6E38\u620F\u5DE5\u4F5C\u53F0", children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "button",
        {
          type: "button",
          role: "tab",
          tabIndex: gameTab === tab ? 0 : -1,
          "aria-selected": gameTab === tab,
          id: `${tabsId}-${tab}-tab`,
          "aria-controls": `${tabsId}-${tab}-panel`,
          onKeyDown: (event) => {
            handleTabKey(event, tabs, gameTab, onGameTab);
          },
          onClick: () => {
            onGameTab(tab);
          },
          children: tab === "preview" ? "\u8BD5\u73A9" : project.source === "example" ? "\u8BF4\u660E" : "\u9879\u76EE\u6587\u4EF6"
        },
        tab
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-game-panels", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-panel", role: "tabpanel", id: `${tabsId}-preview-panel`, "aria-labelledby": `${tabsId}-preview-tab`, hidden: gameTab !== "preview", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(GamePreview, { project, building }, `${project.id}:${String(project.previewReady)}`) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-panel", role: "tabpanel", id: `${tabsId}-design-panel`, "aria-labelledby": `${tabsId}-design-tab`, hidden: gameTab !== "design", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(GameDesign, { project, files: workspace.files, selected, sessionId, onSelect }) })
    ] })
  ] });
}
function CreativeWorkbench({
  sessionId,
  runningCalls,
  partial,
  undispatched,
  settledMutation,
  settledMutationTurn,
  liveTurn,
  sessionRunning,
  productionQueue,
  productionIntents,
  sendProductionPrompt,
  cancelProduction,
  removeQueuedProduction,
  workspace,
  error,
  workspaceLoading,
  reload,
  open,
  creativeProject,
  welcome,
  useStore,
  actions
}) {
  let activities = (0, import_react3.useMemo)(
    () => fileMutations(runningCalls, partial, undispatched),
    [partial, runningCalls, undispatched]
  ), normalizedActivities = (0, import_react3.useMemo)(() => activities.flatMap((activity2) => {
    let path = creativeRelativePath(activity2.path, workspace?.cwd);
    return path === void 0 ? [] : [{ activity: activity2, path }];
  }), [activities, workspace?.cwd]), primaryActivity = normalizedActivities.at(-1), activityPaths = (0, import_react3.useMemo)(() => new Set(normalizedActivities.map((value) => value.path)), [normalizedActivities]), settledPath = settledMutation === void 0 ? void 0 : creativeRelativePath(settledMutation.slice(settledMutation.indexOf("\0") + 1), workspace?.cwd), activity = primaryActivity?.activity, activityPath = primaryActivity?.path, workbench = useStore((memory) => memory.workbench), setWorkbench = actions.setWorkbench, gameTab = useStore((memory) => memory.gameTab), setGameTab = actions.setGameTab, gameProjectId = useStore((memory) => memory.gameProjectId), setGameProjectId = actions.setGameProjectId, gamePane = useStore((memory) => memory.gamePane), setGamePane = actions.setGamePane, videoTab = useStore((memory) => memory.videoTab), setVideoTab = actions.setVideoTab, videoProjectId = useStore((memory) => memory.videoProjectId), setVideoProjectId = actions.setVideoProjectId, videoPane = useStore((memory) => memory.videoPane), setVideoPane = actions.setVideoPane, selected = useStore((memory) => memory.selected), setSelected = actions.setSelected, buffers = useStore((memory) => memory.buffers), setBuffers = actions.setBuffers, buffersRef = (0, import_react3.useRef)({}), expanded = useStore((memory) => memory.expanded), setExpanded = actions.setExpanded, productionSection = useStore((memory) => memory.productionSection), setProductionSection = actions.setProductionSection, productionSelectedIds = useStore((memory) => memory.productionSelectedIds), productionJobsByEpisode = useStore((memory) => memory.productionJobs), productionSelectionsByEpisode = useStore((memory) => memory.productionSelections), productionReferencesByEpisode = useStore((memory) => memory.productionReferences), productionSequenceByEpisode = useStore((memory) => memory.productionSequence), productionCanvasByEpisode = useStore((memory) => memory.productionCanvas), productionZoomByEpisode = useStore((memory) => memory.productionZoom), productionIntentCalls = useStore((memory) => memory.productionIntentCalls), surfaceRef = (0, import_react3.useRef)(null), setWorkbenchPreference = actions.setWorkbenchPreference, applyWorkbenchPreference = (0, import_react3.useCallback)((preference) => {
    setWorkbenchPreference(preference), writeWorkbenchPreference(workbenchPreferenceStorage(), workspace?.cwd, preference);
  }, [setWorkbenchPreference, workspace?.cwd]), compactTabsId = (0, import_react3.useId)(), compactStudioId = `${compactTabsId}-studio-panel`, compactVideoStudioId = `${compactTabsId}-video-studio-panel`, compactChatId = `${compactTabsId}-chat-panel`, navRef = (0, import_react3.useRef)(null), activityBases = (0, import_react3.useRef)(/* @__PURE__ */ new Map()), previousSignals = (0, import_react3.useRef)(/* @__PURE__ */ new Set()), consumedSettledMutation = useStore((memory) => memory.settledMutation), liveTurns = (0, import_react3.useRef)(/* @__PURE__ */ new Set());
  liveTurn !== void 0 && liveTurns.current.add(liveTurn);
  let saveLocks = (0, import_react3.useRef)(/* @__PURE__ */ new Set()), buffer = selected === void 0 ? void 0 : buffers[selected], selectedFile = workspace?.files.find((file) => file.path === selected), selectedMedia = selectedFile?.kind === "media", dirty = buffer?.source === "human" && buffer.content !== buffer.saved, saving = buffer?.saving === !0, fileError = buffer?.error, conflict = buffer?.conflict, selectedLower = selected?.toLocaleLowerCase(), markdown = selectedLower?.endsWith(".md") === !0, jsonl = selectedLower?.endsWith(".jsonl") === !0, structured = jsonl || selectedLower?.endsWith(".json") === !0, previewable = markdown || jsonl, episodeDirectory = episodeDirectoryForPath(selected), productionAvailable = selected !== void 0 && isCreatorDocumentPath(selected) && episodeDirectory !== void 0, editorModes = productionAvailable ? EDITOR_MODES : EDITOR_MODES.filter((mode) => mode !== "production"), episodeDocumentPaths = (0, import_react3.useMemo)(
    () => episodeDirectory === void 0 ? [] : creatorDocumentPaths(workspace?.files.filter((file) => file.kind === "text") ?? [], episodeDirectory),
    [episodeDirectory, workspace?.files]
  ), episodeDocuments = (0, import_react3.useMemo)(() => Object.fromEntries(episodeDocumentPaths.flatMap((path) => {
    let current = buffers[path];
    return current === void 0 || current.missing === !0 ? [] : [[path, current.content]];
  })), [buffers, episodeDocumentPaths]), episodeProduction = (0, import_react3.useMemo)(
    () => episodeDirectory === void 0 ? void 0 : parseEpisodeProduction(episodeDocuments, episodeDirectory),
    [episodeDirectory, episodeDocuments]
  ), productionLibrary = (0, import_react3.useMemo)(() => (workspace?.files ?? []).flatMap((file) => {
    if (file.kind !== "media" || file.mimeType?.startsWith("audio/") === !0) return [];
    if (!file.path.startsWith("\u5267\u96C6/") && !file.path.startsWith("\u4EA4\u4ED8/")) return [];
    let targetId = file.path.toLocaleUpperCase().match(/(?:SHOT|IMG|MOTION|VISUAL)-[A-Z0-9-]+/u)?.[0] ?? file.path.split("/").at(-2) ?? "PROJECT-MEDIA";
    return [{
      id: `workspace:${file.path}:${file.version}`,
      targetId,
      kind: file.mimeType?.startsWith("image/") === !0 ? "image" : "video",
      url: endpoint("media", sessionId, file.path),
      path: file.path
    }];
  }), [sessionId, workspace?.files]), productionVersions = (0, import_react3.useMemo)(() => {
    if (episodeProduction === void 0) return [];
    let episodeName = episodeProduction.episodeDirectory.split("/").at(-1) ?? "", knownTargets = [
      ...episodeProduction.shots.map((shot) => shot.id),
      ...episodeProduction.assets.map((asset) => asset.id),
      ...episodeProduction.visualAssets.map((asset) => asset.id),
      ...episodeProduction.motions.map((motion) => motion.id)
    ].sort((left, right) => right.length - left.length), motionTargets = new Map(episodeProduction.motions.flatMap((motion) => motion.shotId === void 0 ? [] : [[motion.id, motion.shotId]])), fromWorkspace = productionLibrary.flatMap((version) => {
      if (version.path === void 0 || !version.path.startsWith(`${episodeProduction.episodeDirectory}/`) && !version.path.startsWith(`\u4EA4\u4ED8/${episodeName}/`)) return [];
      let matched = mediaTargetFromPath(version.path, knownTargets), composition = /(?:^|\/)成片-[^/]+\.mp4$/iu.test(version.path) || /(?:^|\/)制作成果\/成片\//u.test(version.path);
      if (matched === void 0 && !composition) return [];
      let targetId = matched === void 0 ? episodeProduction.episodeDirectory : motionTargets.get(matched) ?? matched;
      return [{ ...version, targetId }];
    }), byId = /* @__PURE__ */ new Map();
    for (let version of fromWorkspace) byId.set(version.id, version);
    return [...byId.values()];
  }, [episodeProduction, productionLibrary]), productionSelectedId = episodeDirectory === void 0 ? void 0 : productionSelectedIds[episodeDirectory], productionJobs = episodeDirectory === void 0 ? [] : productionJobsByEpisode[episodeDirectory] ?? [], productionSelections = episodeDirectory === void 0 ? {} : productionSelectionsByEpisode[episodeDirectory] ?? {}, productionReferences = episodeDirectory === void 0 ? {} : productionReferencesByEpisode[episodeDirectory] ?? {}, productionSequence = episodeDirectory === void 0 ? [] : productionSequenceByEpisode[episodeDirectory] ?? [], productionCanvas = episodeDirectory === void 0 ? {} : productionCanvasByEpisode[episodeDirectory] ?? {}, productionZoom = episodeDirectory === void 0 ? 0.65 : productionZoomByEpisode[episodeDirectory] ?? 0.65, setProductionSelectedId = (0, import_react3.useCallback)((selectedId) => {
    episodeDirectory !== void 0 && actions.setProductionSelectedIds((current) => ({ ...current, [episodeDirectory]: selectedId }));
  }, [actions, episodeDirectory]), setProductionJobs = (0, import_react3.useCallback)((jobs) => {
    episodeDirectory !== void 0 && actions.setProductionJobs((current) => ({ ...current, [episodeDirectory]: jobs }));
  }, [actions, episodeDirectory]), setProductionSelections = (0, import_react3.useCallback)((selections) => {
    episodeDirectory !== void 0 && actions.setProductionSelections((current) => ({ ...current, [episodeDirectory]: selections }));
  }, [actions, episodeDirectory]), setProductionReferences = (0, import_react3.useCallback)((references) => {
    episodeDirectory !== void 0 && actions.setProductionReferences((current) => ({ ...current, [episodeDirectory]: references }));
  }, [actions, episodeDirectory]), setProductionSequence = (0, import_react3.useCallback)((sequence) => {
    episodeDirectory !== void 0 && actions.setProductionSequence((current) => ({ ...current, [episodeDirectory]: sequence }));
  }, [actions, episodeDirectory]), setProductionCanvas = (0, import_react3.useCallback)((canvas) => {
    episodeDirectory !== void 0 && actions.setProductionCanvas((current) => ({ ...current, [episodeDirectory]: canvas }));
  }, [actions, episodeDirectory]), setProductionZoom = (0, import_react3.useCallback)((zoom) => {
    episodeDirectory !== void 0 && actions.setProductionZoom((current) => ({ ...current, [episodeDirectory]: zoom }));
  }, [actions, episodeDirectory]), editorMode = useStore((memory) => memory.editorMode), setEditorMode = actions.setEditorMode, modeSelection = (0, import_react3.useRef)(selected), textareaRef = (0, import_react3.useRef)(null), editorPositions = (0, import_react3.useRef)(/* @__PURE__ */ new Map()), editorReady = buffer !== void 0 && buffer.missing !== !0, workspaceKind = workbench === "game" || workbench === "video" ? void 0 : workbench, gameBuilding = normalizedActivities.some(({ path }) => path.startsWith("game-adaptations/")), videoBuilding = normalizedActivities.some(({ path }) => path.startsWith("video-recaps/"));
  (0, import_react3.useEffect)(() => {
    buffersRef.current = buffers;
  }, [buffers]);
  let rememberEditorPosition = (0, import_react3.useCallback)(() => {
    let element = textareaRef.current;
    element === null || selected === void 0 || element.getAttribute("aria-label") !== selected || editorPositions.current.set(selected, {
      scrollTop: element.scrollTop,
      selectionStart: element.selectionStart,
      selectionEnd: element.selectionEnd
    });
  }, [selected]);
  (0, import_react3.useLayoutEffect)(() => {
    if (editorMode !== "source" || selected === void 0 || !editorReady) return;
    let element = textareaRef.current, position = editorPositions.current.get(selected);
    if (element === null || position === void 0) return;
    let end = Math.min(position.selectionEnd, element.value.length);
    element.setSelectionRange(Math.min(position.selectionStart, end), end), element.scrollTop = position.scrollTop;
  }, [editorMode, editorReady, selected]), (0, import_react3.useEffect)(() => {
    let warn = (event) => {
      Object.values(buffersRef.current).some((value) => value.source === "human" && value.content !== value.saved) && event.preventDefault();
    };
    return globalThis.addEventListener("beforeunload", warn), () => {
      globalThis.removeEventListener("beforeunload", warn);
    };
  }, []);
  let expandPath = (0, import_react3.useCallback)((path) => {
    let segments = path.split("/"), ancestors = [groupForPath(path)];
    for (let index = 1; index < segments.length - 1; index += 1) ancestors.push(segments.slice(0, index + 1).join("/"));
    setExpanded((current) => {
      let next = { ...current };
      for (let ancestor of ancestors) next[ancestor] = !0;
      return next;
    });
  }, []), revealPath = (0, import_react3.useCallback)((path) => {
    rememberEditorPosition();
    let nextWorkbench = workbenchModeForPath(path) ?? "story";
    setWorkbench(nextWorkbench), nextWorkbench === "game" && !path.includes("/build/app/") && setGameTab("design"), setSelected(path), expandPath(path);
  }, [expandPath, rememberEditorPosition]);
  (0, import_react3.useEffect)(() => {
    if (workspace === void 0) return;
    let pending = productionIntents.filter(({ callId }) => productionIntentCalls[callId] !== !0);
    if (pending.length !== 0) {
      for (let { intent } of pending) {
        if (intent.action === "open_section" || intent.action === "focus_target") {
          let documentPath = ["\u5206\u955C.md", "\u56FE\u7247\u63D0\u793A\u8BCD.md", "\u89C6\u89C9\u8BBE\u5B9A.md", "\u5267\u672C.md", "\u89C6\u9891\u63D0\u793A\u8BCD.md"].map((name2) => `${intent.episode}/${name2}`).find((path) => workspace.files.some((file) => file.path === path));
          documentPath !== void 0 && (setWorkbench("drama"), setSelected(documentPath), expandPath(documentPath), globalThis.setTimeout(() => {
            setEditorMode("production");
          }, 0));
        }
        if (intent.action === "open_section") setProductionSection(intent.section ?? "shots");
        else if (intent.action === "focus_target")
          actions.setProductionSelectedIds((current) => ({ ...current, [intent.episode]: intent.targetId })), setProductionSection(intent.section ?? (intent.targetId?.startsWith("SHOT-") === !0 ? "shots" : "assets"));
        else if (intent.action === "set_sequence")
          actions.setProductionSequence((current) => ({
            ...current,
            [intent.episode]: (intent.shotIds ?? []).map((shotId) => ({ shotId }))
          }));
        else if (intent.action === "track_job" && intent.jobId !== void 0 && intent.targetId !== void 0 && intent.jobKind !== void 0) {
          let { jobId, targetId, jobKind } = intent;
          actions.setProductionJobs((current) => {
            let jobs = current[intent.episode] ?? [];
            return jobs.some((job) => job.id === jobId) ? {
              ...current,
              [intent.episode]: jobs.map((job) => job.id === jobId ? {
                ...job,
                targetId,
                kind: jobKind,
                status: "running",
                progress: Math.max(10, job.progress),
                prompt: intent.prompt ?? job.prompt,
                expectedOutputs: intent.expectedOutputs ?? job.expectedOutputs,
                error: void 0
              } : job)
            } : {
              ...current,
              [intent.episode]: [...jobs, {
                ...createPendingJob({
                  id: jobId,
                  targetId,
                  kind: jobKind,
                  prompt: intent.prompt ?? "",
                  expectedOutputs: intent.expectedOutputs
                }),
                status: "running",
                progress: 10
              }]
            };
          });
        }
      }
      actions.setProductionIntentCalls((current) => ({
        ...current,
        ...Object.fromEntries(pending.map(({ callId }) => [callId, !0]))
      }));
    }
  }, [actions, expandPath, productionIntentCalls, productionIntents, setEditorMode, setProductionSection, setSelected, setWorkbench, workspace]);
  let openedGame = (0, import_react3.useRef)(!1);
  workbench === "game" && (openedGame.current = !0);
  let gameStudioMounted = openedGame.current, openedVideo = (0, import_react3.useRef)(!1);
  workbench === "video" && (openedVideo.current = !0);
  let videoStudioMounted = openedVideo.current, followAgentPath = (0, import_react3.useCallback)((path) => {
    expandPath(path);
    let current = selected === void 0 ? void 0 : buffersRef.current[selected];
    path !== selected && current?.source === "human" && current.content !== current.saved && surfaceRef.current?.ownerDocument.activeElement === textareaRef.current || workbench === "game" && gameTab === "preview" || workbench === "video" && videoTab === "preview" || revealPath(path);
  }, [expandPath, gameTab, revealPath, selected, videoTab, workbench]);
  (0, import_react3.useEffect)(() => {
    activityPath !== void 0 && activityPath === selected && !selectedMedia && setEditorMode("source");
  }, [activityPath, selected, selectedMedia]), (0, import_react3.useEffect)(() => {
    modeSelection.current !== selected && (modeSelection.current = selected, setEditorMode(selected !== void 0 && activityPaths.has(selected) ? "source" : selectedMedia || previewable ? "preview" : "source"));
  }, [activityPaths, previewable, selected, selectedMedia]), (0, import_react3.useEffect)(() => {
    workspaceLoading || activityPath === void 0 && (selected !== void 0 && ((workspace?.files.some((file) => file.path === selected) ?? !1) || buffers[selected] !== void 0) && workbenchModeForPath(selected) === workbench || setSelected(workspace === void 0 ? void 0 : preferredWorkbenchFile(workspace.files, workbench)));
  }, [activityPath, buffers, selected, workbench, workspace, workspaceLoading]), (0, import_react3.useEffect)(() => {
    if (workspace === void 0 || workspaceLoading) return;
    let paths = new Set(workspace.files.map((file) => file.path));
    setBuffers((current) => {
      let changed = !1, next = { ...current };
      for (let [path, value] of Object.entries(current))
        paths.has(path) || activityPaths.has(path) || value.source === "agent" && sessionRunning && path === settledPath || (value.source === "human" && value.content !== value.saved ? value.missing !== !0 && (next[path] = { ...value, missing: !0, error: "\u6587\u4EF6\u5DF2\u4ECE workspace \u79FB\u9664\u3002\u672C\u5730\u8349\u7A3F\u4ECD\u4FDD\u7559\uFF0C\u53EF\u590D\u5236\u540E\u653E\u5F03\u8349\u7A3F\u3002" }, changed = !0) : (delete next[path], changed = !0));
      return changed ? next : current;
    });
  }, [activityPaths, sessionRunning, settledPath, workspace, workspaceLoading]), (0, import_react3.useEffect)(() => {
    if (selected === void 0 || selectedMedia || activityPaths.has(selected) || !(workspace?.files.some((file) => file.path === selected) ?? !1)) return;
    let controller = new AbortController();
    return setBuffers((current) => {
      let existing = current[selected];
      return existing === void 0 ? current : { ...current, [selected]: { ...existing, error: void 0 } };
    }), fetch(endpoint("file", sessionId, selected), { signal: controller.signal }).then((response) => json(response)).then((file) => {
      setBuffers((current) => {
        let existing = current[file.path];
        return existing?.source === "human" && existing.content !== existing.saved ? existing.version === file.version ? { ...current, [file.path]: { ...existing, missing: !1, error: void 0 } } : {
          ...current,
          [file.path]: {
            ...existing,
            missing: !1,
            error: void 0,
            conflict: {
              message: `${file.path} \u5DF2\u5728\u78C1\u76D8\u4E0A\u66F4\u65B0\uFF1B\u4F60\u7684\u672C\u5730\u8349\u7A3F\u6CA1\u6709\u88AB\u8986\u76D6\u3002`,
              theirs: file.content,
              theirsVersion: file.version
            }
          }
        } : {
          ...current,
          [file.path]: { content: file.content, saved: file.content, source: "disk", version: file.version }
        };
      });
    }).catch((reason) => {
      controller.signal.aborted || setBuffers((current) => {
        let existing = current[selected];
        return existing === void 0 ? current : {
          ...current,
          [selected]: { ...existing, error: reason instanceof Error ? reason.message : String(reason) }
        };
      });
    }), () => {
      controller.abort();
    };
  }, [activityPaths, selected, selectedMedia, sessionId, workspace?.files]), (0, import_react3.useEffect)(() => {
    if (!productionAvailable) return;
    let missing = episodeDocumentPaths.filter((path) => buffersRef.current[path] === void 0 && !activityPaths.has(path));
    if (missing.length === 0) return;
    let controller = new AbortController();
    return Promise.all(missing.map((path) => fetch(endpoint("file", sessionId, path), { signal: controller.signal }).then((response) => json(response)))).then((files) => {
      setBuffers((current) => {
        let next = { ...current };
        for (let file of files) {
          let existing = next[file.path];
          existing?.source === "human" && existing.content !== existing.saved || (next[file.path] = { content: file.content, saved: file.content, source: "disk", version: file.version });
        }
        return next;
      });
    }).catch((reason) => {
      controller.signal.aborted || setBuffers((current) => {
        let next = { ...current };
        for (let path of missing) {
          let existing = next[path];
          existing !== void 0 && (next[path] = { ...existing, error: reason instanceof Error ? reason.message : String(reason) });
        }
        return next;
      });
    }), () => {
      controller.abort();
    };
  }, [activityPaths, episodeDocumentPaths, productionAvailable, sessionId]), (0, import_react3.useEffect)(() => {
    if (normalizedActivities.length !== 0) {
      for (let { path } of normalizedActivities) expandPath(path);
      activityPath !== void 0 && followAgentPath(activityPath), setBuffers((current) => {
        let next = current;
        for (let { activity: currentActivity, path } of normalizedActivities) {
          let existing = next[path];
          if (existing?.source === "human" && existing.content !== existing.saved) {
            next = {
              ...next,
              [path]: {
                ...existing,
                conflict: { message: `${path} \u6B63\u7531 Agent \u4FEE\u6539\uFF1B\u4F60\u7684\u672C\u5730\u8349\u7A3F\u5DF2\u9501\u5B9A\uFF0C\u4E0D\u4F1A\u88AB\u8986\u76D6\u3002` }
              }
            };
            continue;
          }
          let basis = activityBases.current.get(currentActivity.callId);
          (basis === void 0 || basis.path !== path) && (basis = { path, base: existing?.content ?? "" }, activityBases.current.set(currentActivity.callId, basis));
          let preview = previewMutation(currentActivity, basis.base);
          preview === void 0 || existing?.source === "agent" && existing.content === preview || (next = {
            ...next,
            [path]: {
              content: preview,
              saved: existing?.saved ?? "",
              source: "agent",
              version: existing?.version ?? ""
            }
          });
        }
        return next;
      });
    }
  }, [activityPath, expandPath, followAgentPath, normalizedActivities]), (0, import_react3.useEffect)(() => {
    let signals = new Set(mutatingCallIds(runningCalls));
    for (let { activity: currentActivity } of normalizedActivities) signals.add(currentActivity.callId.split(":", 1)[0] ?? currentActivity.callId);
    let settled = [...previousSignals.current].some((callId) => !signals.has(callId));
    for (let callId of activityBases.current.keys())
      signals.has(callId.split(":", 1)[0] ?? callId) || activityBases.current.delete(callId);
    previousSignals.current = signals, settled && reload();
  }, [normalizedActivities, reload, runningCalls]), (0, import_react3.useEffect)(() => {
    if (settledMutation === void 0 || settledMutation === consumedSettledMutation) return;
    if (settledMutationTurn === void 0 || !liveTurns.current.has(settledMutationTurn)) {
      actions.setSettledMutation(settledMutation);
      return;
    }
    if (workspace?.cwd === void 0) return;
    actions.setSettledMutation(settledMutation);
    let path = creativeRelativePath(settledMutation.slice(settledMutation.indexOf("\0") + 1), workspace.cwd);
    path !== void 0 && followAgentPath(path), reload();
  }, [actions, consumedSettledMutation, followAgentPath, reload, settledMutation, settledMutationTurn, workspace?.cwd]), (0, import_react3.useEffect)(() => {
    if (selected !== void 0) {
      for (let button of navRef.current?.querySelectorAll("button[data-file-path]") ?? [])
        if (button.dataset.filePath === selected) {
          button.scrollIntoView({ block: "nearest" });
          break;
        }
    }
  }, [selected]), (0, import_react3.useEffect)(() => {
    if (!open || normalizedActivities.length > 0 || workspace === void 0) return;
    let sessionSurface = surfaceRef.current?.parentElement;
    if (sessionSurface == null) return;
    let knownPaths = new Set(workspace.files.map((file) => file.path)), followOfficialFileLink = (event) => {
      let origin = event.target;
      if (!(origin instanceof Element)) return;
      let control = origin.closest("button, a");
      if (control === null || control.closest(".oh-story-split-surface") !== null) return;
      let candidates = [control.title, control.getAttribute("aria-label"), control.textContent];
      for (let candidate of candidates) {
        let path = creativeRelativePath(candidate?.trim().replace(/^(?:Open|打开)\s+/u, ""), workspace.cwd);
        if (!(path === void 0 || !knownPaths.has(path))) {
          event.preventDefault(), event.stopPropagation(), revealPath(path);
          break;
        }
      }
    };
    return sessionSurface.addEventListener("click", followOfficialFileLink, !0), () => {
      sessionSurface.removeEventListener("click", followOfficialFileLink, !0);
    };
  }, [normalizedActivities.length, open, revealPath, workspace]), (0, import_react3.useEffect)(() => {
    if (workbench !== "game" && workbench !== "video") return;
    let surface = surfaceRef.current, sessionSurface = surface?.parentElement, chat = Array.from(sessionSurface?.children ?? []).find((child) => child !== surface && child instanceof HTMLElement);
    if (!(chat instanceof HTMLElement)) return;
    let previous = {
      id: chat.id,
      role: chat.getAttribute("role"),
      labelledBy: chat.getAttribute("aria-labelledby")
    };
    return chat.id = compactChatId, chat.setAttribute("role", "tabpanel"), chat.setAttribute("aria-labelledby", `${compactTabsId}-chat-tab`), () => {
      chat.id = previous.id, previous.role === null ? chat.removeAttribute("role") : chat.setAttribute("role", previous.role), previous.labelledBy === null ? chat.removeAttribute("aria-labelledby") : chat.setAttribute("aria-labelledby", previous.labelledBy);
    };
  }, [compactChatId, compactTabsId, workbench]);
  let savePath = (0, import_react3.useCallback)(async (path) => {
    if (saveLocks.current.has(path)) return;
    let submitted = buffersRef.current[path];
    if (!(submitted === void 0 || submitted.missing === !0 || submitted.content === submitted.saved)) {
      saveLocks.current.add(path), setBuffers((current) => {
        let existing = current[path];
        return existing === void 0 ? current : { ...current, [path]: { ...existing, saving: !0, error: void 0 } };
      });
      try {
        let file = await json(await fetch(endpoint("file", sessionId, path), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content: submitted.content, baseVersion: submitted.version })
        }));
        setBuffers((current) => {
          let latest = current[path];
          if (latest === void 0) return current;
          let unchanged = latest.content === submitted.content;
          return {
            ...current,
            [path]: {
              content: unchanged ? file.content : latest.content,
              saved: file.content,
              source: unchanged ? "disk" : "human",
              version: file.version,
              saving: !1
            }
          };
        }), reload();
      } catch (reason) {
        if (reason instanceof WorkspaceRequestError && reason.status === 412)
          try {
            let theirs = await json(await fetch(endpoint("file", sessionId, path)));
            setBuffers((current) => {
              let latest = current[path];
              return latest === void 0 ? current : {
                ...current,
                [path]: {
                  ...latest,
                  saving: !1,
                  conflict: {
                    message: `${path} \u5DF2\u5728\u78C1\u76D8\u4E0A\u66F4\u65B0\uFF1B\u8BF7\u9009\u62E9\u4FDD\u7559\u54EA\u4E00\u7248\u3002`,
                    theirs: theirs.content,
                    theirsVersion: theirs.version
                  }
                }
              };
            });
          } catch (refreshError) {
            setBuffers((current) => {
              let existing = current[path];
              return existing === void 0 ? current : {
                ...current,
                [path]: { ...existing, saving: !1, error: refreshError instanceof Error ? refreshError.message : String(refreshError) }
              };
            });
          }
        else
          setBuffers((current) => {
            let existing = current[path];
            return existing === void 0 ? current : {
              ...current,
              [path]: { ...existing, saving: !1, error: reason instanceof Error ? reason.message : String(reason) }
            };
          });
      } finally {
        saveLocks.current.delete(path);
      }
    }
  }, [reload, sessionId]);
  (0, import_react3.useEffect)(() => {
    if (!open) return;
    let saveShortcut = (event) => {
      !(event.metaKey || event.ctrlKey) || event.key.toLocaleLowerCase() !== "s" || (event.preventDefault(), selected !== void 0 && savePath(selected));
    };
    return globalThis.addEventListener("keydown", saveShortcut), () => {
      globalThis.removeEventListener("keydown", saveShortcut);
    };
  }, [open, savePath, selected]);
  let groups = (0, import_react3.useMemo)(() => {
    let value = /* @__PURE__ */ new Map(), all = [...workspace?.files ?? []].filter((file) => workbenchModeForPath(file.path) === workbench);
    activityPath !== void 0 && !all.some((file) => file.path === activityPath) && all.push({ path: activityPath, bytes: 0, version: "", kind: "text" }), all.sort((left, right) => left.path.localeCompare(right.path, "zh-Hans-CN"));
    for (let file of all) {
      let directory2 = groupForPath(file.path), files = value.get(directory2) ?? [];
      files.push(file), value.set(directory2, files);
    }
    let order = GROUP_ORDER[workbench];
    return [...value.entries()].sort(([left], [right]) => {
      let leftIndex = order.indexOf(left), rightIndex = order.indexOf(right);
      return (leftIndex < 0 ? order.length : leftIndex) - (rightIndex < 0 ? order.length : rightIndex) || left.localeCompare(right, "zh-Hans-CN");
    });
  }, [activityPath, workbench, workspace]), selectWorkbench = (next) => {
    if (setWorkbench(next), next === "game" || next === "video") {
      next === "game" ? setGameTab("preview") : setVideoTab("preview"), setSelected(void 0);
      return;
    }
    let target = workspace === void 0 ? void 0 : preferredWorkbenchFile(workspace.files, next);
    target === void 0 ? setSelected(void 0) : revealPath(target);
  }, selectEditorMode = (next) => {
    next === "preview" && rememberEditorPosition(), setEditorMode(next);
  }, navigateProductionTarget = (target) => {
    let before = (buffersRef.current[target.path]?.content ?? "").slice(0, target.offset), approximateScrollTop = Math.max(0, before.split(/\r?\n/u).length * 28 - 96);
    editorPositions.current.set(target.path, { scrollTop: approximateScrollTop, selectionStart: target.offset, selectionEnd: target.offset }), modeSelection.current = target.path, revealPath(target.path), setEditorMode("source");
  }, selectedLabel = selected ?? `\u5728\u5F53\u524D DSH workspace \u4E2D\u9009\u62E9${workbenchLabel(workbench)}\u6587\u4EF6`, selectedBasename = selected?.split("/").at(-1) ?? selectedLabel, selectedGroup = selected === void 0 ? void 0 : groupForPath(selected), toggleGroup = (key, open2) => {
    setExpanded((current) => ({ ...current, [key]: open2 }));
  }, resolveConflict = (keepLocal) => {
    if (selected === void 0 || conflict?.theirs === void 0 || conflict.theirsVersion === void 0) return;
    let theirs = conflict.theirs, theirsVersion = conflict.theirsVersion;
    setBuffers((current) => {
      let existing = current[selected];
      return existing === void 0 ? current : {
        ...current,
        [selected]: keepLocal ? { ...existing, saved: theirs, version: theirsVersion, source: "human", conflict: void 0 } : { content: theirs, saved: theirs, source: "disk", version: theirsVersion }
      };
    });
  };
  return open ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { ref: surfaceRef, className: "oh-story-split-surface", "data-open": "true", "data-workbench": workbench, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("style", { children: plugin_default }),
    (workbench === "game" || workbench === "video") && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-mobile-switcher", role: "tablist", "aria-label": workbench === "game" ? "\u7A84\u5C4F\u6E38\u620F\u5DE5\u4F5C\u53F0" : "\u7A84\u5C4F\u89C6\u9891\u5DE5\u4F5C\u53F0", children: ["studio", "chat"].map((pane) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        type: "button",
        role: "tab",
        id: `${compactTabsId}-${pane}-tab`,
        "aria-controls": pane === "chat" ? compactChatId : workbench === "game" ? compactStudioId : compactVideoStudioId,
        "aria-selected": (workbench === "game" ? gamePane : videoPane) === pane,
        tabIndex: (workbench === "game" ? gamePane : videoPane) === pane ? 0 : -1,
        onKeyDown: (event) => {
          handleTabKey(event, ["studio", "chat"], workbench === "game" ? gamePane : videoPane, workbench === "game" ? setGamePane : setVideoPane);
        },
        onClick: () => {
          workbench === "game" ? setGamePane(pane) : setVideoPane(pane);
        },
        children: pane === "studio" ? "\u5236\u4F5C" : "\u5BF9\u8BDD"
      },
      pane
    )) }),
    workbench === "game" && workspace === void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("main", { id: compactStudioId, className: "oh-game-studio", role: "tabpanel", "aria-labelledby": `${compactTabsId}-studio-tab`, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-game-design-empty", children: error ?? "\u6B63\u5728\u8FDE\u63A5\u6E38\u620F\u5DE5\u4F5C\u53F0\u2026" }) }),
    workspace !== void 0 && gameStudioMounted && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      GameStudio,
      {
        sessionId,
        workspace,
        building: gameBuilding,
        selected,
        gameTab,
        gameProjectId,
        hidden: workbench !== "game",
        onGameTab: setGameTab,
        onGameProject: setGameProjectId,
        workbenches: WORKBENCH_MODES,
        paneId: compactStudioId,
        labelledBy: `${compactTabsId}-studio-tab`,
        onWorkbench: selectWorkbench,
        onCollapse: () => {
          applyWorkbenchPreference("closed");
        },
        onSelect: revealPath
      }
    ),
    workbench === "video" && workspace === void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("main", { id: compactVideoStudioId, className: "oh-video-studio", role: "tabpanel", "aria-labelledby": `${compactTabsId}-studio-tab`, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-video-preview-empty", children: error ?? "\u6B63\u5728\u8FDE\u63A5\u89C6\u9891\u5DE5\u4F5C\u53F0\u2026" }) }),
    workspace !== void 0 && videoStudioMounted && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      VideoStudio,
      {
        sessionId,
        projects: workspace.videos,
        running: videoBuilding,
        projectId: videoProjectId,
        tab: videoTab,
        hidden: workbench !== "video",
        workbenches: WORKBENCH_MODES,
        paneId: compactVideoStudioId,
        labelledBy: `${compactTabsId}-studio-tab`,
        onProject: setVideoProjectId,
        onTab: setVideoTab,
        onWorkbench: selectWorkbench,
        onCollapse: () => {
          applyWorkbenchPreference("closed");
        }
      }
    ),
    workbench !== "game" && workbench !== "video" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("aside", { className: "oh-story-tree", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-story-brand", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "oh-story-brand-cluster", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("strong", { children: [
              "\u2726 ",
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "Oh Story" })
            ] }),
            workspaceKind !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "oh-story-kind", children: workspaceKind === "story" ? "\u5C0F\u8BF4" : "\u77ED\u5267" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "oh-story-brand-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: reload, title: "\u5237\u65B0", "aria-label": "\u5237\u65B0\u9879\u76EE\u6587\u4EF6", children: "\u21BB" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => {
              applyWorkbenchPreference("closed");
            }, title: "\u6536\u8D77\u521B\u4F5C\u5DE5\u4F5C\u53F0", "aria-label": "\u6536\u8D77\u521B\u4F5C\u5DE5\u4F5C\u53F0", children: "\xD7" })
          ] })
        ] }),
        workspace !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-mode-tabs", role: "tablist", "aria-label": "\u521B\u4F5C\u5DE5\u4F5C\u53F0", children: WORKBENCH_MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            tabIndex: workbench === mode ? 0 : -1,
            "aria-selected": workbench === mode,
            onKeyDown: (event) => {
              handleTabKey(event, WORKBENCH_MODES, workbench, selectWorkbench);
            },
            onClick: () => {
              selectWorkbench(mode);
            },
            children: workbenchLabel(mode)
          },
          mode
        )) }),
        error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-error", children: error }),
        workspace?.metadataErrors.map((message) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-warning", children: message }, message)),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("nav", { ref: navRef, "aria-label": workbench === "story" ? "\u5C0F\u8BF4\u9879\u76EE\u6587\u4EF6" : "\u77ED\u5267\u9879\u76EE\u6587\u4EF6", children: groups.map(([directory2, files]) => {
          let groupOpen = selectedGroup === directory2 || expanded[directory2] === !0;
          return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { className: "oh-story-file-group", open: groupOpen, onToggle: (event) => {
            toggleGroup(directory2, event.currentTarget.open);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("summary", { children: [
              directory2,
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: files.length })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              FileTreeNodes,
              {
                nodes: buildFileTree(files, directory2),
                depth: 1,
                expanded,
                selected,
                activityPath,
                onToggle: toggleGroup,
                onSelect: revealPath
              }
            )
          ] }, directory2);
        }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("main", { className: "oh-story-editor", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "oh-story-editor-path", title: selected, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: selectedLabel }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: selectedBasename })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-story-editor-actions", children: [
            (previewable || productionAvailable) && !selectedMedia && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-editor-tabs", role: "tablist", "aria-label": productionAvailable ? "\u77ED\u5267\u6587\u6863\u67E5\u770B\u65B9\u5F0F" : markdown ? "Markdown \u67E5\u770B\u65B9\u5F0F" : "JSONL \u67E5\u770B\u65B9\u5F0F", children: editorModes.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "button",
              {
                type: "button",
                role: "tab",
                tabIndex: editorMode === mode ? 0 : -1,
                "aria-selected": editorMode === mode,
                onKeyDown: (event) => {
                  handleTabKey(event, editorModes, editorMode, selectEditorMode);
                },
                onClick: () => {
                  selectEditorMode(mode);
                },
                children: mode === "preview" ? "\u9884\u89C8" : mode === "source" ? "\u6E90\u7801" : "\u751F\u4EA7"
              },
              mode
            )) }),
            (dirty || saving) && selected !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "oh-story-save", type: "button", disabled: saving || buffer?.missing === !0, onClick: () => {
              savePath(selected);
            }, children: saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58" })
          ] })
        ] }),
        activity !== void 0 && activityPath !== void 0 && activityPath === selected && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-story-stream", "data-stage": activity.stage, role: "status", "aria-live": "polite", children: [
          "\u25CF ",
          activity.stage === "running" ? "Agent \u6B63\u5728\u5E94\u7528\u4FEE\u6539" : "Agent \u6B63\u5728\u751F\u6210\u6587\u4EF6\u5185\u5BB9"
        ] }),
        conflict !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-story-conflict", role: "alert", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: conflict.message }),
          conflict.theirs !== void 0 && conflict.theirsVersion !== void 0 && selected !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => {
              resolveConflict(!1);
            }, children: "\u8F7D\u5165\u78C1\u76D8\u7248\u672C" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => {
              resolveConflict(!0);
            }, children: "\u4FDD\u7559\u672C\u5730\u8349\u7A3F" })
          ] })
        ] }),
        fileError !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-error", children: fileError }),
        selected === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-empty", children: workbench === "story" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          "\u5F53\u524D workspace \u8FD8\u6CA1\u6709\u5C0F\u8BF4\u6587\u4EF6\u3002\u53EF\u5728\u53F3\u4FA7 Chat \u4E2D\u8FD0\u884C ",
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "/story-setup" }),
          "\u3002"
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          "\u5F53\u524D workspace \u8FD8\u6CA1\u6709\u77ED\u5267\u9879\u76EE\u3002\u53EF\u5728\u53F3\u4FA7 Chat \u4E2D\u8FD0\u884C ",
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "/short-drama" }),
          "\u3002"
        ] }) }) : selectedMedia && selectedFile !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oh-story-media-document", children: selectedFile.mimeType?.startsWith("image/") === !0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("img", { src: endpoint("media", sessionId, selectedFile.path), alt: selectedFile.path }) : selectedFile.mimeType?.startsWith("audio/") === !0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("audio", { src: endpoint("media", sessionId, selectedFile.path), controls: !0 }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("video", { src: endpoint("media", sessionId, selectedFile.path), controls: !0, preload: "metadata" }) }) : buffer === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-story-empty", children: [
          "\u6B63\u5728\u52A0\u8F7D ",
          selected,
          "\u2026"
        ] }) : buffer.missing === !0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "oh-story-empty", children: [
          "\u6587\u4EF6\u5DF2\u4ECE workspace \u79FB\u9664\uFF0C\u672C\u5730\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002\u8BF7\u5148\u590D\u5236\u9700\u8981\u7684\u5185\u5BB9\uFF0C\u518D\u653E\u5F03\u8349\u7A3F\u3002",
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => {
            setBuffers((current) => {
              let next = { ...current };
              return delete next[selected], next;
            }), setSelected(workspace === void 0 ? void 0 : preferredWorkbenchFile(workspace.files, workbench));
          }, children: "\u653E\u5F03\u672C\u5730\u8349\u7A3F" })
        ] }) : editorMode === "production" && productionAvailable && episodeProduction !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          DramaProductionView,
          {
            sessionId,
            production: episodeProduction,
            sessionRunning,
            queue: productionQueue,
            section: productionSection,
            selectedId: productionSelectedId,
            jobs: productionJobs,
            versions: productionVersions,
            libraryVersions: productionLibrary,
            selections: productionSelections,
            manualReferences: productionReferences,
            sequence: productionSequence,
            canvas: productionCanvas,
            zoom: productionZoom,
            onSectionChange: setProductionSection,
            onSelect: setProductionSelectedId,
            onNavigate: navigateProductionTarget,
            onJobsChange: setProductionJobs,
            onSelectionsChange: setProductionSelections,
            onManualReferencesChange: setProductionReferences,
            onOpenMedia: (path) => {
              revealPath(path);
            },
            onSequenceChange: setProductionSequence,
            onCanvasChange: setProductionCanvas,
            onZoomChange: setProductionZoom,
            onDispatchPrompt: sendProductionPrompt,
            onCancelTurn: cancelProduction,
            onRemoveQueued: removeQueuedProduction,
            onRefresh: reload
          }
        ) : previewable && editorMode === "preview" ? markdown ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(MarkdownPreview, { content: buffer.content, label: selected }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(JsonlPreview, { content: buffer.content, label: selected }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "textarea",
          {
            ref: textareaRef,
            value: buffer.content,
            "data-format": structured ? "structured" : "prose",
            onBlur: rememberEditorPosition,
            onScroll: rememberEditorPosition,
            onSelect: rememberEditorPosition,
            onChange: (event) => {
              let content = event.target.value;
              setBuffers((current) => ({
                ...current,
                [selected]: {
                  content,
                  saved: current[selected]?.saved ?? "",
                  source: "human",
                  version: current[selected]?.version ?? "",
                  conflict: current[selected]?.conflict,
                  saving: current[selected]?.saving
                }
              }));
            },
            spellCheck: !structured,
            "aria-label": selected
          }
        )
      ] })
    ] })
  ] }) : !creativeProject && error === void 0 ? welcome ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(WelcomeGuide, {}) : null : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { ref: surfaceRef, className: "oh-story-split-surface", "data-open": "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("style", { children: plugin_default }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { className: "oh-story-launcher", type: "button", title: error ?? "\u6253\u5F00\u521B\u4F5C\u5DE5\u4F5C\u53F0", "aria-label": "\u6253\u5F00\u521B\u4F5C\u5DE5\u4F5C\u53F0", onClick: () => {
      applyWorkbenchPreference("open");
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { "aria-hidden": !0, children: "\u2726" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("b", { children: "\u521B\u4F5C\u5DE5\u4F5C\u53F0" })
    ] })
  ] });
}
function CreativeSplitBridge(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SessionWorkbenchMemory, { ...props }, props.sessionId);
}
function SessionWorkbenchMemory(props) {
  let { sessionId, useStore, actions } = props, hydrated = useStore((state) => state.hydrated);
  return (0, import_react3.useLayoutEffect)(() => {
    hydrated || actions.restore(workbenchMemoryBySession.get(sessionId));
  }, [actions, hydrated, sessionId]), hydrated ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(WorkbenchMemoryMirror, { sessionId, useStore }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SessionWorkbenchBridge, { ...props })
  ] }) : null;
}
function WorkbenchMemoryMirror({ sessionId, useStore }) {
  let memory = useStore((state) => state);
  return (0, import_react3.useEffect)(() => {
    workbenchMemoryBySession.set(sessionId, memory);
  }, [memory, sessionId]), null;
}
function SessionWorkbenchBridge({ sessionId, useSession, useSessions, useProjection, useChat, useStore, actions, sendProductionPrompt, cancelProduction, removeQueuedProduction }) {
  let marker = (0, import_react3.useRef)(null), [target, setTarget] = (0, import_react3.useState)(), runningCalls = useChat((snapshot) => snapshot.legacy.runningCalls), partial = useChat((snapshot) => streamingAssistant(snapshot.timeline)), undispatched = useChat((snapshot) => undispatchedCalls(snapshot), sameUndispatchedCalls), settledMutation = useChat((snapshot) => latestSettledMutation(snapshot)), settledMutationTurn = useChat((snapshot) => latestSettledMutationTurn(snapshot)), liveTurn = useChat((snapshot) => openTurn(snapshot)), workbench = useStore((memory) => memory.workbench), gamePane = useStore((memory) => memory.gamePane), videoPane = useStore((memory) => memory.videoPane), sessionRunning = useSession((snapshot) => snapshot.running), inboxRows = useProjection("inbox", (inbox) => inbox?.["next-turn"]), pendingSubmissions = useSession((snapshot) => snapshot.pendingSubmissions), productionQueue = (0, import_react3.useMemo)(() => productionQueueFromInbox(
    inboxRows,
    new Set(pendingSubmissions.filter((item) => item.placement === "transcript").map((item) => item.requestId))
  ), [inboxRows, pendingSubmissions]), chat = useChat((snapshot) => snapshot), productionIntents = (0, import_react3.useMemo)(() => settledProductionIntents(chat), [chat]), { workspace, error, loading: workspaceLoading, reload } = useWorkspace(sessionId), chosenPreference = useStore((memory) => memory.workbenchPreference), creativeProject = hasCreativeProject(workspace), welcome = useSessions((state) => state.byId[sessionId]?.blank === !0) && workspace !== void 0 && !workspaceLoading && !creativeProject, storedPreference = (0, import_react3.useMemo)(
    () => readWorkbenchPreference(workbenchPreferenceStorage(), workspace?.cwd),
    [workspace?.cwd]
  ), open = resolveWorkbenchOpen(chosenPreference ?? storedPreference, creativeProject);
  return (0, import_react3.useLayoutEffect)(() => {
    let document = marker.current?.ownerDocument;
    if (document === void 0) return;
    let locate = () => {
      let anchor = document.querySelector(
        `[data-conversation-content][data-conversation-session="${CSS.escape(sessionId)}"]:not([data-sidebar-chat] *) > [data-conversation-scroll] > [data-slot='conversation.session']`
      );
      setTarget((current) => current === anchor ? current : anchor ?? void 0);
    };
    locate();
    let observer = new MutationObserver(locate);
    return observer.observe(document.body, { childList: !0, subtree: !0 }), () => {
      observer.disconnect();
    };
  }, [sessionId]), (0, import_react3.useLayoutEffect)(() => {
    let scroller = target?.parentElement;
    if (scroller == null) return;
    if (!open) {
      let publishSeam = () => {
        let box = scroller.getBoundingClientRect();
        scroller.style.setProperty("--oh-story-seam-top", `${String(box.top)}px`), scroller.style.setProperty("--oh-story-seam-right", `${String(scroller.ownerDocument.documentElement.clientWidth - box.right)}px`);
      };
      publishSeam();
      let seams = new ResizeObserver(publishSeam);
      seams.observe(scroller);
      let view = scroller.ownerDocument.defaultView;
      return view?.addEventListener("resize", publishSeam), () => {
        seams.disconnect(), view?.removeEventListener("resize", publishSeam), scroller.style.removeProperty("--oh-story-seam-top"), scroller.style.removeProperty("--oh-story-seam-right");
      };
    }
    let composerSeat = () => scroller.querySelector(":scope > [data-composer-seat]"), parkedAtTail = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= 8, parked = parkedAtTail(), drivenAt = 0, markDriven = (event) => {
      event.target instanceof Node && composerSeat()?.contains(event.target) === !0 || event.type === "pointerdown" && event.target !== scroller || (drivenAt = performance.now());
    }, trackParked = () => {
      parkedAtTail() ? parked = !0 : performance.now() - drivenAt < 400 && (parked = !1);
    }, publishLayout = () => {
      scroller.style.setProperty("--oh-story-scroll-height", `${String(scroller.clientHeight)}px`), scroller.style.setProperty("--oh-story-composer-height", `${String(composerSeat()?.getBoundingClientRect().height ?? 0)}px`), scroller.dataset.ohStoryWorkbench = workbench;
      let studioPane = workbench === "video" ? videoPane : gamePane;
      scroller.dataset.ohStudioPane = studioPane;
      let compactAt = workbench === "game" || workbench === "video" ? 720 : 620, mediumAt = workbench === "game" || workbench === "video" ? 960 : 900, layout = scroller.clientWidth < compactAt ? "compact" : scroller.clientWidth < mediumAt ? "medium" : "wide";
      scroller.dataset.ohStoryLayout !== layout && (scroller.dataset.ohStoryLayout = layout), parked && (scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight);
    }, observer = new ResizeObserver(publishLayout), observed = /* @__PURE__ */ new WeakSet(), flowObserved = !1, observePanes = () => {
      let flow = scroller.querySelector("[data-chat-flow]:not([data-step-process-content])");
      flowObserved = flow !== null;
      for (let pane of [composerSeat(), flow])
        pane === null || observed.has(pane) || (observed.add(pane), observer.observe(pane));
    };
    publishLayout(), scroller.addEventListener("scroll", trackParked, { passive: !0 });
    for (let driven of ["wheel", "touchmove", "pointerdown", "keydown"])
      scroller.addEventListener(driven, markDriven, { passive: !0 });
    observer.observe(scroller), observePanes();
    let seats = new MutationObserver(() => {
      observePanes(), publishLayout();
    });
    seats.observe(scroller, { childList: !0 });
    let panes = new MutationObserver(() => {
      flowObserved || observePanes();
    });
    return panes.observe(scroller, { childList: !0, subtree: !0 }), () => {
      panes.disconnect(), scroller.removeEventListener("scroll", trackParked);
      for (let driven of ["wheel", "touchmove", "pointerdown", "keydown"])
        scroller.removeEventListener(driven, markDriven);
      observer.disconnect(), seats.disconnect(), scroller.style.removeProperty("--oh-story-scroll-height"), scroller.style.removeProperty("--oh-story-composer-height"), delete scroller.dataset.ohStoryLayout, delete scroller.dataset.ohStoryWorkbench, delete scroller.dataset.ohStudioPane;
    };
  }, [gamePane, open, target, videoPane, workbench]), /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { ref: marker, className: "oh-story-bridge-marker", "aria-hidden": !0 }),
    target === void 0 ? null : (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      CreativeWorkbench,
      {
        sessionId,
        runningCalls,
        partial,
        undispatched: sessionRunning ? undispatched : NO_UNDISPATCHED_CALLS,
        settledMutation,
        settledMutationTurn,
        liveTurn,
        sessionRunning,
        productionQueue,
        productionIntents,
        workspace,
        error,
        workspaceLoading,
        reload,
        open,
        creativeProject,
        welcome,
        sendProductionPrompt,
        cancelProduction,
        removeQueuedProduction,
        useStore,
        actions
      }
    ), target)
  ] });
}
function WelcomeGuide() {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "oh-story-welcome", "aria-label": "Oh Story \u4F7F\u7528\u5F15\u5BFC", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("style", { children: plugin_default }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { children: "Oh Story \u5DF2\u52A0\u8F7D" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: "\u4F5C\u54C1\u76EE\u5F55\u4E2D\u6709\u521B\u4F5C\u6587\u4EF6\u65F6\uFF0C\u5C0F\u8BF4\u3001\u77ED\u5267\u3001\u6E38\u620F\u3001\u89C6\u9891\u5DE5\u4F5C\u53F0\u4F1A\u81EA\u52A8\u663E\u793A\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("ol", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("li", { children: "\u70B9\u51FB\u5DE6\u4FA7\u300C\u5DE5\u4F5C\u533A / Workspaces\u300D\u65C1\u7684\u300C\u6DFB\u52A0\u5DE5\u4F5C\u533A / Add workspace\u300D\uFF0C\u9009\u62E9\u5B58\u653E\u4F5C\u54C1\u7684\u6587\u4EF6\u5939\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("li", { children: "\u5728\u4E0B\u65B9\u300C\u9009\u62E9\u5DE5\u4F5C\u533A / Choose workspace\u300D\u4E2D\u9009\u4E2D\u8BE5\u76EE\u5F55\uFF0C\u6216\u6253\u5F00\u5DF2\u6709\u4F1A\u8BDD\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("li", { children: "\u7A7A\u76EE\u5F55\uFF08\u5305\u62EC DSH \u81EA\u52A8\u5EFA\u7ACB\u7684\u300C\u9ED8\u8BA4\u5DE5\u4F5C\u533A / Default workspace\u300D\uFF09\u5148\u5728 Chat \u4E2D\u5F00\u59CB\u521B\u4F5C\uFF0C\u751F\u6210\u7B2C\u4E00\u4E2A\u521B\u4F5C\u6587\u4EF6\u540E\uFF0C\u5DE5\u4F5C\u53F0\u4F1A\u81EA\u52A8\u51FA\u73B0\u3002" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { children: [
      "\u67E5\u770B\u5DF2\u6709\u4F5C\u54C1\u65E0\u9700 API Key\u3002\u5F00\u59CB AI \u521B\u4F5C\u524D\uFF0C\u5728\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u300D\u914D\u7F6E\u6A21\u578B\uFF0C\u518D\u8F93\u5165 ",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "/story" }),
      "\u3001",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "/short-drama" }),
      "\u3001",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "/novel-to-game quick" }),
      " \u6216 ",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "/video-recap" }),
      "\u3002"
    ] })
  ] });
}
function WorkbenchWelcome() {
  let marker = (0, import_react3.useRef)(null), [target, setTarget] = (0, import_react3.useState)();
  return (0, import_react3.useLayoutEffect)(() => {
    let document = marker.current?.ownerDocument;
    if (document === void 0) return;
    let locate = () => {
      let anchor = document.querySelector("[data-conversation-content]:not([data-sidebar-chat] *) > [data-conversation-scroll]");
      setTarget((current) => current === anchor ? current : anchor ?? void 0);
    };
    locate();
    let observer = new MutationObserver(locate);
    return observer.observe(document.body, { childList: !0, subtree: !0 }), () => {
      observer.disconnect();
    };
  }, []), /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { ref: marker, className: "oh-story-bridge-marker", "aria-hidden": !0 }),
    target === void 0 ? null : (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime5.jsx)(WelcomeGuide, {}), target)
  ] });
}
function WorkbenchSeat({ SessionProvider, renderSlot }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SessionProvider, { empty: () => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(WorkbenchWelcome, {}), children: renderSlot("oh-story.workspace", {}) });
}
function argsOf(block) {
  let raw = ("kind" in block ? block.call?.argsRaw : block.phase === "start" ? block.argsRaw : void 0) ?? "{}";
  try {
    let value = JSON.parse(raw);
    return typeof value == "object" && value !== null && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
function resultOf(block) {
  if ("kind" in block)
    return block.content.map((item) => item.type === "text" ? item.text : JSON.stringify(item, null, 2)).join(`
`);
}
function RoleToolView({ block, inspect }) {
  let args = argsOf(block), role = typeof args.role == "string" ? args.role : "story-role", output = resultOf(block), state = "kind" in block ? block.isError ? "error" : "done" : "running";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { className: "oh-story-role", "data-state": state, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("style", { children: plugin_default }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("summary", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "\u2726 Role" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: role }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("em", { children: state === "running" ? "\u8FD0\u884C\u4E2D" : state === "error" ? "\u5931\u8D25" : "\u5B8C\u6210" })
    ] }),
    output !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { children: output }),
    inspect !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: inspect, children: "\u5728\u8F68\u8FF9\u4E2D\u68C0\u67E5" })
  ] });
}
function ProductionToolView({ block, inspect }) {
  let args = argsOf(block), action = typeof args.action == "string" ? args.action : "production", episode = typeof args.episode == "string" ? args.episode : "\u77ED\u5267", state = "kind" in block ? block.isError ? "error" : "done" : "running";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { className: "oh-story-role", "data-state": state, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("style", { children: plugin_default }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("summary", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "\u25A6 \u751F\u4EA7" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("strong", { children: [
        episode,
        " \xB7 ",
        action
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("em", { children: state === "running" ? "\u6267\u884C\u4E2D" : state === "error" ? "\u5931\u8D25" : "\u5DF2\u5E94\u7528" })
    ] }),
    resultOf(block) !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { children: resultOf(block) }),
    inspect !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: inspect, children: "\u5728\u8F68\u8FF9\u4E2D\u68C0\u67E5" })
  ] });
}
function apply(context) {
  context.slots.inject("shell.overlay", () => {
    let disposeSeat = context.slots.register({
      name: "shell.overlay",
      id: "oh-story-workspace",
      order: -100,
      children: { "oh-story.workspace": { kind: "single", scope: "session" } }
    }, WorkbenchSeat), disposeWorkbench = context.slots.register({
      name: "oh-story.workspace",
      store: createWorkbenchStore,
      inject: (sessionId) => {
        let binding = context.sessions.binding(sessionId), conversation = binding?.ctx.get("conversation");
        return binding === void 0 || conversation === void 0 ? {
          sendProductionPrompt: () => Promise.reject(new Error("DSH \u4F1A\u8BDD\u5F53\u524D\u4E0D\u53EF\u7528\u3002")),
          cancelProduction: () => Promise.reject(new Error("DSH \u4F1A\u8BDD\u5F53\u524D\u4E0D\u53EF\u7528\u3002")),
          removeQueuedProduction: () => Promise.reject(new Error("DSH \u4F1A\u8BDD\u5F53\u524D\u4E0D\u53EF\u7528\u3002"))
        } : {
          sendProductionPrompt: (prompt) => conversation.send(prompt),
          cancelProduction: () => conversation.cancel(),
          removeQueuedProduction: (itemId) => conversation.updateQueue(itemId, { kind: "remove" })
        };
      }
    }, CreativeSplitBridge);
    return [disposeSeat, disposeWorkbench];
  }), context.slots.inject("tool.call.toolview", () => context.slots.register({
    name: "tool.call.toolview",
    key: "oh_story_role"
  }, RoleToolView)), context.slots.inject("tool.call.toolview", () => context.slots.register({
    name: "tool.call.toolview",
    key: OH_STORY_PRODUCTION_TOOL_NAME
  }, ProductionToolView));
}
var index_default = { name, inject, apply };
;return module.exports;}});
//# sourceMappingURL=client.js.map
