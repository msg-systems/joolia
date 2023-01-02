import { Component, OnInit } from '@angular/core';
import { AuthenticationService, ConfigurationService, SidebarService, UserService } from '../../services';
import { Router } from '@angular/router';
import { User } from '../../models';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
    jooliaLogoSrc: string;
    showPreview: boolean;
    user: User;

    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        private userService: UserService,
        private sidebarService: SidebarService
    ) {}

    ngOnInit() {
        const appBaseHref = ConfigurationService.getConfiguration().appBaseHref;
        this.jooliaLogoSrc = appBaseHref + 'assets/joolia-text-only.svg';
        this.userService.loggedInUserChanged.subscribe((user) => (this.user = user));
        this.showPreview = ConfigurationService.getConfiguration().stage !== 'production';
    }

    onLogout() {
        this.authenticationService.logout();
        this.router.navigate(['home']);
    }

    isAuthenticated() {
        return this.authenticationService.isAuthenticated();
    }
}
