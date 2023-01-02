import { AbstractDialogData } from './abstract-dialog-data.model';
import { SelectOption } from './select-option.model';

export interface SelectionDialogData extends AbstractDialogData {
    selectionName: string;
    selectionOptions: SelectOption[];
    cancelKey: string;
    confirmKey: string;
}
