import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigurationService } from './configuration.service';
import { UserSignUp } from '../models';
import { AuthenticationService } from './authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { ConfigurationServiceStub, LoggerServiceStub } from '../../../testing/unitTest';
import { LoggerService } from './logger.service';

const configurationServiceStub = new ConfigurationServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const cookieSpy = jasmine.createSpyObj('CookieService', ['delete']);

let httpMock: HttpTestingController;

function checkServerCall(url: string, method: string, resBody?: Object, verifyHttp: boolean = true) {
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    req.flush(resBody ? resBody : {});
    if (verifyHttp) {
        httpMock.verify();
    }
}

describe('AuthenticationService', () => {
    let service: AuthenticationService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthenticationService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: CookieService, useValue: cookieSpy },
                { provide: LoggerService, useValue: loggerServiceStub }
            ]
        });

        service = TestBed.inject(AuthenticationService);
        httpMock = TestBed.inject(HttpTestingController);

        spyOn(window.localStorage, 'getItem').and.callFake(() => {
            return JSON.stringify({ loggedIn: 'true' });
        });

        spyOn(window.localStorage, 'setItem');

        spyOn(window.localStorage, 'removeItem');
    });

    function signIn() {
        service.signIn('test@mail.com', 'secretPassword').subscribe();
        checkServerCall(`https://api.joolia.net/signin`, 'POST');
        tick();
        checkServerCall(`https://api.joolia.net/token`, 'GET');
        tick();
        // remove planned interval for renewal of token
        service['appRefreshTokenIntervalSub'].unsubscribe();
    }

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Login/Logout/Signup', () => {
        it('should sigIn', fakeAsync(() => {
            const nextSpy = spyOn(service.authenticationChanged, 'next').and.callThrough();
            const nextSpyLogin = spyOn(service.loginExecuted, 'next').and.callThrough();

            service.loginExecuted.subscribe();
            service.authenticationChanged.subscribe();
            service.jwtExpiration = '2';

            service.signIn('test@mail.com', 'secretPassword').subscribe();

            checkServerCall(`https://api.joolia.net/signin`, 'POST');
            tick();
            checkServerCall(`https://api.joolia.net/token`, 'GET');
            tick();

            // remove planned interval for renewal of token
            service['appRefreshTokenIntervalSub'].unsubscribe();

            expect(window.localStorage.setItem).toHaveBeenCalled();
            expect(nextSpy).toHaveBeenCalled();
            expect(nextSpyLogin).toHaveBeenCalled();
        }));

        it('should signUp', () => {
            service.signUp(<UserSignUp>{ email: 'test@mail.com', name: 'Test user' }).subscribe();
            checkServerCall(`https://api.joolia.net/signup`, 'POST');
        });

        it('should logout', fakeAsync(() => {
            const nextSpy = spyOn(service.authenticationChanged, 'next').and.callThrough();
            const nextSpyLogout = spyOn(service.logoutExecuted, 'next').and.callThrough();

            service.jwtExpiration = new Date().toISOString();
            service.jwtToken = 'JWT thisIsMyJooliaJWT';

            service.logoutExecuted.subscribe();
            service.authenticationChanged.subscribe();

            service.logout();
            tick();
            checkServerCall(`https://api.joolia.net/signout`, 'POST');
            tick();

            expect(window.localStorage.removeItem).toHaveBeenCalledWith('loggedIn');
            expect(service.jwtToken).toBeNull();
            expect(service.jwtExpiration).toBeNull();
            expect(nextSpy).toHaveBeenCalled();
            expect(nextSpyLogout).toHaveBeenCalled();
        }));
    });

    describe('JWT Token', () => {
        it('should use default value for renewaltime if not able to calculate', fakeAsync(() => {
            signIn();
            expect(service.tokenRenewalTimeout).toBe(30000);
        }));

        it('should renew after the half of the jwtExpiration', fakeAsync(() => {
            const date = new Date();
            date.setMinutes(date.getMinutes() + 2);
            service.jwtExpiration = date.toISOString();
            signIn();
            expect(service.tokenRenewalTimeout).toBe(60000);
        }));
    });

    describe('CSRF Token handling', () => {
        it('should get XSRF cookie', () => {
            service.getXsrfCookie().subscribe(() => checkServerCall(`https://api.joolia.net/init`, 'GET'));
        });
    });

    describe('Password change', () => {
        it('should requestPasswordReset', () => {
            service.requestPasswordReset('test@mail.com').subscribe();
            checkServerCall(`https://api.joolia.net/request-password-reset`, 'PUT');
        });

        it('should reset Password', () => {
            service.resetPassword('resetToken', 'newPassword').subscribe();
            checkServerCall(`https://api.joolia.net/reset-password`, 'PATCH');
        });
    });

    describe('Checks', () => {
        it('should return if user isAuthenticated', () => {
            const isAuthenticated = service.isAuthenticated();
            expect(isAuthenticated).toBeTruthy();
        });

        it('should return if email is available', fakeAsync(() => {
            service.checkMailAvailability('test@mail.com').subscribe((res) => {
                expect(res).toBeTruthy();
            });

            checkServerCall(`https://api.joolia.net/user/checkemail?email%5B%5D=test@mail.com`, 'GET', { emailAvailable: true });
        }));
    });
});
