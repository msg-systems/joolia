import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { TranslateCompiler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { LoggerModule } from 'ngx-logger';
import { MESSAGE_FORMAT_CONFIG, TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SharedModule } from '../shared/shared.module';
import { ErrorComponent, FooterComponent, HomeComponent, MaterialModule, ToolbarComponent } from './components';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner.component';
import { AuthenticationGuard, FileUploadGuard, FormatDetailsSubmissionsGuard, LoggedInGuard } from './guards';
import { BaseInterceptor, ErrorInterceptor, MetaInterceptor, XsrfInterceptor } from './interceptors';
import {
    ActivityService,
    ActivityTemplateService,
    CommentService,
    ConfigurationService,
    FileService,
    FormatTemplateService,
    CanvasService,
    LibraryService,
    LoggerService,
    PaginatorIntlService,
    PhaseService,
    PhaseTemplateService,
    RatingService,
    SnackbarService,
    SubmissionService,
    UserService,
    UtilService,
    ReferenceResolverService,
    ValidationService,
    WorkspaceService,
    NotificationService
} from './services';
import { AuthorizationService } from './services/authorization.service';
import { SocketServices } from './socket.services';

// see https://github.com/ngx-translate/core/issues/199
export class MultiTranslateHttpLoader implements TranslateLoader {
    constructor(
        private http: HttpClient,
        public resources: { prefix: string; suffix: string }[] = [
            {
                prefix: ConfigurationService.getConfiguration().appBaseHref + '/assets/i18n/',
                suffix: '.json'
            }
        ]
    ) {}

    public getTranslation(lang: string): any {
        return forkJoin(
            this.resources.map((config) => {
                return this.http.get(`${config.prefix}${lang}${config.suffix}`);
            })
        ).pipe(
            map((response) => {
                return response.reduce((a, b) => {
                    return Object.assign(a, b);
                });
            })
        );
    }
}

const translateResources = [
    { prefix: ConfigurationService.getConfiguration().appBaseHref + 'assets/i18n/', suffix: '.json' },
    { prefix: ConfigurationService.getConfiguration().appBaseHref + 'assets/i18n/privacy-policy/', suffix: '.json' }
];

export function createTranslateLoader(http: HttpClient) {
    return new MultiTranslateHttpLoader(http, translateResources);
}

export function TranslateMessageFormatCompilerFactory() {
    return new TranslateMessageFormatCompiler();
}

export function injectTranslateServiceInPaginator(translate: TranslateService) {
    const service = new PaginatorIntlService();
    service.injectTranslateService(translate);
    return service;
}

/**
 * Module for essentials which are needed to run the application
 */
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        HttpClientModule,
        HttpClientXsrfModule.withOptions({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
        SharedModule,
        FlexLayoutModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            },
            compiler: {
                provide: TranslateCompiler,
                useFactory: TranslateMessageFormatCompilerFactory
            }
        }),
        LoggerModule.forRoot(environment.configuration.loggerConfig) // Is overriden in LoggerService
    ],
    providers: [
        ConfigurationService,
        UserService,
        ActivityService,
        ActivityTemplateService,
        AuthorizationService,
        AuthenticationGuard,
        CookieService,
        FormatDetailsSubmissionsGuard,
        FormatTemplateService,
        LoggedInGuard,
        FileUploadGuard,
        LoggerService,
        PhaseService,
        PhaseTemplateService,
        ValidationService,
        SnackbarService,
        UtilService,
        ReferenceResolverService,
        WorkspaceService,
        LibraryService,
        FileService,
        SubmissionService,
        CommentService,
        RatingService,
        CanvasService,
        NotificationService,
        { provide: HTTP_INTERCEPTORS, useClass: BaseInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MetaInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
        {
            provide: MESSAGE_FORMAT_CONFIG,
            useValue: { locales: environment.configuration.supportedLanguages }
        },
        {
            provide: MatPaginatorIntl,
            useFactory: injectTranslateServiceInPaginator,
            deps: [TranslateService]
        },
        ...SocketServices
    ],
    exports: [HomeComponent, ToolbarComponent, MaterialModule, TranslateModule, LoggerModule, FooterComponent],
    declarations: [HomeComponent, ToolbarComponent, ErrorComponent, FooterComponent, CookieBannerComponent]
})
export class CoreModule {}
