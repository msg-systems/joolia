import { Template } from './template.model';
import { FileMeta } from './file-meta.model';
import { KeyVisual } from './key-visual.model';

export interface FormatTemplate extends Template {
    shortDescription: string;
    description: string;
    phaseTemplateCount: number;
    activityTemplateCount: number;
    files: FileMeta[];
    keyVisual: KeyVisual;
}
