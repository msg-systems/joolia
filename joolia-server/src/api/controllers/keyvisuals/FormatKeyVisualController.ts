import { AbstractKeyVisualEntryController } from './AbstractKeyVisualController';
import { Format } from '../../models';

export class FormatKeyVisualController extends AbstractKeyVisualEntryController {
    protected getEntity(resLocals: any): Format {
        return resLocals.format;
    }
}
