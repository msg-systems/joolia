import { Moment } from 'moment';
import { User } from './user.model';

export interface Comment {
    id: string;
    comment: string;
    createdBy: User;
    createdAt: Moment;
    updatedAt: Moment;
}
