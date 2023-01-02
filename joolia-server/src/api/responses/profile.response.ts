import { User } from '../models';
import { ResponseBuilder } from './builder';

export class ProfileResponse {
    public static readonly attrs = ['id', 'name', 'email', 'company', 'admin', 'workspaceCount'];

    public id: string;
    public name: string;
    public email: number;
    public company: Date;
    public admin: boolean;
    public workspaceCount: number;

    public constructor(user: User, workspaceCount: number) {
        Object.assign(this, user);
        this.workspaceCount = workspaceCount;
    }
}

export class ProfileResponseBuilder extends ResponseBuilder<ProfileResponse> {
    public readonly responseAttrs: string[] = ProfileResponse.attrs;

    protected map(user: any): Partial<ProfileResponse> {
        return new ProfileResponse(user, user.workspaceCount);
    }
}
