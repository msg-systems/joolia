/**
 * The AuthorizationService handles all logic regarding the authorization of a user and its UserRole.
 */
import { Injectable } from '@angular/core';
import { Entity, Permission, PermissionsRole, UserRole } from '../models';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class AuthorizationService {
    private loadedPermissions: PermissionsRole[] = [];

    constructor() {
        this.loadedPermissions = ConfigurationService.getPermissions();
    }

    hasPermission(entity: Entity, role: UserRole, requestedPermission: Permission): boolean {
        return !!this.loadedPermissions.find(
            (permissionRole: PermissionsRole) =>
                permissionRole.entity === entity && permissionRole.role === role && permissionRole.permissions.includes(requestedPermission)
        );
    }
}
