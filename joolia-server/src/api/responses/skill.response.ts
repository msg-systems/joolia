import { ResponseBuilder } from './builder';

export class SkillResponse {
    public static readonly attrs = ['id', 'name'];

    public id: string;
    public name: string;

    public constructor(data: unknown) {
        Object.assign(this, data);
    }
}

export class SkillResponseBuilder extends ResponseBuilder<SkillResponse> {
    public readonly responseAttrs: string[] = SkillResponse.attrs;

    protected map(data: unknown): Partial<SkillResponse> {
        return new SkillResponse(data);
    }
}
