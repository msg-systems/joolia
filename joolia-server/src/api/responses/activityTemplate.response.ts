import { ResponseBuilder } from './builder';
import { ActivityTemplate, ActivityTemplateCanvas, Library, StepTemplate, TemplateCategory } from '../models';
import { UserResponse, UserResponseBuilder } from './user.response';
import { ActivityConfigurationResponse, ActivityConfigurationResponseBuilder } from './activityConfiguration.response';
import { FileEntryResponse } from './fileEntry.response';
import { LinkEntryResponse } from './linkEntry.response';
import { createKeyVisualResponseBuilder } from './utils';

export class ActivityTemplateResponse {
    public static readonly attrs: string[] = [
        'id',
        'name',
        'shortDescription',
        'description',
        'createdBy',
        'duration',
        'stepTemplates',
        'library',
        'configuration',
        'keyVisual',
        'category',
        'canvases'
    ];

    public id: string;
    public name: string;
    public duration: number;
    public shortDescription: string;
    public description: string;
    public createdBy: Partial<UserResponse>;
    public library: Library;
    public stepTemplates: StepTemplate[];
    public configuration: Partial<ActivityConfigurationResponse>;
    public keyVisual: Partial<FileEntryResponse> | Partial<LinkEntryResponse>;
    public category: TemplateCategory;
    public canvases: ActivityTemplateCanvas[];

    public constructor(template: ActivityTemplate) {
        Object.assign(this, template);
    }
}

export class ActivityTemplateResponseBuilder extends ResponseBuilder<ActivityTemplateResponse> {
    public readonly responseAttrs: string[] = ActivityTemplateResponse.attrs;

    protected map(template: ActivityTemplate): Partial<ActivityTemplateResponse> {
        const res = new ActivityTemplateResponse(template);
        res.createdBy = new UserResponseBuilder().buildOne(template.createdBy);

        if (template.keyVisual) {
            /**
             * Improvement: Given the Type from each field in the response we can move this logic to the ResponseBuilder
             * to call further ResponseBuilder hence this code would be unnecessary;
             *
             * Hint: If you copy & paste this snippet to another response think through again about the idea above.
             *
             * TODO: Nth .. its enough! Refactor-me
             */
            const keyVisualResponse = createKeyVisualResponseBuilder(template.keyVisual);
            res.keyVisual = keyVisualResponse.buildOne(template.keyVisual);
        }

        if (template.configuration) {
            const builder = new ActivityConfigurationResponseBuilder();
            res.configuration = builder.buildOne(template);
        }
        return res;
    }
}
