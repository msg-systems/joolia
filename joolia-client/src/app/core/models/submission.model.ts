import { User } from './user.model';
import { Activity } from './activity.model';
import { Moment } from 'moment';
import { Team } from './team.model';
import { FileMeta } from './file-meta.model';

export interface Submission {
    id: string;
    name: string;
    description: string;
    submittedBy: {
        team: Team;
        user: User;
    };
    activity: Activity;
    createdBy: User;
    createdAt: Moment;
    files: FileMeta[];
    commentCount: number;
    averageRating: number;
    fileCount: number;
}
