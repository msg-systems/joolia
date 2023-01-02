import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { Activity, FileMeta, Link, LinkEntry, List, Phase, Step } from '../models';
import { UploadFile, UploadOutput } from 'ngx-uploader';
import { NgxUploadService } from './ngx-upload.service';
import { FileService } from './file.service';
import { cloneDeep } from 'lodash-es';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams, UtilService } from './util.service';
import { NgxOutputEvents } from '../enum/global/upload.enum';
import { FileUsage } from '../enum/global/file-usage.enum';
import * as moment from 'moment';

/**
 * The ActivityService handles all http requests regarding loading and actions on activities on the currently loaded format and phase (saved
 * in the FormatService and PhaseService).
 */
@Injectable({
    providedIn: 'root'
})
export class ActivityService {
    activityChanged = new Subject<Activity>();
    activityListChanged = new Subject<List<Activity>>();

    private readonly serverConnection: string;

    private loadedActivity: Activity;
    private loadedActivityList: List<Activity> = { count: 0, entities: [] };

    constructor(
        private http: HttpClient,
        private fileService: FileService,
        private config: ConfigurationService,
        private translate: TranslateService,
        private ngxUploadService: NgxUploadService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    unsetLoadedActivity() {
        this.loadedActivity = null;

        this.activityChanged.next(this.loadedActivity);
    }

    loadActivities(formatId: string, phaseId: string, queryParams?: IQueryParams): Observable<List<Activity>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<Activity>>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity`, { params: httpParams })
            .pipe(
                map((activityList: List<Activity>) => {
                    this.loadedActivityList = activityList;

                    this.activityListChanged.next(this.loadedActivityList);

                    return this.loadedActivityList;
                })
            );
    }

    loadActivity(formatId: string, phaseId: string, id: string, queryParams?: IQueryParams): Observable<Activity> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<Activity>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${id}`, { params: httpParams })
            .pipe(
                map((activity: Activity) => {
                    this.loadedActivity = activity;
                    this.loadedActivity.files = activity.files || [];
                    this.loadedActivity.collaborationLinks = activity.collaborationLinks || [];
                    this.loadedActivity.configuration.blocked = true;
                    this.activityChanged.next(this.loadedActivity);

                    return activity;
                })
            );
    }

    loadActivityDetails(formatId: string, phaseId: string, activityId: string): Observable<Partial<Activity>> {
        return this.http
            .get<Partial<Activity>>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/_details`)
            .pipe(
                map((activity: Partial<Activity>) => {
                    this.loadedActivity.submissionCount = activity.submissionCount;
                    this.loadedActivity.stepCount = activity.stepCount;
                    this.loadedActivity.configuration.blocked = activity.configuration.blocked;
                    return activity;
                })
            );
    }

    loadSteps(formatId: string, phaseId: string, id: string, queryParams?: IQueryParams): Observable<List<Step>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<Step>>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${id}/step`, { params: httpParams })
            .pipe(
                map((stepList: List<Step>) => {
                    if (this.loadedActivity) {
                        this.loadedActivity.steps = stepList;
                        this.activityChanged.next(this.loadedActivity);
                    }
                    return stepList;
                })
            );
    }

    getCurrentActivity() {
        return this.loadedActivity;
    }

    createActivity(formatId: string, phaseId: string, body: Partial<Activity>): Observable<Activity> {
        return this.http.post<Activity>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity`, body).pipe(
            map((createdActivity: Activity) => {
                this.addActivity(createdActivity, body.position);

                return createdActivity;
            })
        );
    }

    createActivityFromTemplate(formatId: string, phaseId: string, activityTemplateId: string, position: number): Observable<Activity> {
        return this.http
            .post<Activity>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/_template`, {
                activityTemplateId,
                position
            })
            .pipe(
                map((createdActivity: Activity) => {
                    this.addActivity(createdActivity, position);

                    return createdActivity;
                })
            );
    }

    createStep(formatId: string, phaseId: string, body: Partial<Step>): Observable<Step> {
        const activity = this.getCurrentActivity();

        return this.http.post<Step>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activity.id}/step`, body).pipe(
            map((createdStep: Step) => {
                if (this.loadedActivity) {
                    // concat instead of push triggers change detection
                    this.loadedActivity.steps.entities = this.loadedActivity.steps.entities.concat([createdStep]);
                    this.loadedActivity.steps.count++;

                    this.activityChanged.next(this.loadedActivity);
                }

                return createdStep;
            })
        );
    }

    updateActivity(formatId: string, phaseId: string, id: string, updatedBody: Partial<Activity>): Observable<void> {
        if (updatedBody.name === '') {
            updatedBody.name = this.translate.instant('labels.untitledActivity');
        }

        return this.http.patch<Activity>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${id}`, updatedBody).pipe(
            map((respondedActivity: Activity) => {
                if (this.loadedActivityList) {
                    this.loadedActivityList.entities = this.loadedActivityList.entities.map((activity) => {
                        return activity.id === respondedActivity.id ? Object.assign(activity, respondedActivity) : activity;
                    });

                    this.activityListChanged.next(cloneDeep(this.loadedActivityList));
                }

                if (this.loadedActivity) {
                    Object.assign(this.loadedActivity, respondedActivity);

                    this.activityChanged.next(this.loadedActivity);
                }
            })
        );
    }

    updateStep(formatId: string, phaseId: string, id: string, updateBody: Partial<Step>): Observable<void> {
        const activity = this.getCurrentActivity();

        return this.http
            .patch<Step>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activity.id}/step/${id}`, updateBody)
            .pipe(
                map((respondedStep: Step) => {
                    if (this.loadedActivity) {
                        this.loadedActivity.steps.entities = this.loadedActivity.steps.entities.map((step) => {
                            return step.id === respondedStep.id ? Object.assign(step, respondedStep) : step;
                        });

                        this.activityChanged.next(this.loadedActivity);
                    }
                })
            );
    }

    updateStepChecked(formatId: string, phaseId: string, stepId: string, body: any): Observable<void> {
        const activity = this.getCurrentActivity();

        return this.http
            .post<any>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activity.id}/step/${stepId}/_check`, body)
            .pipe(
                map((respondedStep) => {
                    if (this.loadedActivity) {
                        this.loadedActivity.steps.entities = this.loadedActivity.steps.entities.map((step) => {
                            if (step.id === stepId) {
                                step.checkedBy = respondedStep.done
                                    ? step.checkedBy.concat([respondedStep.checkedById])
                                    : step.checkedBy.filter((id) => id !== respondedStep.checkedById);
                            }
                            return step;
                        });

                        this.activityChanged.next(this.loadedActivity);
                    }
                })
            );
    }

    updateActivityPosition(formatId: string, phaseId: string, id: string, updatedPosition: number): Observable<void> {
        return this.http
            .patch<Activity>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${id}/_position`, {
                position: updatedPosition
            })
            .pipe(
                map(() => {
                    if (this.loadedActivityList) {
                        const updatedActivity = this.loadedActivityList.entities.find((activity) => activity.id === id);

                        this.loadedActivityList.entities = this.loadedActivityList.entities.filter((activity) => activity.id !== id);
                        this.loadedActivityList.entities.splice(updatedPosition, 0, updatedActivity);

                        this.activityListChanged.next(this.loadedActivityList);
                    }
                })
            );
    }

    deleteActivity(formatId: string, phaseId: string, id: string): Observable<void> {
        return this.http.delete(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${id}`).pipe(
            map(() => {
                if (this.loadedActivityList) {
                    this.loadedActivityList.entities = this.loadedActivityList.entities.filter((activity) => activity.id !== id);
                    this.loadedActivityList.count--;

                    this.activityListChanged.next(this.loadedActivityList);
                }
            })
        );
    }

    deleteStep(formatId: string, phaseId: string, id: string): Observable<void> {
        const activity = this.getCurrentActivity();

        return this.http.delete(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activity.id}/step/${id}`).pipe(
            map(() => {
                if (this.loadedActivity) {
                    this.loadedActivity.steps.entities = this.loadedActivity.steps.entities.filter((step) => step.id !== id);
                    this.loadedActivity.steps.count--;

                    this.activityChanged.next(this.loadedActivity);
                }
            })
        );
    }

    addActivity(activity: Activity, position: number) {
        if (this.loadedActivityList) {
            this.loadedActivityList.entities.splice(position, 0, activity);
            this.loadedActivityList.count++;

            this.activityListChanged.next(this.loadedActivityList);
        }
    }

    loadActivityFilesMeta(formatId: string, phaseId: string, queryParams?: IQueryParams) {
        const activity = this.getCurrentActivity();
        return this.fileService.loadFilesMeta(`/format/${formatId}/phase/${phaseId}/activity/${activity.id}`, queryParams).pipe(
            map((files) => {
                files = files.length > 0 ? this.ngxUploadService.getUploadProgressForFiles(files) : files;
                return files;
            })
        );
    }

    loadActivityFileMeta(formatId: string, phaseId: string, fileId: FileMeta['id'], queryParams?: IQueryParams) {
        const activity = this.getCurrentActivity();
        return this.fileService.loadFileMeta(`/format/${formatId}/phase/${phaseId}/activity/${activity.id}`, fileId, queryParams);
    }

    loadActivityKeyVisualMeta(formatId: string, phaseId: string, activityId: string, queryParams?: IQueryParams) {
        const activity = this.getCurrentActivity();
        return this.fileService.loadKeyVisualMeta(`/format/${formatId}/phase/${phaseId}/activity/${activity.id}`, queryParams);
    }

    getDownloadLink(formatId: string, phaseId: string, fileId: FileMeta['id'], download: boolean) {
        const activity = this.getCurrentActivity();

        const queryParams: IQueryParams = { download: download };

        return this.fileService
            .getDownloadFileMeta(`/format/${formatId}/phase/${phaseId}/activity/${activity.id}`, fileId, queryParams)
            .subscribe((downloadMeta) => {
                this.loadedActivity.files = this.loadedActivity.files.map((file) => {
                    if (file.id === fileId) {
                        if (download) {
                            file.downloadUrl = downloadMeta.fileUrl;
                        } else {
                            file.tabUrl = downloadMeta.fileUrl;
                        }
                    }
                    return file;
                });
            });
    }

    onSubmissionsLoaded(activityId: string, submissionCount: number) {
        if (activityId === this.loadedActivity.id && submissionCount !== undefined) {
            this.loadedActivity.submissionCount = submissionCount;
            this.activityChanged.next(this.loadedActivity);
        }
    }

    onSubmissionCreated(activityId: string) {
        if (activityId === this.loadedActivity.id) {
            this.loadedActivity.submissionCount = this.loadedActivity.submissionCount ? ++this.loadedActivity.submissionCount : 1;
            this.activityChanged.next(this.loadedActivity);
        }
    }

    onSubmissionDeleted(activityId: string) {
        if (activityId === this.loadedActivity.id) {
            this.loadedActivity.submissionCount =
                this.loadedActivity.submissionCount && this.loadedActivity.submissionCount > 0 ? --this.loadedActivity.submissionCount : 0;
            this.activityChanged.next(this.loadedActivity);
        }
    }

    updateFile(formatId: string, phaseId: string, fileId: FileMeta['id'], body: Partial<FileMeta>) {
        const activity = this.getCurrentActivity();

        return this.fileService.updateFile(`/format/${formatId}/phase/${phaseId}/activity/${activity.id}`, fileId, body).pipe(
            map((updatedMeta: FileMeta) => {
                this.loadedActivity.files = this.loadedActivity.files.map((file) => {
                    if (file.id === updatedMeta.id) {
                        Object.assign(file, updatedMeta);
                    }

                    return file;
                });
                this.activityChanged.next(this.loadedActivity);
            })
        );
    }

    deleteFile(ngxUS: NgxUploadService, formatId: string, phaseId: string, fileId: FileMeta['id']) {
        if (this.loadedActivity.files.find((file) => file.id === fileId).upload) {
            ngxUS.abortFileUpload(this.loadedActivity.files.find((file) => file.id === fileId));
            this.loadedActivity.files = this.loadedActivity.files.filter((file) => file.id !== fileId);
        }

        const activity = this.getCurrentActivity();

        // delete file from entity
        return this.fileService.deleteFile(`/format/${formatId}/phase/${phaseId}/activity/${activity.id}`, fileId).pipe(
            map(() => {
                this.loadedActivity.files = this.loadedActivity.files.filter((file) => file.id !== fileId);
                this.activityChanged.next(this.loadedActivity);
            })
        );
    }

    onUploadOutput(ngxUS: NgxUploadService, formatId: string, phaseId: string, output: UploadOutput) {
        if (output.type === NgxOutputEvents.ALLADDEDTOQUEUE) {
            const activity = this.getCurrentActivity();

            const parent = `/format/${formatId}/phase/${phaseId}/activity/${activity.id}`;
            const result = ngxUS['on' + output.type](output, this.loadedActivity.files, parent);
        } else {
            const result = ngxUS['on' + output.type](output, this.loadedActivity.files);

            if (
                output.type === NgxOutputEvents.REMOVEDALL ||
                output.type === NgxOutputEvents.REMOVED ||
                output.type === NgxOutputEvents.UPLOADING ||
                output.type === NgxOutputEvents.ADDEDTOQUEUE
            ) {
                this.loadedActivity.files = result;
            } else if (output.type === NgxOutputEvents.DONE) {
                this.loadedActivity.files.forEach((f) => {
                    if (f.upload && f.upload.id === output.file.id) {
                        f.upload = <UploadFile>{};
                    }
                });
            }
        }
    }

    onKeyVisualUploadOutput(parent: string, ngxUS: NgxUploadService, output: UploadOutput) {
        switch (output.type) {
            case NgxOutputEvents.ALLADDEDTOQUEUE:
                ngxUS.onallAddedToQueue(
                    output,
                    [
                        {
                            id: output.file.id,
                            name: output.file.name,
                            upload: output.file,
                            fileUsage: FileUsage.KEYVISUAL
                        } as FileMeta
                    ],
                    parent
                );
                break;
            case NgxOutputEvents.DONE:
                ngxUS.ondone(output, []);
                const splitParent = parent.split('/format/')[1].split('/phase/');
                const formatId = splitParent[0];
                const phaseId = splitParent[1].split('/activity')[0];
                this.loadActivityKeyVisualMeta(formatId, phaseId, this.loadedActivity.id).subscribe((keyVisual) => {
                    this.loadedActivity.keyVisual = keyVisual;
                    this.activityChanged.next(this.loadedActivity);
                });
                break;
            case NgxOutputEvents.REJECTED:
                ngxUS.onrejected(output, []);
                break;
        }
    }

    uploadKeyVisualLink(parent: string, body: any) {
        return this.http.put<any>(`${this.serverConnection}${parent}/keyvisual`, body).pipe(
            map((keyVisual: Link) => {
                this.loadedActivity.keyVisual = keyVisual;
                this.activityChanged.next(this.loadedActivity);
            })
        );
    }

    addCollaborationLink(formatId: string, phaseId: string, link: LinkEntry) {
        this.updateActivity(formatId, phaseId, this.loadedActivity.id, { collaborationLinks: [link] } as Partial<Activity>).subscribe();
    }

    deleteCollaborationLink(formatId: string, phaseId: string, linkId: string) {
        this.updateActivity(formatId, phaseId, this.loadedActivity.id, {
            collaborationLinks: [
                {
                    id: linkId,
                    linkUrl: null
                }
            ] as LinkEntry[]
        } as Partial<Activity>).subscribe();
    }

    loadCurrentActivities(formatId: string, phase: Phase, queryParams?: IQueryParams): Observable<Activity[]> {
        if (!queryParams) {
            queryParams = {};
        }
        queryParams.order = 'position';
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<Activity>>(`${this.serverConnection}/format/${formatId}/phase/${phase.id}/activity`, { params: httpParams })
            .pipe(
                map((activities: List<Activity>) => {
                    const durationUnit = phase.durationUnit;
                    const startDate = moment(phase.startDate);
                    const activitiesWithDates = activities.entities.map((activity: Activity) => {
                        const a: any = {
                            id: activity.id
                        };
                        a.startDate = moment(startDate);
                        const duration = moment.duration({ [durationUnit]: activity.duration });
                        startDate.add(duration);
                        a.endDate = moment(startDate);
                        return a;
                    });
                    const activeActivities: any[] = activitiesWithDates.filter((a: any) => {
                        return a.startDate.diff(moment()) <= 0 && a.endDate.diff(moment()) > 0;
                    });
                    if (activeActivities.length > 0) {
                        return activities.entities.filter((activity: Activity) => activeActivities.find((a: any) => a.id === activity.id));
                    } else {
                        const plannedActivities: any[] = activitiesWithDates.filter((a: any) => {
                            return a.startDate.diff(moment()) > 0;
                        });
                        return plannedActivities.length > 0
                            ? [activities.entities.find((activity: Activity) => plannedActivities[0].id === activity.id)]
                            : [];
                    }
                })
            );
    }
}
