import { Context } from "@deepseek-ai/cordis";
//#region src/index.d.ts
/** Stable cordis plugin name. */
declare const name = "agnes-studio";
/** Required services. */
declare const inject: string[];
/**
 * Join a vendor base URL with a client endpoint without duplicating or losing
 * the API version segment.
 *
 * The base URLs above already carry a version (`.../v1`, `.../api/v3`), while
 * clients also send fully-qualified endpoints (`/v1/images/generations`,
 * `/v2/video_generation`). Naive concatenation produced `.../v1/v1/...`, which
 * Agnes answered with 404 — every image/video call from the panel failed.
 *
 * Rules:
 *   base .../v1 + /v1/images/...   → .../v1/images/...   (version deduped)
 *   base .../v1 + /images/...      → .../v1/images/...
 *   base .../v1 + /v2/video_gen    → .../v2/video_gen    (endpoint version wins)
 *   base .../v1 + /agnesapi?...    → .../v1/agnesapi?...
 */
declare function buildUpstreamUrl(baseUrl: string, endpoint: string): string;
/**
 * Mount the multi-vendor API proxy routes and agent announcement.
 */
declare function apply(ctx: Context): void;
//#endregion
export { apply, buildUpstreamUrl, inject, name };
//# sourceMappingURL=index.d.ts.map