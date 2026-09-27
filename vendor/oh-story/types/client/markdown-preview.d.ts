type Alignment = "left" | "center" | "right" | undefined;
interface ListItem {
    readonly text: string;
    readonly checked?: boolean;
}
export type MarkdownBlock = {
    readonly kind: "code";
    readonly lines: readonly string[];
    readonly language?: string;
} | {
    readonly kind: "heading";
    readonly text: string;
    readonly level: number;
} | {
    readonly kind: "quote";
    readonly lines: readonly string[];
} | {
    readonly kind: "ul" | "ol";
    readonly items: readonly ListItem[];
    readonly start?: number;
} | {
    readonly kind: "table";
    readonly headers: readonly string[];
    readonly rows: readonly (readonly string[])[];
    readonly alignments: readonly Alignment[];
} | {
    readonly kind: "rule";
} | {
    readonly kind: "paragraph";
    readonly lines: readonly string[];
};
export declare function parseMarkdownBlocks(markdown: string): MarkdownBlock[];
export declare function MarkdownPreview({ content, label }: {
    readonly content: string;
    readonly label: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=markdown-preview.d.ts.map