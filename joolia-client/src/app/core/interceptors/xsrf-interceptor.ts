/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class XsrfInterceptor implements HttpInterceptor {
    private headerName = 'X-XSRF-TOKEN';

    constructor(private tokenService: HttpXsrfTokenExtractor) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Copied from Angular source code but without excluding absolute URLs
        if (req.method === 'GET' || req.method === 'OPTIONS' || req.method === 'HEAD') {
            return next.handle(req);
        }
        const token = this.tokenService.getToken();

        // Be careful not to overwrite an existing header of the same name.
        if (token !== null && !req.headers.has(this.headerName)) {
            req = req.clone({ headers: req.headers.set(this.headerName, token) });
        }
        return next.handle(req);
    }
}
