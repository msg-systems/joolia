import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from './configuration.service';
import { Entity, Permission, UserRole } from '../models';
import { AuthorizationService } from './authorization.service';
import { getMockData } from '../../../testing/unitTest';

let mockPermissions;

describe('AuthorizationService', () => {
    let service: AuthorizationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AuthorizationService, ConfigurationService]
        });

        service = TestBed.inject(AuthorizationService);
        mockPermissions = getMockData('permissionrole.set.set1');
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('hasPermission', () => {
        it('should return true for organizers accessing a format', () => {
            const hasPermission = service.hasPermission(Entity.FORMAT, UserRole.ORGANIZER, Permission.UPDATE_FORMAT);
            expect(hasPermission).toBe(true);
        });

        it('should return false for participents accessing a format', () => {
            const hasPermission = service.hasPermission(Entity.FORMAT, UserRole.PARTICIPANT, Permission.UPDATE_FORMAT);
            expect(hasPermission).toBe(false);
        });

        it('should return true for admins updating a workspace', () => {
            const hasPermission = service.hasPermission(Entity.WORKSPACE, UserRole.ADMIN, Permission.UPDATE_WORKSPACE);
            expect(hasPermission).toBe(true);
        });

        it('should return false for participents updating a workspace', () => {
            const hasPermission = service.hasPermission(Entity.WORKSPACE, UserRole.PARTICIPANT, Permission.UPDATE_WORKSPACE);
            expect(hasPermission).toBe(false);
        });
    });
});
