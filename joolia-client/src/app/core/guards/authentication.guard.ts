import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService, LoggerService } from '../services';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService, private router: Router, private logger: LoggerService) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authenticationService.isAuthenticated()) {
            this.logger.debug('[AuthenticationGuard] user is authenticated', this, this.canActivate);
            return true;
        } else {
            this.logger.debug('[AuthenticationGuard] user is not authenticated', this, this.canActivate);
            this.router.navigate(['signin']);
            return false;
        }
    }

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(next, state);
    }
}
