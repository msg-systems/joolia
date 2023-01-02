import { ChecklistItem } from './checklist-item.model';

export interface ProgressRow {
    id: string;
    name: string;
    progressText?: string;
    progressPercentage?: number;
    stepList?: ChecklistItem[];
    isDetailRow: boolean;
}
