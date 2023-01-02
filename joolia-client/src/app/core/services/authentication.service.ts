import { Injectable } from '@angular/core';
import { User, UserSignUp } from '../models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { concatMap, map } from 'rxjs/operators';
import { IQueryParams, UtilService } from './util.service';
import { LoggerService } from './logger.service';

/**
 * The AuthenticationService handles all logic and http requests regarding the authentication of a user.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    authenticationChanged = new Subject<User>();
    logoutExecuted = new Subject();
    loginExecuted = new Subject();
    tokenRenewalTimeout: number;
    private readonly serverConnection: string;
    private appRefreshTokenIntervalSub: Subscription;

    constructor(private http: HttpClient, private config: ConfigurationService, private logger: LoggerService) {
        this.serverConnection = this.config.getServerConnection();
    }

    private _jwtToken: string;

    get jwtToken(): string {
        return this._jwtToken;
    }

    set jwtToken(value: string) {
        this._jwtToken = value;
    }

    private _jwtExpiration: string;

    get jwtExpiration(): string {
        return this._jwtExpiration;
    }

    set jwtExpiration(value: string) {
        this._jwtExpiration = value;
    }

    public isAuthenticated(): boolean {
        return Boolean(localStorage.getItem('loggedIn'));
    }

    checkMailAvailability(email: string): Observable<boolean> {
        const queryParams: IQueryParams = { email: email };
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<any>(`${this.serverConnection}/user/checkemail`, { params: httpParams })
            .pipe(map((res) => res.emailAvailable));
    }

    signIn(email: string, password: string): Observable<User> {
        return this.http
            .post<User>(`${this.serverConnection}/signin`, { email, password })
            .pipe(
                concatMap(async (u: User) => {
                    localStorage.setItem('loggedIn', 'true');
                    return u;
                }),
                concatMap(async (u: User) => {
                    await this.refreshToken();
                    return u;
                }),
                concatMap(async (u: User) => {
                    this.loginExecuted.next();
                    return u;
                }),
                concatMap(async (u: User) => {
                    this.authenticationChanged.next(u);
                    return u;
                }),
                concatMap(async (u: User) => u)
            );
    }

    signUp(user: UserSignUp): Observable<any> {
        return this.http.post<any>(`${this.serverConnection}/signup`, user);
    }

    logout() {
        this.http.post<void>(`${this.serverConnection}/signout`, {}).subscribe();
        this.removeLoggedIn();
        this.jwtToken = this.jwtExpiration = null;
        this.authenticationChanged.next(null);
        this.logoutExecuted.next();
    }

    requestPasswordReset(email: string): Observable<any> {
        return this.http.put<any>(`${this.serverConnection}/request-password-reset`, { email });
    }

    resetPassword(token: string, password: string): Observable<any> {
        return this.http.patch<any>(`${this.serverConnection}/reset-password`, { token, password });
    }

    getXsrfCookie(): Observable<void> {
        this.logger.debug('[CSRF] get token');
        return this.http.get<void>(`${this.serverConnection}/init`);
    }

    async refreshToken(): Promise<void> {
        return await this.http
            .get<void>(`${this.serverConnection}/token`)
            .toPromise()
            .then(
                () => {
                    this.scheduledCalls();
                },
                (error) => {
                    this.logger.debug(`[JOOLIA] error token renewal: ${error.message}`);
                }
            );
    }

    public stopTokenRenewal() {
        if (this.appRefreshTokenIntervalSub) {
            this.logger.debug('[SCHEDULED] stop subscription for renewal');
            this.appRefreshTokenIntervalSub.unsubscribe();
        }
    }

    public removeLoggedIn() {
        localStorage.removeItem('loggedIn');
    }

    private calcRenewalTimeout(): number {
        const expirationDate = new Date(this.jwtExpiration);
        const currentDate = new Date();
        const dateDiff = expirationDate.getTime() - currentDate.getTime();
        return Math.floor(dateDiff / 2);
    }

    private async scheduledCalls() {
        this.tokenRenewalTimeout = await this.calcRenewalTimeout();

        if (!this.tokenRenewalTimeout || this.tokenRenewalTimeout < 0) {
            this.tokenRenewalTimeout = ConfigurationService.getConfiguration().configuration.jwtToken.defaultRenewalTimeout;
        }

        this.logger.debug(`[JOOLIA]: Token renewal time: ${this.tokenRenewalTimeout} ms`);

        this.stopTokenRenewal();

        this.appRefreshTokenIntervalSub = interval(this.tokenRenewalTimeout).subscribe(() => {
            if (this.isAuthenticated()) {
                this.logger.debug('[SCHEDULED]: Refreshing token which is about to expire');
                this.refreshToken();
            }
        });
    }
}
