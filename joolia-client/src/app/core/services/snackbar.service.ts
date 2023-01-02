import { Injectable, TemplateRef, EmbeddedViewRef } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/portal';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {
    snackbarConfig: MatSnackBarConfig;

    constructor(private snackBar: MatSnackBar, private translate: TranslateService) {
        this.snackbarConfig = ConfigurationService.getConfiguration().configuration.snackBarConfig;
    }

    openWithMessage(messageKey: string, messageParams?: Object, action?: string): MatSnackBarRef<SimpleSnackBar> {
        return this.snackBar.open(
            this.translate.instant(messageKey, messageParams),
            action ? this.translate.instant(action) : action,
            this.snackbarConfig
        );
    }

    openFromComponent(component: ComponentType<any>): MatSnackBarRef<any> {
        return this.snackBar.openFromComponent(component, this.snackbarConfig);
    }

    openFromTemplate(template: TemplateRef<any>): MatSnackBarRef<EmbeddedViewRef<any>> {
        return this.snackBar.openFromTemplate(template, this.snackbarConfig);
    }
}
