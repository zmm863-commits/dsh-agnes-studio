import type { IncomingHttpHeaders } from "node:http";
interface WorkspaceTrustRequest {
    readonly headers: IncomingHttpHeaders | Headers;
}
/** Reject malformed declarations at plugin load instead of silently widening access. */
export declare function assertTrustedWorkspaceAuthority(entry: string): void;
/**
 * Same browser trust boundary as DSH's native API: every request must address a
 * loopback or explicitly trusted Host, and browser markers must be same-origin.
 */
export declare function isTrustedWorkspaceRequest(request: WorkspaceTrustRequest, trustedHosts: readonly string[]): boolean;
/**
 * Permit a generated-game document to navigate from one loopback alias to
 * another (127.0.0.1 ↔ localhost). Subresources then become same-origin with
 * the isolated preview document and use the stricter path above.
 */
export declare function isTrustedPreviewNavigation(request: WorkspaceTrustRequest, trustedHosts: readonly string[]): boolean;
export {};
//# sourceMappingURL=workspace-request-trust.d.ts.map