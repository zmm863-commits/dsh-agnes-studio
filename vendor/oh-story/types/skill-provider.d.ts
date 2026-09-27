import { type SkillProvider } from "@deepseek-ai/dsh-skill";
interface ParsedSkill {
    readonly name: string;
    readonly description: string;
    readonly content: string;
    readonly userInvocable: boolean;
}
export declare function parseBundledSkill(source: string): ParsedSkill;
export declare function dshSkillContent(name: string, content: string): string;
export declare function defaultBundledSkillRoot(): string;
export declare function defaultDramaSkillRoot(): string;
export declare function defaultNovelToGameSkillRoot(): string;
export declare function createOhStorySkillProvider(skillRoot?: string): SkillProvider;
export declare function dshDramaSkillContent(name: string, content: string, skillRoot?: string): string;
export declare function createDramaSkillProvider(skillRoot?: string): SkillProvider;
export declare function dshNovelToGameSkillContent(_name: string, content: string): string;
export declare function createNovelToGameSkillProvider(skillRoot?: string): SkillProvider;
export declare function defaultVideoRecapSkillRoot(): string;
export declare function dshVideoRecapSkillContent(_name: string, content: string): string;
export declare function createVideoRecapSkillProvider(skillRoot?: string): SkillProvider;
export {};
//# sourceMappingURL=skill-provider.d.ts.map