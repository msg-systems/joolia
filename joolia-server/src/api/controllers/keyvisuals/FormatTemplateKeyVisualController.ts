import { FormatTemplate } from '../../models';
import { AbstractKeyVisualEntryController } from './AbstractKeyVisualController';

export class FormatTemplateKeyVisualController extends AbstractKeyVisualEntryController {
    protected getEntity(resLocals: any): FormatTemplate {
        return resLocals.formatTemplate;
    }
}
