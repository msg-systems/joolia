import { AbstractDialogData } from './abstract-dialog-data.model';
import { MultiSelectOptionData } from './multi-select-option-data.model';

/**
 * Model to define multiple dropdown selection options for a single dialog.
 */
export interface MultiSelectionDialogData extends AbstractDialogData {
    selectionDetails: MultiSelectOptionData[];
    cancelKey: string;
    confirmKey: string;
}
