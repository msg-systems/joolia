import { Component, OnDestroy, OnInit } from '@angular/core';
import { Action, FilterToggleGroupItem, InvitationData, User, UserRole, Workspace } from '../../../../core/models';
import {
    ConfigurationService,
    IQueryParams,
    SnackbarService,
    UserService,
    UtilService,
    ViewTypeService,
    WorkspaceService
} from '../../../../core/services';
import { Subscription } from 'rxjs';
import { InvitationDialogComponent } from '../../../../shared/components/invitation-dialog/invitation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { assign } from 'lodash-es';
import { UserRoleFilter, UserStatusFilter } from '../../../../core/enum/global/filter.enum';
import { ViewType } from '../../../../core/enum/global/view-type.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-workspace-details-members',
    templateUrl: './workspace-details-members.component.html',
    styleUrls: ['./workspace-details-members.component.scss']
})
export class WorkspaceDetailsMembersComponent implements OnInit, OnDestroy {
    private actionBarActions: Action[] = [];
    private memberMenuActions: Action[] = [];

    public workspace: Workspace;
    private subscriptions: Subscription[] = [];
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    userStatusFilter: FilterToggleGroupItem[] = [];
    userRoleFilter: FilterToggleGroupItem[] = [];
    initialFilters: Array<string[]>;
    selectedFilters: string[][];
    memberViewType: ViewType;
    isWorkspaceAdmin = false;

    constructor(
        private workspaceService: WorkspaceService,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private userService: UserService,
        private viewTypeService: ViewTypeService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.subscriptions.push(
            this.viewTypeService.memberViewTypeChanged.subscribe((memberViewType: ViewType) => {
                this.memberViewType = memberViewType;
            })
        );
        this.memberViewType = this.viewTypeService.getMemberViewType();

        this.workspace = this.workspaceService.getCurrentWorkspace();

        this.initFilterOptions();

        this.subscriptions.push(
            this.workspaceService.workspaceChanged.subscribe((workspace: Workspace) => {
                this.workspace = workspace;
                this.isWorkspaceAdmin = workspace.me.userRole === UserRole.ADMIN;

                if (this.workspace.members) {
                    this.noMoreLoadable = this.workspace.members.entities.length >= this.workspace.members.count;
                }

                this.setActionBarActions();
                this.setMemberMenuActions();

                this.isLoading = false;
            })
        );

        if (this.workspace) {
            this.getInitialWorkspaceMembers();
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    initFilterOptions() {
        this.userStatusFilter = ConfigurationService.getFilters().workspaceMember.userStatus;
        this.userRoleFilter = ConfigurationService.getFilters().workspaceMember.userRole;

        if (this.route.snapshot.queryParams.admin) {
            this.initialFilters = [[], [UserRoleFilter.ADMIN]];
            this.selectedFilters = this.initialFilters;
        }
    }

    trackingFunction(index: number, item: User) {
        return item.id;
    }

    setActionBarActions() {
        this.actionBarActions = this.isWorkspaceAdmin
            ? [
                  {
                      actionKey: 'buttons.addMember',
                      actionFunction: this.onAddMember.bind(this)
                  }
              ]
            : [];
    }

    setMemberMenuActions() {
        this.memberMenuActions =
            this.isWorkspaceAdmin && this.workspace.members.count > 1
                ? [
                      {
                          actionKey: 'buttons.removeWorkspaceMember',
                          actionFunction: this.onRemoveMember.bind(this)
                      }
                  ]
                : [];
    }

    getInitialWorkspaceMembers() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.member.initialAmount);
    }

    onLoadMore() {
        this.loadMore(
            this.workspace.members.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination.member.loadMore,
            true
        );
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().workspace.select.members,
            order: 'name'
        };

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        if (this.selectedFilters && this.selectedFilters.some((filter) => filter.length > 0)) {
            queryParams = UtilService.addFilterToQueryParams(queryParams, this.getFilterObject(this.selectedFilters));
        }

        this.isLoading = true;
        this.workspaceService.loadWorkspaceMembers(this.workspace.id, queryParams, loadMore).subscribe(() => {
            this.workspace.members.entities.forEach((member) => {
                if (member.avatar && member.avatar.id) {
                    this.userService.loadAvatarMeta(member.id).subscribe((avatar) => assign(member.avatar, avatar));
                }
            });
        });
    }

    onFilterChange(selectedCriteria: string[][]) {
        this.selectedFilters = selectedCriteria;
        this.getInitialWorkspaceMembers();
    }

    getFilterObject(filter: string[][]) {
        const filterObject: any = {};

        if (filter[0].length === 1) {
            filterObject.pending = filter[0][0] === UserStatusFilter.PENDING;
        }
        if (filter[1].length === 1) {
            filterObject.admin = filter[1][0] === UserRoleFilter.ADMIN;
        }

        return filterObject;
    }

    onAddMember() {
        const dialogRef = this.dialog.open(InvitationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.invitation.header',
                contentKey: 'dialog.invitation.content',
                contentParams: {
                    maxEmailAddresses: ConfigurationService.getConfiguration().configuration.ranges.mailAddresses.max
                }
            }
        });

        dialogRef.afterClosed().subscribe((data: InvitationData) => {
            if (data && data.emails.length > 0) {
                this.snackbarService.openWithMessage('snackbar.mailsAreProcessedMessage');
                this.workspaceService.addWorkspaceMembers(this.workspace.id, data).subscribe();
            }
        });
    }

    onRemoveMember(memberId: string) {
        if (this.workspace.members.entities.length === 1) {
            this.snackbarService.openWithMessage('snackbar.removeLastWorkspaceMemberError');
        } else {
            const deletedUser = this.workspace.members.entities.find((member) => member.id === memberId);
            const deletedUserName = deletedUser.name ? deletedUser.name : deletedUser.email;
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '400px',
                data: {
                    headerKey: 'dialog.delete.header',
                    contentKey: 'dialog.delete.workspaceMemberDeletion',
                    contentParams: { objectName: deletedUserName },
                    cancelKey: 'buttons.cancel',
                    confirmKey: 'buttons.delete'
                }
            });

            dialogRef.afterClosed().subscribe((confirmation: boolean) => {
                if (confirmation) {
                    const deletionBody = {
                        emails: [deletedUser.email]
                    };

                    this.workspaceService.removeWorkspaceMember(this.workspace.id, deletionBody).subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.workspaceMemberDeleted', {
                                objectName: deletedUserName,
                                parentName: this.workspace.name
                            });
                        },
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.workspaceMemberDeletionError');
                        }
                    );
                }
            });
        }
    }

    onViewTypeChanged(viewType: ViewType) {
        this.viewTypeService.setMemberViewType(viewType);
    }

    isCardViewType(): boolean {
        return this.memberViewType === ViewType.CARD_VIEW;
    }

    isListViewType(): boolean {
        return this.memberViewType === ViewType.LIST_VIEW;
    }
}
