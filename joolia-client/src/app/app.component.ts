import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService, ConfigurationService, LoggerService, NgxUploadService, UserService } from './core/services';
import * as moment from 'moment';
import { get } from 'scriptjs';
import { Title } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { CookieBannerComponent } from './core/components/cookie-banner/cookie-banner.component';
import { detect } from 'detect-browser';
import { ErrorDialogComponent } from './shared/components/error-dialog/error-dialog.component';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

declare var grecaptcha;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    ready = false;
    private appUpdateIntervalSub;

    constructor(
        private translate: TranslateService,
        private titleService: Title,
        private storageService: LocalStorageService,
        private bottomSheet: MatBottomSheet,
        private dialog: MatDialog,
        private swUpdate: SwUpdate,
        private logger: LoggerService,
        private ngxUploadService: NgxUploadService,
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.setLanguage();
    }

    @HostListener('window:beforeunload', ['$event'])
    windowBeforeUnloadHandler(ev: Event) {
        if (this.ngxUploadService.isUploadActive()) {
            ev.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
            // Chrome requires returnValue to be set
            ev.returnValue = true;
        }
    }

    ngOnInit() {
        this.logger.debug('[JOOLIA]: SWUpdate active - ' + this.swUpdate.isEnabled);
        this.scheduledCalls();
        this.setTitle();
        this.setupRecaptcha();
        this.getTokens();
        this.setupCookieNotice();
        this.detectSupportedBrowser(); // show unsupported browser dialog
    }

    private getTokens() {
        // get XSRF-Cookie for authorized mutating requests
        this.authenticationService.getXsrfCookie().subscribe(() => {
            this.logger.debug('[CSRF] get token - finished');
            if (this.authenticationService.isAuthenticated()) {
                this.logger.debug('[JOOLIA]: Initial Token refresh');
                // get refresh token
                this.authenticationService.refreshToken().then(() => {
                    this.logger.debug('[JOOLIA]: Initial Token refresh - finished');
                    this.userService.updateLocalUser();
                    this.ready = true;
                });
            } else {
                this.ready = true;
            }
        });
    }

    private setLanguage() {
        // Initialization of the TranslationService
        this.translate.addLangs(ConfigurationService.getConfiguration().configuration.supportedLanguages);
        this.translate.setDefaultLang('en');
        this.logger.debug('[JOOLIA]: Default Language - en');

        const browserLang = this.translate.getBrowserLang();
        this.logger.debug(`[JOOLIA]: Browser Language - ${browserLang}`);

        const usedLang = browserLang.match(ConfigurationService.getConfiguration().configuration.supportedLanguagesRegex)
            ? browserLang
            : 'en';
        this.translate.use(usedLang);
        moment.locale(usedLang);
        this.logger.debug(`[JOOLIA]: Active Language - ${browserLang}`);

        if (usedLang === 'de') {
            registerLocaleData(localeDe);
        }
    }

    private detectSupportedBrowser() {
        const browser = detect();
        switch (browser && browser.name) {
            case 'ie':
            case 'edge':
                this.dialog.open(ErrorDialogComponent, {
                    width: '400px',
                    data: {
                        headerKey: 'dialog.errors.browserSupportTitle',
                        contentKey: 'dialog.errors.content.unsupportedBrowser',
                        confirmKey: 'dialog.errors.confirm'
                    }
                });
                break;
            default:
                this.logger.info('[JOOLIA]: Browser Supported');
        }
    }

    private setupCookieNotice() {
        // show cookie note on first visit
        setTimeout(() => {
            if (!this.storageService.retrieve('viewedCookieNote')) {
                const bottomSheetRef = this.bottomSheet.open(CookieBannerComponent, {
                    hasBackdrop: false,
                    disableClose: true,
                    panelClass: 'cookie-banner-panel'
                });

                bottomSheetRef.afterDismissed().subscribe((accepted: boolean) => {
                    if (accepted) {
                        this.storageService.store('viewedCookieNote', true);
                    }
                });
            }
        }, ConfigurationService.getConfiguration().configuration.cookieBanner.delay);
    }

    private setupRecaptcha() {
        const reCaptchaConfig = ConfigurationService.getConfiguration().configuration.reCaptcha;
        if (reCaptchaConfig.enabled) {
            get('https://www.google.com/recaptcha/api.js?render=' + reCaptchaConfig.siteKey, () => {
                grecaptcha.ready(() => {
                    grecaptcha.execute(reCaptchaConfig.siteKey, { action: 'login' });
                });
            });
        }
    }

    private setTitle() {
        this.translate.get('home.pageTitle').subscribe((title: string) => {
            this.titleService.setTitle(title);
        });
    }

    private scheduledCalls() {
        if (this.swUpdate.isEnabled) {
            this.appUpdateIntervalSub = interval(1000 * 60 * 2).subscribe(() => {
                this.swUpdate.checkForUpdate();
            });

            this.swUpdate.available.subscribe(() => {
                this.translate.get('home.newVersionUpdate').subscribe((versionUpdateText: string) => {
                    this.logger.debug('[SCHEDULED]: Update App');
                    if (confirm(versionUpdateText)) {
                        window.location.reload();
                    }
                });
            });
        }
    }
}
