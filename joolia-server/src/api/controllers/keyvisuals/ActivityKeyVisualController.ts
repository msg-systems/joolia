import { Activity } from '../../models';
import { AbstractKeyVisualEntryController } from './AbstractKeyVisualController';

export class ActivityKeyVisualController extends AbstractKeyVisualEntryController {
    protected getEntity(resLocals: any): Activity {
        return resLocals.activity;
    }
}
