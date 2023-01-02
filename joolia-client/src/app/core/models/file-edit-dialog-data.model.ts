import { AbstractDialogData } from './abstract-dialog-data.model';

export interface FileEditDialogDataModel extends AbstractDialogData {
    fileName: string;
    cancelKey: string;
    confirmKey: string;
}
