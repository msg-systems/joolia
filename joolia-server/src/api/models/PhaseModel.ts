import * as moment from 'moment';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Activity, Format, User } from './internal';
import { AbstractModel } from './AbstractModel';

export enum PhaseDurationUnit {
    MINUTES = 'minutes',
    DAYS = 'days'
}

export enum PhaseStatus {
    UNPLANNED = 'unplanned',
    ACTIVE = 'active',
    PLANNED = 'planned',
    PAST = 'past'
}

@Entity()
export class Phase extends AbstractModel<Phase> {
    @Column({
        type: 'enum',
        enum: PhaseDurationUnit,
        default: PhaseDurationUnit.MINUTES
    })
    public durationUnit: PhaseDurationUnit;

    @Column({
        nullable: true
    })
    public startDate: Date;

    @Column({
        nullable: true
    })
    public name: string;

    @Column({
        default: true
    })
    public visible: boolean;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @ManyToOne(() => Format, (format) => format.phases) //TODO: JOOLIA-2406 Missing nullable constraint?
    public format: Format;

    @OneToMany(() => Activity, (activity) => activity.phase)
    public activities: Activity[];

    public get duration(): number {
        if (this.activities) {
            return this.activities.reduce((acc, activity) => acc + activity.duration, 0);
        }
        return 0;
    }

    public get status(): PhaseStatus {
        if (!this.startDate) {
            return PhaseStatus.UNPLANNED;
        }

        if (moment.utc().isAfter(moment.utc(this.startDate).add(this.duration, PhaseDurationUnit.MINUTES))) {
            return PhaseStatus.PAST;
        } else if (moment.utc().isBefore(moment.utc(this.startDate))) {
            return PhaseStatus.PLANNED;
        } else {
            return PhaseStatus.ACTIVE;
        }
    }

    public get endDate(): Date {
        return this.startDate
            ? moment
                  .utc(this.startDate)
                  .add(this.duration, PhaseDurationUnit.MINUTES)
                  .toDate()
            : null;
    }

    public static roundStartDate(startDate: Date, durationUnit: PhaseDurationUnit): Date {
        // If a phase has 'DAYS' as duration unit, the time doesn't matter. It also would break the sorting.
        // For 'MINUTES', the seconds don't matter.
        if (durationUnit === PhaseDurationUnit.DAYS && startDate) {
            return moment
                .utc(startDate)
                .startOf('day')
                .toDate();
        } else if (durationUnit === PhaseDurationUnit.MINUTES && startDate) {
            return moment
                .utc(startDate)
                .startOf('minute')
                .toDate();
        }
    }
}
