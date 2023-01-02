import { AuthenticationService } from '../../app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { User } from '../../app/core/models';

export class AuthenticationServiceStub implements Partial<AuthenticationService> {
    public _signUpCalls: any[] = [];
    public _signInCalls: any[] = [];
    public _logoutCalls: any[] = [];
    public _checkMailAvailabilityCalls: any[] = [];
    public _cookieCalls: any[] = [];

    authenticated = true;

    authenticationChanged = new Subject<User>();

    constructor(isAuth?: boolean) {
        if (isAuth !== undefined) {
            this.authenticated = isAuth;
        }
    }

    isAuthenticated(): boolean {
        return this.authenticated;
    }

    signUp(): Observable<any> {
        this._signUpCalls.push('');
        return of({ name: 'test', email: 'test@test.com', password: '12345678', contact: true });
    }

    signIn(email: string, password: string): Observable<any> {
        this._signInCalls.push('');
        return of({ email: 'test@test.com', password: '12345678' });
    }

    checkMailAvailability(email: string): Observable<boolean> {
        this._checkMailAvailabilityCalls.push('');
        return of(true);
    }

    async refreshToken(): Promise<void> {
        return new Promise((resolve) => {
            this._cookieCalls.push('refreshToken');
            resolve();
        });
    }

    logout() {
        this._logoutCalls.push('');
    }

    getXsrfCookie(): Observable<any> {
        this._cookieCalls.push('xsrfCookie');
        return of(true);
    }

    _resetStubCalls() {
        this._signInCalls.length = 0;
        this._signUpCalls.length = 0;
        this._logoutCalls.length = 0;
        this._checkMailAvailabilityCalls.length = 0;
        this._cookieCalls.length = 0;
    }
}
