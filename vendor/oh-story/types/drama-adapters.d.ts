/**
 * Drama Skills generates no media by itself and neither does DeepSeek: every
 * image, video, speech, or music result comes from a provider adapter that
 * `short-drama-produce` runs through `production_tool.py run --adapter-config`.
 * Upstream deliberately leaves that config file and its credentials outside
 * every project. This module names the bundled adapters (five as of Drama
 * Skills 0.7.1, one per `provider_adapters.py` choice), registers them for the
 * current DSH host so the Agent has a file to pass, and reports which host
 * environment variables are present — never their values.
 */
/** Upstream job modalities with a bundled adapter; `tts` is spoken dialogue (MiniMax Speech). */
export type DramaAdapterModality = "image" | "video" | "tts" | "music";
export interface DramaAdapterSpec {
    /** Adapter id used both in the config file and in a job's `adapter` field. */
    readonly name: string;
    readonly label: string;
    readonly modality: DramaAdapterModality;
    /** Host environment variables the bundled adapter refuses to run without. */
    readonly requiredEnv: readonly string[];
    readonly optionalEnv: readonly string[];
    readonly timeoutSeconds: number;
    /** Provider reference shipped with the Skill, relative to the drama skill root. */
    readonly reference: string;
}
export interface DramaAdapterStatus {
    readonly name: string;
    readonly label: string;
    readonly modality: DramaAdapterModality;
    readonly configured: boolean;
    readonly missing: readonly string[];
}
export interface DramaAdapterConfigLocation {
    readonly path: string;
    /** True when the plugin writes the file; false when the creator points at their own. */
    readonly generated: boolean;
}
/** Point at a creator-owned adapter config instead of the generated one. */
export declare const DRAMA_ADAPTER_CONFIG_ENV = "OH_STORY_DRAMA_ADAPTER_CONFIG";
export declare const DRAMA_ADAPTERS: readonly DramaAdapterSpec[];
/**
 * The generated file is keyed by the skill root so two DSH profiles running
 * different plugin installs never overwrite each other's registration.
 */
export declare function dramaAdapterConfigPath(skillRoot: string, env?: NodeJS.ProcessEnv, temporaryRoot?: string): DramaAdapterConfigLocation;
/** The upstream adapter-config document: argv commands and timeouts only, never credentials. */
export declare function dramaAdapterConfigDocument(skillRoot: string, python?: string): {
    readonly adapters: Record<string, {
        readonly command: readonly string[];
        readonly timeout_seconds: number;
    }>;
};
/**
 * Register the bundled adapters for this host. A creator-owned config is left
 * untouched and only checked for existence.
 */
export declare function ensureDramaAdapterConfig(skillRoot: string, options?: {
    readonly python?: string;
    readonly env?: NodeJS.ProcessEnv;
    readonly temporaryRoot?: string;
}): Promise<DramaAdapterConfigLocation & {
    readonly ok: boolean;
}>;
/** Presence only: a variable counts as configured when it is set and non-empty. */
export declare function dramaAdapterStatuses(env?: NodeJS.ProcessEnv): DramaAdapterStatus[];
/** One line per adapter for Skill text: `gpt-image-2 (image: OPENAI_API_KEY)`. */
export declare function dramaAdapterSummary(): string;
//# sourceMappingURL=drama-adapters.d.ts.map