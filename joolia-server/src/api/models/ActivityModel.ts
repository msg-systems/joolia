import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import {
    ActivityCanvas,
    ActivityConfiguration,
    ActivityFileEntry,
    KeyVisualEntry,
    LinkEntry,
    Phase,
    PhaseDurationUnit,
    Step,
    Submission,
    User
} from './internal';
import { AbstractModel } from './AbstractModel';

@Entity()
export class Activity extends AbstractModel<Activity> {
    @Column()
    public name: string;

    @Column()
    public position: number;

    @Column()
    public duration: number;

    @Column({
        nullable: true,
        type: 'text'
    })
    public shortDescription: string;

    @Column({
        nullable: true,
        type: 'text'
    })
    public description: string;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @ManyToOne(() => Phase, (phase) => phase.activities)
    public phase: Phase;

    @OneToMany(() => ActivityFileEntry, (file) => file.activity, { cascade: true })
    public files: ActivityFileEntry[];

    @OneToMany(() => Step, (step) => step.activity)
    public steps: Step[];

    @OneToMany(() => LinkEntry, (link) => link.activity)
    public collaborationLinks: LinkEntry[];

    @OneToOne(() => KeyVisualEntry)
    @JoinColumn()
    public keyVisual: KeyVisualEntry;

    @OneToMany(() => Submission, (submission) => submission.activity)
    public submissions: Submission[];

    @OneToOne(() => ActivityConfiguration, { cascade: true })
    @JoinColumn()
    public configuration: ActivityConfiguration;

    @OneToMany(() => ActivityCanvas, (activityCanvas) => activityCanvas.activity)
    public canvases: ActivityCanvas[];

    /**
     * Rounds the duration to the activity in insertion and update
     * @param minimumDuration minimum duration of the activity in minutes
     * If the phase durationUnit is in minutes it is rounded to nearest minimumDuration
     * If the phase durationUnit is in days it is rounded up to next day
     */
    public roundDuration(minimumDuration: number): void {
        if (this.phase.durationUnit === PhaseDurationUnit.MINUTES) {
            if (this.duration < minimumDuration) {
                this.duration = minimumDuration;
            } else {
                this.duration =
                    this.duration % minimumDuration < minimumDuration / 2
                        ? Math.floor(this.duration / minimumDuration) * minimumDuration
                        : (Math.floor(this.duration / minimumDuration) + 1) * minimumDuration;
            }
        } else {
            // rounds minutes to full days and stores them in minutes
            if (this.duration % (60 * 24) != 0) {
                const roundedToDays = Math.ceil(this.duration / (60 * 24)); // round to days
                this.duration = roundedToDays * 24 * 60; // rounded days to minutes
            }
        }
    }

    /**
     * Activity is considered in progress if it has any submission or any step already checked.
     */
    public hasProgress(): boolean {
        let progress = false;

        if (this.submissions) {
            progress = this.submissions.length > 0;
        }

        if (!progress && this.steps) {
            progress = this.steps.some((step) => (step.checks ? step.checks.length > 0 : false));
        }

        return progress;
    }
}
