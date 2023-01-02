import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from 'ngx-webstorage';

/**
 * The BackButtonComponent expects to be given a routerLink and a label. If not, it navigates to
 * format overview or workspace details depending on the session storage key 'backTo' on click.
 */
@Component({
    selector: 'back-button',
    templateUrl: './back-button.component.html',
    styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {
    @Input() routerLinkArg: any[] | string = null;
    @Input() labelKey: string = null;
    @Input() labelParams: any = null;

    label: string;
    backTo: string;

    constructor(private storage: SessionStorageService, private translate: TranslateService, private router: Router) {}

    ngOnInit(): void {
        this.backTo = this.storage.retrieve('backTo');

        if (!this.routerLinkArg && !this.labelKey) {
            this.label = this.translate.instant('buttons.backToFormats');
        } else {
            this.label = this.translate.instant(this.labelKey, this.labelParams);
        }
    }

    onNavigateBack() {
        if (!this.routerLinkArg) {
            if (this.backTo === 'workspace' && this.labelParams && this.labelParams.id) {
                this.router.navigate(['workspace', this.labelParams.id, 'formats']);
            } else {
                this.router.navigate(['format', 'overview']);
            }
        }
    }
}
