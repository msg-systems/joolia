import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { ConfigurationService } from './configuration.service';
import { ConfigurationServiceStub, FileServiceStub, getMockData, LibraryServiceStub } from '../../../testing/unitTest';
import { PhaseTemplateService } from './phase-template.service';
import { IQueryParams } from './util.service';
import { List, PhaseTemplate } from '../models';
import { LibraryCategory } from '../enum/global/library-category.enum';
import { assign } from 'lodash-es';

const configurationServiceStub = new ConfigurationServiceStub();
const fileServiceStub = new FileServiceStub();
const libraryServiceStub = new LibraryServiceStub();

let mockPhaseTemplate1;
let mockPhaseTemplateList1;
let mockLibrary1;

const phaseTemplateURL = `https://api.joolia.net/library/` + libraryServiceStub.getCurrentLibrary().id + '/phase-template';
const allPhaseTemplateUrl = 'https://api.joolia.net/phase-template';

describe('PhaseTemplateService', () => {
    let service: PhaseTemplateService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PhaseTemplateService,
                { provide: FileService, useValue: fileServiceStub },
                { provide: ConfigurationService, useValue: configurationServiceStub }
            ]
        });

        service = TestBed.inject(PhaseTemplateService);
        httpMock = TestBed.inject(HttpTestingController);

        mockPhaseTemplate1 = getMockData('template.phase.template1');
        mockPhaseTemplateList1 = getMockData('template.phase.list.list1');
        mockLibrary1 = getMockData('library.library1');
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Load:', () => {
        describe('Phase template', () => {
            it('load specific phase template', fakeAsync(() => {
                const nextSpy = spyOn(service.phaseTemplateChanged, 'next').and.callThrough();

                const sub = service.phaseTemplateChanged.subscribe((template) => {
                    expect(template).toEqual(mockPhaseTemplate1);
                });

                service.loadPhaseTemplate(mockLibrary1.id, mockPhaseTemplate1.id).subscribe();

                const req = httpMock.expectOne(`${phaseTemplateURL}/${mockPhaseTemplate1.id}`);
                req.flush(mockPhaseTemplate1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should return the loaded phase template', fakeAsync(() => {
                service.loadPhaseTemplate(mockLibrary1.id, mockPhaseTemplate1.id).subscribe();
                const req = httpMock.expectOne(`${phaseTemplateURL}/${mockPhaseTemplate1.id}`);
                req.flush(mockPhaseTemplate1);
                httpMock.verify();
                expect(service.getCurrentPhaseTemplate()).toEqual(mockPhaseTemplate1);
            }));
        });

        describe('Phase templates', () => {
            it('should load the phase templates', fakeAsync(() => {
                const nextSpy = spyOn(service.phaseTemplateListChanged, 'next').and.callThrough();

                const sub = service.phaseTemplateListChanged.subscribe((templates) => {
                    expect(templates).toEqual(mockPhaseTemplateList1);
                    expect(templates.count).toBe(mockPhaseTemplateList1.count);
                });

                service.loadPhaseTemplates(mockLibrary1.id).subscribe();
                const req = httpMock.expectOne(phaseTemplateURL);
                req.flush(mockPhaseTemplateList1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load more phase templates', fakeAsync(() => {
                service.loadPhaseTemplates(mockLibrary1.id).subscribe();
                const req1 = httpMock.expectOne(phaseTemplateURL);
                req1.flush(mockPhaseTemplateList1);
                httpMock.verify();

                const nextSpy = spyOn(service.phaseTemplateListChanged, 'next').and.callThrough();

                const sub = service.phaseTemplateListChanged.subscribe((templates) => {
                    expect(templates.entities.length).toBe(2);
                });

                service.loadPhaseTemplates(mockLibrary1.id, {}, true).subscribe();
                const req2 = httpMock.expectOne(phaseTemplateURL);
                req2.flush(mockPhaseTemplateList1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load the ids of phase templates', fakeAsync(() => {
                const queryParams: IQueryParams = {
                    select: 'id'
                };

                service.loadPhaseTemplates(mockLibrary1.id, queryParams).subscribe();
                const req = httpMock.expectOne(`${phaseTemplateURL}?select%5B%5D=id`);
                req.flush(mockPhaseTemplateList1);
                httpMock.verify();
            }));

            it('should load all phase templates', fakeAsync(() => {
                service.loadAllPhaseTemplates().subscribe((templates) => {
                    expect(templates).toEqual(mockPhaseTemplateList1);
                    expect(templates.count).toBe(mockPhaseTemplateList1.count);
                });

                const req2 = httpMock.expectOne(allPhaseTemplateUrl);
                req2.flush(mockPhaseTemplateList1);
                httpMock.verify();
            }));
        });
    });

    describe('Update', () => {
        beforeEach(() => {
            service.loadPhaseTemplates(mockLibrary1.id).subscribe();
            const req1 = httpMock.expectOne(`https://api.joolia.net/library/${mockLibrary1.id}/phase-template`);
            req1.flush(mockPhaseTemplateList1);
            service.loadPhaseTemplate(mockLibrary1.id, mockPhaseTemplate1.id).subscribe();
            const req2 = httpMock.expectOne(`https://api.joolia.net/library/${mockLibrary1.id}/phase-template/${mockPhaseTemplate1.id}`);
            req2.flush(mockPhaseTemplate1);
            httpMock.verify();
        });

        it('should update an existing phaseTemplate', fakeAsync(() => {
            const nextSpyList = spyOn(service.phaseTemplateListChanged, 'next').and.callThrough();
            const nextSpy = spyOn(service.phaseTemplateChanged, 'next').and.callThrough();

            service.phaseTemplateListChanged.subscribe((data: List<PhaseTemplate>) => {
                const phaseTemplate = data.entities.find((p: PhaseTemplate) => p.id === mockPhaseTemplate1.id);
                expect(phaseTemplate.category).toBe(LibraryCategory.ideate);
            });

            service.phaseTemplateChanged.subscribe((data: PhaseTemplate) => {
                expect(data.category).toBe(LibraryCategory.ideate);
            });

            service.updatePhaseTemplate(mockLibrary1.id, mockPhaseTemplate1.id, LibraryCategory.ideate).subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/library/${mockLibrary1.id}/phase-template/${mockPhaseTemplate1.id}`);
            expect(req.request.method).toBe('PATCH');
            req.flush(assign({ id: mockPhaseTemplate1.id }, req.request.body));
            httpMock.verify();

            expect(nextSpyList).toHaveBeenCalled();
            expect(nextSpy).toHaveBeenCalled();
        }));
    });
});
