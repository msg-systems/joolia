import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { ConfigurationService } from './configuration.service';
import { ConfigurationServiceStub, FileServiceStub, getMockData, LibraryServiceStub } from '../../../testing/unitTest';
import { ActivityTemplateService } from './activity-template.service';
import { IQueryParams } from './util.service';
import { LibraryService } from './library.service';
import { ActivityTemplate, List } from '../models';
import { assign } from 'lodash-es';
import { LibraryCategory } from '../enum/global/library-category.enum';

const configurationServiceStub = new ConfigurationServiceStub();
const fileServiceStub = new FileServiceStub();
const libraryServiceStub = new LibraryServiceStub();

let mockActivityTemplate1;
let mockActivityTemplateList1;
let mockLibrary1;

const activityTemplateURL = `https://api.joolia.net/library/` + libraryServiceStub.getCurrentLibrary().id + '/activity-template';
const allActivityTemplateUrl = 'https://api.joolia.net/activity-template';

describe('ActivityTemplateService', () => {
    let service: ActivityTemplateService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ActivityTemplateService,
                { provide: FileService, useValue: fileServiceStub },
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: LibraryService, useValue: libraryServiceStub }
            ]
        });

        service = TestBed.inject(ActivityTemplateService);
        httpMock = TestBed.inject(HttpTestingController);

        mockActivityTemplate1 = getMockData('template.activity.template1');
        mockActivityTemplateList1 = getMockData('template.activity.list.list1');
        mockLibrary1 = getMockData('library.library1');
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Load:', () => {
        describe('Activity template', () => {
            it('load specific activity template', fakeAsync(() => {
                const nextSpy = spyOn(service.activityTemplateChanged, 'next').and.callThrough();

                const sub = service.activityTemplateChanged.subscribe((template) => {
                    expect(template).toEqual(mockActivityTemplate1);
                });

                service.loadActivityTemplate(mockLibrary1.id, mockActivityTemplate1.id).subscribe();

                const req = httpMock.expectOne(`${activityTemplateURL}/${mockActivityTemplate1.id}`);
                req.flush(mockActivityTemplate1);
                httpMock.verify();

                sub.unsubscribe();
                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should return the loaded activity template', () => {
                const nextSpy = spyOn(service.activityTemplateChanged, 'next').and.callThrough();

                service.loadActivityTemplate(mockLibrary1.id, mockActivityTemplate1.id).subscribe();

                const req = httpMock.expectOne(`${activityTemplateURL}/${mockActivityTemplate1.id}`);
                req.flush(mockActivityTemplate1);
                httpMock.verify();

                expect(service.getCurrentActivityTemplate()).toEqual(mockActivityTemplate1);
                expect(nextSpy).toHaveBeenCalled();
            });
        });

        describe('Activity templates', () => {
            it('should load the activity templates', fakeAsync(() => {
                const nextSpy = spyOn(service.activityTemplateListChanged, 'next').and.callThrough();

                const sub = service.activityTemplateListChanged.subscribe((templates) => {
                    expect(templates).toEqual(mockActivityTemplateList1);
                    expect(templates.count).toBe(mockActivityTemplateList1.count);
                });

                service.loadActivityTemplates(mockLibrary1.id).subscribe();
                const req = httpMock.expectOne(activityTemplateURL);
                req.flush(mockActivityTemplateList1);
                httpMock.verify();

                sub.unsubscribe();
                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load more activity templates', fakeAsync(() => {
                const nextSpy = spyOn(service.activityTemplateListChanged, 'next').and.callThrough();

                service.loadActivityTemplates(mockLibrary1.id).subscribe();

                const req1 = httpMock.expectOne(activityTemplateURL);
                req1.flush(mockActivityTemplateList1);
                httpMock.verify();

                const sub = service.activityTemplateListChanged.subscribe((templates) => {
                    expect(templates.entities.length).toBe(2);
                });

                service.loadActivityTemplates(mockLibrary1.id, {}, true).subscribe();
                const req2 = httpMock.expectOne(activityTemplateURL);
                req2.flush(mockActivityTemplateList1);
                httpMock.verify();

                sub.unsubscribe();
                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load the ids of activity templates', fakeAsync(() => {
                const nextSpy = spyOn(service.activityTemplateListChanged, 'next').and.callThrough();

                const queryParams: IQueryParams = {
                    select: 'id'
                };

                service.loadActivityTemplates(mockLibrary1.id, queryParams).subscribe();

                const req = httpMock.expectOne(`${activityTemplateURL}?select%5B%5D=id`);
                req.flush(mockActivityTemplateList1);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load all activity templates', fakeAsync(() => {
                service.loadAllActivityTemplates().subscribe((templates) => {
                    expect(templates).toEqual(mockActivityTemplateList1);
                    expect(templates.count).toBe(mockActivityTemplateList1.count);
                });

                const req2 = httpMock.expectOne(allActivityTemplateUrl);
                req2.flush(mockActivityTemplateList1);
                httpMock.verify();
            }));
        });

        describe('Update', () => {
            beforeEach(fakeAsync(() => {
                service.loadActivityTemplates(mockLibrary1.id).subscribe();
                const req1 = httpMock.expectOne(`https://api.joolia.net/library/${mockLibrary1.id}/activity-template`);
                req1.flush(mockActivityTemplateList1);

                service.loadActivityTemplate(mockLibrary1.id, mockActivityTemplate1.id).subscribe();

                const req2 = httpMock.expectOne(
                    `https://api.joolia.net/library/${mockLibrary1.id}/activity-template/${mockActivityTemplate1.id}`
                );
                req2.flush(mockActivityTemplate1);

                httpMock.verify();
            }));

            it('should update an existing activity template', fakeAsync(() => {
                const nextSpyList = spyOn(service.activityTemplateListChanged, 'next').and.callThrough();
                const nextSpy = spyOn(service.activityTemplateChanged, 'next').and.callThrough();

                service.activityTemplateListChanged.subscribe((data: List<ActivityTemplate>) => {
                    const activityTemplate = data.entities.find((a: ActivityTemplate) => a.id === mockActivityTemplate1.id);
                    expect(activityTemplate.category).toBe(LibraryCategory.ideate);
                });

                service.activityTemplateChanged.subscribe((data: ActivityTemplate) => {
                    expect(data.category).toBe(LibraryCategory.ideate);
                });

                service.updateActivityTemplate(mockLibrary1.id, mockActivityTemplate1.id, LibraryCategory.ideate).subscribe();
                const url = `https://api.joolia.net/library/${mockLibrary1.id}/activity-template/${mockActivityTemplate1.id}`;
                const req = httpMock.expectOne(url);
                expect(req.request.method).toBe('PATCH');
                req.flush(assign({ id: mockActivityTemplate1.id }, req.request.body));
                httpMock.verify();

                expect(nextSpyList).toHaveBeenCalled();
                expect(nextSpy).toHaveBeenCalled();
            }));
        });
    });
});
