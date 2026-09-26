export type GameVerificationBinding = "CURRENT" | "PINNED" | "STALE" | "UNBOUND";
export interface GameVerificationFreshness {
    readonly binding: Exclude<GameVerificationBinding, "PINNED">;
    readonly verifiedPreviewVersion?: string | undefined;
}
/**
 * The upstream QA schema intentionally contains no build digest. Track what
 * this DSH process actually observes instead of pretending an imported PASS
 * belongs to the current build. A QA rewrite binds that run to the preview
 * visible at the same observation; later preview changes make it stale.
 */
export declare class WorkspaceVerificationTracker {
    #private;
    observe(key: string, verificationRevision: string | undefined, previewVersion: string): GameVerificationFreshness;
}
//# sourceMappingURL=game-verification.d.ts.map