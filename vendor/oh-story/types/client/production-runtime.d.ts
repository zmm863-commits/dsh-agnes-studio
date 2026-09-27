export type ProductionJobKind = "image" | "video" | "composition";
export type ProductionJobStatus = "awaiting_confirmation" | "pending" | "running" | "dispatched_unknown" | "succeeded" | "failed" | "canceled";
export interface ProductionMediaVersion {
    readonly id: string;
    readonly targetId: string;
    readonly kind: "image" | "video";
    readonly url: string;
    /** Workspace-relative path when the result is owned by the DSH FileSystem. */
    readonly path?: string | undefined;
}
export interface ProductionJob {
    readonly id: string;
    readonly targetId: string;
    readonly kind: ProductionJobKind;
    readonly status: ProductionJobStatus;
    readonly progress: number;
    readonly prompt: string;
    readonly error?: string | undefined;
    readonly output?: ProductionMediaVersion | undefined;
    readonly expectedOutputs: number;
    readonly completedOutputs: number;
    /**
     * Deliverable whose name the job cannot influence. Drama Skills 0.7 renders the
     * assembled cut to a fixed path, so it carries no job id to correlate on.
     */
    readonly outputPath?: string | undefined;
    /** Versions already at `outputPath` when the job was dispatched, so an earlier cut never completes it. */
    readonly supersededOutputIds?: readonly string[] | undefined;
}
export interface ProductionSequenceItem {
    readonly shotId: string;
    readonly versionId?: string | undefined;
}
export interface CanvasPoint {
    readonly x: number;
    readonly y: number;
}
export interface ProductionQueueEntry {
    readonly id: string;
    readonly preview: string;
}
/**
 * DSH Queue rows from the host `inbox` projection's `next-turn` list. DSH 0.1.7 removed
 * `SessionSnapshot.queue`; reading it threw and blanked the whole workbench (#50). The
 * projection is wire JSON and absent without agent-loop, so every row is checked rather than
 * trusted. Like DSH's own QueueDock, a row whose prompt RPC already has a transcript echo is
 * a turn being claimed, not a queued one. The preview is the row's full text: the job-id label
 * is matched against it, and the old 200-character preview could cut that label off.
 */
export declare function productionQueueFromInbox(rows: unknown, claimedRequestIds?: ReadonlySet<string>): ProductionQueueEntry[];
export declare function createPendingJob(input: {
    readonly id: string;
    readonly targetId: string;
    readonly kind: ProductionJobKind;
    readonly prompt: string;
    readonly expectedOutputs?: number | undefined;
    readonly outputPath?: string | undefined;
    readonly supersededOutputIds?: readonly string[] | undefined;
}): ProductionJob;
export declare function selectedVersionForTarget(targetId: string, versions: readonly ProductionMediaVersion[], selections: Readonly<Record<string, string>>, kind?: ProductionMediaVersion["kind"]): ProductionMediaVersion | undefined;
export declare function mediaTargetFromPath(path: string, knownTargets: readonly string[]): string | undefined;
export declare function mediaVersionMatchesJob(version: ProductionMediaVersion, jobId: string): boolean;
export declare function outputsForJob(job: ProductionJob, versions: readonly ProductionMediaVersion[]): ProductionMediaVersion[];
/**
 * True while a composition the creator already dispatched has not settled. Every composition
 * for an episode renders to the same upstream path, so a second one dispatched now would be
 * completed by the first one's cut — and, once marked succeeded, could no longer be removed
 * from the DSH Queue.
 */
export declare function compositionInFlight(jobs: readonly ProductionJob[]): boolean;
/**
 * A composition whose Turn ended without a cut stays dispatched_unknown so a late cut can still
 * complete it, and compositionInFlight lets the creator compose again. Both render to the same
 * upstream path, so once a new composition is dispatched its cut would complete the old job too.
 * Fail the old one instead, keeping the check findings its error already reports.
 */
export declare function settleSupersededCompositions(jobs: readonly ProductionJob[], next: ProductionJob): ProductionJob[];
export declare function referencesForTarget(targetId: string, production: {
    readonly shots: readonly {
        readonly id: string;
        readonly references: readonly string[];
    }[];
}, versions: readonly ProductionMediaVersion[], selections: Readonly<Record<string, string>>, libraryVersions?: readonly ProductionMediaVersion[], manualReferences?: Readonly<Record<string, readonly string[]>>): ProductionMediaVersion[];
export declare function queuedItemForJob(jobId: string, queue: readonly ProductionQueueEntry[]): ProductionQueueEntry | undefined;
export declare function activeProductionJobId(jobs: readonly ProductionJob[], queue: readonly ProductionQueueEntry[], sessionRunning: boolean): string | undefined;
/** Reconcile the lightweight Session projection against DSH Queue/Turn state and real workspace outputs. */
export declare function reconcileProductionJobs(jobs: readonly ProductionJob[], queue: readonly ProductionQueueEntry[], sessionRunning: boolean, versions: readonly ProductionMediaVersion[]): ProductionJob[];
export declare function reconcileSequence(shotIds: readonly string[], current: readonly ProductionSequenceItem[], versions: readonly ProductionMediaVersion[], selections: Readonly<Record<string, string>>): ProductionSequenceItem[];
export declare function sequenceIssues(sequence: readonly ProductionSequenceItem[], versions: readonly ProductionMediaVersion[]): string[];
export declare function reorderSequence(sequence: readonly ProductionSequenceItem[], source: number, target: number): ProductionSequenceItem[];
//# sourceMappingURL=production-runtime.d.ts.map