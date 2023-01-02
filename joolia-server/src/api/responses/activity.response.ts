import { Activity, SubmissionModifySetting, SubmissionViewSetting, TeamSubmission, User, UserSubmission } from '../models';
import { ResponseBuilder } from './builder';
import { isCreator, isMember } from '../utils/helpers';
import { FileEntryResponse } from './fileEntry.response';
import { LinkEntryResponse, LinkEntryResponseBuilder } from './linkEntry.response';
import { ActivityConfigurationResponse, ActivityConfigurationResponseBuilder } from './activityConfiguration.response';
import { createKeyVisualResponseBuilder } from './utils';
import { DeepPartial } from 'typeorm';

export class ActivityResponse {
    public static readonly required = ['id', 'name', 'duration', 'description', 'position', 'shortDescription', 'configuration'];

    public static readonly attrs = ActivityResponse.required.concat('keyVisual', 'collaborationLinks');

    public id: string;
    public name: string;
    public description: string;
    public shortDescription: string;
    public duration: number;
    public position: number;
    public collaborationLinks: Array<Partial<LinkEntryResponse>>;
    public keyVisual: Partial<FileEntryResponse> | Partial<LinkEntryResponse>;
    public configuration: Partial<ActivityConfigurationResponse>;

    public constructor(activity: Activity) {
        Object.assign(this, activity);
    }
}

export class ActivityResponseBuilder extends ResponseBuilder<ActivityResponse> {
    public readonly responseAttrs: string[] = ActivityResponse.attrs;

    protected map(activity: Activity): Partial<ActivityResponse> {
        const res = new ActivityResponse(activity);

        if (activity.keyVisual) {
            /**
             * Improvement: Given the Type from each field in the response we can move this logic to the ResponseBuilder
             * to call further ResponseBuilder hence this code would be unnecessary;
             *
             * Hint: If you copy & paste this snippet to another response think through again about the idea above.
             *
             * TODO: 2nd ;)
             */
            const keyVisualResponse = createKeyVisualResponseBuilder(activity.keyVisual);
            res.keyVisual = keyVisualResponse.buildOne(activity.keyVisual);
        }

        if (activity.configuration) {
            const activityConfRespBuilder = new ActivityConfigurationResponseBuilder();
            res.configuration = activityConfRespBuilder.buildOne(activity);
        }

        if (activity.collaborationLinks) {
            res.collaborationLinks = new LinkEntryResponseBuilder().buildMany(activity.collaborationLinks);
        }

        return res;
    }
}

export class ActivityReorderResponse {
    public static readonly attrs = ['id', 'position'];

    public id: string;
    public position: number;

    public constructor(activity: Activity) {
        Object.assign(this, activity);
    }
}

export class ActivityReorderResBuilder extends ResponseBuilder<ActivityReorderResponse> {
    public readonly responseAttrs: string[] = ActivityReorderResponse.attrs;

    protected map(activity: Activity): Partial<ActivityReorderResponse> {
        return new ActivityReorderResponse(activity);
    }
}

interface ConfigurationDetails {
    blocked: boolean;
}
export class ActivityDetailsResponse {
    public static readonly attrs = ['submissionCount', 'stepCount', 'configuration'];

    public submissionCount: number;
    public stepCount: number;
    public configuration: ConfigurationDetails;

    public constructor(activity: Activity, hasCanvasSubmissions: boolean, user: DeepPartial<User>, isOrganizer: boolean) {
        this.submissionCount = this.computeSubmissionCount(activity, user, isOrganizer);
        this.stepCount = activity.steps ? activity.steps.length : 0;
        this.configuration = { blocked: activity.hasProgress() || hasCanvasSubmissions };
    }

    private computeSubmissionCount(activity: Activity, user: DeepPartial<User>, isOrganizer: boolean): number {
        if (!activity.submissions) {
            return 0;
        }

        const activityCfg = activity.configuration;

        if (!user || isOrganizer || activityCfg.submissionViewSetting === SubmissionViewSetting.MEMBER) {
            return activity.submissions.length;
        } else {
            let count = 0;

            activity.submissions.forEach((submission) => {
                const countable =
                    (activityCfg.submissionModifySetting === SubmissionModifySetting.MEMBER &&
                        isCreator(user, submission as UserSubmission)) ||
                    (activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM &&
                        isMember(user, (submission as TeamSubmission).team));

                if (countable) {
                    count++;
                }
            });

            return count;
        }
    }
}

export class ActivityDetailsResponseBuilder extends ResponseBuilder<ActivityDetailsResponse> {
    public readonly responseAttrs: string[] = ActivityDetailsResponse.attrs;

    protected map(data: [Activity, boolean]): Partial<ActivityDetailsResponse> {
        let activity: Activity;
        let hasCanvasSubmissions = false;
        // eslint-disable-next-line prefer-const
        [activity, hasCanvasSubmissions] = data;
        const res = new ActivityDetailsResponse(activity, hasCanvasSubmissions, this.user, this.isOrganizer);
        return res;
    }
}
