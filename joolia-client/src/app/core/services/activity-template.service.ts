import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { Observable, Subject } from 'rxjs';
import { ActivityTemplate, FileMeta, List } from '../models';
import { map } from 'rxjs/operators';
import { FileService } from './file.service';
import { cloneDeep } from 'lodash-es';
import { IQueryParams, UtilService } from './util.service';

/**
 * The ActivityTemplateService handles all logic and http requests regarding activity templates.
 */
@Injectable()
export class ActivityTemplateService {
    activityTemplateChanged = new Subject<ActivityTemplate>();
    activityTemplateListChanged = new Subject<List<ActivityTemplate>>();

    private readonly serverConnection: string;

    private loadedActivityTemplateList: List<ActivityTemplate> = { count: 0, entities: [] };
    private loadedActivityTemplate: ActivityTemplate;

    constructor(private fileService: FileService, private http: HttpClient, private config: ConfigurationService) {
        this.serverConnection = this.config.getServerConnection();
    }

    getCurrentActivityTemplate() {
        return cloneDeep(this.loadedActivityTemplate);
    }

    loadActivityTemplates(libraryId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<ActivityTemplate>>(`${this.serverConnection}/library/${libraryId}/activity-template`, { params: httpParams })
            .pipe(
                map((activityTemplateList: List<ActivityTemplate>) => {
                    if (loadMore) {
                        this.loadedActivityTemplateList.count = activityTemplateList.count;
                        this.loadedActivityTemplateList.entities = this.loadedActivityTemplateList.entities.concat(
                            activityTemplateList.entities
                        );
                    } else {
                        this.loadedActivityTemplateList = activityTemplateList;
                    }
                    this.activityTemplateListChanged.next(cloneDeep(this.loadedActivityTemplateList));
                })
            );
    }

    loadAllActivityTemplates(queryParams?: IQueryParams): Observable<List<ActivityTemplate>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<List<ActivityTemplate>>(`${this.serverConnection}/activity-template`, { params: httpParams });
    }

    createActivityTemplate(libraryId: string, activityId: string, category: string): Observable<ActivityTemplate> {
        return this.http.post<ActivityTemplate>(`${this.serverConnection}/library/${libraryId}/activity-template`, {
            activityId: activityId,
            category: category
        });
    }

    loadActivityTemplate(libraryId: string, activityId: string, queryParams?: IQueryParams): Observable<ActivityTemplate> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<ActivityTemplate>(`${this.serverConnection}/library/${libraryId}/activity-template/${activityId}`, { params: httpParams })
            .pipe(
                map((activityTemplate: ActivityTemplate) => {
                    this.loadedActivityTemplate = activityTemplate;
                    this.activityTemplateChanged.next(this.loadedActivityTemplate);

                    return activityTemplate;
                })
            );
    }

    updateActivityTemplate(libraryId: string, templateId: string, category: string): Observable<void> {
        return this.http
            .patch<ActivityTemplate>(`${this.serverConnection}/library/${libraryId}/activity-template/${templateId}`, {
                category
            })
            .pipe(
                map((activityTemplate: ActivityTemplate) => {
                    if (this.loadedActivityTemplateList) {
                        this.loadedActivityTemplateList.entities = this.loadedActivityTemplateList.entities.map((t) => {
                            return t.id === activityTemplate.id ? Object.assign(t, activityTemplate) : t;
                        });

                        this.activityTemplateListChanged.next(cloneDeep(this.loadedActivityTemplateList));
                    }

                    if (this.loadedActivityTemplate) {
                        Object.assign(this.loadedActivityTemplate, activityTemplate);

                        this.activityTemplateChanged.next(this.loadedActivityTemplate);
                    }
                })
            );
    }

    deleteActivityTemplate(libraryId: string, activityTemplateId: string): Observable<void> {
        return this.http.delete(`${this.serverConnection}/library/${libraryId}/activity-template/${activityTemplateId}`).pipe(
            map(() => {
                this.loadedActivityTemplateList.entities = this.loadedActivityTemplateList.entities.filter(
                    (activityTemplate) => activityTemplate.id !== activityTemplateId
                );
                this.loadedActivityTemplateList.count--;
                this.activityTemplateListChanged.next(cloneDeep(this.loadedActivityTemplateList));
            })
        );
    }

    loadActivityTemplateFilesMeta(libraryId: string, activityTemplateId: string, queryParams?: IQueryParams) {
        return this.fileService.loadFilesMeta(`/library/${libraryId}/activity-template/${activityTemplateId}`, queryParams);
    }

    getDownloadLink(libraryId: string, activityTemplateId: string, fileId: FileMeta['id'], download: boolean): Observable<FileMeta> {
        const queryParams: IQueryParams = { download: download };
        return this.fileService.getDownloadFileMeta(`/library/${libraryId}/activity-template/${activityTemplateId}`, fileId, queryParams);
    }

    loadActivityTemplateKeyVisualMeta(libraryId: string, activityTemplateId: string, queryParams?: IQueryParams): Observable<FileMeta> {
        return this.fileService.loadKeyVisualMeta(`/library/${libraryId}/activity-template/${activityTemplateId}`, queryParams).pipe(
            map((keyVisual: FileMeta) => {
                if (this.loadedActivityTemplateList) {
                    const activityTemplate = this.loadedActivityTemplateList.entities.find((t) => t.id === activityTemplateId);
                    if (activityTemplate) {
                        activityTemplate.keyVisual = keyVisual;
                    }
                }
                return cloneDeep(keyVisual);
            })
        );
    }
}
