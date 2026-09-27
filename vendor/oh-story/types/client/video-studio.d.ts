import { type WorkbenchMode } from "./file-activity.js";
export interface VideoPreviewAsset {
    readonly role: "source" | "edited" | "final";
    readonly label: string;
    readonly path: string;
    readonly bytes: number;
    readonly version: string;
    readonly mimeType: string;
}
export interface VideoArtifactSummary {
    readonly label: string;
    readonly path: string;
    readonly version: string;
    readonly kind: "plan" | "script" | "subtitle" | "quality" | "manifest";
}
export interface VideoProject {
    readonly id: string;
    readonly root: string;
    readonly title: string;
    readonly state: "not-started" | "working" | "waiting" | "ready";
    readonly stage: string;
    readonly stageLabel: string;
    readonly nextArtifact?: string | undefined;
    readonly previews: readonly VideoPreviewAsset[];
    readonly artifacts: readonly VideoArtifactSummary[];
}
export declare function VideoStudio({ sessionId, projects, running, projectId, tab, hidden, workbenches, paneId, labelledBy, onProject, onTab, onWorkbench, onCollapse }: {
    readonly sessionId: string;
    readonly projects: readonly VideoProject[];
    readonly running: boolean;
    readonly projectId: string | undefined;
    readonly tab: "preview" | "artifacts";
    readonly hidden: boolean;
    readonly workbenches: readonly WorkbenchMode[];
    readonly paneId: string;
    readonly labelledBy: string;
    readonly onProject: (id: string) => void;
    readonly onTab: (tab: "preview" | "artifacts") => void;
    readonly onWorkbench: (mode: WorkbenchMode) => void;
    readonly onCollapse: () => void;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=video-studio.d.ts.map