import { MemberStepCheck, Step, TeamStepCheck } from '../models';
import { ResponseBuilder } from './builder';

function fillResponse(step: Step, res: StepResponse): void {
    for (const stepCheck of step.checks) {
        if (stepCheck.isTeamCheck) {
            res.checkedBy.push((stepCheck as TeamStepCheck).team.id);
        } else {
            res.checkedBy.push((stepCheck as MemberStepCheck).member.user.id);
        }
    }
}

export class StepResponse {
    public static readonly attrs = ['id', 'description', 'position', 'checkedBy'];

    public id: string;
    public description: string;
    public position: number;
    public checkedBy: string[]; // Ids of StepCheck, team or user

    public constructor(step: Step) {
        Object.assign(this, step);
    }
}

export class StepResponseBuilder extends ResponseBuilder<StepResponse> {
    public readonly responseAttrs: string[] = StepResponse.attrs;

    protected map(step: Step): Partial<StepResponse> {
        const res = new StepResponse(step);
        if (step.checks) {
            res.checkedBy = [];
            fillResponse(step, res);
        }

        return res;
    }
}

export class PostStepResponseBuilder extends ResponseBuilder<StepResponse> {
    public readonly responseAttrs: string[] = StepResponse.attrs;

    protected map(step: Step): Partial<StepResponse> {
        const res = new StepResponse(step);
        res.checkedBy = []; // Current contract requires anyway after creation, even empty
        if (step.checks) {
            fillResponse(step, res);
        }

        return res;
    }
}
