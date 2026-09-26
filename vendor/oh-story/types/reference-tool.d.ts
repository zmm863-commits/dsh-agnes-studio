import { type ToolDefinition, type ToolGuard, type ToolRuntime } from "@deepseek-ai/dsh-tools";
export declare const OH_STORY_REFERENCE_TOOL_NAME = "oh_story_bundled_reference";
export declare function createOhStoryReferenceTool(storySetupRoot?: string): Promise<ToolDefinition>;
/** Deny a scoped same-name replacement instead of executing untrusted reference code. */
export declare function bundledReferenceGuard(definition: ToolDefinition, tools: Pick<ToolRuntime, "get">): ToolGuard;
//# sourceMappingURL=reference-tool.d.ts.map