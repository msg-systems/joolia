import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { NgxUploadService, SnackbarService } from '../services';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class FileUploadGuard implements CanActivate, CanActivateChild {
    constructor(
        private ngxUploadService: NgxUploadService,
        private snackbarService: SnackbarService,
        private translate: TranslateService
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.ngxUploadService.isUploadActive()) {
            this.snackbarService.openWithMessage('snackbar.filesCurrentlyUploading');
            return false;
        }

        return true;
    }

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(next, state);
    }
}
