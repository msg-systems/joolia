import { ActivityTemplate, Library, PhaseDurationUnit, PhaseTemplate, TemplateCategory } from '../models';
import { ResponseBuilder } from './builder';
import { UserResponse, UserResponseBuilder } from './user.response';

export class PhaseTemplateResponse {
    public static readonly attrs = [
        'id',
        'name',
        'durationUnit',
        'category',
        'activityTemplates',
        'library',
        'createdBy',
        'activityTemplateCount',
        'duration'
    ];

    public id: string;
    public name: string;
    public durationUnit: PhaseDurationUnit;
    public category: TemplateCategory;
    public library: Library;
    public createdBy: Partial<UserResponse>;
    public activityTemplates: ActivityTemplate[];
    public activityTemplateCount: number;
    public duration: number;

    public constructor(template: PhaseTemplate) {
        Object.assign(this, template);
    }
}

export class PhaseTemplateResponseBuilder extends ResponseBuilder<PhaseTemplateResponse> {
    public readonly responseAttrs: string[] = PhaseTemplateResponse.attrs;

    protected map(template: PhaseTemplate): Partial<PhaseTemplateResponse> {
        const res = new PhaseTemplateResponse(template);
        res.activityTemplateCount = template.activityTemplateCount;
        res.duration = template.duration;
        res.createdBy = new UserResponseBuilder().buildOne(template.createdBy);
        return res;
    }
}
