import { Context } from "@deepseek-ai/cordis";
//#region src/index.d.ts
/** Stable cordis plugin name. */
declare const name = "agnes-studio";
/** Required services. */
declare const inject: string[];
/**
 * Mount the multi-vendor API proxy routes and agent announcement.
 */
declare function apply(ctx: Context): void;
//#endregion
export { apply, inject, name };
//# sourceMappingURL=index.d.ts.map