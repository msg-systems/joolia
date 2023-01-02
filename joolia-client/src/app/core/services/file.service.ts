import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FileMeta } from '../models';
import { IQueryParams, UtilService } from './util.service';
import { FileUsage } from '../enum/global/file-usage.enum';

@Injectable({
    providedIn: 'root'
})
export class FileService {
    private readonly serverConnection: string;
    private mimeTypeRegex: RegExp;

    constructor(private http: HttpClient, private config: ConfigurationService) {
        this.serverConnection = this.config.getServerConnection();
        this.mimeTypeRegex = ConfigurationService.getConfiguration().configuration.fileServiceConfig.openFileDirectlyMimeTypeRegex;
    }

    loadFilesMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta[]> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<FileMeta[]>(this.serverConnection + parent + '/file', { params: httpParams });
    }

    loadFileMeta(parent: string, fileId: FileMeta['id'], queryParams?: IQueryParams): Observable<FileMeta> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<FileMeta>(this.serverConnection + parent + '/file/' + fileId, { params: httpParams });
    }

    loadKeyVisualMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<FileMeta>(this.serverConnection + parent + '/keyvisual', { params: httpParams });
    }

    loadAvatarMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<FileMeta>(this.serverConnection + parent + '/avatar', { params: httpParams });
    }

    loadLogoMeta(parent: string, queryParams?: IQueryParams): Observable<FileMeta> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<FileMeta>(this.serverConnection + parent + '/logo', { params: httpParams });
    }

    loadUploadMetaForFile(parent: string, file: FileMeta, queryParams?: IQueryParams): Observable<FileMeta> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        let url: string = this.serverConnection + parent;
        let method: string;
        switch (file.fileUsage) {
            case FileUsage.KEYVISUAL:
                url += '/keyvisual';
                method = 'put';
                break;
            case FileUsage.AVATAR:
                url += '/avatar';
                method = 'put';
                break;
            case FileUsage.LOGO:
                url += '/logo';
                method = 'put';
                break;
            default:
                url += '/file';
                method = 'post';
                break;
        }
        const body = { name: file.name, size: file.size };
        return this.http[method]<FileMeta>(url, body, { params: httpParams });
    }

    getDownloadFileMeta(parent: string, fileId: FileMeta['id'], queryParams?: IQueryParams): Observable<FileMeta> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<FileMeta>(this.serverConnection + parent + '/file/' + fileId, { params: httpParams });
    }

    updateFile(parent: string, fileId: FileMeta['id'], body: Partial<FileMeta>): Observable<FileMeta> {
        if (typeof body.name === 'string' && body.name.trim().length === 0) {
            return of(<FileMeta>{});
        } else {
            return this.http.patch<FileMeta>(this.serverConnection + parent + '/file/' + fileId, body);
        }
    }

    deleteFile(parent: string, fileId: FileMeta['id'], queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.delete<void>(this.serverConnection + parent + '/file/' + fileId, { params: httpParams });
    }
}
