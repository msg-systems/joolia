import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthenticationService, LoggerService } from '../services';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class BaseInterceptor implements HttpInterceptor {
    constructor(private logger: LoggerService, private authService: AuthenticationService, private router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.logSpecificRequests(request);

        const clonedRequest = this.modifyRequest(request);

        this.logger.trace(clonedRequest, this, this.intercept);

        return next.handle(clonedRequest).pipe(
            tap(
                (event) => this.readJWTFromResponse(event),
                (error) => this.handleResponseError(error)
            )
        );
    }

    private modifyRequest(request: HttpRequest<any>) {
        this.logger.trace('[BaseInterceptor] setting header', this, this.modifyRequest);

        const token = this.authService.jwtToken;
        let authHeader = {};
        if (token) {
            authHeader = {
                setHeaders: {
                    Authorization: token
                }
            };
        }

        return request.clone({
            ...authHeader,
            withCredentials: true
        });
    }

    private logSpecificRequests(request: HttpRequest<any>) {
        if (request.urlWithParams.includes('?')) {
            this.logger.trace(request.urlWithParams);
        }
    }

    private readJWTFromResponse(event) {
        if (event instanceof HttpResponse && event.body && event.body.token) {
            this.logger.debug('[HTTPInterceptor]: Token received');
            this.authService.jwtToken = event.body.token;
            this.authService.jwtExpiration = event.body.expires;
        }
    }

    private handleResponseError(error) {
        this.logger.debug(`[HTTPInterceptor]: Response(${error.status}) - ${error.message} `);

        if (error.status === 401) {
            if (error.url.endsWith('/token')) {
                this.authService.removeLoggedIn();
                this.authService.stopTokenRenewal();
            }

            this.logger.debug(`[HTTPInterceptor]: Redirecting to Login`);
            this.router.navigate(['/signin']);
        }
    }
}
