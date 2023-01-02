import { FileMeta } from './file-meta.model';
import { Moment } from 'moment';
import { Skill } from './skill.model';

export enum UserRole {
    PARTICIPANT = 'participant',
    ORGANIZER = 'organizer',
    ADMIN = 'admin',
    TECHNICAL = 'technical'
}

/**
 * Model which defines the User
 */
export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    company: string;
    role: UserRole;
    teamCount: number;
    pending: boolean;
    avatar: FileMeta;
    formatCount?: number;
    lastLogin?: Moment;
    skills: Skill[];
    admin?: boolean;
    workspaceCount?: number;
    selected?: boolean;
}

export interface UserSignUp extends User {
    privateWorkspaceName: string;
    privateLibraryName: string;
}
