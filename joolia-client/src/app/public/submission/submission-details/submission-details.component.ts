import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { assign, set } from 'lodash-es';
import { Subscription } from 'rxjs';
import { CommentService } from 'src/app/core/services/comment.service';
import { IDownloadOptions } from 'src/app/shared/components/file-list/file-list.component';
import { SubmissionModifySetting } from '../../../core/enum/global/submission.enum';
import {
    Activity,
    Comment,
    FileMeta,
    Format,
    List,
    Permission,
    Phase,
    Rating,
    Submission,
    Team,
    UpdateEventBody,
    UserRole
} from '../../../core/models';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    IQueryParams,
    LoggerService,
    NgxUploadService,
    NotificationService,
    PhaseService,
    RatingService,
    SnackbarService,
    SubmissionService,
    TeamService,
    UserService,
    UtilService
} from '../../../core/services';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DescriptionDialogComponent } from '../../../shared/components/description-dialog/description-dialog.component';
import { EditFileDialogComponent } from '../../../shared/components/edit-file-dialog/edit-file-dialog.component';

@Component({
    selector: 'app-submission-details',
    templateUrl: './submission-details.component.html',
    styleUrls: ['./submission-details.component.scss']
})
export class SubmissionDetailsComponent implements OnDestroy, OnInit {
    currentFormat: Format;
    currentPhase: Phase;
    currentActivity: Activity;
    submission: Submission;
    teamList: List<Team>;
    isEditAllowed = false;
    comments: List<Comment> = { entities: [], count: 0 };
    rating: Rating;
    isRatingEditable = false;

    submissionNameMaxLength: number;
    submissionDescriptionMaxLength: number;

    subscriptions: Subscription[] = [];

    notifSubmissionWSPrefix: string;

    constructor(
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private submissionService: SubmissionService,
        private teamService: TeamService,
        private router: Router,
        private route: ActivatedRoute,
        private userService: UserService,
        private dialog: MatDialog,
        private ngxUS: NgxUploadService,
        private snackbarService: SnackbarService,
        private commentService: CommentService,
        private userRatingService: RatingService,
        private logger: LoggerService,
        private utilService: UtilService,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.submission;

        this.submissionNameMaxLength = characterLimits.name;
        this.submissionDescriptionMaxLength = characterLimits.description;

        this.currentFormat = this.formatService.getCurrentFormat();
        this.currentPhase = this.phaseService.getCurrentPhase();
        this.currentActivity = this.activityService.getCurrentActivity();

        this.subscriptions.push(
            this.teamService.teamListChanged.subscribe((teamList: List<Team>) => {
                this.teamList = teamList;
            })
        );

        this.initNotifications();

        this.subscriptions.push(
            this.submissionService.submissionChanged.subscribe((submission: Submission) => {
                this.initSubmission(submission);
            })
        );

        // Comment subscriptions
        this.subscriptions.push(
            this.commentService.commentListChanged.subscribe((updatedList: List<Comment>) => {
                this.comments = updatedList;
                this.comments.entities.forEach((comment) => {
                    const user = comment.createdBy;
                    // TODO: use optional chaining once we're on typescript 3.7 or later
                    if (user && user.avatar && user.avatar.id && !user.avatar.fileUrl) {
                        this.userService.loadAvatarMeta(user.id).subscribe((avatar) => assign(user.avatar, avatar));
                    }
                });
            })
        );

        // Rating subscriptions
        this.subscriptions.push(
            this.userRatingService.ratingChanged.subscribe((rating: Rating) => {
                this.rating = rating;
            })
        );

        this.subscriptions.push(
            this.notificationService.submissionChangedWS.subscribe((a) => {
                this.logger.debug('[SOCKET] Submission file notification received. Reloading files...');
                this.initSubmissionFiles();
            })
        );

        this.loadSubmission();

        this.isRatingEditable = this.currentFormat.me.userRole !== UserRole.TECHNICAL;
    }

    onSendRating(r: number) {
        this.userRatingService.patchRating(this.submission.id, r).subscribe(
            () => {
                this.submissionService
                    .getAverageRating(this.submission.id)
                    .subscribe((averageRating) => (this.submission.averageRating = averageRating));
            },
            (err) => {
                this.snackbarService.openWithMessage('snackbar.ratingCreationError');
            }
        );
    }

    private initNotifications() {
        this.notifSubmissionWSPrefix = ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.submission;

        const submissionId = this.route.snapshot.params['submissionId'];
        this.notificationService.init().then(() => {
            this.notificationService.joinRoom(`${this.notifSubmissionWSPrefix}${submissionId}`);
        });
    }

