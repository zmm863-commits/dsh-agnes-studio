export interface JsonlRecord {
    readonly line: number;
    readonly raw: string;
    readonly value?: unknown;
    readonly title: string;
    readonly type?: string;
    readonly status?: string;
    readonly error?: string;
}
export declare function parseJsonl(content: string): JsonlRecord[];
export declare function JsonlPreview({ content, label }: {
    readonly content: string;
    readonly label: string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=jsonl-preview.d.ts.map