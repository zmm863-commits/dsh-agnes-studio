export interface FileTreeInput {
    readonly path: string;
    readonly bytes: number;
}
export interface FileTreeFile {
    readonly kind: "file";
    readonly name: string;
    readonly path: string;
    readonly bytes: number;
}
export interface FileTreeDirectory {
    readonly kind: "directory";
    readonly name: string;
    readonly path: string;
    readonly fileCount: number;
    readonly children: readonly FileTreeNode[];
}
export type FileTreeNode = FileTreeFile | FileTreeDirectory;
export declare function buildFileTree(files: readonly FileTreeInput[], group: string): readonly FileTreeNode[];
//# sourceMappingURL=file-tree.d.ts.map