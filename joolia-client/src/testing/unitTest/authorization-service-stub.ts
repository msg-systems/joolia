import { AuthorizationService } from '../../app/core/services/authorization.service';
import { Entity, Permission, UserRole } from '../../app/core/models';

export class AuthorizationServiceStub implements Partial<AuthorizationService> {
    hasPermission(entity: Entity, role: UserRole, requestedPermission: Permission): boolean {
        return true;
    }
}
