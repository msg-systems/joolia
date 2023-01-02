import { UserRole } from './user.model';

export enum Entity {
    FORMAT = 'Format',
    WORKSPACE = 'Workspace'
}

export enum Permission {
    UPDATE_FORMAT = 'update_Format',
    DELETE_FORMAT = 'delete_Format',
    ADD_MEMBER = 'add_Member',
    DELETE_MEMBER = 'delete_Member',
    UPDATE_MEMBER = 'update_Member',
    ADD_TEAM = 'add_Team',
    UPDATE_TEAM = 'update_Team',
    DELETE_TEAM = 'delete_Team',
    ADD_TEAMMEMBER = 'add_TeamMember',
    DELETE_TEAMMEMBER = 'delete_TeamMember',
    ADD_PHASE = 'add_Phase',
    UPDATE_PHASE = 'update_Phase',
    DELETE_PHASE = 'delete_Phase',
    ADD_ACTIVITY = 'add_Activity',
    UPDATE_ACTIVITY = 'update_Activity',
    DELETE_ACTIVITY = 'delete_Activity',
    ADD_STEP = 'add_Step',
    DELETE_STEP = 'delete_Step',
    UPDATE_WORKSPACE = 'update_Workspace',
    GET_SUBMISSIONS = 'see_Submission'
}

export interface PermissionsRole {
    entity: Entity;
    role: UserRole;
    permissions: Permission[];
}
