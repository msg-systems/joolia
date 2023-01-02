import { Activity, ActivityConfiguration, ActivityFileEntry, ActivityTemplate, Phase, PhaseDurationUnit, Step, User } from '../models';
import { QueryRunner } from 'typeorm';
import { ActivityRepository } from '../repositories';

import { KeyVisualService } from './KeyVisualService';
import { CanvasService } from './CanvasService';

/**
 * TODO: Not a service. Move to custom repo instead.
 */
export class ActivityService {
    /**
     * Creates a new activity from an activity template
     * @param runner runner used for multiple query transaction
     * @param phase the phase the activity will belong to
     * @param position if provided me
     * @param user requesting the creation
     * @param activityTemplate the original template
     */
    public static async createActivityFromTemplate(
        runner: QueryRunner,
        phase: Phase,
        activityTemplate: ActivityTemplate,
        user: User,
        position?: number
    ): Promise<Activity> {
        const activityRepository = runner.manager.getCustomRepository(ActivityRepository);
        const stepRepository = runner.manager.getRepository(Step);

        // if duration is one day or more and the corresponding phase is hourly scheduled, the duration is rounded to one hour
        // if duration is less then a day and the corresponding phase is daily scheduled, the duration is rounded up to one day anyway by the subscription
        if (phase.durationUnit === PhaseDurationUnit.MINUTES && activityTemplate.duration >= 24 * 60) {
            activityTemplate.duration = 60;
        }

        let activity = new Activity({
            name: activityTemplate.name,
            duration: activityTemplate.duration,
            shortDescription: activityTemplate.shortDescription,
            description: activityTemplate.description,
            position: position ? position : activityTemplate.position,
            createdBy: user,
            phase: phase,
            files: [],
            configuration: new ActivityConfiguration({
                submissionViewSetting: activityTemplate.configuration.submissionViewSetting,
                submissionModifySetting: activityTemplate.configuration.submissionModifySetting
            })
        });
        for (const file of activityTemplate.files) {
            const activityFile = new ActivityFileEntry({
                name: file.name,
                contentType: file.contentType,
                size: file.size,
                fileId: file.fileId,
                versionId: file.versionId,
                createdBy: user
            });
            activity.files.push(activityFile);
        }
        // If activity template position is there means it is a template associated to a format the position should not be altered
        activity = position ? await activityRepository.createActivity(activity) : await activityRepository.save(activity);

        await KeyVisualService.copyKeyVisual(activity, activityTemplate.keyVisual, runner);

        const stepPromises = activityTemplate.stepTemplates.map((stepTemplate) => {
            const step = new Step({
                description: stepTemplate.description,
                position: stepTemplate.position,
                createdBy: user,
                activity
            });
            return stepRepository.save(step);
        });
        await Promise.all(stepPromises);

        await CanvasService.copyTemplateCanvasesToActivity(runner, activityTemplate.canvases, activity, user);

        return activity;
    }
}
