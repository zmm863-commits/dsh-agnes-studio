import type { DramaEpisodeProduction } from "./drama-production.js";
import type { ProductionJob, ProductionMediaVersion } from "./production-runtime.js";
export declare function nativeProductionPrompt(production: DramaEpisodeProduction, job: ProductionJob, references: readonly ProductionMediaVersion[]): string;
export declare function nativeBatchPrompt(production: DramaEpisodeProduction, job: ProductionJob, candidates: readonly {
    readonly id: string;
    readonly prompt: string;
}[]): string;
/**
 * Upstream's edit stage owns only the 剪辑单 CUT items, the delivery spec, and what it writes under
 * 制作成果/成片/ (short-drama-edit stage-contract.md). Normalised clips therefore go to 成片/规格统一/,
 * which mediaTargetFromPath keeps out of the shot versions, and carry no job id that could correlate
 * them with a production job. An external mix ends with the loudnorm pass render itself runs
 * (edit_tool.py `_loudnorm_filter`, then AAC 192k at 48 kHz).
 */
export declare function nativeCompositionPrompt(production: DramaEpisodeProduction, job: ProductionJob, orderedPaths: readonly string[]): string;
//# sourceMappingURL=production-prompts.d.ts.map