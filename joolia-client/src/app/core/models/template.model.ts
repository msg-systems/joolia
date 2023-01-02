import { Library } from './library.model';
import { FileMeta } from './file-meta.model';
import { KeyVisual } from './key-visual.model';
import { User } from './user.model';
import { DurationUnit } from './phase.model';

export interface Template {
    id: string;
    name: string;
    shortDescription?: string;
    description?: string;
    createdBy: User;
    library?: Library;
    phaseTemplateCount?: number;
    activityTemplateCount?: number;
    duration?: number;
    files?: FileMeta[];
    keyVisual?: KeyVisual;
    category: string;
    durationUnit?: DurationUnit;
}
