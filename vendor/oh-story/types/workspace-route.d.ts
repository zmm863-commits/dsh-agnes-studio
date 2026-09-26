import type { Context } from "@deepseek-ai/cordis";
interface WorkspaceRouteOptions {
    readonly maxBytes: number;
    readonly trustedHosts?: readonly string[];
}
export interface ByteRange {
    readonly start: number;
    readonly end: number;
}
/**
 * RFC 9110 14.2: a Range this server cannot parse or does not support is ignored (`undefined`, full
 * 200 response); only a well-formed but unsatisfiable range earns a 416 (`null`).
 */
export declare function parseByteRange(value: string | undefined, size: number): ByteRange | undefined | null;
export declare function assertCreativePath(path: string, kind: "text" | "media"): void;
export declare function mediaMimeTypeForPath(path: string): string | undefined;
export declare function gameRoot(path: string): boolean;
/**
 * Emitted for EVERY preview response, not just HTML. previewContentType serves .svg as
 * image/svg+xml — an active document type — so a game that self-navigates its frame to a scripted
 * SVG would otherwise land in a document with no policy at all, while the iframe sandbox flags
 * (which do persist across that navigation) still grant it script execution. The `sandbox`
 * directive makes each response self-confining regardless of the iframe attribute.
 */
export declare function previewContentSecurityPolicy(assets: string): string;
/** Mount the narrow editor API on DSH's official web-server extension seam. */
export declare function registerWorkspaceRoute(context: Context, options: WorkspaceRouteOptions): void;
export {};
//# sourceMappingURL=workspace-route.d.ts.map