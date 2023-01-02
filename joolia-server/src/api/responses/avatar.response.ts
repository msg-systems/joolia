import { FileEntry } from '../models';
import { ResponseBuilder } from './builder';

export class UserAvatarResponse {
    public static readonly attrs = ['id', 'name', 'contentType', 'size', 'updatedAt', 'createdAt', 'fileUrl'];

    public id: string;
    public name: string;
    public contentType: string;
    public size: number;
    public createdAt: Date;
    public updatedAt: Date;
    public fileUrl: string;

    public constructor(fileEntry: FileEntry) {
        Object.assign(this, fileEntry);
        this.name = fileEntry.name;
    }
}

export class UserAvatarResponseBuilder extends ResponseBuilder<UserAvatarResponse> {
    public readonly responseAttrs: string[] = UserAvatarResponse.attrs;

    protected map(entry: FileEntry): Partial<UserAvatarResponse> {
        return new UserAvatarResponse(entry);
    }
}