    private initSubmission(submission: Submission) {
        this.submission = submission;

        const isTeamSubmission = this.currentActivity.configuration.submissionModifySetting === SubmissionModifySetting.TEAM;
        const user = this.userService.getCurrentLoggedInUser();

        if (this.formatService.hasPermission(Permission.UPDATE_FORMAT)) {
            this.isEditAllowed = true;
        } else if (isTeamSubmission) {
            this.teamService.loadTeams(this.currentFormat.id).subscribe(() => {
                this.isEditAllowed = this.teamList.entities
                    .filter((team: Team) => team.members.find((member) => member.id === user.id))
                    .map((team: Team) => team.id)
                    .includes(submission.submittedBy.team.id);
            });
        } else {
            this.isEditAllowed = submission.submittedBy.user.id === user.id;
        }

        this.initSubmissionFiles();
    }

    private initSubmissionFiles() {
        this.submissionService
            .loadSubmissionFilesMeta(this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, this.submission.id)
            .subscribe((files) => (this.submission.files = files || []));
    }

    ngOnDestroy() {
        const submissionId = this.route.snapshot.params['submissionId'];
        this.notificationService.leaveRoom(`${this.notifSubmissionWSPrefix}${submissionId}`);
        this.notificationService.terminate();
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    onSubmissionUpdate(fieldName: string, updatedValue: any) {
        if (this.submission.hasOwnProperty(fieldName) && this.submission[fieldName] !== updatedValue) {
            const updatedBody = {};
            updatedBody[fieldName] = updatedValue;

            this.submissionService
                .updateSubmission(this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, this.submission.id, updatedBody)
                .subscribe();
        }
    }

    onSubmissionDelete() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.submissionDeletion',
                contentParams: { objectName: this.submission.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.submissionService
                    .deleteSubmission(this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, this.submission.id)
                    .subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.submissionDeleted', { objectName: this.submission.name });
                            this.activityService.onSubmissionDeleted(this.currentActivity.id);
                            this.router.navigate([
                                'format',
                                this.currentFormat.id,
                                'phase',
                                this.currentPhase.id,
                                'activity',
                                this.currentActivity.id,
                                'submission',
                                'overview'
                            ]);
                        },
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.submissionDeletionError');
                        }
                    );
            }
        });
    }

    onFileUpdate(file: FileMeta) {
        const dialogRef = this.dialog.open(EditFileDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.editFile.header',
                fileName: file.name,
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.save'
            }
        });

        dialogRef.afterClosed().subscribe((updatedName: string) => {
            if (updatedName) {
                const body: Partial<FileMeta> = {
                    name: updatedName
                };
                this.submissionService
                    .updateFile(this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, file.id, body)
                    .subscribe(
                        () => {},
                        () => {
                            this.snackbarService.openWithMessage('snackbar.fileUpdateError');
                        }
                    );
            }
        });
    }

    onFileDelete(fileId: string) {
        const selectedFile = this.submission.files.find((file) => file.id === fileId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.fileDeletion',
                contentParams: { objectName: selectedFile.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.submissionService
                    .deleteFile(this.ngxUS, this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, fileId)
                    .subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.fileDeleted', { objectName: selectedFile.name });
                        },
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.fileDeletionError');
                        }
                    );
            }
        });
    }

    onUploadOutput(output) {
        this.submissionService.onUploadOutput(this.ngxUS, this.currentFormat.id, this.currentPhase.id, this.currentActivity.id, output);
    }

    onFileDownloadClicked(options: IDownloadOptions) {
        this.submissionService.getDownloadLink(
            this.currentFormat.id,
            this.currentPhase.id,
            this.currentActivity.id,
            options.fileId,
            options.download
        );
    }

    onInfoClicked() {
        this.dialog.open(DescriptionDialogComponent, {
            width: '536px',
            height: '816px',
            autoFocus: false
        });
    }

    onSendComment(e: Partial<Comment>) {
        this.commentService.postComment(e).subscribe(
            () => {
                return;
            },
            (err) => {
                this.snackbarService.openWithMessage('snackbar.commentCreationError');
            }
        );
    }

    getComments() {
        const queryParams: IQueryParams = { order: '-updatedAt' };

        this.commentService.fetchCommentsOfSubmission(queryParams).subscribe();
    }

    onDeleteComment(e: string) {
        this.commentService.deleteComment(e).subscribe(
            (data) => {
                this.snackbarService.openWithMessage('snackbar.commentDeleted');
            },
            (err) => {
                this.logger.debug(err.error, this, this.onDeleteComment);
                this.snackbarService.openWithMessage('snackbar.commentDeletionError');
            }
        );
    }

    getRating() {
        this.userRatingService.loadRating(this.submission.id).subscribe();
    }

    private loadSubmission() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().submission.select.details
        };

        this.submissionService.loadSubmission(this.route.snapshot.params['submissionId'], queryParams).subscribe(
            (data) => {
                this.getComments();
                this.getRating();
            },
            (err) => {
                const formatId = this.currentFormat.id;
                const phaseId = this.currentPhase.id;
                const activityId = this.currentActivity.id;

                this.utilService.logAndNavigate(
                    err.error,
                    this,
                    this.loadSubmission,
                    'snackbar.submissionNotFound',
                    `format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/overview`
                );
            }
        );
    }
}
