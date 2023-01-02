import { SubmissionModifySetting, SubmissionViewSetting } from '../enum/global/submission.enum';

export interface ActivityConfiguration {
    submissionModifySetting: SubmissionModifySetting;
    submissionViewSetting: SubmissionViewSetting;
    blocked: boolean;
}
