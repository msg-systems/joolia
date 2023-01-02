import { ActivityService, IQueryParams, UtilService } from '../../app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { Activity, FileMeta, LinkEntry, List, Phase, Step } from '../../app/core/models';
import { HttpParams } from '@angular/common/http';
import { getMockData } from './mock-data';

export class ActivityServiceStub implements Partial<ActivityService> {
    public _loadActivityCalls: any[] = [];
    public _deleteActivityCalls: any[] = [];
    public _updateActivityCalls: any[] = [];
    public _addLinkCalls: any[] = [];
    public _deleteLinkCalls: any[] = [];
    public _loadCurrentActivitiesCalls: any[] = [];
    public _loadStepsCalls: any[] = [];

    activityChanged = new Subject<Activity>();
    activityListChanged = new Subject<List<Activity>>();

    getCurrentActivity(): Activity {
        return getMockData('activity.activity1');
    }

    loadActivity(formatId: string, phaseId: string, activityId: string, queryParams?: IQueryParams): Observable<Activity> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        this._loadActivityCalls.push({ formatId: formatId, phaseId: phaseId, activityId: activityId, httpParams: httpParams });
        return of(getMockData('activity.activity1'));
    }

    deleteActivity(formatId: string, phaseId: string, activityId: string): Observable<void> {
        this._deleteActivityCalls.push({ formatId: formatId, phaseId: phaseId, activityId: activityId });
        return of();
    }

    loadActivityDetails(_formatId: string, _phaseId: string, _activityId: string): Observable<Partial<Activity>> {
        return of(getMockData('activity.activity1'));
    }

    loadActivityFilesMeta(formatId: string, phaseId: string): Observable<FileMeta[]> {
        return of(getMockData('file.set.set1'));
    }

    loadActivityKeyVisualMeta(formatId: string, phaseId: string, activityId: string, queryParams?: IQueryParams) {
        return of(getMockData('file.set.set1'));
    }

    updateActivity(formatId: string, phaseId: string, id: string, updatedValue: any): Observable<void> {
        this._updateActivityCalls.push({ formatId: formatId, phaseId: phaseId, id: id, updatedValue: updatedValue });
        return of();
    }

    addCollaborationLink(formatId: string, phaseId: string, link: LinkEntry) {
        this._addLinkCalls.push({ formatId, phaseId, link });
    }

    deleteCollaborationLink(formatId: string, phaseId: string, linkId: string) {
        this._deleteLinkCalls.push({ formatId, phaseId, linkId });
    }

    loadCurrentActivities(formatId: string, phase: Phase, queryParams?: IQueryParams): Observable<Activity[]> {
        this._loadCurrentActivitiesCalls.push({ formatId: formatId, phase: phase, queryParams: queryParams });
        return of([]);
    }

    loadSteps(formatId: string, phaseId: string, id: string, queryParams?: IQueryParams, parent?: string): Observable<List<Step>> {
        this._loadStepsCalls.push({ formatId: formatId, phaseId: phaseId, id: id, queryParams: queryParams, parent: parent });
        return of({ count: 0, entities: [] });
    }

    _resetStubCalls(): void {
        this._loadActivityCalls.length = 0;
        this._deleteActivityCalls.length = 0;
    }
}
