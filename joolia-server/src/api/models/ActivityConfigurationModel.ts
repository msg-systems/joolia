import { Column, Entity, OneToOne } from 'typeorm';
import { Activity } from './internal';
import { AbstractModel } from './AbstractModel';

/**
 * Specifies the modify setting for the submissions in the activity (who can update the progress or submit submissions?)
 */
export enum SubmissionModifySetting {
    MEMBER = 'member',
    TEAM = 'team'
}

/**
 * Specifies the view setting for the submissions in the activity (submitter can be team or format member)
 */
export enum SubmissionViewSetting {
    SUBMITTER = 'submitter',
    MEMBER = 'member'
}

@Entity()
export class ActivityConfiguration extends AbstractModel<ActivityConfiguration> {
    @Column({
        default: SubmissionModifySetting.MEMBER
    })
    public submissionModifySetting: SubmissionModifySetting;

    @Column({
        default: SubmissionViewSetting.SUBMITTER
    })
    public submissionViewSetting: SubmissionViewSetting;

    @OneToOne(() => Activity, (activity) => activity.configuration)
    public activity: Activity;
}
