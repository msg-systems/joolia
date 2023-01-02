import { Phase } from './phase.model';

export interface PhaseMap {
    activePhases: Phase[];
    plannedPhases: Phase[];
    unplannedPhases: Phase[];
    pastPhases: Phase[];
}
