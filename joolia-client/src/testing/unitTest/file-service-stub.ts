import { Observable } from 'rxjs';
import { FileService, IQueryParams } from '../../app/core/services';
import { FileMeta } from '../../app/core/models';
import { getMockData } from './mock-data';

export class FileServiceStub implements Partial<FileService> {
    public _loadUploadMetaForFileCalls: any[] = [];
    public _loadFileMetaCalls: any[] = [];
    public _deleteFileCalls: any[] = [];
    public _loadFilesMetaCalls: any[] = [];
    public _loadKeyVisualMetaCalls: any[] = [];
    public _getDownloadFileMetaCalls: any[] = [];
    public _loadAvatarMetaCalls: any[] = [];
    public _loadLogoMetaCalls: any[] = [];

    loadUploadMetaForFile(parent, file, queryParam): Observable<FileMeta> {
        this._loadUploadMetaForFileCalls.push({ parent: parent, file: file, queryParam: queryParam });
        return new Observable<FileMeta>((subscriber) => subscriber.next());
    }

    loadFileMeta(parent, fileId, queryParams): Observable<FileMeta> {
        const mockFileMeta = getMockData('file.file1');
        this._loadFileMetaCalls.push({ parent: parent, fileId: fileId, queryParams: queryParams });
        return new Observable<FileMeta>((subscriber) => subscriber.next(mockFileMeta));
    }

    deleteFile(parent: string, fileId: FileMeta['id'], queryParams?: IQueryParams): Observable<void> {
        this._deleteFileCalls.push({ parent: parent, fileId: fileId, queryParams: queryParams });
        return new Observable<void>((subscriber) => subscriber.next());
    }

    loadFilesMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta[]> {
        this._loadFilesMetaCalls.push({ parent: parent, queryParams: queryParams });
        return new Observable<FileMeta[]>((subscriber) => subscriber.next([]));
    }

    loadAvatarMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta> {
        this._loadAvatarMetaCalls.push({ parent: parent, queryParams: queryParams });
        return new Observable<FileMeta>((subscriber) => subscriber.next(getMockData('file.file1')));
    }

    loadKeyVisualMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta> {
        this._loadKeyVisualMetaCalls.push({ parent: parent, queryParams: queryParams });
        return new Observable<FileMeta>((subscriber) => subscriber.next());
    }

    loadLogoMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta> {
        this._loadLogoMetaCalls.push({ parent, queryParams });
        return new Observable<FileMeta>((subscriber) => subscriber.next(getMockData('file.file1')));
    }

    getDownloadFileMeta(parent: string, fileId: FileMeta['id'], queryParams?: IQueryParams): Observable<FileMeta> {
        this._getDownloadFileMetaCalls.push({ parent: parent, fileId: fileId, queryParams: queryParams });
        return new Observable<FileMeta>((subscriber) => subscriber.next(getMockData('file.file1')));
    }

    _toHaveBeenCalledWith(method: string, params: any[]) {
        return !!this[`${'_' + method + 'Calls'}`.toString()].indexOf(params);
    }

    _resetStubCalls() {
        this._loadUploadMetaForFileCalls.length = 0;
        this._loadFileMetaCalls.length = 0;
        this._deleteFileCalls.length = 0;
        this._loadFilesMetaCalls.length = 0;
        this._loadKeyVisualMetaCalls.length = 0;
        this._getDownloadFileMetaCalls.length = 0;
        this._loadAvatarMetaCalls.length = 0;
        this._loadLogoMetaCalls.length = 0;
    }
}
