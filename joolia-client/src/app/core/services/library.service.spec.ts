import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { ConfigurationServiceStub, getMockData, TranslateServiceStub, UserServiceStub } from '../../../testing/unitTest';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { LibraryService } from './library.service';
import { assign } from 'lodash-es';
import { IQueryParams } from './util.service';
import { UserService } from './user.service';
import { Library, List } from '../models';

const configurationServiceStub = new ConfigurationServiceStub();
const translationServiceStub = new TranslateServiceStub();
const userServiceStub = new UserServiceStub();

let mockLibrary1;
let mockLibraryList1;
let mockUserShaak;
let mockUserLuke;

const libraryURL = 'https://api.joolia.net/library';

describe('LibraryService', () => {
    let service: LibraryService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                LibraryService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: TranslateService, useValue: translationServiceStub },
                { provide: UserService, useValue: userServiceStub }
            ]
        });

        service = TestBed.inject(LibraryService);
        httpMock = TestBed.inject(HttpTestingController);

        mockLibrary1 = getMockData('library.library1');
        mockLibraryList1 = getMockData('library.list.list1');
        mockUserShaak = getMockData('user.shaak');
        mockUserLuke = getMockData('user.luke');

        translationServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Library', () => {
        it('should create the library', fakeAsync(() => {
            const body = {
                name: mockLibrary1.name
            };

            const nextSpy = spyOn(service.libraryListChanged, 'next').and.callThrough();

            const sub = service.libraryListChanged.subscribe((library: List<Library>) => {
                expect(library).toEqual(mockLibraryList1);
            });

            service.createLibrary(body).subscribe();

            const req = httpMock.expectOne(libraryURL);
            expect(req.request.method).toBe('POST');
            req.flush(assign(mockLibrary1, body));
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load specific library', fakeAsync(() => {
            const nextSpy = spyOn(service.libraryChanged, 'next').and.callThrough();

            const sub = service.libraryChanged.subscribe((library) => {
                expect(library).toEqual(mockLibrary1);
            });

            service.loadLibrary(mockLibrary1.id).subscribe();

            const req = httpMock.expectOne(`${libraryURL}/${mockLibrary1.id}`);
            req.flush(mockLibrary1);
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should return the loaded library', fakeAsync(() => {
            service.loadLibrary(mockLibrary1.id).subscribe();
            const req = httpMock.expectOne(`${libraryURL}/${mockLibrary1.id}`);
            req.flush(mockLibrary1);
            httpMock.verify();
            expect(service.getCurrentLibrary()).toEqual(mockLibrary1);
        }));
    });

    describe('Libraries', () => {
        it('should load the libraries', fakeAsync(() => {
            const nextSpy = spyOn(service.libraryListChanged, 'next').and.callThrough();

            const sub = service.libraryListChanged.subscribe((libraries) => {
                expect(libraries).toEqual(mockLibraryList1);
                expect(libraries.count).toBe(mockLibraryList1.count);
            });

            service.loadLibraries().subscribe();
            const req = httpMock.expectOne(libraryURL);
            req.flush(mockLibraryList1);
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load more libraries', fakeAsync(() => {
            const nextSpy = spyOn(service.libraryListChanged, 'next').and.callThrough();

            service.loadLibraries().subscribe();
            const req1 = httpMock.expectOne(libraryURL);
            req1.flush(mockLibraryList1);
            httpMock.verify();

            const sub = service.libraryListChanged.subscribe((libraries) => {
                expect(libraries.entities.length).toBe(2);
            });

            service.loadLibraries({}, true).subscribe();
            const req2 = httpMock.expectOne(libraryURL);
            req2.flush(mockLibraryList1);
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load the ids of libraries', fakeAsync(() => {
            const queryParams: IQueryParams = {
                select: 'id'
            };

            service.loadLibraries(queryParams).subscribe();
            const req = httpMock.expectOne(`${libraryURL}?select%5B%5D=id`);
            req.flush(mockLibraryList1);
            httpMock.verify();
        }));
    });

    describe('Library Members:', () => {
        describe('load:', () => {
            beforeEach(() => {
                // load specific library
                service.loadLibrary(mockLibrary1.id).subscribe();
                httpMock.expectOne(() => true).flush(mockLibrary1);
                httpMock.verify();
            });

            describe('loadLibraryMembers', () => {
                it('should load library members for loaded library', fakeAsync(() => {
                    const nextSpy = spyOn(service.libraryChanged, 'next').and.callThrough();

                    const sub = service.libraryChanged.subscribe((loadedLibrary) => {
                        expect(loadedLibrary.hasOwnProperty('members')).toBe(true);
                        expect(loadedLibrary.memberCount).toBe(2);
                        expect(loadedLibrary.members.count).toBe(2);
                        expect(loadedLibrary.members.entities.length).toBe(2);
                    });

                    service.loadLibraryMembers(mockLibrary1.id).subscribe();
                    const req = httpMock.expectOne(`${libraryURL}/${mockLibrary1.id}/member`);
                    req.flush(mockLibrary1.members);
                    httpMock.verify();

                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));

                it('should load more library members for loaded library', fakeAsync(() => {
                    const nextSpy = spyOn(service.libraryChanged, 'next').and.callThrough();

                    // Initial library member loading
                    service.loadLibraryMembers(mockLibrary1.id).subscribe();
                    const req1 = httpMock.expectOne(`${libraryURL}/${mockLibrary1.id}/member`);
                    req1.flush(mockLibrary1.members);
                    httpMock.verify();

                    const sub = service.libraryChanged.subscribe((loadedLibrary) => {
                        expect(loadedLibrary.members.entities.length).toBe(4);
                    });

                    service.loadLibraryMembers(mockLibrary1.id, {}, true).subscribe();
                    const req2 = httpMock.expectOne(`${libraryURL}/${mockLibrary1.id}/member`);
                    req2.flush(mockLibrary1.members);
                    httpMock.verify();

                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));
            });
        });
    });
});
