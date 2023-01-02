import { Component, OnDestroy, OnInit } from '@angular/core';
import { Action, FilterToggleGroupItem, InvitationData, Library } from '../../../../core/models';
import { InvitationDialogComponent } from '../../../../shared/components/invitation-dialog/invitation-dialog.component';
import { Subscription } from 'rxjs';
import {
    ConfigurationService,
    IQueryParams,
    LibraryService,
    SnackbarService,
    UserService,
    UtilService,
    ViewTypeService
} from '../../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { assign } from 'lodash-es';
import { ViewType } from '../../../../core/enum/global/view-type.enum';
import { UserStatusFilter } from '../../../../core/enum/global/filter.enum';

/**
 * The LibraryMembersComponent displays all members of a selected library.
 */
@Component({
    selector: 'app-library-members',
    templateUrl: './library-members.component.html',
    styleUrls: ['./library-members.component.scss']
})
export class LibraryMembersComponent implements OnDestroy, OnInit {
    public library: Library;
    memberViewType: ViewType;
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    userStatusFilter: FilterToggleGroupItem[] = [];
    selectedFilters: string[];
    private subscriptions: Subscription[] = [];
    private memberMenuActions: Action[] = [];
    private deleteMemberAction = {
        actionKey: 'buttons.removeLibraryMember',
        actionFunction: this.onRemoveMember.bind(this)
    };
    private actionBarActions: Action[] = [
        {
            actionKey: 'buttons.addMember',
            actionFunction: this.onAddMember.bind(this)
        }
    ];

    constructor(
        private libraryService: LibraryService,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private translate: TranslateService,
        private userService: UserService,
        private viewTypeService: ViewTypeService
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

        this.library = this.libraryService.getCurrentLibrary();

        this.subscriptions.push(
            this.libraryService.libraryChanged.subscribe((library: Library) => {
                this.library = library;
                if (this.library.members) {
                    this.noMoreLoadable = this.library.members.entities.length >= this.library.members.count;
                    this.initMemberMenuActions();
                }
                this.isLoading = false;
            })
        );

        if (this.library) {
            this.getInitialLibraryMembers();
        }

        this.userStatusFilter = ConfigurationService.getFilters().libraryMember.userStatus;
    }

    initMemberMenuActions() {
        this.memberMenuActions = this.library.members.count > 1 ? [this.deleteMemberAction] : [];
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
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
                this.libraryService.addLibraryMembers(this.library.id, data).subscribe();
            }
        });
    }

    onRemoveMember(memberId: string) {
        if (this.library.members.entities.length === 1) {
            this.snackbarService.openWithMessage('snackbar.removeLastLibraryMemberError');
        } else {
            const deletedUser = this.library.members.entities.find((member) => member.id === memberId);
            const deletedUserName = deletedUser.name ? deletedUser.name : deletedUser.email;
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '400px',
                data: {
                    headerKey: 'dialog.delete.header',
                    contentKey: 'dialog.delete.libraryMemberDeletion',
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

                    this.libraryService.removeLibraryMember(this.library.id, deletionBody).subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.libraryMemberDeleted', {
                                objectName: deletedUserName,
                                parentName: this.library.name
                            });
                        },
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.libraryMemberDeletionError');
                        }
                    );
                }
            });
        }
    }

    getInitialLibraryMembers() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.member.initialAmount);
    }

    onLoadMore() {
        this.loadMore(
            this.library.members.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination.member.loadMore,
            true
        );
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().library.select.members,
            order: 'name'
        };

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        if (this.selectedFilters && this.selectedFilters.length === 1) {
            queryParams = UtilService.addFilterToQueryParams(queryParams, this.getFilterObject(this.selectedFilters));
        }

        this.isLoading = true;
        this.libraryService.loadLibraryMembers(this.library.id, queryParams, loadMore).subscribe(() => {
            this.library.members.entities.forEach((member) => {
                if (member.avatar && member.avatar.id) {
                    this.userService.loadAvatarMeta(member.id).subscribe((avatar) => assign(member.avatar, avatar));
                }
            });
        });
    }

    onFilterChange(selectedCriteria: string[][]) {
        this.selectedFilters = selectedCriteria[0];
        this.getInitialLibraryMembers();
    }

    getFilterObject(filter: string[]) {
        let filterObject = {};

        if (filter.length === 1) {
            filterObject = {
                pending: filter[0] === UserStatusFilter.PENDING
            };
        }

        return filterObject;
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
