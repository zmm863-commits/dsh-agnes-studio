export interface PythonProbe {
    readonly ok: boolean;
    readonly version?: string | undefined;
}
export declare function commandOutput(command: string, args: readonly string[]): Promise<string | undefined>;
/** Upstream Skills require Python 3.10+. */
export declare function pythonVersion(value: string | undefined): PythonProbe;
/**
 * The interpreter the host will run upstream scripts with. The first command
 * that meets the version floor wins; an interpreter that answers but is too old
 * is reported only when nothing better exists, so `python3` at 3.9 does not hide
 * `python` at 3.12. The command is written into the adapter config's argv, so
 * this is the same choice everywhere the plugin starts Python.
 */
export declare function hostPython(probe?: (command: string, args: readonly string[]) => Promise<string | undefined>): Promise<{
    readonly command: string;
    readonly probe: PythonProbe;
}>;
//# sourceMappingURL=host-python.d.ts.map