import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { InvitationData, Library, List, SelectOption, User } from '../models';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { LibraryCategory } from '../enum/global/library-category.enum';
import { IQueryParams, UtilService } from './util.service';
import { UserService } from './user.service';

/**
 * The LibraryService handles all http requests regarding loading and actions on libraries..
 */
@Injectable()
export class LibraryService {
    libraryChanged = new Subject<Library>();
    libraryListChanged = new Subject<List<Library>>();
    categorySelectionChanged = new Subject<string[]>();

    private loadedLibrary: Library;
    private loadedLibraryList: List<Library> = { count: 0, entities: [] };
    private loadedCategories: string[];
    private selectedCategories: string[];

    private readonly serverConnection: string;

    constructor(
        private http: HttpClient,
        private config: ConfigurationService,
        private translate: TranslateService,
        private userService: UserService
    ) {
        this.serverConnection = this.config.getServerConnection();
        this.loadCategories().subscribe();
    }

    loadCategories(): Observable<void> {
        this.selectedCategories = [];
        this.loadedCategories = Object.values(LibraryCategory);
        return of();
    }

    getCategories(): string[] {
        return this.loadedCategories;
    }

    getCategoryIcon(category: string): string {
        const icons = ConfigurationService.getConfiguration().configuration.icons.libraryCategories;
        return icons[category];
    }

    getCategoryOptions(): SelectOption[] {
        const libraryCategories = this.loadedCategories;

        const categoryOptions: SelectOption[] = [];

        libraryCategories.forEach((category) => {
            categoryOptions.push(<SelectOption>{
                display: this.translate.instant('labels.categoryValue.' + category),
                value: category
            });
        });

        return categoryOptions;
    }

    getSelectedCategories(): string[] {
        return this.selectedCategories;
    }

    selectCategories(selectCategories: string[]) {
        this.selectedCategories = selectCategories;
        this.categorySelectionChanged.next(selectCategories);
    }

    loadLibraries(queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<Library>>(this.serverConnection + '/library', { params: httpParams })
            .pipe(
                map((libraries: List<Library>) => {
                    if (loadMore) {
                        this.loadedLibraryList.count = libraries.count;
                        this.loadedLibraryList.entities = this.loadedLibraryList.entities.concat(libraries.entities);
                    } else {
                        this.loadedLibraryList = libraries;
                    }
                    this.libraryListChanged.next(this.loadedLibraryList);
                })
            );
    }

    loadLibrary(libraryId: string, queryParams?: IQueryParams): Observable<Library> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<Library>(`${this.serverConnection}/library/${libraryId}`, { params: httpParams })
            .pipe(
                map((library: Library) => {
                    this.loadedLibrary = library;
                    this.libraryChanged.next(this.loadedLibrary);

                    return library;
                })
            );
    }

    getCurrentLibraries(): List<Library> {
        return {
            count: this.loadedLibraryList.count,
            entities: this.loadedLibraryList.entities.slice()
        };
    }

    getCurrentLibrary(): Library {
        return this.loadedLibrary;
    }

    createLibrary(body: Partial<Library>): Observable<void> {
        return this.http.post<Library>(`${this.serverConnection}/library`, body).pipe(
            map((library: Library) => {
                this.loadedLibraryList.entities.push(library);
                this.loadedLibraryList.count++;
                this.libraryListChanged.next(this.loadedLibraryList);
            })
        );
    }

    loadLibraryMembers(libraryId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<User>>(`${this.serverConnection}/library/${libraryId}/member`, { params: httpParams })
            .pipe(
                tap({
                    next: (members) =>
                        members.entities.forEach((m) =>
                            this.userService.getSkills(m, { select: ConfigurationService.getQueryParams().library.select.members })
                        )
                }),
                map((memberList: List<User>) => {
                    if (loadMore) {
                        this.loadedLibrary.members.count = memberList.count;
                        this.loadedLibrary.members.entities = this.loadedLibrary.members.entities.concat(memberList.entities);
                    } else {
                        this.loadedLibrary.members = memberList;
                    }
                    this.libraryChanged.next(this.loadedLibrary);
                })
            );
    }

    addLibraryMembers(libraryId: string, invitationBody: InvitationData) {
        return this.http.patch<void>(`${this.serverConnection}/library/${libraryId}/member`, invitationBody);
    }

    removeLibraryMember(libraryId: string, deletionBody: { emails: string[] }): Observable<void> {
        return this.http.post(`${this.serverConnection}/library/${libraryId}/member/_delete`, deletionBody).pipe(
            map(() => {
                this.loadedLibrary.members.entities = this.loadedLibrary.members.entities.filter(
                    (member) => deletionBody.emails.findIndex((deletedMail) => deletedMail === member.email) === -1
                );
                this.loadedLibrary.members.count--;
                this.libraryChanged.next(this.loadedLibrary);
            })
        );
    }

    patchLibrary(libraryId: string, updatedLibrary: Partial<Library>) {
        if (updatedLibrary.name === '') {
            updatedLibrary.name = this.translate.instant('labels.untitledLibrary');
        }
        return this.http.patch<Library>(`${this.serverConnection}/library/${libraryId}`, updatedLibrary).pipe(
            map((respondedLibrary: Library) => {
                if (this.loadedLibraryList) {
                    this.loadedLibraryList.entities = this.loadedLibraryList.entities.map((library) => {
                        return library.id === respondedLibrary.id ? Object.assign(library, respondedLibrary) : library;
                    });

                    this.libraryListChanged.next(this.loadedLibraryList);
                }

                if (this.loadedLibrary) {
                    Object.assign(this.loadedLibrary, respondedLibrary);

                    this.libraryChanged.next(this.loadedLibrary);
                }
            })
        );
    }

    deleteLibrary(libraryId: string): Observable<void> {
        return this.http.delete(`${this.serverConnection}/library/${libraryId}`).pipe(
            map(() => {
                this.loadedLibraryList.entities = this.loadedLibraryList.entities.filter((library) => library.id !== libraryId);
                this.loadedLibraryList.count--;
                this.libraryListChanged.next(this.loadedLibraryList);
            })
        );
    }
}
