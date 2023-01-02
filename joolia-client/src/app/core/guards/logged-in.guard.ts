import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService, LoggerService, UserService } from '../services';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        private logger: LoggerService,
        private userService: UserService
    ) {}

    /**
     * @description if the user is already logged in, he should not be able to visit certain pages like signin / signup / ...
     */
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
        if (this.authenticationService.isAuthenticated()) {
            this.logger.debug('[LoggedInGuard] user is authenticated', this, this.canActivate);
            this.logger.debug('[LoggedInGuard] re-routing to format overview', this, this.canActivate);
            return this.router.parseUrl('/format/overview');
        } else {
            this.logger.debug('[Guard] user is not authenticated', this, this.canActivate);
            return true;
        }
    }

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
        return this.canActivate(next, state);
    }
}
