import { FileService } from '../../src/api/services';
import { IFileEntry } from '../../src/api/models';

export class DummyFileService extends FileService {
    public async createAccessUrl(fileEntry: IFileEntry, contentDispositionHeader: boolean): Promise<string> {
        return 'https://example.com/file/blah';
    }

    public async createUploadUrl(fileEntry: IFileEntry): Promise<string> {
        return 'https://example.com/file/blah';
    }

    public async deleteFile(fileEntry: IFileEntry): Promise<void> {
        // nothing to do
    }
}
