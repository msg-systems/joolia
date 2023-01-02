import { UserRating } from '../models';
import { ResponseBuilder } from './builder';
import { UserResponse, UserResponseBuilder } from './user.response';

export class UserRatingResponse {
    public static readonly attrs = ['id', 'rating', 'createdBy', 'createdAt', 'updatedAt'];

    public id: string;
    public comment: string;
    public createdBy: Partial<UserResponse>;
    public createdAt: Date;
    public updatedAt: Date;

    public constructor(rating: UserRating) {
        Object.assign(this, rating);
    }
}

export class UserRatingResponseBuilder extends ResponseBuilder<UserRatingResponse> {
    public readonly responseAttrs: string[] = UserRatingResponse.attrs;

    protected map(rating: UserRating): Partial<UserRatingResponse> {
        const res = new UserRatingResponse(rating);
        res.createdBy = new UserResponseBuilder().buildOne(rating.createdBy);
        return res;
    }
}
