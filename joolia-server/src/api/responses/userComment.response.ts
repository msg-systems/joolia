import { UserComment } from '../models';
import { ResponseBuilder } from './builder';
import { UserResponse, UserResponseBuilder } from './user.response';

export class UserCommentResponse {
    public static readonly attrs = ['id', 'comment', 'createdBy', 'createdAt', 'updatedAt'];

    public id: string;
    public comment: string;
    public createdBy: Partial<UserResponse>;
    public createdAt: Date;
    public updatedAt: Date;

    public constructor(comment: UserComment) {
        Object.assign(this, comment);
    }
}

export class UserCommentResponseBuilder extends ResponseBuilder<UserCommentResponse> {
    public readonly responseAttrs: string[] = UserCommentResponse.attrs;

    protected map(comment: UserComment): Partial<UserCommentResponse> {
        const res = new UserCommentResponse(comment);
        res.createdBy = new UserResponseBuilder().buildOne(comment.createdBy);
        return res;
    }
}
