import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    IQueryParams,
    PhaseService,
    SnackbarService,
    SubmissionService,
    TeamService,
    UserService
} from '../../../core/services';
import { Router } from '@angular/router';
import {
    Activity,
    Format,
    List,
    Phase,
    SelectOption,
    SubmitDialogDataModel,
    Submission,
    Permission,
    Team,
    User
} from '../../../core/models';
import { Observable, of, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SubmitDialogComponent } from '../../../shared/components/submit-dialog/submit-dialog.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { assign } from 'lodash-es';
import { SubmissionModifySetting, SubmissionViewSetting } from '../../../core/enum/global/submission.enum';

@Component({
    selector: 'app-submission-overview',
    templateUrl: './submission-overview.component.html',
    styleUrls: ['./submission-overview.component.scss']
})
export class SubmissionOverviewComponent implements OnDestroy, OnInit {
    currentFormat: Format;
    currentPhase: Phase;
    currentActivity: Activity;
    submissionList: List<Submission>;
    teamList: List<Team>;
    teamSubmissions: boolean;
    viewOthers: boolean;
    isOrganizer: boolean;
    mySubmitterIds: string[] = [];
    columnsToDisplay: string[];
    paginatorSizeOptions: number[];
    initialPaginatorSize: number;
    isLoadingContent = false;

    subscriptions: Subscription[] = [];

    constructor(
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private submissionService: SubmissionService,
        private teamService: TeamService,
        private router: Router,
        private dialog: MatDialog,
        private userService: UserService,
        private translate: TranslateService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit() {
        const configuration = ConfigurationService.getConfiguration().configuration.tableConfigs.activitySubmissions;

        this.columnsToDisplay = configuration.columns;
        this.initialPaginatorSize = configuration.defaultPaginationSize;
        this.paginatorSizeOptions = configuration.availablePaginationSizes;

        this.currentFormat = this.formatService.getCurrentFormat();
        this.currentPhase = this.phaseService.getCurrentPhase();
        this.currentActivity = this.activityService.getCurrentActivity();

        this.subscriptions.push(
            this.formatService.formatChanged.subscribe((format: Format) => {
                this.currentFormat = format;
            })
        );

        this.subscriptions.push(
            this.teamService.teamListChanged.subscribe((teamList: List<Team>) => {
                this.teamList = teamList;
            })
        );

        this.teamSubmissions = this.currentActivity.configuration.submissionModifySetting === SubmissionModifySetting.TEAM;
        this.viewOthers = this.currentActivity.configuration.submissionViewSetting === SubmissionViewSetting.MEMBER;
        this.isOrganizer = this.formatService.hasPermission(Permission.UPDATE_FORMAT);

        if (!this.isOrganizer) {
            this.setMySubmitterIds();
        }

        this.subscriptions.push(
            this.submissionService.submissionListChanged.subscribe((submissionList: List<Submission>) => {
                this.submissionList = submissionList;
                this.isLoadingContent = false;
            })
        );

        this.loadSubmissionData(0, this.initialPaginatorSize);
    }

    private setMySubmitterIds() {
        const user = this.userService.getCurrentLoggedInUser();
        if (this.teamSubmissions) {
            this.teamService.loadTeams(this.currentFormat.id).subscribe(() => {
                this.mySubmitterIds = this.teamList.entities
                    .filter((team: Team) => team.members.find((member) => member.id === user.id))
                    .map((team: Team) => team.id);
            });
        } else {
            this.mySubmitterIds = [user.id];
        }
    }

    loadSubmissionData(skipAmount: number, takeAmount: number) {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().submission.select.overview,
            order: 'createdAt',
            skip: skipAmount,
            take: takeAmount
        };

        this.isLoadingContent = true;

        this.submissionService
            .loadSubmissionsOfActivity(this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, queryParams)
            .subscribe(() => {
                this.activityService.onSubmissionsLoaded(this.currentActivity.id, this.submissionList.count);
                this.submissionList.entities.forEach((submission) => {
                    const user = submission.submittedBy.user;
                    const team = submission.submittedBy.team;
                    if (user && user.avatar && user.avatar.id) {
                        this.userService.loadAvatarMeta(user.id).subscribe((avatar) => assign(user.avatar, avatar));
                    }
                    if (team && team.avatar && team.avatar.id) {
                        this.teamService.loadTeamAvatarMeta(team.id).subscribe((avatar) => assign(team.avatar, avatar));
                    }
                });
            });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    navigateToSubmission(submissionId: string) {
        this.router.navigate([
            'format',
            this.currentFormat.id,
            'phase',
            this.currentPhase.id,
            'activity',
            this.currentActivity.id,
            'submission',
            submissionId
        ]);
    }

    onSubmissionCreate() {
        const user = this.userService.getCurrentLoggedInUser();
        const data: SubmitDialogDataModel = {
            headerKey: 'dialog.submit.header',
            contentKey: '',
            cancelKey: 'buttons.cancel',
            submitKey: 'buttons.submit'
        };

        let observable: Observable<void> = this.teamSubmissions ? this.teamService.loadTeams(this.currentFormat.id) : of<void>(null);
        if (this.isOrganizer && !this.teamSubmissions) {
            observable = this.formatService.loadFormatMembers();
        }

        observable.subscribe(() => {
            const members: User[] = !this.teamSubmissions && this.isOrganizer ? this.currentFormat.members.entities : [user];
            // TODO make a query to the server with the filtering in members pending false JOOLIA 519
            data.members = members
                .filter((m) => !m.pending)
                .map(
                    (m) =>
                        <SelectOption>{
                            value: m,
                            display: m.name
                        }
                );

            if (this.teamSubmissions) {
                const teams: Team[] = this.isOrganizer
                    ? this.teamList.entities
                    : this.teamList.entities.filter((team: Team) => team.members.find((member) => member.id === user.id));
                data.teams = teams.map(
                    (t) =>
                        <SelectOption>{
                            value: t,
                            display: t.name
                        }
                );
            }

            const memberKey = this.isOrganizer && members.length > 1 ? 'dialog.submit.content.organizer' : 'dialog.submit.content.member';
            data.contentKey = this.teamSubmissions ? 'dialog.submit.content.team' : memberKey;

            const dialogRef = this.dialog.open(SubmitDialogComponent, {
                disableClose: true,
                width: '376px',
                data
            });

            dialogRef.afterClosed().subscribe((submission: Submission) => {
                if (submission) {
                    this.activityService.onSubmissionCreated(this.currentActivity.id);
                    this.navigateToSubmission(submission.id);
                }
            });
        });
    }

    onSubmissionDelete(submissionId: string) {
        const submission = this.submissionList.entities.find((s) => s.id === submissionId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.submissionDeletion',
                contentParams: { objectName: submission.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.submissionService
                    .deleteSubmission(this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, submissionId)
                    .subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.submissionDeleted', { objectName: submission.name });
                            this.activityService.onSubmissionDeleted(this.currentActivity.id);
                        },
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.submissionDeletionError');
                        }
                    );
            }
        });
    }

    onPaginationChange(event: PageEvent) {
        const contentOffset = event.pageIndex * event.pageSize;

        this.loadSubmissionData(contentOffset, event.pageSize);
    }
}
