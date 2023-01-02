import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ActivityService,
    AuthenticationService,
    CanvasService,
    ConfigurationService,
    FormatService,
    LoggerService,
    NotificationService,
    TeamService,
    UserService,
    UtilService
} from '../../../core/services';
import {
    Activity,
    Canvas,
    CanvasSubmission,
    Format,
    List,
    SelectOption,
    Slot,
    Team,
    UpdateEventBody,
    UserRole
} from '../../../core/models';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { SubmissionModifySetting, SubmissionSubmitter, SubmissionViewSetting } from '../../../core/enum/global/submission.enum';
import { TranslateService } from '@ngx-translate/core';
import { ICanvasInput } from '../../../shared/components/canvas/base-canvas/base-canvas.component';

@Component({
    selector: 'app-canvas-details',
    templateUrl: './canvas-details.component.html',
    styleUrls: ['./canvas-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CanvasDetailsComponent implements OnInit, OnDestroy {
    canvas: Canvas;
    activity: Activity;
    phaseId: string;
    format: Format;

    canvasInput: ICanvasInput = {
        isCanvasEditable: false,
        isOrganizer: false,
        isSubmissionEditable: false,
        isSubmissionCreatable: false,
        displaySubmitterName: false,
        submissionModifySetting: undefined
    };

    submitterForm: FormGroup;
    submitterSelectOptions: SelectOption[];
    submissions: CanvasSubmission[];
    subscriptions: Subscription[] = [];

    notificationCanvasWSPrefix: string;

    constructor(
        private route: ActivatedRoute,
        private formatService: FormatService,
        private activityService: ActivityService,
        private canvasService: CanvasService,
        private utilService: UtilService,
        private teamService: TeamService,
        private userService: UserService,
        protected authenticationService: AuthenticationService,
        protected logger: LoggerService,
        private notificationService: NotificationService,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.submitterForm = new FormGroup({
            submitter: new FormControl('')
        });

        this.format = this.formatService.getCurrentFormat();
        this.phaseId = this.route.snapshot.params['phaseId'];

        this.canvasInput.isOrganizer = this.canvasInput.isCanvasEditable = this.format.me.userRole === UserRole.ORGANIZER;

        this.addSubscriptions();
        this.initNotifications();

        this.activityService.loadActivity(this.format.id, this.phaseId, this.route.snapshot.params['activityId']).subscribe(
            (activity: Activity) => {
                this.activity = activity;
                this.canvasInput.submissionModifySetting = this.activity.configuration.submissionModifySetting;
                this.loadCanvas(this.route.snapshot.params['canvasId']);
                this.loadSubmitterSelectionList();
            },
            (err) => {
                const goto = `/format/${this.format.id}/phase/${this.phaseId}`;
                this.utilService.logAndNavigate(err.error, this, this.ngOnInit, 'snackbar.activityNotFound', goto);
            }
        );
    }

    initSubmitter() {
        let submitterValue = this.submitterForm.value.submitter;

        this.addAllSubmitterSelection();

        if (!submitterValue && this.submitterSelectOptions.length > 0) {
            submitterValue = this.submitterSelectOptions.find((m) => m.value.id === this.userService.getCurrentLoggedInUser().id);
            submitterValue = !submitterValue ? this.submitterSelectOptions[0].value : submitterValue.value;

            this.submitterForm.setValue({ submitter: submitterValue });
        }
    }

    addAllSubmitterSelection() {
        if (this.activity.configuration.submissionViewSetting !== SubmissionViewSetting.MEMBER && !this.canvasInput.isOrganizer) {
            return;
        }

        const allSubmitterDisplay = this.translateService.instant('labels.allSubmitter');
        this.submitterSelectOptions.unshift({ value: SubmissionSubmitter.ALL, display: allSubmitterDisplay });
    }

    loadSubmissions() {
        // get the name of the submitter for which to load the canvas submissions
        const submitter = this.submitterForm.value.submitter;

        if (!this.submitterForm.value.submitter) {
            return;
        }

        const currentUser = this.userService.getCurrentLoggedInUser();

        // check if the canvas is editable for the current user; one of the following condition has to be fulfilled:
        // 1. the current user is the submitter and this is his canvas
        // 2. the current user is the format organizer
        // 3. the chosen submitter is a team and the current user is part of that team
        this.canvasInput.isSubmissionEditable =
            this.canvasInput.isOrganizer ||
            (this.activity.configuration.submissionModifySetting === SubmissionModifySetting.TEAM &&
                submitter !== SubmissionSubmitter.ALL &&
                (<Team>submitter).members.some((member) => member.id === currentUser.id) &&
                this.format.me.userRole !== UserRole.TECHNICAL) ||
            submitter.id === currentUser.id;

        // if the submitter option is not 'All submissions', the specific submitter id is added to the query params,
        // so that only his canvas submissions are retrieved;
        // for 'All submissions', there are no query params, thus all submissions for that specific canvas are retrieved
        let queryParams = {};
        if (!(submitter === SubmissionSubmitter.ALL)) {
            queryParams = UtilService.addFilterToQueryParams({}, { submittedBy: submitter.id });
        }

        // get the canvas submissions for a specific canvas
        this.canvasService
            .loadSubmissions(this.format.id, this.phaseId, this.activity.id, this.route.snapshot.params['canvasId'], queryParams)
            .subscribe((submissions: List<CanvasSubmission>) => {
                this.submissions = submissions.entities;
            });
    }

    editCanvas(update: UpdateEventBody) {
        if (!update.updatedFieldName) {
            throw new Error('updateFieldName missing');
        }

        const body: any = {
            [update.updatedFieldName]: update.updatedFieldValue
        };

        this.canvasService.updateCanvas(this.format.id, this.phaseId, this.activity.id, this.canvas.id, body).subscribe();
    }

    editCanvasSlot(update: UpdateEventBody) {
        if (!update.updatedObjectId) {
            throw new Error('updatedObjectId missing');
        }

        if (!update.updatedFieldName) {
            throw new Error('updateFieldName missing');
        }

        let body: any;

        if (update.updatedFieldName === 'slot') {
            body = { ...update.updatedFieldValue };
            delete body.id;
        } else {
            body = { [update.updatedFieldName]: update.updatedFieldValue };
        }

        this.canvasService
            .updateSlot(this.format.id, this.phaseId, this.activity.id, this.canvas.id, update.updatedObjectId, body)
            .subscribe();
    }

    addCanvasSubmission(submission: Partial<CanvasSubmission>) {
        const submittedById =
            this.submitterForm.value.submitter === SubmissionSubmitter.ALL
                ? this.userService.getCurrentLoggedInUser().id
                : this.submitterForm.value.submitter.id;

        const body: any = {
            content: submission.content,
            color: submission.color,
            submittedById: submittedById
        };

        submission.voteCount = 0;
        submission.me = { isVotedByMe: false };

        this.canvasService
            .createSubmission(this.format.id, this.phaseId, this.activity.id, this.canvas.id, submission.slotId, body)
            .subscribe((createdSubmission) => {
                this.submissions.push(createdSubmission);
            });
    }

    onVoteSubmissionClicked(submission: CanvasSubmission) {
        if (!submission) {
            throw new Error('likedObject missing');
        }

        if (submission.me.isVotedByMe) {
            --submission.voteCount;
            submission.me.isVotedByMe = false;
            this.subscriptions.push(
                this.canvasService
                    .removeVoteSubmission(this.format.id, this.phaseId, this.activity.id, this.canvas.id, submission.slotId, submission.id)
                    .subscribe()
            );
        } else {
            ++submission.voteCount;
            submission.me.isVotedByMe = true;
            this.subscriptions.push(
                this.canvasService
                    .voteSubmission(this.format.id, this.phaseId, this.activity.id, this.canvas.id, submission.slotId, submission.id)
                    .subscribe()
            );
        }
    }

    editCanvasSubmissionContent(update: UpdateEventBody) {
        const body: any = {
            content: update.updatedFieldValue
        };

        this.editCanvasSubmission(update, body);
    }

    editCanvasSubmissionColor(update: UpdateEventBody) {
        const body: any = {
            color: update.updatedFieldValue
        };

        this.editCanvasSubmission(update, body);
    }

    private editCanvasSubmission(update: UpdateEventBody, body: any) {
        const { slotId, submissionId } = update.updatedObjectId;

        if (!slotId) {
            throw new Error('slotId missing');
        }

        if (!submissionId) {
            throw new Error('submissionId missing');
        }

        this.canvasService
            .updateSubmission(this.format.id, this.phaseId, this.activity.id, this.canvas.id, slotId, submissionId, body)
            .subscribe((updatedSubmission: CanvasSubmission) => {
                this.submissions.map((submission) =>
                    submission.id === updatedSubmission.id ? Object.assign(submission, updatedSubmission) : submission
                );
            });
    }

    deleteCanvasSubmission(deleteEventParams: any) {
        const { slotId, submissionId } = deleteEventParams;
        this.canvasService
            .deleteSubmission(this.format.id, this.phaseId, this.activity.id, this.canvas.id, slotId, submissionId)
            .subscribe(() => {
                this.submissions = this.submissions.filter((submission) => submission.id !== submissionId);
            });
    }

    deleteCanvasSlot(slotId: string) {
        this.canvasService.deleteSlot(this.format.id, this.phaseId, this.activity.id, this.canvas.id, slotId).subscribe();
    }

    addCanvasSlot(slot: Slot) {
        this.canvasService.createSlot(this.format.id, this.phaseId, this.activity.id, this.canvas.id, slot).subscribe();
    }

    ngOnDestroy(): void {
        this.notificationService.leaveRoom(`${this.notificationCanvasWSPrefix}${this.route.snapshot.params['canvasId']}`);
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    loadCanvas(id: string) {
        this.canvasService.loadCanvas(this.format.id, this.phaseId, this.activity.id, id).subscribe(
            () => {},
            (err) => {
                this.utilService.logAndNavigate(
                    err.error,
                    this,
                    this.loadCanvas,
                    'snackbar.canvasNotFound',
                    `format/${this.format.id}/phase/${this.phaseId}/activity/${this.activity.id}`
                );
            }
        );
    }

    loadSubmitterSelectionList() {
        if (this.activity.configuration.submissionModifySetting === SubmissionModifySetting.MEMBER) {
            this.loadMembersAsSubmitter();
        } else {
            this.loadTeamsAsSubmitter();
        }
    }

    private addSubscriptions() {
        this.subscriptions.push(
            this.submitterForm.valueChanges.subscribe(() => {
                this.loadSubmissions();
                this.canvasInput.displaySubmitterName =
                    this.submitterForm.value.submitter === SubmissionSubmitter.ALL ||
                    this.activity.configuration.submissionModifySetting === SubmissionModifySetting.TEAM;
                this.canvasInput.isSubmissionCreatable = !(
                    this.submitterForm.value.submitter === SubmissionSubmitter.ALL &&
                    this.activity.configuration.submissionModifySetting === SubmissionModifySetting.TEAM
                );
            })
        );

        this.formatService.formatChanged.subscribe(() => {
            this.canvasInput.isOrganizer = this.canvasInput.isCanvasEditable = this.format.me.userRole === UserRole.ORGANIZER;
        });

        this.subscriptions.push(
            this.canvasService.canvasChanged.subscribe((canvas: Canvas) => {
                this.canvas = canvas;
            })
        );

        this.subscriptions.push(
            this.notificationService.canvasChangedWS.subscribe((a) => {
                this.loadSubmissions();
            })
        );
    }

    private initNotifications() {
        this.notificationCanvasWSPrefix = ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.canvas;

        this.notificationService.init().then(() => {
            this.notificationService.joinRoom(`${this.notificationCanvasWSPrefix}${this.route.snapshot.params['canvasId']}`);
        });
    }

    private loadTeamsAsSubmitter() {
        this.subscriptions.push(
            this.teamService.teamListChanged.subscribe((teamList: List<Team>) => {
                if (!this.submitterSelectOptions || this.submitterSelectOptions.length === 0) {
                    const user = this.userService.getCurrentLoggedInUser();

                    const teams: Team[] = this.canvasInput.isOrganizer
                        ? teamList.entities
                        : teamList.entities.filter((team) => team.members.some((member) => member.id === user.id));

                    this.submitterSelectOptions = teams.map((team) => {
                        return { value: team, display: team.name };
                    });

                    this.initSubmitter();
                }
            })
        );
        this.teamService.loadTeams(this.format.id).subscribe();
    }

    private loadMembersAsSubmitter() {
        if (this.canvasInput.isOrganizer || this.activity.configuration.submissionViewSetting === SubmissionViewSetting.MEMBER) {
            this.subscriptions.push(
                this.formatService.formatChanged.subscribe((format: Format) => {
                    if (format.members) {
                        this.submitterSelectOptions = format.members.entities
                            .filter((member) => !member.pending)
                            .map((member) => {
                                return { value: member, display: member.name };
                            });
                        this.initSubmitter();
                    }
                })
            );
            this.formatService.loadFormatMembers().subscribe();
        } else {
            const user = this.userService.getCurrentLoggedInUser();
            this.submitterSelectOptions = [{ value: user, display: user.name }];
            this.initSubmitter();
        }
    }
}
