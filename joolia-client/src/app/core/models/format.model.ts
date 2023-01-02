import { User } from './user.model';
import { Moment } from 'moment';
import { List } from './list.model';
import { Team } from './team.model';
import { FileMeta } from './file-meta.model';
import { Me } from './me.model';
import { KeyVisual } from './key-visual.model';
import { LinkEntry } from './link-entry.model';

export interface Format {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    meetingLink: LinkEntry;
    createdBy: User;
    memberCount: number;
    teamCount: number;
    submissionCount: number;
    phaseCount: number;
    activityCount: number;
    commentCount: number;
    members: List<User>;
    startDate: Moment;
    endDate: Moment;
    teams: List<Team>;
    files: FileMeta[];
    keyVisual: KeyVisual;
    me: Me;
    workspaceId: string;
    workspaceName: string;
    containsTechnicalUser?: boolean;
}
