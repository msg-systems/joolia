import { User } from './user.model';
import { List } from './list.model';

export interface Library {
    id: string;
    name: string;
    members: List<User>;
    memberCount: number;
    templateCount: number;
    formatTemplateCount: number;
    activityTemplateCount: number;
    phaseTemplateCount: number;
}
