import { Entity, Permission, PermissionsRole, UserRole } from '../app/core/models';

export interface PermissionConfig {
    permissions: PermissionsRole[];
}

const formatOrganizerPermission: PermissionsRole = {
    entity: Entity.FORMAT,
    role: UserRole.ORGANIZER,
    permissions: [
        Permission.UPDATE_FORMAT,
        Permission.DELETE_FORMAT,
        Permission.ADD_MEMBER,
        Permission.DELETE_MEMBER,
        Permission.UPDATE_MEMBER,
        Permission.ADD_TEAM,
        Permission.UPDATE_TEAM,
        Permission.DELETE_TEAM,
        Permission.ADD_TEAMMEMBER,
        Permission.DELETE_TEAMMEMBER,
        Permission.ADD_PHASE,
        Permission.UPDATE_PHASE,
        Permission.DELETE_PHASE,
        Permission.ADD_ACTIVITY,
        Permission.UPDATE_ACTIVITY,
        Permission.DELETE_ACTIVITY,
        Permission.ADD_STEP,
        Permission.DELETE_STEP,
        Permission.GET_SUBMISSIONS
    ]
};

const formatParticipantPermission: PermissionsRole = {
    entity: Entity.FORMAT,
    role: UserRole.PARTICIPANT,
    permissions: [
        Permission.ADD_TEAM,
        Permission.UPDATE_TEAM,
        Permission.DELETE_TEAM,
        Permission.ADD_TEAMMEMBER,
        Permission.DELETE_TEAMMEMBER
    ]
};

const formatTechnicalUserPermission: PermissionsRole = {
    entity: Entity.FORMAT,
    role: UserRole.TECHNICAL,
    permissions: [Permission.GET_SUBMISSIONS]
};

const workspaceAdminPermission: PermissionsRole = {
    entity: Entity.WORKSPACE,
    role: UserRole.ADMIN,
    permissions: [Permission.UPDATE_WORKSPACE]
};

const workspaceParticipantPermission: PermissionsRole = {
    entity: Entity.WORKSPACE,
    role: UserRole.PARTICIPANT,
    permissions: []
};

export const permissionConfig: PermissionConfig = {
    permissions: [
        formatOrganizerPermission,
        formatParticipantPermission,
        formatTechnicalUserPermission,
        workspaceAdminPermission,
        workspaceParticipantPermission
    ]
};
