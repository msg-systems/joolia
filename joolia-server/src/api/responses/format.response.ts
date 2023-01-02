import { Format, FormatMemberRoles } from '../models';
import { ResponseBuilder } from './builder';

export class MeObjectResponse {
    public constructor(public userRole: FormatMemberRoles) {}
}

export class PostFormatResponse {
    public static readonly required = ['id', 'name', 'description', 'shortDescription', 'updatedAt', 'me'];

    public id: string;
    public name: string;
    public description: string;
    public shortDescription: string;
    public updatedAt: Date;
    public me: MeObjectResponse;

    public constructor(format: Format) {
        Object.assign(this, format);
    }
}

export class PostFormatResponseBuilder extends ResponseBuilder<PostFormatResponse> {
    public readonly responseAttrs: string[] = PostFormatResponse.required;

    protected map(format: Format): Partial<PostFormatResponse> {
        const res = new PostFormatResponse(format);
        res.me = new MeObjectResponse(FormatMemberRoles.ORGANIZER); // User has created hence is Organizer
        return res;
    }
}

export class GetFormatResponse {
    public static readonly attrs = [
        'id',
        'name',
        'description',
        'shortDescription',
        'updatedAt',
        'me',
        'memberCount',
        'teamCount',
        'submissionCount',
        'phaseCount',
        'activityCount',
        'commentCount',
        'organizerCount',
        'startDate',
        'endDate',
        'keyVisual',
        'workspaceName',
        'workspaceId',
        'createdById',
        'containsTechnicalUser'
    ];

    public id: string;
    public name: string;
    public description: string;
    public shortDescription: string;
    public updatedAt: Date;
    public memberCount: number;
    public teamCount: number;
    public submissionCount: number;
    public phaseCount: number;
    public activityCount: number;
    public commentCount: number;
    public organizerCount: number;
    public startDate: Date;
    public endDate: Date;
    public me: { userRole: FormatMemberRoles };
    public keyVisual: { id?: string; linkUrl?: string };
    public workspaceId: string;
    public workspaceName: string;
    public createdById: string;
    public containsTechnicalUser: boolean;

    public constructor(data: any) {
        Object.assign(this, data);
        this.me = { userRole: data.userRole };
        this.keyVisual = null;
        this.containsTechnicalUser = data.containsTechnicalUser ? true : false;

        if (data.keyVisualUrl) {
            this.keyVisual = { linkUrl: data.keyVisualUrl };
        } else {
            if (data.keyVisualFileId) {
                this.keyVisual = { id: data.keyVisualFileId };
            }
        }
    }
}

export class GetFormatResponseBuilder extends ResponseBuilder<GetFormatResponse> {
    public readonly responseAttrs: string[] = GetFormatResponse.attrs;

    protected map(data: unknown): Partial<GetFormatResponse> {
        return new GetFormatResponse(data);
    }
}
