import { User } from '../models';
import { ResponseBuilder } from './builder';
import { FileEntryResponse } from './fileEntry.response';
import { FileEntryResponseBuilder } from './fileEntry.response';

export class UserResponse {
    public static readonly attrs = ['id', 'name', 'email', 'pending', 'company', 'avatar'];

    public id: string;
    public name: string;
    public email: number;
    public pending: boolean;
    public company: Date;
    public avatar: Partial<FileEntryResponse>;

    public constructor(user: User) {
        Object.assign(this, user);
    }
}

export class UserResponseBuilder extends ResponseBuilder<UserResponse> {
    public readonly responseAttrs: string[] = UserResponse.attrs;

    protected map(user: User): Partial<UserResponse> {
        const res = new UserResponse(user);

        if (user.avatar) {
            /**
             * Improvement: Given the Type from each field in the response we can move this logic to the ResponseBuilder
             * to call further ResponseBuilder hence this code would be unnecessary;
             *
             * Hint: If you copy & paste this snippet to another response think through again about the idea above.
             *
             * TODO: 5th ;)
             */
            const builder = new FileEntryResponseBuilder();
            res.avatar = builder.buildOne(user.avatar);
        }

        return res;
    }
}
