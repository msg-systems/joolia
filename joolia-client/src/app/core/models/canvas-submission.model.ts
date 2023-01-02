import { Moment } from 'moment';
import { User } from './user.model';
import { Team } from './team.model';
import { Me } from './me.model';

export interface CanvasSubmission {
    id: string;
    content: string;
    color: string;
    createdAt: Moment;
    createdBy: User;
    submittedBy: {
        team: Team;
        user: User;
    };
    slotId: string;
    voteCount: number;
    me: Me;
}
