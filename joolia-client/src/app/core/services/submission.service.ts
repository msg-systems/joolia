import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UploadFile, UploadOutput } from 'ngx-uploader';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxOutputEvents } from '../enum/global/upload.enum';
import { FileMeta, List, Submission } from '../models';
import { ActivityService } from './activity.service';
import { ConfigurationService } from './configuration.service';
import { FileService } from './file.service';
import { FormatService } from './format.service';
import { NgxUploadService } from './ngx-upload.service';
import { PhaseService } from './phase.service';
import { IQueryParams, UtilService } from './util.service';

@Injectable()
export class SubmissionService {
    submissionChanged = new Subject<Submission>();
    submissionListChanged = new Subject<List<Submission>>();

    private readonly serverConnection: string;

    private loadedSubmission: Submission;
    private loadedSubmissionList: List<Submission> = { count: 0, entities: [] };

    constructor(
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private http: HttpClient,
        private fileService: FileService,
        private config: ConfigurationService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    loadSubmissionsOfFormat(formatId: string, queryParams?: IQueryParams): Observable<List<Submission>> {
        return this.loadSubmissions(`${this.serverConnection}/format/${formatId}/submission`, queryParams);
    }

    loadFormatSubmissionFilterValues(formatId: string): Observable<{ users: string[]; teams: string[]; phases: string[] }> {
        return this.http.get<{ users: string[]; teams: string[]; phases: string[] }>(
            `${this.serverConnection}/format/${formatId}/submission/_filterValues`
        );
    }

    loadSubmissionsOfTeam(formatId: string, teamId: string, queryParams?: IQueryParams): Observable<List<Submission>> {
        return this.loadSubmissions(`${this.serverConnection}/format/${formatId}/team/${teamId}/submission`, queryParams);
    }

    loadSubmissionsOfActivity(
        formatId: string,
        phaseId: string,
        activityId: string,
        queryParams?: IQueryParams
    ): Observable<List<Submission>> {
        return this.loadSubmissions(
            `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission`,
            queryParams
        );
    }

    loadSubmission(submissionId: string, queryParams?: IQueryParams): Observable<Submission> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        const format = this.formatService.getCurrentFormat();
        const phase = this.phaseService.getCurrentPhase();
        const activity = this.activityService.getCurrentActivity();

        return this.http
            .get<Submission>(
                `${this.serverConnection}/format/${format.id}/phase/${phase.id}/activity/${activity.id}/submission/${submissionId}`,
                { params: httpParams }
            )
            .pipe(
                map((submission: Submission) => {
                    this.loadedSubmission = submission;

                    this.submissionChanged.next(this.loadedSubmission);

                    return submission;
                })
            );
    }

