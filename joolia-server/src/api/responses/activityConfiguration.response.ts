import { Activity, ActivityConfiguration, ActivityTemplate, SubmissionModifySetting, SubmissionViewSetting } from '../models';
import { ResponseBuilder } from './builder';

export class ActivityConfigurationResponse {
    public static readonly attrs = ['id', 'submissionModifySetting', 'submissionViewSetting'];

    public id: string;
    public submissionModifySetting: SubmissionModifySetting;
    public submissionViewSetting: SubmissionViewSetting;

    public constructor(configuration: ActivityConfiguration) {
        Object.assign(this, configuration);
    }
}

export class ActivityConfigurationResponseBuilder extends ResponseBuilder<ActivityConfigurationResponse> {
    public readonly responseAttrs: string[] = ActivityConfigurationResponse.attrs;

    protected map(o: Activity | ActivityTemplate): Partial<ActivityConfigurationResponse> {
        const res = new ActivityConfigurationResponse(o.configuration);
        return res;
    }
}
