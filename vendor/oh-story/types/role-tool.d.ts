import type { Context } from "@deepseek-ai/cordis";
import type { SubagentRuntime } from "@deepseek-ai/dsh-subagent";
import { type ToolDefinition } from "@deepseek-ai/dsh-tools";
import { type OhStoryRoleName } from "./role-provider.js";
export declare const OH_STORY_ROLE_TOOL_NAME = "oh_story_role";
export type OhStoryRoleSubagents = Pick<SubagentRuntime, "start">;
export declare function roleToolFilter(role: OhStoryRoleName): {
    readonly allow: readonly string[];
};
export declare function createOhStoryRoleTool(subagents?: OhStoryRoleSubagents): Promise<ToolDefinition>;
export declare function registerOhStoryRoleTool(context: Context): Promise<void>;
//# sourceMappingURL=role-tool.d.ts.map