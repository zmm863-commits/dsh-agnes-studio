import { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
//#region src/client/index.d.ts
/** Required services. */
declare const inject: string[];
/**
 * Mount the sidebar entry and the floating studio panel.
 * @param ctx - client root context.
 */
declare function apply(ctx: ClientContext): void;
//#endregion
export { apply, inject };
//# sourceMappingURL=client.d.ts.map