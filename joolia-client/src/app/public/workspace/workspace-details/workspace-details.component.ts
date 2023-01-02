import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidenavItem, UserRole, Workspace } from '../../../core/models';
import { ConfigurationService, IQueryParams, UtilService, WorkspaceService } from '../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-workspace-details',
    templateUrl: './workspace-details.component.html',
    styleUrls: ['./workspace-details.component.scss']
})
export class WorkspaceDetailsComponent implements OnInit, OnDestroy {
    participantSidenavItems: SidenavItem[] = [
        {
            sidenavKey: 'sidenav.workspace.information',
            sidenavRouterLink: `information`,
            icon: 'info'
        },
        {
            sidenavKey: 'sidenav.workspace.allFormats',
            sidenavRouterLink: `formats`,
            icon: 'vertical_split'
        },
        {
            sidenavKey: 'sidenav.workspace.members',
            sidenavRouterLink: `members`,
            icon: 'people'
        }
    ];
    sidenavItems: SidenavItem[] = [];

    workspace: Workspace;
    subscriptions: Subscription[] = [];
    isWorkspaceAdmin = false;

    constructor(
        private workspaceService: WorkspaceService,
        private route: ActivatedRoute,
        private router: Router,
        private storage: SessionStorageService,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        this.storage.store('backTo', 'workspace');

        this.subscriptions.push(
            this.workspaceService.workspaceChanged.subscribe((workspace) => {
                this.workspace = workspace;
                this.isWorkspaceAdmin = workspace.me.userRole === UserRole.ADMIN;

                this.setSidenavItems();

                if (this.router.url.match('[^?]admin') && !this.isWorkspaceAdmin) {
                    this.router.navigate([`/workspace/${this.workspace.id}/formats`]);
                }
            })
        );

        this.loadWorkspace();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private loadWorkspace() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().workspace.select.details
        };

        this.workspaceService.loadWorkspace(this.route.snapshot.params['workspaceId'], queryParams).subscribe(
            (data) => {},
            (err) => {
                this.utilService.logAndNavigate(err.error, this, this.loadWorkspace, 'snackbar.workspaceNotFound', 'workspace/overview');
            }
        );
    }

    private setSidenavItems() {
        if (this.isWorkspaceAdmin) {
            this.sidenavItems = this.participantSidenavItems.concat([
                {
                    sidenavKey: 'sidenav.workspace.administration',
                    sidenavRouterLink: `admin`,
                    icon: 'admin_panel_settings'
                }
            ]);
        } else {
            this.sidenavItems = this.participantSidenavItems;
        }
    }
}
