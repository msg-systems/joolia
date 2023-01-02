import { FileCreator } from './file-creator.model';

export interface KeyVisual {
    id: string;
    createdBy: FileCreator;
    fileUrl?: string;
    linkUrl?: string;
}
