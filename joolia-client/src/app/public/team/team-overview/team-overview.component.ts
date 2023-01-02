import { Component, OnDestroy, OnInit } from '@angular/core';
import { Action, Format, List, Team, UserRole } from '../../../core/models';
import { ConfigurationService, FormatService, IQueryParams, SnackbarService, TeamService, UserService } from '../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { TeamCreateDialogComponent } from '../../../shared/components/team-create-dialog/team-create-dialog.component';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { assign } from 'lodash-es';
import { Router } from '@angular/router';

@Component({
    selector: 'app-team-overview',
    templateUrl: './team-overview.component.html',
    styleUrls: ['./team-overview.component.scss']
})
export class TeamOverviewComponent implements OnDestroy, OnInit {
    actionBarActions: Action[] = [];
    teamMenuActions: { team: Team; actions: Action[] }[] = [];

    format: Format;
    teamList: List<Team>;
    isOrganizer: boolean;
    isEditAllowed = false;
    isLoading = false;
    noMoreLoadable = false;
    subscriptions: Subscription[] = [];
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;

    constructor(
        private formatService: FormatService,
        private teamService: TeamService,
        private dialog: MatDialog,
        private translate: TranslateService,
        private snackbarService: SnackbarService,
        private userService: UserService,
        private router: Router
    ) {}

    ngOnInit() {
        this.format = this.formatService.getCurrentFormat();
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;
        this.isOrganizer = this.isUserOrganizer();
        this.isEditAllowed = this.isEditTeamAllowed();

        this.subscriptions.push(
            this.formatService.formatChanged.subscribe((format) => {
                this.format = format;
                this.isOrganizer = this.isUserOrganizer();
                this.isEditAllowed = this.isEditTeamAllowed();
                this.initAction();
            })
        );

        this.subscriptions.push(
            this.teamService.teamListChanged.subscribe((teamList) => {
                this.teamList = teamList;
                this.noMoreLoadable = this.teamList.entities.length >= this.teamList.count;
                this.isLoading = false;
                this.initAction();
                this.loadAvatars();
            })
        );

        this.getInitialTeams();
    }

    initAction() {
        this.actionBarActions = this.isAddTeamAllowed()
            ? [
                  {
                      actionKey: 'buttons.addTeam',
                      actionFunction: this.onAddTeam.bind(this)
                  }
              ]
            : [];

        this.loadTeamMenuActions();
    }

    isUserOrganizer() {
        return this.format.me.userRole === UserRole.ORGANIZER;
    }

    isDeleteAllowed(team: Team): boolean {
        return this.format && this.format.me && (this.isOrganizer || this.userService.isCreatorOf(team));
    }

    isAddTeamAllowed(): boolean {
        return this.format && this.format.me && (this.isOrganizer || this.format.me.userRole === UserRole.PARTICIPANT);
    }

    isEditTeamAllowed(): boolean {
        return this.format && this.format.me && (this.isOrganizer || this.format.me.userRole === UserRole.PARTICIPANT);
    }

    getInitialTeams() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.team.initialAmount);
    }

    onLoadMore() {
        this.loadMore(this.teamList.entities.length, ConfigurationService.getConfiguration().configuration.pagination.team.loadMore, true);
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().team.select.overview,
            order: 'name'
        };

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        this.isLoading = true;
        this.teamService.loadTeams(this.formatService.getCurrentFormat().id, queryParams, loadMore).subscribe();
    }

    loadTeamMenuActions() {
        if (this.format && this.teamList) {
            this.teamMenuActions = [];
            this.teamList.entities.forEach((t) => {
                this.teamMenuActions.push({
                    team: t,
                    actions: this.isDeleteAllowed(t)
                        ? [
                              {
                                  actionKey: 'buttons.deleteTeam',
                                  actionFunction: this.onDeleteTeam.bind(this)
                              }
                          ]
                        : []
                });
            });
        }
    }

    getTeamMenuActions(team: Team) {
        return this.teamMenuActions.find((t) => t.team === team).actions;
    }

    loadAvatars() {
        this.teamList.entities.forEach((team) => {
            team.members.forEach((member) => {
                if (member.avatar && member.avatar.id && !member.avatar.fileUrl) {
                    this.userService.loadAvatarMeta(member.id).subscribe((avatar) => assign(member.avatar, avatar));
                }
            });

            if (team.avatar) {
                this.teamService.loadTeamAvatarMeta(team.id).subscribe((avatar) => assign(team.avatar, avatar));
            }
        });
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    onTeamClick(teamId: string) {
        this.router.navigate(['format', this.format.id, 'teams', teamId]);
    }

    onAddTeam() {
        const dialogRef = this.dialog.open(TeamCreateDialogComponent, {
            width: '400px'
        });

        dialogRef.afterClosed().subscribe((team: Partial<Team>) => {
            if (team) {
                this.teamService.createTeam(this.format.id, team).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.teamCreated');
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.duplicateTeamName');
                    }
                );
            }
        });
    }

    onDeleteTeam(teamId: string) {
        const team = this.teamList.entities.find((t) => t.id === teamId);

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.teamDeletion',
                contentParams: { objectName: team.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.teamService.deleteTeam(this.format.id, team.id).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.teamDeleted', { objectName: team.name });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.teamDeletionError');
                    }
                );
            }
        });
    }
}
