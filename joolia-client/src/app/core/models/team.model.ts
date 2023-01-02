import { User } from './user.model';
import { FileMeta } from '.';
import { Me } from './me.model';

/**
 * Model which defines the Team
 */
export interface Team {
    id: string;
    name: string;
    createdBy: User;
    members: User[];
    avatar: FileMeta;
    files: FileMeta[];
    me?: Me;
}
