import { Moment } from 'moment';

export enum DurationUnit {
    MINUTES = 'minutes',
    DAYS = 'days'
}

export enum PhaseState {
    ACTIVE = 'active',
    PLANNED = 'planned',
    UNPLANNED = 'unplanned',
    PAST = 'past'
}

export interface Phase {
    id: string;
    name: string;
    startDate: Moment;
    endDate: Moment;
    duration: number;
    durationUnit: DurationUnit;
    activityCount: number;
    status: PhaseState;
    visible: boolean;
}
