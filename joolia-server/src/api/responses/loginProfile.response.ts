import { User } from '../models';
import { ResponseBuilder } from './builder';

export class LoginProfileResponse {
    public static readonly attrs = ['id', 'name', 'email', 'company', 'admin'];

    public id: string;
    public name: string;
    public email: number;
    public company: Date;
    public admin: boolean;

    public constructor(user: User) {
        Object.assign(this, user);
    }
}

export class LoginProfileResponseBuilder extends ResponseBuilder<LoginProfileResponse> {
    public readonly responseAttrs: string[] = LoginProfileResponse.attrs;

    protected map(user: any): Partial<LoginProfileResponse> {
        return new LoginProfileResponse(user);
    }
}
