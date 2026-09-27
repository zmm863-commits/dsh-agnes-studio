export declare const OH_STORY_PRODUCTION_TOOL_NAME = "oh_story_production";
export declare const PRODUCTION_INTENT_ACTIONS: readonly ["open_section", "focus_target", "set_sequence", "track_job"];
export declare const PRODUCTION_INTENT_SECTIONS: readonly ["shots", "assets", "tasks", "sequence", "canvas"];
export declare const PRODUCTION_INTENT_JOB_KINDS: readonly ["image", "video", "composition"];
export type ProductionIntentAction = typeof PRODUCTION_INTENT_ACTIONS[number];
export type ProductionIntentSection = typeof PRODUCTION_INTENT_SECTIONS[number];
export type ProductionIntentJobKind = typeof PRODUCTION_INTENT_JOB_KINDS[number];
export interface ProductionIntentArgs {
    readonly action: ProductionIntentAction;
    readonly episode: string;
    readonly section?: ProductionIntentSection | undefined;
    readonly targetId?: string | undefined;
    readonly shotIds?: readonly string[] | undefined;
    readonly jobId?: string | undefined;
    readonly jobKind?: ProductionIntentJobKind | undefined;
    readonly expectedOutputs?: number | undefined;
    readonly prompt?: string | undefined;
}
/** Validate the cross-runtime UI intent without reading or mutating workspace state. */
export declare function validateProductionIntent(args: ProductionIntentArgs): ProductionIntentArgs;
//# sourceMappingURL=production-intent.d.ts.map