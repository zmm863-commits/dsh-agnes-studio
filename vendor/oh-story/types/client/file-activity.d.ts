import type { ChatSnapshot } from "@deepseek-ai/dsh-client-ui-chat/client";
import type { ConversationTimelineSnapshot, PartialAssistant, RunningToolCall } from "@deepseek-ai/dsh-client-ui-conversation/client";
export type MutationToolName = "write" | "edit" | "str_replace_editor";
export interface FileMutationActivity {
    readonly callId: string;
    readonly name: MutationToolName;
    readonly argsRaw: string;
    readonly stage: "streaming" | "running";
    readonly path: string | undefined;
    readonly operation: "replace-file" | "replace-text" | "insert-text" | undefined;
    readonly oldText: string | undefined;
    readonly newText: string | undefined;
    readonly replaceAll: boolean;
}
interface JsonStringPrefix {
    readonly value: string;
    readonly complete: boolean;
}
export type WorkbenchMode = "story" | "drama" | "game" | "video";
export declare function workbenchLabel(mode: WorkbenchMode): string;
export interface WorkspaceFilePath {
    readonly path: string;
}
/** Read the latest running Assistant step, including tool-only steps hidden from the Chat list. */
export declare function streamingAssistant(timeline: ConversationTimelineSnapshot): PartialAssistant | null;
/** Read a JSON string even while the model is still streaming its closing quote. */
export declare function jsonStringPrefix(raw: string, key: string): JsonStringPrefix | undefined;
/** A call a finished Assistant step issued that DSH has not settled yet. */
export interface UndispatchedCall {
    readonly callId: string;
    readonly name: string;
    readonly argsRaw: string;
}
/**
 * Calls of the open Turn whose Assistant step has finished streaming but that have no result yet.
 * DSH 0.1.7 hides such a call's tool row until its durable `tool/call` event — through pre-execute
 * hooks and any approval — so it is in neither `partial` nor the running calls, and a call it does
 * list stays `preparing` without arguments. The step's own tool-call block still holds them.
 */
export declare function undispatchedCalls(chat: ChatSnapshot): UndispatchedCall[];
export declare function sameUndispatchedCalls(left: readonly UndispatchedCall[], right: readonly UndispatchedCall[]): boolean;
/** Return every active file mutation in official DSH dispatch order, including nested Code Mode calls. */
export declare function fileMutations(runningCalls: readonly RunningToolCall[], partial?: PartialAssistant | null, undispatched?: readonly UndispatchedCall[]): FileMutationActivity[];
/** Running calls whose settlement may have changed creative files. */
export declare function mutatingCallIds(runningCalls: readonly RunningToolCall[]): ReadonlySet<string>;
/** Latest durable successful mutation, used when a fast call skips the live render window. */
export declare function latestSettledMutation(chat: ChatSnapshot): string | undefined;
/** The Turn that produced {@link latestSettledMutation}, when the Chat still locates it. */
export declare function latestSettledMutationTurn(chat: ChatSnapshot): number | undefined;
/** The last Turn while it is open. A reloaded Session shows history Turns as closed. */
export declare function openTurn(chat: ChatSnapshot): number | undefined;
/** Convert a DSH tool path to the creative-relative path accepted by the narrow route. */
export declare function creativeRelativePath(path: string | undefined, cwd: string | undefined): string | undefined;
export declare function workbenchModeForPath(path: string | undefined): WorkbenchMode | undefined;
/** Choose the first useful document when a creative workbench opens. */
export declare function preferredWorkbenchFile(files: readonly WorkspaceFilePath[], mode: WorkbenchMode): string | undefined;
/** Project one streamed mutation over its immediate predecessor. */
export declare function previewMutation(activity: FileMutationActivity, base: string): string | undefined;
export {};
//# sourceMappingURL=file-activity.d.ts.map