import { ActivityTemplate } from './activity-template.model';
import { Template } from './template.model';
import { DurationUnit } from './phase.model';

export interface PhaseTemplate extends Template {
    durationUnit?: DurationUnit;
    activityTemplates: ActivityTemplate[];
}
