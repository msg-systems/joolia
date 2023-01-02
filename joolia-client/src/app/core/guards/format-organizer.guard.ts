import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FormatService } from '../services';
import { Format, Permission } from '../models';
import { catchError, first, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class FormatDetailsSubmissionsGuard implements CanActivate {
    constructor(private router: Router, private formatService: FormatService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.formatService.loadFormat(route.parent.params['formatId']).pipe(
            map((format: Format) => {
                if (this.formatService.hasPermission(Permission.GET_SUBMISSIONS, format)) {
                    return true;
                } else {
                    this.router.navigate(['/error']);
                    return false;
                }
            }),
            first(),
            catchError(() => {
                this.router.navigate(['/error']);
                return of(false);
            })
        );
    }

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(next, state);
    }
}
