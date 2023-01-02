import { Phase, PhaseDurationUnit, PhaseStatus } from '../models';
import { ResponseBuilder } from './builder';

export class PhaseResponse {
    public static readonly attrs = ['id', 'name', 'startDate', 'endDate', 'duration', 'durationUnit', 'activityCount', 'status', 'visible'];

    public id: string;
    public name: string;
    public startDate: Date;
    public endDate: Date;
    public durationUnit: PhaseDurationUnit;
    public visible: boolean;
    public status: PhaseStatus;
    public activityCount: number;
    public duration: number;

    public constructor(phase: Phase) {
        Object.assign(this, phase);
    }
}

export class PhaseResponseBuilder extends ResponseBuilder<PhaseResponse> {
    public readonly responseAttrs: string[] = PhaseResponse.attrs;

    protected map(phase: Phase): Partial<PhaseResponse> {
        const res = new PhaseResponse(phase);
        res.duration = phase.duration;
        res.status = phase.status;
        res.endDate = phase.endDate;
        res.activityCount = phase.activities ? phase.activities.length : 0;
        return res;
    }
}
