import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigurationService, IQueryParams, ReferenceResolverService, SnackbarService, WorkspaceService } from '../../../../core/services';
import { AdminConsentEmail, List, User, UserRole, Workspace } from '../../../../core/models';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { AdminConsentDialogComponent } from 'src/app/shared/components/admin-consent-request-dialog/admin-consent-request-dialog.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-workspace-details-administration',
    templateUrl: './workspace-details-administration.component.html',
    styleUrls: ['./workspace-details-administration.component.scss']
})
export class WorkspaceDetailsAdministrationComponent implements OnInit, OnDestroy {
    workspace: Workspace;
    userList: List<User>;
    adminRole = UserRole.ADMIN;
    private subscriptions: Subscription[] = [];

    columnsToDisplay: string[];
    paginatorSizeOptions: number[];
    initialPaginatorSize: number;
    isLoadingContent = false;
    sortingKey: string;
    isAdminConsentGranted: boolean;

    constructor(
        private workspaceService: WorkspaceService,
        private refResolver: ReferenceResolverService,
        private snackbarService: SnackbarService,
        private dialog: MatDialog
    ) {}

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    ngOnInit() {
        const configuration = ConfigurationService.getConfiguration().configuration.tableConfigs.workspaceAdministration;

        this.columnsToDisplay = configuration.columns;
        this.initialPaginatorSize = configuration.defaultPaginationSize;
        this.paginatorSizeOptions = configuration.availablePaginationSizes;
        this.sortingKey = configuration.defaultSortingKey;

        this.workspace = this.workspaceService.getCurrentWorkspace();

        this.isAdminConsentGranted = !!this.workspace.tenant;

        this.loadUsers(0, this.initialPaginatorSize);
    }

    loadUsers(skipAmount: number, takeAmount: number) {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().workspace.select.adminMembersOverview,
            order: this.sortingKey,
            skip: skipAmount,
            take: takeAmount
        };

        this.isLoadingContent = true;

        this.workspaceService.loadWorkspaceUsers(this.workspace.id, queryParams).subscribe((users: List<User>) => {
            this.userList = users;
            this.userList.entities.forEach((u) => {
                this.refResolver.resolveRef(u).subscribe();
            });
            this.isLoadingContent = false;
        });
    }

    onPaginationChange(event: PageEvent) {
        const contentOffset = event.pageIndex * event.pageSize;

        this.loadUsers(contentOffset, event.pageSize);
    }

    onUserDelete(id: string) {
        const user = this.userList.entities.find((u) => u.id === id);

        if (user) {
            if (this.isLastWorkspaceAdmin(user)) {
                this.snackbarService.openWithMessage('snackbar.deleteLastAdminError');
            } else {
                this.workspaceService.removeWorkspaceMember(this.workspace.id, { emails: [user.email] }).subscribe(
                    () => {
                        this.userList.entities = this.userList.entities.filter((u) => u.id !== id);
                        this.userList.count--;
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.workspaceMemberDeletionError');
                    }
                );
            }
        }
    }

    onUserChangeRole(id: string) {
        const user = this.userList.entities.find((u) => u.id === id);

        if (user) {
            if (this.isLastWorkspaceAdmin(user)) {
                this.snackbarService.openWithMessage('snackbar.demoteLastAdminError');
            } else {
                const body = {
                    role: user.role === UserRole.ADMIN ? UserRole.PARTICIPANT : UserRole.ADMIN
                };

                this.workspaceService.patchWorkspaceMember(this.workspace.id, user.id, body).subscribe((data) => {
                    Object.assign(user, data);
                });
            }
        }
    }

    private isLastWorkspaceAdmin(user: User): boolean {
        const admins = this.userList.entities.filter((member: User) => member.role === UserRole.ADMIN);

        return user.role === UserRole.ADMIN && admins.length < 2;
    }

    onOpenRequestConsentDialog() {
        const dialogRef = this.dialog.open(AdminConsentDialogComponent, {
            width: '400px'
        });

        dialogRef.afterClosed().subscribe((result: AdminConsentEmail) => {
            if (!!result) {
                this.subscriptions.push(
                    this.workspaceService.sendAdminConsentEmail(this.workspace.id, result).subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.emailsAreProcessed', { plural: 1 });
                        },
                        (_error) => {
                            this.snackbarService.openWithMessage('snackbar.domainError', { domain: result.domain });
                        }
                    )
                );
            }
        });
    }
}
