import {
    AfterViewInit,
    Component,
    ContentChildren,
    Directive,
    Input,
    OnDestroy,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

// source: https://github.com/angular/components/issues/2177#issuecomment-447787776

/**
 * Directive to retrieve mat-tab options from router-tab.component.html
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'mat-tab[routerLink]'
})
// tslint:disable-next-line:directive-class-suffix
export class RouterTab {
    @Input()
    public routerLinkActiveOptions: {
        exact: boolean;
    };

    constructor(public tab: MatTab, public routerLink: RouterLink) {}
}

/**
 * Directive to set tabs within app-router-tab
 */
// tslint:disable-next-line:directive-selector
@Directive({ selector: 'app-router-tab-item' })
// tslint:disable-next-line:directive-class-suffix
export class RouterTabItem {
    @Input()
    public routerLink: RouterLink;

    @Input()
    public routerLinkActiveOptions: {
        exact: boolean;
    };

    @Input()
    public disabled: boolean;

    @Input()
    public label: string;
}

/**
 * RouterTab component with the same behavior than mat-tab-nav-bar
 */
@Component({
    selector: 'app-router-tab',
    templateUrl: './router-tab.component.html',
    styleUrls: ['./router-tab.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RouterTabComponent implements AfterViewInit, OnDestroy {
    @ViewChild('matTabGroup')
    public matTabGroup: MatTabGroup;

    @ContentChildren(RouterTabItem)
    public routerTabItems!: QueryList<RouterTabItem>;

    @ViewChildren(RouterTab)
    public routerTabs: QueryList<RouterTab>;

    private subscription = new Subscription();

    constructor(private router: Router) {}

    ngAfterViewInit() {
        // Remove tab click event
        this.matTabGroup._handleClick = () => {};
        // Select current tab depending on url
        this.setIndex();
        // Subscription to navigation change
        this.subscription.add(
            this.router.events.subscribe((e) => {
                if (e instanceof NavigationEnd) {
                    this.setIndex();
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    /**
     * Set current selected tab depending on navigation
     */
    private setIndex() {
        this.routerTabs.find((tab, i) => {
            if (!this.router.isActive(tab.routerLink.urlTree, tab.routerLinkActiveOptions ? tab.routerLinkActiveOptions.exact : false)) {
                return false;
            }
            tab.tab.isActive = true;
            this.matTabGroup.selectedIndex = i;
            return true;
        });
    }
}
