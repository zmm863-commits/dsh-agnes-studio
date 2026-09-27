import type { Session, SessionEvent } from "@deepseek-ai/dsh-session";
import { type OhStoryRoleName } from "./role-provider.js";
/** The durable creation label oh_story_role gives every child it starts. */
export declare function ohStoryRoleLabel(role: OhStoryRoleName): string;
/**
 * Record the Role of a child whose Session DSH has just stamped with its
 * `subagent/descriptor`. The in-process spawn driver appends that event inside
 * the child's first step, before its first model request, so the identity is
 * known before the child can call any tool. The first descriptor is
 * authoritative, as in DSH's own `foldSubagentDescriptor`.
 */
export declare function observeOhStoryRoleDescriptor(session: Session, event: SessionEvent): void;
/** Record a Role for a child Session the Role tool started itself. */
export declare function markOhStoryRoleSession(session: Session, role: OhStoryRoleName): void;
/** The Oh Story Role running in this Session, if it is an oh_story_role child. */
export declare function ohStoryRoleOfSession(session: Session | undefined): OhStoryRoleName | undefined;
//# sourceMappingURL=role-identity.d.ts.map