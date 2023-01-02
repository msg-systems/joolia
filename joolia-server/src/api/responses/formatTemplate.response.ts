import { FormatTemplate, Library, TemplateCategory } from '../models';
import { ResponseBuilder } from './builder';
import { FileEntryResponse } from './fileEntry.response';
import { LinkEntryResponse } from './linkEntry.response';
import { createKeyVisualResponseBuilder } from './utils';
import { UserResponse, UserResponseBuilder } from './user.response';

export class FormatTemplateResponse {
    public static readonly attrs = [
        'id',
        'name',
        'shortDescription',
        'description',
        'createdBy',
        'phaseTemplateCount',
        'activityTemplateCount',
        'library',
        'keyVisual',
        'category'
    ];

    public id: string;
    public name: string;
    public description: string;
    public shortDescription: string;
    public createdBy: Partial<UserResponse>;
    public phaseTemplateCount: number;
    public activityTemplateCount: number;
    public library: Library;
    public keyVisual: Partial<FileEntryResponse> | Partial<LinkEntryResponse>;
    public category: TemplateCategory;

    public constructor(template: FormatTemplate) {
        Object.assign(this, template);
    }
}

export class FormatTemplateResponseBuilder extends ResponseBuilder<FormatTemplateResponse> {
    public readonly responseAttrs: string[] = FormatTemplateResponse.attrs;

    protected map(template: FormatTemplate): Partial<FormatTemplateResponse> {
        const res = new FormatTemplateResponse(template);
        res.createdBy = new UserResponseBuilder().buildOne(template.createdBy);
        res.phaseTemplateCount = template.phaseTemplateCount;
        res.activityTemplateCount = template.activityTemplateCount;

        if (template.keyVisual) {
            /**
             * Improvement: Given the Type from each field in the response we can move this logic to the ResponseBuilder
             * to call further ResponseBuilder hence this code would be unnecessary;
             *
             * Hint: If you copy & paste this snippet to another response think through again about the idea above.
             *
             * TODO: 6th ;)
             */
            const keyVisualResponse = createKeyVisualResponseBuilder(template.keyVisual);
            res.keyVisual = keyVisualResponse.buildOne(template.keyVisual);
        }

        return res;
    }
}
