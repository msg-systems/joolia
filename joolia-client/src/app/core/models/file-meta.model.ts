import { UploadFile } from 'ngx-uploader';
import { KeyVisual } from './key-visual.model';
import { FileUsage } from '../enum/global/file-usage.enum';

export interface FileMeta extends KeyVisual {
    name: string;
    size: number;
    fileUrl: string;
    updatedAt: string;
    contentType: string;
    tabUrl: string;
    downloadUrl: string;
    upload?: UploadFile;
    fileUsage?: FileUsage;
    parent?: string;
}
