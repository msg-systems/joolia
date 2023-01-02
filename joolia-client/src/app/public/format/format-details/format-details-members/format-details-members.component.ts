import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { assign } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { UserStatusFilter } from '../../../../core/enum/global/filter.enum';
import { ViewType } from '../../../../core/enum/global/view-type.enum';
import {
    Action,
    FilterToggleGroupItem,
    Format,
    InvitationData,
    List,
    MailData,
    MultiSelectOptionData,
    Permission,
    SelectOption,
    Team,
    User,
    UserRole
} from '../../../../core/models';
import {
    ConfigurationService,
    FormatService,
    IQueryParams,
    SnackbarService,
    TeamService,
    UserService,
    UtilService,
    ViewTypeService
} from '../../../../core/services';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { InvitationDialogComponent } from '../../../../shared/components/invitation-dialog/invitation-dialog.component';
import { SelectionDialogComponent } from '../../../../shared/components/selection-dialog/selection-dialog.component';
import { SendMailDialogComponent } from '../../../../shared/components/send-mail-dialog/send-mail-dialog.component';

@Component({
    selector: 'app-format-details-members',
    templateUrl: './format-details-members.component.html',
    styleUrls: ['./format-details-members.component.scss']
})
export class FormatDetailsMembersComponent implements OnInit, OnDestroy {
    private actionBarActions: Action[] = [];
    private memberMenuActions: Action[] = [];
    private availableTeams: List<Team> = { count: 0, entities: [] };
    private participantKey = {
        actionKey: 'buttons.changeRoleToOrganizer',
        actionFunction: this.onChangeRole.bind(this)
    };
    private organizerKey = {
        actionKey: 'buttons.changeRoleToParticipant',
        actionFunction: this.onChangeRole.bind(this)
    };

    format: Format;
    private subscriptions: Subscription[] = [];
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    userStatusFilter: FilterToggleGroupItem[] = [];
    userRoleFilter: FilterToggleGroupItem[] = [];
    selectedFilters: string[][];
    memberViewType: ViewType;
    selectedMemberIds: string[] = [];

    contactSelectedChanged = new Subject<{ actionKey: string; disabled: boolean }>();

    constructor(
        private formatService: FormatService,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private userService: UserService,
        private teamService: TeamService,
        private viewTypeService: ViewTypeService,
        private router: Router,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;
        this.format = this.formatService.getCurrentFormat();
        this.memberViewType = this.viewTypeService.getMemberViewType();

        this.subscriptions.push(
            this.formatService.formatChanged.subscribe((format: Format) => {
                this.format = format;
                this.noMoreLoadable = this.format.members.entities.length >= this.format.members.count;
                this.isLoading = false;
                this.initActionBar();
                this.initMemberMenus();
            })
        );

        this.subscriptions.push(
            this.teamService.teamListChanged.subscribe((teams) => {
                this.format.teamCount = teams.count;
            })
        );

        this.subscriptions.push(
            this.viewTypeService.memberViewTypeChanged.subscribe((memberViewType: ViewType) => {
                this.memberViewType = memberViewType;
            })
        );

        if (this.formatService.hasPermission(Permission.ADD_TEAMMEMBER)) {
            this.teamService.loadTeams(this.format.id).subscribe();
        }

        if (this.format) {
            this.getInitialFormatMembers();
        }

        this.userStatusFilter = ConfigurationService.getFilters().formatMember.userStatus;
        this.userRoleFilter = ConfigurationService.getFilters().formatMember.userRole;
    }

