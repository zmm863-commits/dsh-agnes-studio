import type { Context } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
export { createDramaSkillProvider, createNovelToGameSkillProvider, createOhStorySkillProvider, createVideoRecapSkillProvider, parseBundledSkill } from "./skill-provider.js";
export { OH_STORY_ROLE_NAMES, loadBundledRole } from "./role-provider.js";
export { createOhStoryRoleTool, OH_STORY_ROLE_TOOL_NAME, registerOhStoryRoleTool, roleToolFilter, type OhStoryRoleSubagents } from "./role-tool.js";
export { createOhStoryProductionTool, registerOhStoryProductionTool } from "./production-tool.js";
export { OH_STORY_PRODUCTION_TOOL_NAME, validateProductionIntent, type ProductionIntentArgs } from "./production-intent.js";
export { bundledReferenceGuard, createOhStoryReferenceTool, OH_STORY_REFERENCE_TOOL_NAME } from "./reference-tool.js";
export { registerWorkspaceRoute } from "./workspace-route.js";
export { registerOhStoryHooks } from "./native-hooks.js";
export { DRAMA_ADAPTER_CONFIG_ENV, DRAMA_ADAPTERS, dramaAdapterConfigPath, dramaAdapterStatuses, ensureDramaAdapterConfig } from "./drama-adapters.js";
export declare const name = "oh-story";
export declare const inject: string[];
/** DSH owns models, providers, presets, permissions, roots, runs, and sessions. */
export interface Config {
    readonly editorMaxBytes?: number;
    readonly trustedHosts?: string[];
}
export declare const Config: z<Config>;
/** Mount only domain contributions into the current DSH process. */
export declare function apply(context: Context, config?: Config): Promise<void>;
declare const _default: {
    name: string;
    inject: string[];
    Config: z<Config>;
    apply: typeof apply;
};
export default _default;
//# sourceMappingURL=index.d.ts.map