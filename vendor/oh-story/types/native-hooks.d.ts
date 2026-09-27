import type { Context } from "@deepseek-ai/cordis";
import type { FileSystem } from "@deepseek-ai/dsh-fs";
import { type ContextFormed } from "@deepseek-ai/dsh-llm";
import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        /** DSH 0.1.7 dropped the shared `plugin` kind: each producer declares its own. */
        "oh-story-post-write": {
            kind: "oh-story-post-write";
        } & ContextFormed;
    }
}
export interface StoryMutation {
    readonly root: string;
    /** Workspace-relative path of the mutated 正文 file. */
    readonly path: string;
    readonly chapter?: number;
}
export declare function detectStoryMutation(name: string, args: unknown, cwd: string | undefined): StoryMutation | undefined;
type StoryFileSystem = Pick<FileSystem, "resolve" | "contains" | "stat" | "listDir">;
/**
 * DSH's explicit import-window marker, relative to the book directory (the
 * workspace root in DSH's single-book layout). The story-import overlay has
 * the model create it before copying chapters and delete it once
 * `tracking_commit.py init` and `check` succeed.
 */
export declare const IMPORT_MARKER = ".story/work/\u5BFC\u5165\u4E2D.md";
/**
 * Mirrors the outline gate of upstream Oh Story's prose guard
 * (`proseBlockReason`) for books with 大纲/ or 追踪/: creating a new
 * `正文/第N章*.md` requires its `大纲/细纲_第N章*.md`, whether or not Tracking
 * exists yet. The one bypass is an import window — an import signal while the
 * book has no `追踪/_tracking-state.json`. Rewriting an existing chapter is not
 * gated on its outline.
 *
 * It leaves out the rest of proseBlockReason: the Tracking checkpoint (state
 * present and at schema_version 4, 上下文.md at the same state revision, the
 * previous chapter committed), the previous chapter's toxic-phrase debt, the
 * short-story gate that wants 小节大纲.md before 正文.md, and shell-write
 * targets (redirection, cp, tee, scripts), which DSH hooks do not see as file
 * mutations — the story-long-write overlay asks for write/edit instead. It also
 * leaves a workspace with 正文/ but neither 大纲/ nor 追踪/ unguarded.
 */
export declare function validateStoryMutation(fs: StoryFileSystem, mutation: StoryMutation, signal?: AbortSignal): Promise<string | undefined>;
export declare function decideStoryMutation(exec: ToolExecution, next: () => Promise<PreToolDecision>): Promise<PreToolDecision>;
/**
 * Mirror of upstream's `analysis-input-guard` (story_hook_cli.js): the
 * chapter-extractor may write or edit only
 * `{拆文目录}/_analysis_cache/输入-{RAW|REUSE}-{起章}-{止章}.md`, where the
 * 拆文目录 holds `chapter_index.csv` or `_progress.md` and lies inside the
 * workspace. The commit script still validates the file's content.
 */
export declare function validateAnalysisInputWrite(fs: StoryFileSystem, cwd: string, path: string | undefined, signal?: AbortSignal): Promise<string | undefined>;
/**
 * Fence file mutations by a chapter-extractor child to its batch input file.
 * The child is identified by the Role DSH recorded in its Session descriptor,
 * so other Roles and the main Agent are unaffected.
 */
export declare function decideChapterExtractorWrite(exec: ToolExecution, next: () => Promise<PreToolDecision>): Promise<PreToolDecision>;
export interface PostWriteReminderOptions {
    /** The book has no 追踪/_tracking-state.json and no import signal. */
    readonly trackingUninitialized?: boolean;
}
export declare function postWriteReminderText(path: string, options?: PostWriteReminderOptions): string;
/**
 * Native DSH equivalents of the upstream prose guards. They join DSH's typed
 * tool waterfall, so decisions remain visible in the official approval/tool UI.
 */
export declare function registerOhStoryHooks(context: Context): void;
export {};
//# sourceMappingURL=native-hooks.d.ts.map