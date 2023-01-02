import { Injectable } from '@angular/core';
import { Canvas, CanvasSubmission, List, Slot } from '../models';
import { AbstractService } from './abstract.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { IQueryParams, UtilService } from './util.service';
import { ActivityService } from './activity.service';
import { FormatService } from './format.service';
import { PhaseService } from './phase.service';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { LoggerService } from './logger.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class CanvasService extends AbstractService {
    canvasChanged = new Subject<Canvas>();
    canvasListChanged = new Subject<List<Canvas>>();

    private loadedCanvas: Canvas;
    private loadedCanvasList: List<Canvas> = { count: 0, entities: [] };

    constructor(
        http: HttpClient,
        config: ConfigurationService,
        protected authenticationService: AuthenticationService,
        protected logger: LoggerService,
        private activityService: ActivityService,
        private phaseService: PhaseService,
        private formatService: FormatService,
        private translate: TranslateService
    ) {
        super(http, config);
    }

    public createCanvas(body: Partial<Canvas>): Observable<Canvas> {
        const [formatId, phaseId, activityId] = this.getIds();
        return this.http
            .post<Canvas>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas`, body)
            .pipe(
                map((createdCanvas: Canvas) => {
                    this.loadedCanvasList.entities.push(createdCanvas);
                    this.loadedCanvasList.count++;
                    this.canvasListChanged.next(this.loadedCanvasList);
                    return createdCanvas;
                })
            );
    }

    public loadCanvasList(queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        const [formatId, phaseId, activityId] = this.getIds();

        return this.http
            .get<List<Canvas>>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas`, {
                params: httpParams
            })
            .pipe(
                map((canvases: List<Canvas>) => {
                    this.loadedCanvasList = canvases;
                    this.canvasListChanged.next(this.loadedCanvasList);
                })
            );
    }

    public loadCanvas(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        queryParams?: IQueryParams
    ): Observable<Canvas> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<Canvas>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}`, {
                params: httpParams
            })
            .pipe(
                map((canvas: Canvas) => {
                    this.loadedCanvas = canvas;
                    this.canvasChanged.next(this.loadedCanvas);

                    return this.loadedCanvas;
                })
            );
    }

    public updateCanvas(formatId: string, phaseId: string, activityId: string, canvasId: string, body: any): Observable<void> {
        if (body.name !== undefined && body.name === '') {
            body.name = this.translate.instant('labels.untitledCanvas');
        }
        return this.http
            .patch<Canvas>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}`, body)
            .pipe(
                map((canvas: Canvas) => {
                    this.loadedCanvas = Object.assign({}, this.loadedCanvas, canvas);
                    this.canvasChanged.next(this.loadedCanvas);
                })
            );
    }

    public deleteCanvas(canvasId: string): Observable<void> {
        const [formatId, phaseId, activityId] = this.getIds();

        return this.http
            .delete(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}`)
            .pipe(
                map(() => {
                    if (this.loadedCanvasList) {
                        this.loadedCanvasList.entities = this.loadedCanvasList.entities.filter((canvas) => canvas.id !== canvasId);
                        this.loadedCanvasList.count--;
                    }
                    this.canvasListChanged.next(this.loadedCanvasList);
                })
            );
    }

    public updateSlot(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        slotId: string,
        body: any
    ): Observable<void> {
        return this.http
            .patch<Slot>(
                `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/slot/${slotId}`,
                body
            )
            .pipe(
                map((updatedSlot: Slot) => {
                    if (this.loadedCanvas.slots) {
                        const slot = this.loadedCanvas.slots.find((s) => s.id === slotId);
                        if (slot) {
                            Object.assign(slot, updatedSlot);
                            this.canvasChanged.next(this.loadedCanvas);
                        }
                    }
                })
            );
    }

    public createSubmission(formatId: string, phaseId: string, activityId: string, canvasId: string, slotId: string, body: any) {
        return this.http
            .post<CanvasSubmission>(
                `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/` +
                    `slot/${slotId}/submission`,
                body
            )
            .pipe(
                map((submission: CanvasSubmission) => {
                    if (this.loadedCanvas.slots) {
                        const slot = this.loadedCanvas.slots.find((s) => s.id === slotId);
                        if (slot) {
                            slot.submissions.push(submission);
                            this.canvasChanged.next(this.loadedCanvas);
                        }
                    }
                    return submission;
                })
            );
    }

    public updateSubmission(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        slotId: string,
        submissionId: string,
        body: any
    ) {
        return this.http.patch<CanvasSubmission>(
            `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/` +
                `slot/${slotId}/submission/${submissionId}`,
            body
        );
    }

    public voteSubmission(formatId: string, phaseId: string, activityId: string, canvasId: string, slotId: string, submissionId: string) {
        return this.http.post<void>(
            `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/` +
                `slot/${slotId}/submission/${submissionId}/vote`,
            null
        );
    }

    public removeVoteSubmission(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        slotId: string,
        submissionId: string
    ) {
        return this.http.delete<void>(
            `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/` +
                `slot/${slotId}/submission/${submissionId}/vote`
        );
    }

    public loadSubmissions(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        queryParams?: IQueryParams
    ): Observable<List<CanvasSubmission>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<CanvasSubmission>>(
                `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/submission`,
                { params: httpParams }
            )
            .pipe(
                map((submissions: List<CanvasSubmission>) => {
                    this.loadedCanvas.slots.forEach((slot: Slot) => {
                        slot.submissions = submissions.entities.filter((s) => s.slotId === slot.id);
                    });
                    this.canvasChanged.next(this.loadedCanvas);
                    return submissions;
                })
            );
    }

    public deleteSubmission(formatId: string, phaseId: string, activityId: string, canvasId: string, slotId: string, submissionId: string) {
        return this.http
            .delete<void>(
                `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/` +
                    `slot/${slotId}/submission/${submissionId}`
            )
            .pipe(
                map(() => {
                    const slot = this.loadedCanvas.slots.find((s) => s.id === slotId);
                    slot.submissions = slot.submissions.filter((sub) => sub.id !== submissionId);
                }),
                tap({
                    next: () => this.canvasChanged.next(this.loadedCanvas)
                })
            );
    }

    public deleteSlot(formatId: string, phaseId: string, activityId: string, canvasId: string, slotId: string) {
        return this.http
            .delete<void>(
                `${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/slot/${slotId}`
            )
            .pipe(
                map(() => {
                    this.loadedCanvas.slots = this.loadedCanvas.slots.filter((s) => s.id !== slotId);
                }),
                tap({
                    next: () => this.canvasChanged.next(this.loadedCanvas)
                })
            );
    }

    createSlot(formatId: string, phaseId: string, activityId: string, canvasId: string, body): Observable<void> {
        return this.http
            .post<Slot>(`${this.serverConnection}/format/${formatId}/phase/${phaseId}/activity/${activityId}/canvas/${canvasId}/slot`, body)
            .pipe(
                map((newSlot) => {
                    const tempSlot = this.loadedCanvas.slots.findIndex((s) => !s.hasOwnProperty('id'));
                    Object.assign(this.loadedCanvas.slots[tempSlot], newSlot);
                }),
                tap({
                    next: () => this.canvasChanged.next(this.loadedCanvas)
                })
            );
    }

    private getIds(): [string, string, string] {
        return [
            this.formatService.getCurrentFormat().id,
            this.phaseService.getCurrentPhase().id,
            this.activityService.getCurrentActivity().id
        ];
    }
}
