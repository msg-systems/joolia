import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileMeta, PhaseTemplate, List, User, FormatTemplate } from '../models';
import { FileService } from './file.service';
import { cloneDeep } from 'lodash-es';
import { IQueryParams, UtilService } from './util.service';

/**
 * The PhaseTemplateService handles all logic and http requests regarding phase templates.
 */
@Injectable()
export class PhaseTemplateService {
    phaseTemplateListChanged = new Subject<List<PhaseTemplate>>();
    phaseTemplateChanged = new Subject<PhaseTemplate>();

    private readonly serverConnection: string;

    private loadedPhaseTemplateList: List<PhaseTemplate> = { count: 0, entities: [] };
    private loadedPhaseTemplate: PhaseTemplate;

    constructor(private fileService: FileService, private http: HttpClient, private config: ConfigurationService) {
        this.serverConnection = this.config.getServerConnection();
    }

    getCurrentPhaseTemplate() {
        return cloneDeep(this.loadedPhaseTemplate);
    }

    loadPhaseTemplates(libraryId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<PhaseTemplate>>(`${this.serverConnection}/library/${libraryId}/phase-template`, { params: httpParams })
            .pipe(
                map((phaseTemplateList: List<PhaseTemplate>) => {
                    if (loadMore) {
                        this.loadedPhaseTemplateList.count = phaseTemplateList.count;
                        this.loadedPhaseTemplateList.entities = this.loadedPhaseTemplateList.entities.concat(phaseTemplateList.entities);
                    } else {
                        this.loadedPhaseTemplateList = phaseTemplateList;
                    }
                    this.phaseTemplateListChanged.next(cloneDeep(this.loadedPhaseTemplateList));
                })
            );
    }

    loadAllPhaseTemplates(queryParams?: IQueryParams): Observable<List<PhaseTemplate>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<List<PhaseTemplate>>(`${this.serverConnection}/phase-template`, { params: httpParams });
    }

    loadPhaseTemplate(libraryId: string, templateId: string, queryParams?: IQueryParams): Observable<PhaseTemplate> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<PhaseTemplate>(`${this.serverConnection}/library/${libraryId}/phase-template/${templateId}`, { params: httpParams })
            .pipe(
                map((phaseTemplate: PhaseTemplate) => {
                    this.loadedPhaseTemplate = phaseTemplate;
                    this.phaseTemplateChanged.next(cloneDeep(phaseTemplate));

                    return phaseTemplate;
                })
            );
    }

    updatePhaseTemplate(libraryId: string, templateId: string, category: string): Observable<void> {
        return this.http
            .patch<PhaseTemplate>(`${this.serverConnection}/library/${libraryId}/phase-template/${templateId}`, {
                category
            })
            .pipe(
                map((phaseTemplate: PhaseTemplate) => {
                    if (this.loadedPhaseTemplateList) {
                        this.loadedPhaseTemplateList.entities = this.loadedPhaseTemplateList.entities.map((t) => {
                            return t.id === phaseTemplate.id ? Object.assign(t, phaseTemplate) : t;
                        });

                        this.phaseTemplateListChanged.next(cloneDeep(this.loadedPhaseTemplateList));
                    }

                    if (this.loadedPhaseTemplate) {
                        Object.assign(this.loadedPhaseTemplate, phaseTemplate);

                        this.phaseTemplateChanged.next(this.loadedPhaseTemplate);
                    }
                })
            );
    }

    deletePhaseTemplate(libraryId: string, phaseTemplateId: string): Observable<void> {
        return this.http.delete(`${this.serverConnection}/library/${libraryId}/phase-template/${phaseTemplateId}`).pipe(
            map(() => {
                this.loadedPhaseTemplateList.entities = this.loadedPhaseTemplateList.entities.filter(
                    (activityTemplate) => activityTemplate.id !== phaseTemplateId
                );
                this.loadedPhaseTemplateList.count--;
                this.phaseTemplateListChanged.next(cloneDeep(this.loadedPhaseTemplateList));
            })
        );
    }

    createPhaseTemplate(libraryId: string, phaseId: string, category: string): Observable<PhaseTemplate> {
        return this.http.post<PhaseTemplate>(`${this.serverConnection}/library/${libraryId}/phase-template`, {
            phaseId: phaseId,
            category: category
        });
    }

    loadPhaseTemplateFilesMeta(libraryId: string, phaseTemplateId: string, queryParams?: IQueryParams) {
        return this.fileService.loadFilesMeta(`/library/${libraryId}/phase-template/${phaseTemplateId}`, queryParams);
    }

    getDownloadLink(libraryId: string, phaseTemplateId: string, fileId: FileMeta['id'], download: boolean): Observable<FileMeta> {
        const queryParams: IQueryParams = { download: download };
        return this.fileService.getDownloadFileMeta(`/library/${libraryId}/phase-template/${phaseTemplateId}`, fileId, queryParams);
    }
}
