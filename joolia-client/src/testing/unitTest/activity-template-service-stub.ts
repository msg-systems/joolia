import { ActivityTemplateService, IQueryParams, UtilService } from '../../app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { ActivityTemplate, FileMeta, List } from '../../app/core/models';
import { HttpParams } from '@angular/common/http';
import { getMockData } from './mock-data';

export class ActivityTemplateServiceStub implements Partial<ActivityTemplateService> {
    public _loadActivityTemplatesCalls: any[] = [];
    public _deleteActivityTemplateCalls: any[] = [];

    activityTemplateListChanged = new Subject<List<ActivityTemplate>>();

    loadActivityTemplates(libraryId: string, queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        this._loadActivityTemplatesCalls.push({ libraryId: libraryId, httpParams: httpParams });
        return of();
    }

    deleteActivityTemplate(libraryId: string, activityTemplateId: string): Observable<void> {
        this._deleteActivityTemplateCalls.push({ libraryId: libraryId, activityTemplateId: activityTemplateId });
        return of();
    }

    loadActivityTemplateFilesMeta(): Observable<FileMeta[]> {
        return of(getMockData('file.set.set1'));
    }

    _resetStubCalls(): void {
        this._loadActivityTemplatesCalls.length = 0;
        this._deleteActivityTemplateCalls.length = 0;
    }
}
