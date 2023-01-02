import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SidenavItem, User } from '../../../core/models';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthenticationService, SidebarService, UserService } from '../../../core/services';

interface SidenavGeneralItem extends SidenavItem {
    urlPrefix: string;
}

/**
 * The SidenavComponent acts as container when a side navigation is needed. The navigation elements can be added dynamically to the sidebar
 * redirecting the user to its new location. If the browser already is on one of the navigation options, the option will be highlighted.
 */
@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {
    @Input() headerTitle: string;
    @Input() navigationOptions: SidenavItem[] = [];

    generalNavigationEntries: SidenavGeneralItem[] = [
        {
            sidenavRouterLink: '/format/overview',
            urlPrefix: '/format/',
            sidenavKey: 'sidenav.format.header',
            icon: 'vertical_split'
        },
        {
            sidenavRouterLink: '/library/overview',
            urlPrefix: '/library/',
            sidenavKey: 'sidenav.library.header',
            icon: 'local_library_outline'
        }
    ];

    workspaceNavigationItem: SidenavGeneralItem = {
        sidenavRouterLink: '/workspace/overview',
        urlPrefix: '/workspace/',
        sidenavKey: 'sidenav.workspace.header',
        icon: 'work_outline'
    };

    activeItem: string;
    subscriptions: Subscription[] = [];
    isWorkspaceTabVisible = false;

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private router: Router,
        public sidebarService: SidebarService
    ) {}

    ngOnInit() {
        this.subscriptions.push(
            this.userService.getCurrentUser().subscribe((user) => {
                this.setWorkspaceVisibility(user);
            })
        );
        this.subscriptions.push(
            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.setActiveLink();
                }
            })
        );
        this.setActiveLink();
    }

    setWorkspaceVisibility(user: User) {
        if (!this.isWorkspaceTabVisible && user !== null && user !== undefined && (user.admin || user.workspaceCount > 1)) {
            this.isWorkspaceTabVisible = true;
            this.generalNavigationEntries.splice(1, 0, this.workspaceNavigationItem);
        } else if (user === null || user === undefined || (!user.admin && user.workspaceCount < 2)) {
            this.isWorkspaceTabVisible = false;
        }
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    setActiveLink() {
        const activeSidenavItem = this.navigationOptions.find((navItem: SidenavItem) =>
            this.isLinkActive(navItem.sidenavRouterLink, navItem.queryParams)
        );

        this.activeItem = activeSidenavItem ? activeSidenavItem.sidenavKey : '';
    }

    isLinkActive(url: string, queryParams): boolean {
        if (!this.router.url.includes('?') && (!queryParams || Object.entries(queryParams).length === 0)) {
            return url.split('/').every((s) => this.router.url.split('/').includes(s));
        } else if (queryParams) {
            const queryParamsString = '' + Object.getOwnPropertyNames(queryParams) + '=' + Object.values(queryParams);
            const splitUrl = this.router.url.split('?');
            return url.split('/').every((s) => splitUrl[0].split('/').includes(s)) && queryParamsString === splitUrl[1];
        }
        return false;
    }

    isAuthenticated() {
        return this.authenticationService.isAuthenticated();
    }
}
