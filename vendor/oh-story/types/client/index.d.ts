import type { Context as ClientContext } from "@deepseek-ai/cordis";
export declare const name = "oh-story";
export declare const inject: string[];
declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface SlotMap {
        "oh-story.workspace": {
            kind: "single";
            scope: "session";
        };
    }
}
/** Register only official DSH surfaces; the split bridge never replaces Chat. */
export declare function apply(context: ClientContext): void;
declare const _default: {
    name: string;
    inject: string[];
    apply: typeof apply;
};
export default _default;
//# sourceMappingURL=index.d.ts.map