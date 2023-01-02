import { List } from './list.model';
import { Step } from './step.model';
import { ActivityConfiguration } from './activity-configuration.model';
import { FileMeta } from './file-meta.model';
import { Phase } from './phase.model';
import { KeyVisual } from './key-visual.model';
import { LinkEntry } from './link-entry.model';

export interface Activity {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    duration: number;
    position: number;
    configuration: ActivityConfiguration;
    steps: List<Step>;
    files: FileMeta[];
    collaborationLinks: LinkEntry[];
    keyVisual: KeyVisual;
    phase?: Partial<Phase>;
    stepCount: number;
    submissionCount: number;
}
