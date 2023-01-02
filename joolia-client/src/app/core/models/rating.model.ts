import { Moment } from 'moment';
import { User } from './user.model';

export interface Rating {
    id: string;
    rating: number;
    createdBy: User;
    createdAt: Moment;
    updatedAt: Moment;
}
