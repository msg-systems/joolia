import {
    Activity,
    ActivityConfiguration,
    ActivityTemplate,
    ActivityTemplateFileEntry,
    Library,
    PhaseTemplate,
    StepTemplate,
    User
} from '../models';
import { stepTemplateResponseAttributes } from '../responses';
import { pick } from 'lodash';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';
import { KeyVisualService } from './KeyVisualService';
import { CanvasService } from './CanvasService';

/**
 * TODO: Not a service. Move to custom repo instead.
 */
export class ActivityTemplateService {
    public static async createActivityTemplate(
        user: User,
        runner: QueryRunner,
        activity: Activity,
        req: Request,
        library: Library,
        phaseTemplate?: PhaseTemplate
    ): Promise<ActivityTemplate> {
        const activityTemplateRepository = runner.manager.getRepository(ActivityTemplate);
        const stepTemplateRepository = runner.manager.getRepository(StepTemplate);

        const activityTemplate = new ActivityTemplate({
            createdBy: user,
            name: activity.name,
            category: req.body.category,
            duration: activity.duration,
            shortDescription: activity.shortDescription,
            description: activity.description,
            files: [],
            configuration: activity.configuration
                ? new ActivityConfiguration({
                      submissionModifySetting: activity.configuration.submissionModifySetting,
                      submissionViewSetting: activity.configuration.submissionViewSetting
                  })
                : undefined,
            position: phaseTemplate ? activity.position : undefined,
            phaseTemplate,
            library
        });

        for (const file of activity.files) {
            const activityTemplateFile = new ActivityTemplateFileEntry({
                name: file.name,
                contentType: file.contentType,
                size: file.size,
                fileId: file.fileId,
                versionId: file.versionId,
                createdBy: file.createdBy,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt
            });
            activityTemplate.files.push(activityTemplateFile);
        }

        await activityTemplateRepository.save(activityTemplate);
        await KeyVisualService.copyKeyVisual(activityTemplate, activity.keyVisual, runner);

        activityTemplate.stepTemplates = [];
        for (const step of activity.steps) {
            const stepTemplate = new StepTemplate({
                activityTemplate,
                position: step.position,
                description: step.description,
                createdBy: activityTemplate.createdBy
            });
            activityTemplate.stepTemplates.push(pick(await stepTemplateRepository.save(stepTemplate), stepTemplateResponseAttributes));
        }

        activityTemplate.canvases = await CanvasService.copyActivityCanvasesToTemplate(runner, activity.canvases, activityTemplate, user);

        return activityTemplate;
    }
}
