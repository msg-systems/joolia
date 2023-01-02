import { FileEntry, KeyVisualEntry, KeyVisualFile, User } from '../models';
import { ResponseBuilder } from './builder';

export class FileEntryResponse {
    public static readonly required = ['id', 'name', 'contentType', 'size', 'createdBy', 'updatedAt', 'createdAt'];
    public static readonly attrs = FileEntryResponse.required.concat('fileUrl');

    public id: string;
    public name: string;
    public contentType: string;
    public size: number;
    public createdAt: Date;
    public updatedAt: Date;
    public fileUrl: string;
    public createdBy: User;

    public constructor(fileEntry: FileEntry) {
        Object.assign(this, fileEntry);
        this.name = fileEntry.name;
    }
}

export class FileEntryResponseBuilder extends ResponseBuilder<FileEntryResponse> {
    public readonly responseAttrs: string[] = FileEntryResponse.attrs;

    protected map(entry: FileEntry | KeyVisualEntry): Partial<FileEntryResponse> {
        if (entry instanceof KeyVisualEntry) {
            return new FileEntryResponse((entry as KeyVisualFile).keyVisualFile);
        }
        return new FileEntryResponse(entry);
    }
}

export class PatchFileEntryResponseBuilder extends FileEntryResponseBuilder {
    public readonly responseAttrs: string[] = ['id', 'name'];
}
