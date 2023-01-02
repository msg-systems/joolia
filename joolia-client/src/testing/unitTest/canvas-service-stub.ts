import { CanvasService, IQueryParams } from '../../app/core/services';
import { Canvas, CanvasSubmission, List } from '../../app/core/models';
import { Observable, of, Subject } from 'rxjs';
import { getMockData } from './mock-data';

export class CanvasServiceStub implements Partial<CanvasService> {
    canvasListChanged = new Subject<List<Canvas>>();
    canvasChanged = new Subject<Canvas>();
    public _createCanvasCalls: any[] = [];
    public _loadCanvasCalls: any[] = [];
    public _loadCanvasesCalls: any[] = [];
    public _updateCanvasCalls: any[] = [];
    public _deleteCanvasCalls: any[] = [];
    public _updateSlotCalls: any[] = [];
    public _createSubmissionCalls: any[] = [];
    public _updateSubmissionCalls: any[] = [];
    public _loadSubmissionsCalls: any[] = [];
    public _deleteSubmissionCalls: any[] = [];
    public _voteSubmissionCalls: any[] = [];
    public _removeVoteSubmissionCalls: any[] = [];

    public createCanvas(canvas: Partial<Canvas>): Observable<Canvas> {
        this._createCanvasCalls.push({ canvas });
        return of(<Canvas>Object.assign({}, canvas, { id: '123' }));
    }

    public loadCanvasList(queryParams?: IQueryParams): Observable<void> {
        this._loadCanvasesCalls.push({ queryParams });
        return of();
    }

    public loadCanvas(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        queryParams?: IQueryParams
    ): Observable<Canvas> {
        this._loadCanvasCalls.push({ formatId, phaseId, activityId, canvasId, queryParams });
        return of(getMockData('canvas.canvas1'));
    }

    public updateCanvas(formatId: string, phaseId: string, activityId: string, canvasId: string, body: any): Observable<void> {
        this._updateCanvasCalls.push({ formatId, phaseId, activityId, canvasId, body });
        return of(body);
    }

    public deleteCanvas(canvasId: string) {
        this._deleteCanvasCalls.push({ canvasId });
        return of<void>();
    }

    public updateSlot(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        slotId: string,
        body: any
    ): Observable<void> {
        this._updateSlotCalls.push({ formatId, phaseId, activityId, canvasId, slotId, body });
        return of();
    }

    public createSubmission(formatId: string, phaseId: string, activityId: string, canvasId: string, slotId: string, body: any) {
        this._createSubmissionCalls.push({ formatId, phaseId, activityId, canvasId, slotId, body });
        return of(<CanvasSubmission>{ content: body.content, color: body.color, id: '123', slotId: slotId });
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
        this._updateSubmissionCalls.push({ formatId, phaseId, activityId, canvasId, slotId, submissionId, body });
        return of(<CanvasSubmission>{ content: body.content, color: body.color, id: submissionId });
    }

    public loadSubmissions(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        queryParams?: IQueryParams
    ): Observable<List<CanvasSubmission>> {
        this._loadSubmissionsCalls.push({ formatId, phaseId, activityId, canvasId, queryParams });
        return of(getMockData('canvas.list.list1'));
    }

    public deleteSubmission(formatId: string, phaseId: string, activityId: string, canvasId: string, slotId: string, submissionId: string) {
        this._deleteSubmissionCalls.push({ formatId, phaseId, activityId, canvasId, slotId, submissionId });
        return of<void>();
    }

    public voteSubmission(formatId: string, phaseId: string, activityId: string, canvasId: string, slotId: string, submissionId: string) {
        this._voteSubmissionCalls.push({ formatId, phaseId, activityId, canvasId, slotId, submissionId });
        return of<void>();
    }

    public removeVoteSubmission(
        formatId: string,
        phaseId: string,
        activityId: string,
        canvasId: string,
        slotId: string,
        submissionId: string
    ) {
        this._removeVoteSubmissionCalls.push({ formatId, phaseId, activityId, canvasId, slotId, submissionId });
        return of<void>();
    }

    _resetStubCalls(): void {
        this._createCanvasCalls.length = 0;
        this._loadCanvasesCalls.length = 0;
        this._loadCanvasCalls.length = 0;
        this._updateCanvasCalls.length = 0;
        this._deleteCanvasCalls.length = 0;
        this._updateSlotCalls.length = 0;
        this._createSubmissionCalls.length = 0;
        this._updateSubmissionCalls.length = 0;
        this._loadSubmissionsCalls.length = 0;
        this._deleteSubmissionCalls.length = 0;
        this._voteSubmissionCalls.length = 0;
        this._removeVoteSubmissionCalls.length = 0;
    }
}
