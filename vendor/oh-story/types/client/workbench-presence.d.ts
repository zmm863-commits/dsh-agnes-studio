/**
 * DSH is a general Harness: one installed plugin must not turn every Session
 * into a writing surface. The workbench claims the conversation layout only for
 * a workspace that actually holds creative work, and the creator can always
 * take the layout back.
 */
export type WorkbenchPreference = "open" | "closed";
export interface WorkbenchWorkspace {
    readonly files: readonly unknown[];
    readonly games: readonly {
        readonly source: "workspace" | "example";
    }[];
    readonly videos: readonly unknown[];
}
export interface WorkbenchPreferenceStorage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
}
/** The bundled game example ships with the plugin, so it never marks a workspace as creative. */
export declare function hasCreativeProject(workspace: WorkbenchWorkspace | undefined): boolean;
/** An explicit creator choice always wins over what the workspace happens to contain. */
export declare function resolveWorkbenchOpen(preference: WorkbenchPreference | undefined, creativeProject: boolean): boolean;
export declare function workbenchPreferenceKey(cwd: string): string;
/** The DSH Session Store is not persisted, so the choice is kept per workspace instead. */
export declare function readWorkbenchPreference(storage: WorkbenchPreferenceStorage | undefined, cwd: string | undefined): WorkbenchPreference | undefined;
export declare function writeWorkbenchPreference(storage: WorkbenchPreferenceStorage | undefined, cwd: string | undefined, preference: WorkbenchPreference): void;
/** Reading the property itself throws when the browser blocks site data. */
export declare function workbenchPreferenceStorage(): WorkbenchPreferenceStorage | undefined;
//# sourceMappingURL=workbench-presence.d.ts.map