import { ConfigurationService, IQueryParams, LibraryService, UtilService } from '../../app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { InvitationData, Library, List, SelectOption } from '../../app/core/models';
import { HttpParams } from '@angular/common/http';
import { getMockData } from './mock-data';

export class LibraryServiceStub implements Partial<LibraryService> {
    public _loadLibrariesCalls: any[] = [];
    public _createLibraryCalls: any[] = [];
    public _patchLibraryCalls: any[] = [];
    public _deleteLibraryCalls: any[] = [];
    public _loadLibraryMembersCalls: any[] = [];
    public _addLibraryMembersCalls: any[] = [];
    public _removeLibraryMemberCalls: any[] = [];
    public _setCategoryFilterCalls: any[] = [];

    libraryListChanged = new Subject<List<Library>>();
    categorySelectionChanged = new Subject<string[]>();
    libraryChanged = new Subject<Library>();

    loadLibraries(queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        this._loadLibrariesCalls.push({ httpParams: httpParams });
        return of();
    }

    createLibrary(body: Library): Observable<void> {
        this._createLibraryCalls.push(body);
        return of();
    }

    patchLibrary(libraryId: string, updatedLibrary: Partial<Library>): Observable<void> {
        this._patchLibraryCalls.push({ libraryId: libraryId, updatedLibrary: updatedLibrary });
        return of();
    }

    deleteLibrary(libraryId: string): Observable<void> {
        this._deleteLibraryCalls.push(libraryId);
        return of();
    }

    getCurrentLibrary(): Library {
        return getMockData('library.library1');
    }

    getCategories(): string[] {
        return ['explore'];
    }

    getCategoryOptions(): SelectOption[] {
        return [
            <SelectOption>{
                display: 'Explore',
                value: 'explore'
            }
        ];
    }

    getSelectedCategories(): string[] {
        return ['explore'];
    }

    selectCategories(select: string[]) {
        this._setCategoryFilterCalls.push({ selectedCategories: select });
        this.categorySelectionChanged.next(select);
    }

    getCategoryIcon(category: string): string {
        return 'code';
    }

    loadLibraryMembers(libraryId: string, queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        this.libraryChanged.next(getMockData('library.library1'));
        this._loadLibraryMembersCalls.push({ libraryId: libraryId, queryParams });
        return of();
    }

    addLibraryMembers(libraryId: string, invitationBody: InvitationData): Observable<void> {
        this._addLibraryMembersCalls.push({ libraryId: libraryId, invitationBody: invitationBody });
        return of();
    }

    removeLibraryMember(libraryId: string, deletionBody: { emails: string[] }): Observable<void> {
        this._removeLibraryMemberCalls.push({ libraryId: libraryId, deletionBody: deletionBody });
        return of();
    }

    _resetStubCalls() {
        this._loadLibrariesCalls.length = 0;
        this._createLibraryCalls.length = 0;
        this._patchLibraryCalls.length = 0;
        this._deleteLibraryCalls.length = 0;
        this._loadLibraryMembersCalls.length = 0;
        this._addLibraryMembersCalls.length = 0;
        this._removeLibraryMemberCalls.length = 0;
    }
}
