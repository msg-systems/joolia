import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { PublicModule } from './public/public.module';
import { AppRoutingModule } from './app-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { APP_BASE_HREF } from '@angular/common';
import { ConfigurationService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LayoutModule } from '@angular/cdk/layout';

export function getCurrentLanguage(translate: TranslateService) {
    return translate.currentLang;
}

/**
 * Module which is used to bootstrap the application
 */
@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreModule,
        SharedModule,
        PublicModule,
        FlexLayoutModule,
        LayoutModule,
        AppRoutingModule,
        NgxWebstorageModule.forRoot(),
        ServiceWorkerModule.register('/ngsw-worker.js', {
            enabled: environment.production
        })
    ],
    providers: [
        {
            provide: APP_BASE_HREF,
            useValue: ConfigurationService.getConfiguration().appBaseHref
        },
        {
            provide: LOCALE_ID,
            useFactory: getCurrentLanguage,
            deps: [TranslateService]
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                ...new MatDialogConfig(), // use default configuration as basis...
                restoreFocus: false // ...but remove focus after closing a dialog
            } as MatDialogConfig
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
