import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoggedInGuard } from './logged-in.guard';
import { AuthenticationService, LoggerService, UserService } from '../services';
import { Router } from '@angular/router';
import { AuthenticationServiceStub, LoggerServiceStub, UserServiceStub } from '../../../testing/unitTest';

const authenticationServiceStub = new AuthenticationServiceStub(true);
const loggerServiceStub = new LoggerServiceStub();
const userServiceStub = new UserServiceStub();
const mockRouter = {
    parseUrl: jasmine.createSpy('parseUrl')
};

describe('LoggedInGuard', () => {
    let guard: LoggedInGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LoggedInGuard,
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: Router, useValue: mockRouter },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: UserService, useValue: userServiceStub }
            ]
        });

        guard = TestBed.inject(LoggedInGuard);
    });

    it('should be forwarded to /format/overview when logged in ', fakeAsync(() => {
        authenticationServiceStub.authenticated = true;
        const result = guard.canActivate(null, null);
        tick();
        expect(typeof result).not.toEqual('boolean');
        expect(mockRouter.parseUrl).toHaveBeenCalledWith('/format/overview');
    }));

    it('should not forwarded to /format/overview when not logged in ', fakeAsync(() => {
        authenticationServiceStub.authenticated = false;
        const result = guard.canActivate(null, null);
        expect(typeof result).toEqual('boolean');
        expect(result).toBe(true);
    }));

    describe('canActivateChild', () => {
        it('should be forwarded to /format/overview when logged in ', fakeAsync(() => {
            authenticationServiceStub.authenticated = true;
            const result = guard.canActivateChild(null, null);
            tick();
            expect(result).toBeFalsy();
            expect(mockRouter.parseUrl).toHaveBeenCalledWith('/format/overview');
        }));

        it('should not forwarded to /format/overview when not logged in ', fakeAsync(() => {
            authenticationServiceStub.authenticated = false;
            expect(guard.canActivateChild(null, null)).toBeTruthy();
        }));
    });
});
