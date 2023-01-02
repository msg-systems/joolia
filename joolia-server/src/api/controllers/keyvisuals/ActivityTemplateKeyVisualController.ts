import { ActivityTemplate } from '../../models';
import { AbstractKeyVisualEntryController } from './AbstractKeyVisualController';

export class ActivityTemplateKeyVisualController extends AbstractKeyVisualEntryController {
    protected getEntity(resLocals: any): ActivityTemplate {
        return resLocals.activityTemplate;
    }
}
