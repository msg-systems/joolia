import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthenticationService, LoggerService } from '../services';
import { Injectable } from '@angular/core';
import { ErrorDialogComponent } from '../../shared/components/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private dialogRef;

    constructor(
        private logger: LoggerService,
        private dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage;
                if (error.error instanceof ErrorEvent) {
                    // client-side error
                    errorMessage = `Error: ${error.error.message}`;
                } else {
                    // server-side error
                    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

                    switch (error.status) {
                        case 0:
                            if (this.dialogRef) {
                                return;
                            }
                            this.dialogRef = this.dialog.open(ErrorDialogComponent, {
                                width: '400px',
                                data: {
                                    headerKey: 'dialog.errors.title',
                                    contentKey: 'dialog.errors.content.connectionError',
                                    confirmKey: 'dialog.errors.confirm'
                                }
                            });

                            this.dialogRef.afterClosed().pipe(finalize(() => (this.dialogRef = undefined)));
                            break;
                        case 401:
                            const currentRoute = this.route.snapshot['_routerState'].url;
                            if (
                                currentRoute !== '/signin' &&
                                currentRoute !== '/signout' &&
                                !this.authenticationService.isAuthenticated()
                            ) {
                                this.dialog
                                    .open(ErrorDialogComponent, {
                                        width: '400px',
                                        data: {
                                            headerKey: 'dialog.errors.title',
                                            contentKey: 'global.missingLogin',
                                            confirmKey: 'dialog.errors.confirm'
                                        }
                                    })
                                    .afterClosed()
                                    .subscribe(() => {
                                        this.router.navigate(['/signin']);
                                    });
                            }

                            break;
                        default:
                            // Do nothing only log message afterwards in log
                            break;
                    }
                }

                this.logger.error(errorMessage, this, this.intercept);
                return throwError(error);
            })
        );
    }
}
