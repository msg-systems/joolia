import { ResponseBuilder } from './builder';
import { WorkspaceMemberRole } from '../models';

export class WorkspaceResponse {
    public static readonly attrs = [
        'id',
        'name',
        'description',
        'memberCount',
        'formatCount',
        'adminCount',
        'me',
        'licensesCount',
        'updatedAt',
        'logoId',
        'tenant',
        'domain',
        'consentDate'
    ];

    public id: string;
    public name: string;
    public description: string;
    public memberCount = 1;
    public adminCount = 1;
    public formatCount = 0;
    public licensesCount: number;
    public me: { userRole: WorkspaceMemberRole };
    public updatedAt: Date;
    public logoId: string;
    public tenant: string;
    public domain: string;
    public consentDate: Date;

    public constructor(data: any) {
        Object.assign(this, data);
        /**
         * Client still needs the role-based approach even for this two-state roles.
         */
        this.me = { userRole: data.admin ? WorkspaceMemberRole.ADMIN : WorkspaceMemberRole.PARTICIPANT };
    }
}

export class WorkspaceResponseBuilder extends ResponseBuilder<WorkspaceResponse> {
    public readonly responseAttrs: string[] = WorkspaceResponse.attrs;

    protected map(data: any): Partial<WorkspaceResponse> {
        return new WorkspaceResponse(data);
    }
}
