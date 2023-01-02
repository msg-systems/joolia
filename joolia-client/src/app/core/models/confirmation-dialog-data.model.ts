import { AbstractDialogData } from './abstract-dialog-data.model';

/**
 * Model which defines the data for the confirmation dialog.
 */
export interface ConfirmationDialogData extends AbstractDialogData {
    cancelKey: string;
    confirmKey: string;
}
