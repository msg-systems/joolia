import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * The NavigationButtonComponent expects to be given a routerLink and a label. If not, it navigates nowhere.
 */
@Component({
    selector: 'navigation-button',
    templateUrl: './navigation-button.component.html',
    styleUrls: ['./navigation-button.component.scss']
})
export class NavigationButtonComponent {
    @Input() routerLinkArg: string[];
    @Input() forwardIcon = false;
    @Input() labelKey: string = null;
    @Input() queryParams?: { [key: string]: any } = null;

    constructor(private router: Router) {}

    onNavigateTo() {
        this.router.navigate(this.routerLinkArg, { queryParams: this.queryParams });
    }
}
