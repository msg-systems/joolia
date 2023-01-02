import { ResponseBuilder } from './builder';
import { WorkspaceMemberRole } from '../models';

export class WorkspaceMemberResponse {
    public static readonly attrs = ['id', 'name', 'email', 'company', 'role', 'pending', 'avatarId'];

    public id: string; // Expected id is userId
    public name: string;
    public email: string;
    public company: string;
    public role: WorkspaceMemberRole;
    public pending: boolean;
    public avatarId: string;

    public constructor(data: any) {
        Object.assign(this, data);
        this.id = data.userId;
        this.role = data.admin ? WorkspaceMemberRole.ADMIN : WorkspaceMemberRole.PARTICIPANT;
    }
}

export class WorkspaceMemberResponseBuilder extends ResponseBuilder<WorkspaceMemberResponse> {
    public readonly responseAttrs: string[] = WorkspaceMemberResponse.attrs;

    protected map(data: unknown): Partial<WorkspaceMemberResponse> {
        return new WorkspaceMemberResponse(data);
    }
}

export class WorkspaceMemberAdminResponse {
    public static readonly attrs = ['id', 'name', 'avatarId', 'company', 'pending', 'email', 'role', 'lastLogin', 'formatCount'];

    public id: string; // Expected id is userId
    public name: string;
    public company: string;
    public pending: boolean;
    public email: string;
    public role: WorkspaceMemberRole;
    public lastLogin: Date;
    public formatCount: number;
    public avatarId: string;

    public constructor(data: any) {
        Object.assign(this, data);
        this.id = data.userId;
        this.role = data.admin ? WorkspaceMemberRole.ADMIN : WorkspaceMemberRole.PARTICIPANT;
    }
}

export class WorkspaceMemberAdminResponseBuilder extends ResponseBuilder<WorkspaceMemberAdminResponse> {
    public readonly responseAttrs: string[] = WorkspaceMemberAdminResponse.attrs;

    protected map(data: unknown): Partial<WorkspaceMemberAdminResponse> {
        return new WorkspaceMemberAdminResponse(data);
    }
}
