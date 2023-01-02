import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Action, FileMeta, List, SidenavItem, Workspace } from '../../../core/models';
import { ConfigurationService, IQueryParams, SnackbarService, UserService, WorkspaceService } from '../../../core/services';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../../../shared/components/error-dialog/error-dialog.component';
import { WorkspaceCreateDialogComponent } from '../workspace-create-dialog/workspace-create-dialog.component';

/**
 * The WorkspaceOverviewComponent displays all workspaces the user has access to. From here the user can switch between which workspaces
 * should be shown, delete workspaces and can create new workspaces.
 */
@Component({
    selector: 'app-overview',
    templateUrl: './workspace-overview.component.html',
    styleUrls: ['./workspace-overview.component.scss']
})
export class WorkspaceOverviewComponent implements OnInit, OnDestroy {
    actionBarActions: Action[] = [];
    workspaceMenuActions: Action[] = [];

    workspaceList: List<Workspace>;
    subscriptions: Subscription[] = [];
    workspaceNameMaxLength: number;
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;

    constructor(
        private workspaceService: WorkspaceService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private translate: TranslateService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit() {
        this.workspaceNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.workspace.name;
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.subscriptions.push(
            this.userService.loggedInUserChanged.subscribe(() => {
                this.checkAdminValidation();
            })
        );

        this.subscriptions.push(
            this.workspaceService.workspaceListChanged.subscribe((workspaceList: List<Workspace>) => {
                this.workspaceList = workspaceList;
                this.noMoreLoadable = this.workspaceList.entities.length >= this.workspaceList.count;
                this.isLoading = false;
                this.workspaceList.entities.forEach((workspace) => {
                    if (workspace.logoId) {
                        this.workspaceService.loadWorkspaceLogoMeta(workspace.id).subscribe((logo: FileMeta) => (workspace.logo = logo));
                    }
                });
            })
        );

        this.subscriptions.push(
            this.route.queryParams.subscribe(() => {
                this.getInitialWorkspaces();
            })
        );

        this.checkAdminValidation();
    }

    checkAdminValidation() {
        this.actionBarActions = [
            {
                actionKey: 'buttons.createWorkspace',
                actionFunction: this.onWorkspaceCreate.bind(this)
            }
        ];

        this.workspaceMenuActions = [
            {
                actionKey: 'buttons.delete',
                actionFunction: this.onWorkspaceDelete.bind(this)
            }
        ];
    }

    getInitialWorkspaces() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.workspace.initialAmount);
    }

    onLoadMore() {
        this.loadMore(
            this.workspaceList.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination.workspace.loadMore,
            true
        );
    }

    getQueryParams() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().workspace.select.overview
        };

        if (this.route.snapshot.queryParams.recentlyUsed) {
            queryParams['order'] = '-updatedAt';
        } else {
            queryParams['order'] = 'name';
        }

        return queryParams;
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        const queryParams = this.getQueryParams();

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        this.isLoading = true;
        this.workspaceService.loadWorkspaces(queryParams, loadMore).subscribe();
    }

    trackingFunction(index: number, item: Workspace) {
        return item.id;
    }

    onWorkspaceClick(workspaceId: string) {
        this.router.navigate(['workspace', workspaceId]);
    }

    onWorkspaceCreate() {
        const dialogRef = this.dialog.open(WorkspaceCreateDialogComponent, { width: '400px' });

        dialogRef.afterClosed().subscribe((workspace: Workspace) => {
            if (workspace) {
                this.workspaceService.createWorkspace(workspace).subscribe(
                    () => {},
                    (error) => {
                        this.dialog.open(ErrorDialogComponent, {
                            width: '400px',
                            data: {
                                headerKey: 'dialog.errors.title',
                                contentKey: 'dialog.errors.content.workspaceCreationError',
                                confirmKey: 'dialog.errors.confirm'
                            }
                        });
                    }
                );
            }
        });
    }

    onWorkspaceUpdate(workspaceId, newWorkspaceName) {
        const workspace = this.workspaceList.entities.find((w) => w.id === workspaceId);
        if (workspace.name !== newWorkspaceName) {
            workspace.name = newWorkspaceName;
            const updatedWorkspace = {
                name: newWorkspaceName
            };

            this.workspaceService
                .patchWorkspace(workspaceId, updatedWorkspace)
                .pipe(
                    catchError(() => {
                        this.dialog.open(ErrorDialogComponent, {
                            width: '400px',
                            data: {
                                headerKey: 'dialog.errors.title',
                                contentKey: 'dialog.errors.content.workspaceNotFound',
                                confirmKey: 'dialog.errors.confirm'
                            }
                        });
                        return EMPTY;
                    })
                )
                .subscribe();
        }
    }

    onWorkspaceDelete(workspaceId: string) {
        const selectedWorkspace = this.workspaceList.entities.find((workspace) => workspace.id === workspaceId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.workspaceDeletion',
                contentParams: { objectName: selectedWorkspace.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.workspaceService.deleteWorkspace(workspaceId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.workspaceDeleted', { objectName: selectedWorkspace.name });
                    },
                    (error) => {
                        this.dialog.open(ErrorDialogComponent, {
                            width: '400px',
                            data: {
                                headerKey: 'dialog.errors.title',
                                contentKey: 'dialog.errors.content.workspaceDeletionError',
                                confirmKey: 'dialog.errors.confirm'
                            }
                        });
                    }
                );
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
