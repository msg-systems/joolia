import { LinkEntry } from './link-entry.model';

export interface LinkEditDialogDataModel {
    parent: string;
    link: LinkEntry;
    header: string;
    description: string;
    confirmKey: string;
    cancelKey: string;
    deleteKey: string;
}
