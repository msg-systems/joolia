import { SelectOption } from './select-option.model';
import { AbstractDialogData } from './abstract-dialog-data.model';

export interface SubmitDialogDataModel extends AbstractDialogData {
    cancelKey: string;
    submitKey: string;
    members?: SelectOption[];
    teams?: SelectOption[];
}
