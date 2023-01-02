import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { ConfigurationService } from './configuration.service';
import { ConfigurationServiceStub, FileServiceStub, getMockData, LibraryServiceStub } from '../../../testing/unitTest';
import { FormatTemplateService } from './format-template.service';
import { LibraryService } from './library.service';
import { IQueryParams } from './util.service';
import { FormatTemplate, List } from '../models';
import { LibraryCategory } from '../enum/global/library-category.enum';
import { assign } from 'lodash-es';

const configurationServiceStub = new ConfigurationServiceStub();
const fileServiceStub = new FileServiceStub();
const libraryServiceStub = new LibraryServiceStub();

let mockFormatTemplate1;
let mockFormatTemplateList1;
let mockLibrary1;

const formatTemplateURL = `https://api.joolia.net/library/` + libraryServiceStub.getCurrentLibrary().id + '/format-template';
const allFormatTemplateUrl = 'https://api.joolia.net/format-template';

describe('FormatTemplateService', () => {
    let service: FormatTemplateService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                FormatTemplateService,
                { provide: FileService, useValue: fileServiceStub },
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: LibraryService, useValue: libraryServiceStub }
            ]
        });

        service = TestBed.inject(FormatTemplateService);
        httpMock = TestBed.inject(HttpTestingController);

        mockFormatTemplate1 = getMockData('template.format.template1');
        mockFormatTemplateList1 = getMockData('template.format.list.list1');
        mockLibrary1 = getMockData('library.library1');
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Load:', () => {
        describe('Format template', () => {
            it('load specific format template', fakeAsync(() => {
                const nextSpy = spyOn(service.formatTemplateChanged, 'next').and.callThrough();

                const sub = service.formatTemplateChanged.subscribe((template) => {
                    expect(template).toEqual(mockFormatTemplate1);
                });

                service.loadFormatTemplate(mockLibrary1.id, mockFormatTemplate1.id).subscribe();

                const req = httpMock.expectOne(`${formatTemplateURL}/${mockFormatTemplate1.id}`);
                req.flush(mockFormatTemplate1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should return the loaded format template', fakeAsync(() => {
                service.loadFormatTemplate(mockLibrary1.id, mockFormatTemplate1.id).subscribe();

                const req = httpMock.expectOne(`${formatTemplateURL}/${mockFormatTemplate1.id}`);
                req.flush(mockFormatTemplate1);
                httpMock.verify();
                expect(service.getCurrentFormatTemplate()).toEqual(mockFormatTemplate1);
            }));
        });

        describe('Format templates', () => {
            it('should load the format templates', fakeAsync(() => {
                const nextSpy = spyOn(service.formatTemplateListChanged, 'next').and.callThrough();

                const sub = service.formatTemplateListChanged.subscribe((templates) => {
                    expect(templates).toEqual(mockFormatTemplateList1);
                    expect(templates.count).toBe(mockFormatTemplateList1.count);
                });

                service.loadFormatTemplates(mockLibrary1.id).subscribe();
                const req = httpMock.expectOne(formatTemplateURL);
                req.flush(mockFormatTemplateList1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load more format templates', fakeAsync(() => {
                service.loadFormatTemplates(mockLibrary1.id).subscribe();

                const req1 = httpMock.expectOne(formatTemplateURL);
                req1.flush(mockFormatTemplateList1);
                httpMock.verify();

                const nextSpy = spyOn(service.formatTemplateListChanged, 'next').and.callThrough();

                const sub = service.formatTemplateListChanged.subscribe((templates) => {
                    expect(templates.entities.length).toBe(2);
                });

                service.loadFormatTemplates(mockLibrary1.id, {}, true).subscribe();
                const req2 = httpMock.expectOne(formatTemplateURL);
                req2.flush(mockFormatTemplateList1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load the ids of format templates', fakeAsync(() => {
                const queryParams: IQueryParams = {
                    select: 'id'
                };

                service.loadFormatTemplates(mockLibrary1.id, queryParams).subscribe();
                const url = formatTemplateURL + '?select%5B%5D=id';
                const req = httpMock.expectOne(url);
                req.flush(mockFormatTemplateList1);
                httpMock.verify();
            }));

            it('should load all format templates', fakeAsync(() => {
                service.loadAllFormatTemplates().subscribe((templates) => {
                    expect(templates).toEqual(mockFormatTemplateList1);
                    expect(templates.count).toBe(mockFormatTemplateList1.count);
                });
                const req2 = httpMock.expectOne(allFormatTemplateUrl);
                req2.flush(mockFormatTemplateList1);
                httpMock.verify();
            }));
        });
    });

    describe('Update', () => {
        beforeEach(() => {
            service.loadFormatTemplates(mockLibrary1.id).subscribe();
            const req1 = httpMock.expectOne(`https://api.joolia.net/library/${mockLibrary1.id}/format-template`);
            req1.flush(mockFormatTemplateList1);
            service.loadFormatTemplate(mockLibrary1.id, mockFormatTemplate1.id).subscribe();
            const req2 = httpMock.expectOne(`https://api.joolia.net/library/${mockLibrary1.id}/format-template/${mockFormatTemplate1.id}`);
            req2.flush(mockFormatTemplate1);
            httpMock.verify();
        });

        it('should update an existing formatTemplate', fakeAsync(() => {
            const nextSpyList = spyOn(service.formatTemplateListChanged, 'next').and.callThrough();
            const nextSpy = spyOn(service.formatTemplateChanged, 'next').and.callThrough();

            service.formatTemplateListChanged.subscribe((data: List<FormatTemplate>) => {
                const formatTemplate = data.entities.find((f: FormatTemplate) => f.id === mockFormatTemplate1.id);
                expect(formatTemplate.category).toBe(LibraryCategory.ideate);
            });

            service.formatTemplateChanged.subscribe((data: FormatTemplate) => {
                expect(data.category).toBe(LibraryCategory.ideate);
            });

            service.updateFormatTemplate(mockLibrary1.id, mockFormatTemplate1.id, LibraryCategory.ideate).subscribe();
            const url = `https://api.joolia.net/library/${mockLibrary1.id}/format-template/${mockFormatTemplate1.id}`;
            const req = httpMock.expectOne(url);
            expect(req.request.method).toBe('PATCH');
            req.flush(assign({ id: mockFormatTemplate1.id }, req.request.body));
            httpMock.verify();

            expect(nextSpyList).toHaveBeenCalled();
            expect(nextSpy).toHaveBeenCalled();
        }));
    });
});