    createSubmission(formatId: string, phaseId: string, activityId: string, body: any): Observable<Submission> {
        return this.http
            .post<Submission>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission`, body)
            .pipe(
                map((createdSubmission: Submission) => {
                    if (this.loadedSubmissionList) {
                        this.loadedSubmissionList.entities = this.loadedSubmissionList.entities.concat([createdSubmission]);
                        this.loadedSubmissionList.count++;

                        this.submissionListChanged.next(this.loadedSubmissionList);
                    }
                    // this is necessary for following file upload
                    this.loadedSubmission = createdSubmission;
                    return createdSubmission;
                })
            );
    }

    getCurrentSubmission() {
        return this.loadedSubmission;
    }

    updateSubmission(formatId: string, phaseId: string, activityId: string, submissionId: string, updatedBody: Partial<Submission>) {
        return this.http
            .patch<Submission>(
                `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/${submissionId}`,
                updatedBody
            )
            .pipe(
                map((respondedSubmission: Submission) => {
                    if (this.loadedSubmissionList) {
                        this.loadedSubmissionList.entities = this.loadedSubmissionList.entities.map((submission) => {
                            return submission.id === respondedSubmission.id ? Object.assign(submission, respondedSubmission) : submission;
                        });

                        this.submissionListChanged.next(this.loadedSubmissionList);
                    }

                    if (this.loadedSubmission) {
                        Object.assign(this.loadedSubmission, respondedSubmission);

                        this.submissionChanged.next(this.loadedSubmission);
                    }
                })
            );
    }

    deleteSubmission(formatId: string, phaseId: string, activityId: string, submissionId: string) {
        return this.http
            .delete(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/${submissionId}`)
            .pipe(
                map(() => {
                    if (this.loadedSubmissionList) {
                        this.loadedSubmissionList.entities = this.loadedSubmissionList.entities.filter(
                            (submission) => submission.id !== submissionId
                        );
                        this.loadedSubmissionList.count--;

                        this.submissionListChanged.next(this.loadedSubmissionList);
                    }
                })
            );
    }

    getDownloadLink(formatId: string, phaseId: string, activityId: string, fileId: FileMeta['id'], download: boolean) {
        const submission = this.getCurrentSubmission();

        return this.getDownloadFile(formatId, phaseId, activityId, submission.id, fileId, download).subscribe((downloadMeta: FileMeta) => {
            this.loadedSubmission.files = this.loadedSubmission.files.map((file) => {
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

    getDownloadFile(
        formatId: string,
        phaseId: string,
        activityId: string,
        submissionId: string,
        fileId: FileMeta['id'],
        download: boolean
    ) {
        const queryParams: IQueryParams = { download: download };

        return this.fileService.getDownloadFileMeta(
            `/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/${submissionId}`,
            fileId,
            queryParams
        );
    }

    loadSubmissionFilesMeta(formatId: string, phaseId: string, activityId: string, submissionId: string, queryParams?: IQueryParams) {
        return this.fileService.loadFilesMeta(
            `/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/${submissionId}`,
            queryParams
        );
    }

    updateFile(formatId: string, phaseId: string, activityId: string, fileId: FileMeta['id'], body: Partial<FileMeta>) {
        const submission = this.getCurrentSubmission();
        const parent = `/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/${submission.id}`;

        return this.fileService.updateFile(parent, fileId, body).pipe(
            map((updatedMeta: FileMeta) => {
                this.loadedSubmission.files = this.loadedSubmission.files.map((file) => {
                    if (file.id === updatedMeta.id) {
                        Object.assign(file, updatedMeta);
                    }

                    return file;
                });
                this.submissionChanged.next(this.loadedSubmission);
            })
        );
    }

    deleteFile(ngxUS: NgxUploadService, formatId: string, phaseId: string, activityId: string, fileId: FileMeta['id']) {
        if (this.loadedSubmission.files.find((file) => file.id === fileId).upload) {
            ngxUS.abortFileUpload(this.loadedSubmission.files.find((file) => file.id === fileId));
            this.loadedSubmission.files = this.loadedSubmission.files.filter((file) => file.id !== fileId);
        }
        // delete file from entity
        const submission = this.getCurrentSubmission();
        const parent = `/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/${submission.id}`;
        return this.fileService.deleteFile(parent, fileId).pipe(
            map(() => {
                this.loadedSubmission.files = this.loadedSubmission.files.filter((file) => file.id !== fileId);
                this.submissionChanged.next(this.loadedSubmission);
            })
        );
    }

    onUploadOutput(ngxUS: NgxUploadService, formatId: string, phaseId: string, activityId: string, output: UploadOutput) {
        if (output.type === NgxOutputEvents.ALLADDEDTOQUEUE) {
            const submission = this.getCurrentSubmission();
            const parent = `/format/${formatId}/phase/${phaseId}/activity/${activityId}/submission/${submission.id}`;
            const result = ngxUS['on' + output.type](output, this.loadedSubmission.files, parent);
        } else {
            const result = ngxUS['on' + output.type](output, this.loadedSubmission.files);

            if (
                output.type === NgxOutputEvents.REMOVEDALL ||
                output.type === NgxOutputEvents.REMOVED ||
                output.type === NgxOutputEvents.UPLOADING ||
                output.type === NgxOutputEvents.ADDEDTOQUEUE
            ) {
                this.loadedSubmission.files = result;
            }

            if (output.type === NgxOutputEvents.DONE) {
                this.loadedSubmission.files.forEach((f) => {
                    if (f.upload && f.upload.id === output.file.id) {
                        f.upload = <UploadFile>{};
                    }
                });
            }
        }
    }

    private loadSubmissions(url: string, queryParams?: IQueryParams): Observable<List<Submission>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<Submission>>(url, { params: httpParams })
            .pipe(
                map((submissionList: List<Submission>) => {
                    this.loadedSubmissionList = submissionList;
                    this.submissionListChanged.next(this.loadedSubmissionList);

                    return submissionList;
                })
            );
    }

    getAverageRating(submissionId: string): Observable<number> {
        // TODO replace this when pushback feature is implemented
        const queryParams: IQueryParams = {
            select: 'id,averageRating'
        };
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        const format = this.formatService.getCurrentFormat();
        const phase = this.phaseService.getCurrentPhase();
        const activity = this.activityService.getCurrentActivity();

        return this.http
            .get<Submission>(
                `${this.serverConnection}/format/${format.id}/phase/${phase.id}/activity/${activity.id}/submission/${submissionId}`,
                { params: httpParams }
            )
            .pipe(
                map((submission: Submission) => {
                    if (this.loadedSubmission && this.loadedSubmission.id === submissionId) {
                        this.loadedSubmission.averageRating = submission.averageRating;
                    }

                    return submission.averageRating;
                })
            );
    }
}
