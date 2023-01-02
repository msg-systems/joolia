import { IQueryParams, PhaseTemplateService, UtilService } from '../../app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { List, PhaseTemplate } from '../../app/core/models';
import { HttpParams } from '@angular/common/http';
import { getMockData } from './mock-data';

export class PhaseTemplateServiceStub implements Partial<PhaseTemplateService> {
    public _loadPhaseTemplatesCalls: any[] = [];
    public _deletePhaseTemplateCalls: any[] = [];

    phaseTemplateChanged = new Subject<PhaseTemplate>();
    phaseTemplateListChanged = new Subject<List<PhaseTemplate>>();

    loadPhaseTemplate(libraryId: string, templateId: string, queryParams?: IQueryParams): Observable<PhaseTemplate> {
        return of();
    }

    loadPhaseTemplates(libraryId: string, queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        this._loadPhaseTemplatesCalls.push({ libraryId: libraryId, httpParams: httpParams });
        return of();
    }

    deletePhaseTemplate(libraryId: string, phaseTemplateId: string): Observable<void> {
        this._deletePhaseTemplateCalls.push({ libraryId: libraryId, phaseTemplateId: phaseTemplateId });
        return of();
    }

    getCurrentPhaseTemplate(): PhaseTemplate {
        return getMockData('template.phase.template1');
    }

    _resetStubCalls() {
        this._loadPhaseTemplatesCalls.length = 0;
        this._deletePhaseTemplateCalls.length = 0;
    }
}
