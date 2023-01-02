import { Format, FormatMember, FormatMemberRoles, Library, User, Workspace, WorkspaceMember } from '../../models';

export declare type MemberOfType = FormatMember | Library | WorkspaceMember;

/**
 * Represents an Invitation to a Joolia's User to be part of a specific
 * concept, like Format, Library and Workspace.
 */
export abstract class Invitation<T> {
    /**
     * Creates an instance of Invitation.
     *
     * @param locale The Locale extracted from the original Request.
     * @param text The Invitation text from the original Request.
     * @param inviter The Joolia's User inviting another User.
     * @param invitee The Joolia's User being invited.
     */
    protected constructor(public locale: string, public text: string, public inviter: User, public invitee: User) {}

    /**
     * Should return the Id of the entity where the user is being invited and will appear in the URL sent through mail.
     * Defaults to the id of the entity in this invitation. For instance see FormatMemberInvitation.
     */
    public getUrlInvitationId(): string {
        return (this.getEntity() as { id: string }).id;
    }

    /**
     * Should return an Entity that carries the member relationship.
     */
    abstract getEntity(): T | { id: string };

    /**
     * Tells whether the invited user in this Invitation is already a member or not.
     *
     * @deprecated See JOOLIA-2230.
     */
    abstract isMember(): boolean;
}

/**
 * Invitation to a Format
 */
export class FormatMemberInvitation extends Invitation<FormatMember> {
    constructor(locale: string, text: string, inviter: User, invitee: User, protected role: FormatMemberRoles, protected format: Format) {
        super(locale, text, inviter, invitee);
    }

    public getEntity(): FormatMember {
        return new FormatMember({ role: this.role, user: this.invitee, format: this.format });
    }

    public isMember(): boolean {
        return this.format.members.some((m) => m.user.email === this.invitee.email);
    }

    public getUrlInvitationId(): string {
        return this.format.id;
    }
}

/**
 * Invitation to a Library
 */
export class LibraryMemberInvitation extends Invitation<Library> {
    constructor(locale: string, text: string, inviter: User, invitee: User, protected library: Library) {
        super(locale, text, inviter, invitee);
    }

    public getEntity(): Library {
        if (!this.isMember()) {
            this.library.members.push(this.invitee);
        }
        return this.library;
    }

    public isMember(): boolean {
        return this.library.members.some((m) => m.email === this.invitee.email);
    }
}

/**
 * Invitation to a Workspace
 */
export class WorkspaceMemberInvitation extends Invitation<WorkspaceMember> {
    constructor(locale: string, text: string, inviter: User, invitee: User, protected workspace: Workspace) {
        super(locale, text, inviter, invitee);
    }

    public getEntity(): WorkspaceMember {
        return new WorkspaceMember({ user: this.invitee, workspace: this.workspace });
    }

    public isMember(): boolean {
        throw new Error('This should be not used anymore. See deprecation.');
    }

    public getUrlInvitationId(): string {
        return this.workspace.id;
    }
}
