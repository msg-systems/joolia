/**
 * Model which defines the Format Member
 */

import { FileMeta } from './file-meta.model';
import { Skill } from './skill.model';
import { Team } from './team.model';
import { UserRole } from './user.model';

export interface FormatMember {
    id: string;
    name: string;
    email: string;
    avatar: FileMeta;
    company: string;
    pending: boolean;
    role: UserRole;
    skills: Skill[];
    teamCount: number;
    teams: Team[];
}
