import { FormatTemplateService, IQueryParams, UtilService } from '../../app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { FormatTemplate, List } from '../../app/core/models';
import { HttpParams } from '@angular/common/http';

export class FormatTemplateServiceStub implements Partial<FormatTemplateService> {
    public _loadFormatTemplatesCalls: any[] = [];
    public _deleteFormatTemplateCalls: any[] = [];

    formatTemplateListChanged = new Subject<List<FormatTemplate>>();

    loadFormatTemplates(libraryId: string, queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        this._loadFormatTemplatesCalls.push({ libraryId: libraryId, httpParams: httpParams });
        return of();
    }

    deleteFormatTemplate(libraryId: string, formatTemplateId: string): Observable<void> {
        this._deleteFormatTemplateCalls.push({ libraryId: libraryId, formatTemplateId: formatTemplateId });
        return of();
    }

    _resetStubCalls(): void {
        this._loadFormatTemplatesCalls.length = 0;
        this._deleteFormatTemplateCalls.length = 0;
    }
}