    initActionBar() {
        this.actionBarActions = this.formatService.hasPermission(Permission.ADD_MEMBER)
            ? [
                  {
                      actionKey: 'buttons.sendMailToSelected',
                      actionFunction: this.onSendMailToSelectedMembers.bind(this),
                      disabled: true
                  },
                  {
                      actionKey: 'buttons.sendMailToAll',
                      actionFunction: this.onSendMailToAll.bind(this)
                  },
                  {
                      actionKey: 'buttons.addMembers',
                      actionFunction: this.onAddMembers.bind(this)
                  }
              ]
            : [];
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    initMemberMenus() {
        if (
            this.format.members.count > 1 &&
            (this.formatService.hasPermission(Permission.DELETE_MEMBER) ||
                this.formatService.hasPermission(Permission.UPDATE_MEMBER) ||
                (this.formatService.hasPermission(Permission.ADD_TEAMMEMBER) && this.format.teamCount))
        ) {
            this.memberMenuActions = [<Action>{}];
        } else {
            this.memberMenuActions = [];
        }
    }

    onMenuOpenClick(id: string) {
        const member = this.format.members.entities.find((m) => m.id === id);
        if (!member) {
            return;
        }
        // initialize with 3 dummy actions to ensure that menu trigger is shown and that there is enough room to render final actions
        this.memberMenuActions = [<Action>{}, <Action>{}, <Action>{}, <Action>{}];
        const loadTeams = new Subject<void>();
        loadTeams.subscribe(() => {
            if (!member.pending && this.format.me.userRole === UserRole.ORGANIZER && this.userService.getCurrentLoggedInUser().id !== id) {
                this.memberMenuActions.push({
                    actionKey: 'buttons.sendMail',
                    actionFunction: this.onSendMailToMember.bind(this)
                });
            }

            if (this.format.members.count > 1 && this.formatService.hasPermission(Permission.DELETE_MEMBER)) {
                this.memberMenuActions.push({
                    actionKey: 'buttons.removeFormatMember',
                    actionFunction: this.onRemoveMember.bind(this)
                });
            }

            if (this.format.members.count > 1 && !member.pending && this.formatService.hasPermission(Permission.UPDATE_MEMBER)) {
                if (member.role === UserRole.ORGANIZER) {
                    this.memberMenuActions.push(this.organizerKey);
                } else {
                    this.memberMenuActions.push(this.participantKey);
                }
            }
            if (this.memberMenuActions.length === 4) {
                // add "no actions" text to ensure that menu trigger does not disappear
                this.memberMenuActions.push({
                    actionKey: 'buttons.noActions',
                    emptyAction: true
                });
            }
            this.memberMenuActions = this.memberMenuActions.slice(4);
        });

        if (this.formatService.hasPermission(Permission.ADD_TEAMMEMBER) && this.format.teamCount) {
            this.teamService.getPossibleTeamsToAddTo(this.format.id, member.id).subscribe((teams) => {
                if (teams.count > 0) {
                    this.memberMenuActions.push({
                        actionKey: 'buttons.addFormatMemberToTeam',
                        actionFunction: this.onAddMemberToTeam.bind(this)
                    });
                    this.availableTeams = teams;
                }
                loadTeams.next();
                loadTeams.complete();
            });
        } else {
            loadTeams.next();
            loadTeams.complete();
        }
    }

    onMemberClick(id: string) {
        const member = this.format.members.entities.find((m) => m.id === id);
        if (!member) {
            return;
        }
        this.router.navigate(['format', this.format.id, 'members', member.id]);
    }

    onCheckboxClick(event: { id: string; checked: boolean }) {
        const index = this.selectedMemberIds.indexOf(event.id);
        if (index >= 0 && !event.checked) {
            this.selectedMemberIds.splice(index, 1);
            if (this.selectedMemberIds.length === 0) {
                this.contactSelectedChanged.next({ actionKey: 'buttons.sendMailToSelected', disabled: true });
            }
        } else if (index === -1 && event.checked) {
            this.selectedMemberIds.push(event.id);
            if (this.selectedMemberIds.length === 1) {
                this.contactSelectedChanged.next({ actionKey: 'buttons.sendMailToSelected', disabled: false });
            }
        }
    }

    trackingFunction(_index: number, item: User) {
        return item.id;
    }

    getInitialFormatMembers() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.member.initialAmount);
    }

    onLoadMore() {
        this.loadMore(
            this.format.members.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination.member.loadMore,
            true
        );
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().format.select.members,
            order: 'name'
        };

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        if (this.selectedFilters && this.selectedFilters.some((filter) => filter.length > 0)) {
            queryParams = UtilService.addFilterToQueryParams(queryParams, this.getFilterObject(this.selectedFilters));
        }

        this.isLoading = true;

        this.formatService.loadFormatMembers(queryParams, loadMore).subscribe(() => this.loadAvatars());
    }

    onFilterChange(selectedCriteria: string[][]) {
        this.selectedMemberIds = [];
        this.selectedFilters = selectedCriteria;
        this.getInitialFormatMembers();
    }

    getFilterObject(filter: string[][]) {
        const filterObject: any = {};

        if (filter[0].length === 1) {
            filterObject.pending = filter[0][0] === UserStatusFilter.PENDING;
        }
        if (filter[1].length === 1) {
            filterObject.role = filter[1][0];
        }

        return filterObject;
    }

    loadAvatars() {
        this.format.members.entities.forEach((member) => {
            if (member.avatar && member.avatar.id && !member.avatar.fileUrl) {
                this.userService.loadAvatarMeta(member.id).subscribe((avatar) => assign(member.avatar, avatar));
            }
        });
    }

    onSendMailToAll() {
        this.sendMail('dialog.sendMailTo.sendToAll');
    }

    onSendMailToMember(memberId: string) {
        const member = this.format.members.entities.find((m: User) => m.id === memberId);
        const receiver = member.name ? member.name : member.email;
        this.sendMail('dialog.sendMailTo.sendTo', receiver, [memberId]);
    }

    onSendMailToSelectedMembers() {
        if (this.selectedMemberIds.length > 0) {
            let receiver = '';
            let count = 1;
            const numberOfDisplayedReceivers = this.selectedMemberIds.length < 3 ? this.selectedMemberIds.length : 3;

            for (const memberId of this.selectedMemberIds) {
                const member = this.format.members.entities.find((m: User) => m.id === memberId);
                receiver = receiver.concat(member.name ? member.name : member.email);
                if (count < numberOfDisplayedReceivers) {
                    receiver = receiver.concat(', ');
                }
                if (count === numberOfDisplayedReceivers) {
                    break;
                }
                count++;
            }

            const remaining = this.selectedMemberIds.length - count;
            if (remaining === 1) {
                const member = this.format.members.entities.find(
                    (m: User) => m.id === this.selectedMemberIds[this.selectedMemberIds.length - 1]
                );
                receiver = receiver.concat(
                    ` ${this.translate.instant('dialog.sendMailTo.conjunction')} ${member.name ? member.name : member.email}`
                );
            } else if (remaining > 1) {
                receiver = receiver.concat(` ${this.translate.instant('dialog.sendMailTo.others', { number: remaining })}`);
            }

            this.sendMail('dialog.sendMailTo.sendTo', receiver, this.selectedMemberIds);
        }
    }

    private sendMail(receiverText: string, receiver?: string, memberIds?: string[]) {
        const dialogRef = this.dialog.open(SendMailDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.sendMailTo.header',
                contentKey: 'dialog.sendMailTo.content',
                contentParams: {
                    contentKey: receiverText,
                    mailReceiver: receiver
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: MailData) => {
            if (result) {
                if (memberIds) {
                    this.snackbarService.openWithMessage('snackbar.emailsAreProcessed', { plural: 1 });
                    this.formatService.sendMail(result.mailMessage, this.format.id, memberIds).subscribe(
                        () => {},
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.connectionError');
                        }
                    );
                } else {
                    this.snackbarService.openWithMessage('snackbar.emailsAreProcessed', { plural: this.format.members.count });
                    this.formatService.sendMail(result.mailMessage, this.format.id).subscribe(
                        () => {},
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.connectionError');
                        }
                    );
                }
            }
        });
    }

    onAddMembers() {
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

        dialogRef.afterClosed().subscribe((result: InvitationData) => {
            if (result) {
                this.snackbarService.openWithMessage('snackbar.mailsAreProcessedMessage');
                this.formatService.addFormatMember(this.format.id, result.emails, result.invitationText).subscribe();
            }
        });
    }

    onAddMemberToTeam(memberId: string) {
        const selectableTeams: SelectOption[] = [];
        for (const team of this.availableTeams.entities) {
            selectableTeams.push({
                display: team.name,
                value: team
            });
        }
        const teamSelectionDetail: MultiSelectOptionData = {
            entityName: 'team',
            selectOptions: selectableTeams,
            required: true
        };

        const dialogRef = this.dialog.open(SelectionDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.addMemberToTeam.header',
                contentKey: 'dialog.addMemberToTeam.content',
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.addTeamMember',
                selectionDetails: [teamSelectionDetail]
            }
        });

        dialogRef.afterClosed().subscribe(
            (team) => {
                if (!team) {
                    return;
                }
                const memberToAdd = this.format.members.entities.find((member: User) => member.id === memberId);
                if (memberToAdd) {
                    this.teamService.addTeamMembers(this.format.id, team['team'].id, [memberToAdd]).subscribe(() => {
                        this.snackbarService.openWithMessage('snackbar.formatMemberAdded');
                        memberToAdd.teamCount++;
                    });
                }
            },
            (err) => {
                this.snackbarService.openWithMessage('snackbar.formatMemberAddError');
            }
        );
    }

    onRemoveMember(memberId: string) {
        if (this.format.members.entities.length === 1) {
            this.snackbarService.openWithMessage('snackbar.removeLastFormatMemberError');
        } else {
            const removedMember: User = this.format.members.entities.find((member: User) => member.id === memberId);
            const removedMemberName = removedMember.name ? removedMember.name : removedMember.email;
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '400px',
                data: {
                    headerKey: 'dialog.delete.header',
                    contentKey: 'dialog.delete.formatMemberDeletion',
                    contentParams: { objectName: removedMemberName },
                    cancelKey: 'buttons.cancel',
                    confirmKey: 'buttons.delete'
                }
            });

            dialogRef.afterClosed().subscribe((confirmation: boolean) => {
                if (confirmation) {
                    this.formatService.removeFormatMember(this.format.id, removedMember.email).subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.formatMemberDeleted', {
                                objectName: removedMemberName,
                                parentName: this.format.name
                            });
                        },
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.formatMemberDeletionError');
                        }
                    );
                }
            });
        }
    }

    onChangeRole(memberId: string) {
        const userRole = this.format.members.entities.find((member: User) => member.id === memberId).role;
        const organizers: User[] = this.format.members.entities.filter((member: User) => member.role === UserRole.ORGANIZER);

        if (userRole === UserRole.ORGANIZER) {
            // prevent last organizer from demoting himself to participant
            if (organizers.length < 2) {
                this.snackbarService.openWithMessage('snackbar.demoteLastOrganizerError');
            } else if (this.userService.getCurrentLoggedInUser().id === memberId) {
                // ask organizer for confirmation before demoting himself to participant
                const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                    width: '400px',
                    data: {
                        headerKey: 'dialog.changeRole.header',
                        contentKey: 'dialog.changeRole.content',
                        cancelKey: 'buttons.cancel',
                        confirmKey: 'buttons.confirm'
                    }
                });
                dialogRef.afterClosed().subscribe((confirmation: boolean) => {
                    if (confirmation) {
                        this.formatService.updateFormatMemberRole(memberId, UserRole.PARTICIPANT).subscribe();
                    }
                });
            } else {
                this.formatService.updateFormatMemberRole(memberId, UserRole.PARTICIPANT).subscribe();
            }
        } else if (userRole === UserRole.PARTICIPANT) {
            this.formatService.updateFormatMemberRole(memberId, UserRole.ORGANIZER).subscribe();
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
