import type { KeyboardEvent as ReactKeyboardEvent } from "react";
/** Roving-focus keyboard contract shared by every workbench tablist. */
export declare function handleTabKey<T extends string>(event: ReactKeyboardEvent<HTMLButtonElement>, values: readonly T[], current: T, select: (value: T) => void): void;
export declare function endpoint(path: string, sessionId: string, file?: string): string;
//# sourceMappingURL=workbench-ui.d.ts.map