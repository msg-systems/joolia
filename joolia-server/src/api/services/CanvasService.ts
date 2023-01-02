import { Activity, ActivityCanvas, ActivityTemplate, ActivityTemplateCanvas, CanvasSlot, User } from '../models';
import { ActivityCanvasRepo } from '../repositories';
import { QueryRunner } from 'typeorm';

/**
 * TODO: Not a service. Move to custom repo instead.
 */
export class CanvasService {
    public static copyTemplateCanvasesToActivity(
        runner: QueryRunner,
        templates: ActivityTemplateCanvas[],
        activity: Activity,
        user: User
    ): Promise<ActivityCanvas[]> {
        const canvasRepo = runner.manager.getCustomRepository(ActivityCanvasRepo);
        const slotRepo = runner.manager.getRepository(CanvasSlot);
        const canvasPromises = templates.map(async (canvasTemplate) => {
            const canvas = await canvasRepo.save(
                new ActivityCanvas({
                    activity,
                    name: canvasTemplate.name,
                    rows: canvasTemplate.rows,
                    columns: canvasTemplate.columns,
                    createdBy: user
                })
            );
            const slots = canvasTemplate.slots.map(
                (s) =>
                    new CanvasSlot({
                        canvas,
                        title: s.title,
                        column: s.column,
                        columnSpan: s.columnSpan,
                        row: s.row,
                        rowSpan: s.rowSpan,
                        sortOrder: s.sortOrder,
                        slotType: s.slotType
                    })
            );
            canvas.slots = await slotRepo.save(slots);
            return Promise.resolve(canvas);
        });
        return Promise.all(canvasPromises);
    }

    public static copyActivityCanvasesToTemplate(
        runner: QueryRunner,
        canvases: ActivityCanvas[],
        template: ActivityTemplate,
        user: User
    ): Promise<ActivityTemplateCanvas[]> {
        const canvasRepo = runner.manager.getRepository(ActivityTemplateCanvas);
        const slotRepo = runner.manager.getRepository(CanvasSlot);
        const canvasTemplates: Array<Promise<ActivityTemplateCanvas>> = canvases.map(async (canvas) => {
            const canvasTemplate = await canvasRepo.save(
                new ActivityTemplateCanvas({
                    activityTemplate: template,
                    name: canvas.name,
                    rows: canvas.rows,
                    columns: canvas.columns,
                    createdBy: user
                })
            );
            const slots = canvas.slots.map(
                (s) =>
                    new CanvasSlot({
                        canvas: canvasTemplate,
                        title: s.title,
                        column: s.column,
                        columnSpan: s.columnSpan,
                        row: s.row,
                        rowSpan: s.rowSpan,
                        sortOrder: s.sortOrder,
                        slotType: s.slotType
                    })
            );
            canvasTemplate.slots = await slotRepo.save(slots);
            return Promise.resolve(canvasTemplate);
        });
        return Promise.all(canvasTemplates);
    }
}
