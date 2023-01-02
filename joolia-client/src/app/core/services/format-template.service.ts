import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileMeta, FormatTemplate, List } from '../models';
import { FileService } from './file.service';
import { cloneDeep } from 'lodash-es';
import { IQueryParams, UtilService } from './util.service';

/**
 * The FormatTemplateService handles all logic and http requests regarding format templates.
 */
@Injectable()
export class FormatTemplateService {
    formatTemplateListChanged = new Subject<List<FormatTemplate>>();
    formatTemplateChanged = new Subject<FormatTemplate>();

    private readonly serverConnection: string;

    private loadedFormatTemplateList: List<FormatTemplate> = { count: 0, entities: [] };
    private loadedFormatTemplate: FormatTemplate;

    constructor(private fileService: FileService, private http: HttpClient, private config: ConfigurationService) {
        this.serverConnection = this.config.getServerConnection();
    }

    getCurrentFormatTemplate() {
        return cloneDeep(this.loadedFormatTemplate);
    }

    loadFormatTemplates(libraryId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<FormatTemplate>>(`${this.serverConnection}/library/${libraryId}/format-template`, { params: httpParams })
            .pipe(
                map((formatTemplateList: List<FormatTemplate>) => {
                    if (loadMore) {
                        this.loadedFormatTemplateList.count = formatTemplateList.count;
                        this.loadedFormatTemplateList.entities = this.loadedFormatTemplateList.entities.concat(formatTemplateList.entities);
                    } else {
                        this.loadedFormatTemplateList = formatTemplateList;
                    }
                    this.formatTemplateListChanged.next(cloneDeep(this.loadedFormatTemplateList));
                })
            );
    }

    loadAllFormatTemplates(queryParams?: IQueryParams): Observable<List<FormatTemplate>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<List<FormatTemplate>>(`${this.serverConnection}/format-template`, { params: httpParams });
    }

    loadFormatTemplate(libraryId: string, templateId: string, queryParams?: IQueryParams): Observable<FormatTemplate> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<FormatTemplate>(`${this.serverConnection}/library/${libraryId}/format-template/${templateId}`, { params: httpParams })
            .pipe(
                map((formatTemplate: FormatTemplate) => {
                    this.loadedFormatTemplate = formatTemplate;
                    this.formatTemplateChanged.next(cloneDeep(formatTemplate));

                    return formatTemplate;
                })
            );
    }

    updateFormatTemplate(libraryId: string, templateId: string, category: string): Observable<void> {
        return this.http
            .patch<FormatTemplate>(`${this.serverConnection}/library/${libraryId}/format-template/${templateId}`, {
                category
            })
            .pipe(
                map((formatTemplate: FormatTemplate) => {
                    if (this.loadedFormatTemplateList) {
                        this.loadedFormatTemplateList.entities = this.loadedFormatTemplateList.entities.map((t) => {
                            return t.id === formatTemplate.id ? Object.assign(t, formatTemplate) : t;
                        });

                        this.formatTemplateListChanged.next(cloneDeep(this.loadedFormatTemplateList));
                    }

                    if (this.loadedFormatTemplate) {
                        Object.assign(this.loadedFormatTemplate, formatTemplate);

                        this.formatTemplateChanged.next(this.loadedFormatTemplate);
                    }
                })
            );
    }

    deleteFormatTemplate(libraryId: string, formatTemplateId: string): Observable<void> {
        return this.http.delete(`${this.serverConnection}/library/${libraryId}/format-template/${formatTemplateId}`).pipe(
            map(() => {
                this.loadedFormatTemplateList.entities = this.loadedFormatTemplateList.entities.filter(
                    (activityTemplate) => activityTemplate.id !== formatTemplateId
                );
                this.loadedFormatTemplateList.count--;
                this.formatTemplateListChanged.next(cloneDeep(this.loadedFormatTemplateList));
            })
        );
    }

    createFormatTemplate(libraryId: string, formatId: string, category: string): Observable<FormatTemplate> {
        return this.http.post<FormatTemplate>(`${this.serverConnection}/library/${libraryId}/format-template`, {
            formatId: formatId,
            category: category
        });
    }

    loadFormatTemplateFilesMeta(libraryId: string, formatTemplateId: string, queryParams?: IQueryParams) {
        return this.fileService.loadFilesMeta(`/library/${libraryId}/format-template/${formatTemplateId}`, queryParams);
    }

    getDownloadLink(libraryId: string, formatTemplateId: string, fileId: FileMeta['id'], download: boolean): Observable<FileMeta> {
        const queryParams: IQueryParams = { download: download };
        return this.fileService.getDownloadFileMeta(`/library/${libraryId}/format-template/${formatTemplateId}`, fileId, queryParams);
    }

    loadFormatTemplateKeyVisualMeta(libraryId: string, formatTemplateId: string, queryParams?: IQueryParams): Observable<FileMeta> {
        return this.fileService.loadKeyVisualMeta(`/library/${libraryId}/format-template/${formatTemplateId}`, queryParams).pipe(
            map((keyVisual: FileMeta) => {
                if (this.loadedFormatTemplateList) {
                    const formatTemplate = this.loadedFormatTemplateList.entities.find((t) => t.id === formatTemplateId);
                    if (formatTemplate) {
                        formatTemplate.keyVisual = keyVisual;
                    }
                }
                return cloneDeep(keyVisual);
            })
        );
    }
}
