import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubmissionModifySetting, SubmissionViewSetting } from '../../../../core/enum/global/submission.enum';
import {
    Activity,
    ActivityConfiguration,
    CheckedBy,
    ChecklistItem,
    List,
    Permission,
    Step,
    StepCheckedEvent,
    Team,
    UpdateEventBody,
    User,
    UserRole
} from '../../../../core/models';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    IQueryParams,
    PhaseService,
    TeamService,
    UserService
} from '../../../../core/services';

@Component({
    selector: 'app-activity-details-progress',
    templateUrl: './activity-details-progress.component.html',
    styleUrls: ['./activity-details-progress.component.scss']
})
export class ActivityDetailsProgressComponent implements OnInit, OnDestroy {
    activity: Activity;
    memberList: List<User> = { count: 0, entities: [] };
    teamList: List<Team> = { count: 0, entities: [] };
    teamProgress: boolean;
    viewOthers: boolean;
    noTeamsOrMembersLabel: string;

    allEntities: CheckedBy[];
    myEntities: CheckedBy[];
    otherEntities: CheckedBy[];

    stepDescriptionMaxLength: number;
    stepList: ChecklistItem[];
    subscriptions: Subscription[] = [];

    isAddAllowed = false;

    constructor(
        private activityService: ActivityService,
        private formatService: FormatService,
        private phaseService: PhaseService,
        private teamService: TeamService,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.stepDescriptionMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.step.description;
        const activityConfiguration: ActivityConfiguration = this.activityService.getCurrentActivity().configuration;
        this.teamProgress = activityConfiguration.submissionModifySetting === SubmissionModifySetting.TEAM;
        this.viewOthers = activityConfiguration.submissionViewSetting === SubmissionViewSetting.MEMBER;
        this.isAddAllowed = this.formatService.hasPermission(Permission.ADD_STEP);
        this.noTeamsOrMembersLabel = this.teamProgress
            ? this.isAddAllowed
                ? 'emptyStates.activityProgressTeam.organizer'
                : 'emptyStates.activityProgressTeam.participant'
            : 'emptyStates.member.content';

        this.subscriptions.push(
            this.activityService.activityChanged.subscribe((activity: Activity) => {
                this.activity = activity;

                if (this.activity && this.activity.steps) {
                    this.stepList = this.activity.steps.entities.map((step: Step) => {
                        return { itemId: step.id, content: step.description, checked: false };
                    });
                }
            })
        );

        this.subscriptions.push(
            this.formatService.formatChanged.subscribe((format) => {
                this.memberList = format.members;

                this.setEntities();
            })
        );

        this.subscriptions.push(
            this.teamService.teamListChanged.subscribe((teamList: List<Team>) => {
                this.teamList = teamList;

                this.setEntities();
            })
        );

        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().activity.select.detailsProgress,
            order: 'position'
        };

        if (this.teamProgress) {
            this.teamService.loadTeams(this.formatService.getCurrentFormat().id).subscribe();
        } else {
            this.formatService.loadFormatMembers().subscribe();
        }
        this.activityService
            .loadSteps(
                this.formatService.getCurrentFormat().id,
                this.phaseService.getCurrentPhase().id,
                this.activityService.getCurrentActivity().id,
                queryParams
            )
            .subscribe();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    onAddEntry(newEntry: string) {
        if (newEntry !== '') {
            const createBody = {
                description: newEntry,
                done: false
            };

            this.activityService
                .createStep(this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id, createBody)
                .subscribe();
        }
    }

    onEditEntry(item: UpdateEventBody) {
        if (item.updatedFieldValue === '') {
            this.onDeleteEntry(item.updatedObjectId);
        } else if (this.stepList.find((step) => step.itemId === item.updatedObjectId).content !== item.updatedFieldValue) {
            const updateBody = {
                description: item.updatedFieldValue
            };

            this.activityService
                .updateStep(
                    this.formatService.getCurrentFormat().id,
                    this.phaseService.getCurrentPhase().id,
                    item.updatedObjectId,
                    updateBody
                )
                .subscribe();
        }
    }

    onDeleteEntry(id: string) {
        this.activityService.deleteStep(this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id, id).subscribe();
    }

    onStepChecked(event: StepCheckedEvent) {
        const body = { checkedById: event.checkedById, done: event.done };
        this.activityService
            .updateStepChecked(this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id, event.stepId, body)
            .subscribe();
    }

    private setEntities() {
        if (this.teamList || this.memberList) {
            if (this.isAddAllowed) {
                this.allEntities = this.getTeamsOrMembers('all');
            } else {
                this.myEntities = this.getTeamsOrMembers('me');
                if (this.viewOthers) {
                    this.otherEntities = this.getTeamsOrMembers('others');
                }
            }
        }
    }

    private getTeamsOrMembers(filter: string) {
        const currentUser = this.userService.getCurrentLoggedInUser();
        if (currentUser) {
            const entities: any[] = this.teamProgress
                ? this.teamList.entities
                : // TODO make a query to the server with the filtering in members pending false JOOLIA 519
                  this.memberList.entities.filter((member: User) => member.role === UserRole.PARTICIPANT && !member.pending);
            const myEntity = this.teamProgress
                ? (team: Team) => team.members.find((member) => member.id === currentUser.id)
                : (member) => member.id === currentUser.id;
            switch (filter) {
                case 'me':
                    return entities.filter(myEntity);
                case 'others':
                    return entities.filter((entity) => !myEntity(entity));
                case 'all':
                    return [].concat(entities);
            }
        }
    }
}
