import { Step } from './step.model';
import { Template } from './template.model';
import { ActivityConfiguration } from './activity-configuration.model';
import { FileMeta } from './file-meta.model';
import { KeyVisual } from './key-visual.model';
import { Canvas } from './canvas.model';

export interface ActivityTemplate extends Template {
    shortDescription: string;
    description: string;
    duration: number;
    stepTemplates: Step[];
    configuration: ActivityConfiguration;
    files: FileMeta[];
    keyVisual: KeyVisual;
    category: string;
    canvases: Canvas[];
}
