import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService, LoggerService } from '../services';

/**
 * Meta Interceptor is used to add Custom Header Attributes in the HTTP-Header fields
 */
@Injectable()
export class MetaInterceptor implements HttpInterceptor {
    jooliaClientVersion;

    constructor(private logger: LoggerService) {
        this.jooliaClientVersion = ConfigurationService.getConfiguration().configuration.client.version;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({ headers: request.headers.set('X-JOOLIA-Client-Version', this.jooliaClientVersion) });

        this.logger.trace(request, this, this.intercept);
        return next.handle(request);
    }
}
