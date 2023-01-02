import { fakeAsync, TestBed } from '@angular/core/testing';
import { ActivityService } from './activity.service';
import { FormatService } from './format.service';
import { PhaseService } from './phase.service';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from './file.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Activity, FileMeta, Link, List, Step } from '../models';
import { assign, cloneDeep } from 'lodash-es';
import { NgxUploadService } from './ngx-upload.service';
import { UploadFile } from 'ngx-uploader';
import { IQueryParams } from './util.service';
import {
    ConfigurationServiceStub,
    FileServiceStub,
    FormatServiceStub,
    getMockData,
    LoggerServiceStub,
    PhaseServiceStub,
    SnackbarServiceStub,
    TranslateServiceStub
} from '../../../testing/unitTest';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';
import { HttpRequest } from '@angular/common/http';
import * as moment from 'moment';
import createSpyObj = jasmine.createSpyObj;

let mockFormat1;
let mockPhase1;
let mockActivityList1;
let mockActivity1;
let mockStepList1;
let mockStep1;
let mockFileSet1;

const formatServiceStub = new FormatServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const fileServiceStub = new FileServiceStub();
const configurationServiceStub = new ConfigurationServiceStub();
const translateServiceStub = new TranslateServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const snackbarServiceStub = new SnackbarServiceStub();

describe('ActivityService', () => {
    let service: ActivityService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ActivityService,
                { provide: FormatService, useValue: formatServiceStub },
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: FileService, useValue: fileServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: SnackbarService, useValue: snackbarServiceStub }
            ]
        });

        service = TestBed.inject(ActivityService);
        httpMock = TestBed.inject(HttpTestingController);

        mockFormat1 = getMockData('format.format1');
        mockPhase1 = getMockData('phase.phase1');
        mockActivityList1 = getMockData('activity.list.list1');
        mockActivity1 = getMockData('activity.activity1');
        mockStepList1 = getMockData('step.list.list1');
        mockStep1 = getMockData('step.step1');
        mockFileSet1 = getMockData('file.set.set1');

        fileServiceStub._resetStubCalls();
        translateServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('loadedActivity', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req.flush(mockActivity1);
            httpMock.verify();
        });

        it('should return loaded activity', () => {
            const activity = service.getCurrentActivity();
            expect(activity.id).toBe(mockActivity1.id);
        });

        it('should unset loaded activity', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            let activity = service.getCurrentActivity();
            expect(activity.id).toBe(mockActivity1.id);

            service.activityChanged.subscribe((data) => {
                expect(data).toBeNull();
            });

            service.unsetLoadedActivity();
            activity = service.getCurrentActivity();
            expect(activity).toBeNull();
            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('loadActivities', () => {
        it('should load activities', fakeAsync(() => {
            const nextSpy = spyOn(service.activityListChanged, 'next').and.callThrough();

            service.activityListChanged.subscribe((activityList: List<Activity>) => {
                expect(activityList.count).toBe(3);
            });

            service.loadActivities(mockFormat1.id, mockPhase1.id).subscribe((data: List<Activity>) => {
                expect(data.count).toBe(3);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity`);
            expect(req.request.method).toBe('GET');
            req.flush(mockActivityList1);
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load id and name of activites', () => {
            const queryParams: IQueryParams = { select: 'id,name' };

            service.loadActivities(mockFormat1.id, mockPhase1.id, queryParams).subscribe();

            httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity?select%5B%5D=id&select%5B%5D=name`
            );
            httpMock.verify();
        });
    });

    describe('loadActivity', () => {
        it('should load activity', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.activityChanged.subscribe((data: Activity) => {
                expect(data.id).toBe(mockActivity1.id);
            });

            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe((data: Activity) => {
                expect(data.id).toBe(mockActivity1.id);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            expect(req.request.method).toBe('GET');
            req.flush(mockActivity1);
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load id and name of activity', () => {
            const queryParams: IQueryParams = { select: 'id,name' };
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123', queryParams).subscribe();

            httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123?select%5B%5D=id&select%5B%5D=name`
            );
            httpMock.verify();
        });
    });

    describe('loadSteps', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req.flush(mockActivity1);
            httpMock.verify();
        });

        it('should load steps', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.activityChanged.subscribe((data: Activity) => {
                expect(data.steps.count).toBe(6);
            });

            service.loadSteps(mockFormat1.id, mockPhase1.id, mockActivity1.id).subscribe((data: List<Step>) => {
                expect(data.count).toBe(6);
            });

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/step`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockStepList1);
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load id and name of steps', () => {
            const queryParams: IQueryParams = { select: 'id,name' };

            service.loadSteps(mockFormat1.id, mockPhase1.id, '123', queryParams).subscribe();

            httpMock.expectOne(
                `https://api.joolia.net` +
                    `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123/step?select%5B%5D=id&select%5B%5D=name`
            );
            httpMock.verify();
        });
    });

    describe('createActivity', () => {
        beforeEach(() => {
            service.loadActivities(mockFormat1.id, mockPhase1.id).subscribe();

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity`);
            req.flush(mockActivityList1);
            httpMock.verify();
        });

        it('should create an activity and add it to loaded activity list', fakeAsync(() => {
            const nextSpy = spyOn(service.activityListChanged, 'next').and.callThrough();

            const body = {
                name: 'new activity',
                position: 1
            };

            service.createActivity(mockFormat1.id, mockPhase1.id, body).subscribe((data: Activity) => {
                expect(data.id).toBe('newActivity');
            });

            service.activityListChanged.subscribe((data: List<Activity>) => {
                expect(data.count).toBe(4);
                expect(data.entities[1].id).toBe('newActivity');
            });

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity`);
            expect(req.request.method).toBe('POST');
            req.flush(assign({ id: 'newActivity' }, body));
            httpMock.verify();
            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('createActivityFromTemplate', () => {
        beforeEach(() => {
            service.loadActivities(mockFormat1.id, mockPhase1.id).subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity`);
            req.flush(mockActivityList1);
            httpMock.verify();
        });

        it('should create an activity from a template and add it to loaded activity list', fakeAsync(() => {
            const nextSpy = spyOn(service.activityListChanged, 'next').and.callThrough();

            service.createActivityFromTemplate(mockFormat1.id, mockPhase1.id, 'templateId', 1).subscribe((data: Activity) => {
                expect(data.id).toBe('newActivityFromTemplate');
            });

            service.activityListChanged.subscribe((data: List<Activity>) => {
                expect(data.count).toBe(4);
                expect(data.entities[1].id).toBe('newActivityFromTemplate');
            });

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/_template`);
            expect(req.request.method).toBe('POST');
            req.flush({ id: 'newActivityFromTemplate' });
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('createStep', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req.flush(assign({}, mockActivity1, { steps: cloneDeep(mockStepList1) }));
            httpMock.verify();
        });

        it('should create a new step and add it to the step list of loaded activity', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.createStep(mockFormat1.id, mockPhase1.id, {}).subscribe((data: Step) => {
                expect(data.id).toBe('newStep');
            });

            service.activityChanged.subscribe((data: Activity) => {
                expect(data.steps.count).toBe(7);
                expect(data.steps.entities[6].id).toBe('newStep');
            });

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/step`
            );
            expect(req.request.method).toBe('POST');
            req.flush({ id: 'newStep' });
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('updateActivity', () => {
        beforeEach(() => {
            service.loadActivities(mockFormat1.id, mockPhase1.id).subscribe();
            const req1 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity`);
            req1.flush(mockActivityList1);

            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req2 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req2.flush(mockActivity1);
            httpMock.verify();
        });

        it('should update an existing activity (List)', fakeAsync(() => {
            const nextSpyList = spyOn(service.activityListChanged, 'next').and.callThrough();
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.activityListChanged.subscribe((data: List<Activity>) => {
                const activity = data.entities.find((a: Activity) => a.id === mockActivity1.id);
                expect(activity.name).toBe('test translation');
            });

            service.activityChanged.subscribe((data: Activity) => {
                expect(data.name).toBe('test translation');
            });

            service.updateActivity(mockFormat1.id, mockPhase1.id, mockActivity1.id, { name: '' }).subscribe();

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`
            );
            expect(req.request.method).toBe('PATCH');
            req.flush(assign({ id: mockActivity1.id }, req.request.body));
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
            expect(nextSpyList).toHaveBeenCalled();
        }));
    });

    describe('updateStep', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req1 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req1.flush(mockActivity1);

            service.loadSteps(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req2 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123/step`);
            req2.flush(mockStepList1);
            httpMock.verify();
        });

        it('should update an existing step', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.updateStep(mockFormat1.id, mockPhase1.id, mockStep1.id, { description: 'updated step' }).subscribe();

            service.activityChanged.subscribe((data: Activity) => {
                const step = data.steps.entities.find((s: Step) => s.id === mockStep1.id);
                expect(step.description).toBe('updated step');
            });

            const req = httpMock.expectOne(
                'https://api.joolia.net' +
                    `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/step/${mockStep1.id}`
            );
            expect(req.request.method).toBe('PATCH');
            req.flush(assign({ id: mockStep1.id }, req.request.body));
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('updateStepChecked', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req1 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req1.flush(mockActivity1);

            service.loadSteps(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req2 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123/step`);
            req2.flush(mockStepList1);
            httpMock.verify();
        });

        it('should check step', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.updateStepChecked(mockFormat1.id, mockPhase1.id, mockStep1.id, { done: true, checkedById: '12345678' }).subscribe();

            service.activityChanged.subscribe((data: Activity) => {
                const step = data.steps.entities.find((s: Step) => s.id === mockStep1.id);
                expect(step.checkedBy.length).toBe(3);
                expect(step.checkedBy.indexOf('12345678')).toBeGreaterThan(-1);
            });

            const req = httpMock.expectOne(
                'https://api.joolia.net' +
                    `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/step/${mockStep1.id}/_check`
            );
            expect(req.request.method).toBe('POST');
            req.flush(assign({ id: mockStep1.id }, req.request.body));
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should uncheck step', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service
                .updateStepChecked(mockFormat1.id, mockPhase1.id, mockStep1.id, { done: false, checkedById: mockStep1.checkedBy[0] })
                .subscribe();

            service.activityChanged.subscribe((data: Activity) => {
                const step = data.steps.entities.find((s: Step) => s.id === mockStep1.id);
                expect(step.checkedBy.length).toBe(1);
                expect(step.checkedBy.indexOf(mockStep1.checkedBy[0])).toBeLessThan(0);
            });

            const req = httpMock.expectOne(
                'https://api.joolia.net' +
                    `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/step/${mockStep1.id}/_check`
            );
            expect(req.request.method).toBe('POST');
            req.flush(assign({ id: mockStep1.id }, req.request.body));
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('updateActivityPosition', () => {
        beforeEach(() => {
            service.loadActivities(mockFormat1.id, mockPhase1.id).subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity`);
            req.flush(mockActivityList1);
            httpMock.verify();
        });

        it('should update position of an existing activity', fakeAsync(() => {
            const nextSpy = spyOn(service.activityListChanged, 'next').and.callThrough();

            const id = mockActivityList1.entities[2].id;

            service.activityListChanged.subscribe((data: List<Activity>) => {
                expect(data.entities[0].id).toBe(id);
                expect(data.entities.length).toBe(3);
            });

            service.updateActivityPosition(mockFormat1.id, mockPhase1.id, id, 0).subscribe();

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${id}/_position`
            );
            expect(req.request.method).toBe('PATCH');
            req.flush({ id: id, position: 0 });
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('deleteActivity', () => {
        beforeEach(() => {
            service.loadActivities(mockFormat1.id, mockPhase1.id).subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity`);
            req.flush(mockActivityList1);
            httpMock.verify();
        });

        it('should delete an existing activity', fakeAsync(() => {
            const nextSpy = spyOn(service.activityListChanged, 'next').and.callThrough();

            service.activityListChanged.subscribe((data: List<Activity>) => {
                expect(data.entities.find((activity: Activity) => activity.id === mockActivity1.id)).toBeUndefined();
                expect(data.entities.length).toBe(2);
                expect(data.count).toBe(2);
            });

            service.deleteActivity(mockFormat1.id, mockPhase1.id, mockActivity1.id).subscribe();

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`
            );
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('deleteStep', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req1 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req1.flush(mockActivity1);

            service.loadSteps(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req2 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123/step`);
            req2.flush(mockStepList1);

            httpMock.verify();
        });

        it('should delete an existing step', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.deleteStep(mockFormat1.id, mockPhase1.id, mockStep1.id).subscribe();

            service.activityChanged.subscribe((data: Activity) => {
                expect(data.steps.entities.find((s: Step) => s.id === mockStep1.id)).toBeUndefined();
                expect(data.steps.entities.length).toBe(5);
                expect(data.steps.count).toBe(5);
            });

            const req = httpMock.expectOne(
                'https://api.joolia.net' +
                    `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/step/${mockStep1.id}`
            );
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('files', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req.flush(mockActivity1);
            httpMock.verify();
        });

        it('should loadActivityFilesMeta', () => {
            service.loadActivityFilesMeta(mockFormat1.id, mockPhase1.id).subscribe();
            const parent = `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`;
            expect(fileServiceStub._toHaveBeenCalledWith('loadFilesMeta', [parent, undefined])).toEqual(true);
        });

        it('should loadActivityFileMeta', () => {
            service.loadActivityFileMeta(mockFormat1.id, mockPhase1.id, '123');
            const parent = `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`;
            expect(fileServiceStub._toHaveBeenCalledWith('loadFileMeta', [parent, '123', undefined])).toEqual(true);
        });

        it('should loadActivityKeyVisualMeta', () => {
            service.loadActivityKeyVisualMeta(mockFormat1.id, mockPhase1.id, '123');
            const parent = `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`;
            expect(fileServiceStub._toHaveBeenCalledWith('loadKeyVisualMeta', [parent, undefined])).toEqual(true);
        });

        xit('should getDownloadLink', () => {
            const activity = service.getCurrentActivity();
            const fileId = mockFileSet1[0].id;

            activity.files = mockFileSet1;
            service.getDownloadLink(mockFormat1.id, mockPhase1.id, fileId, true);

            const parent = `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`;
            expect(fileServiceStub._toHaveBeenCalledWith('getDownloadFileMeta', [parent, fileId, { download: true }])).toEqual(true);
            expect(activity.files[0].fileUrl).toBe('testFileUrl');
        });

        describe('deleteFile', () => {
            let ngxUS;
            beforeEach(() => {
                ngxUS = createSpyObj('NgxUploadService', ['abortFileUpload']);
                const activity = service.getCurrentActivity();
                activity.files = mockFileSet1;
            });

            it('should abort upload if file is not uploaded yet', () => {
                const activity = service.getCurrentActivity();
                const fileToDelete = activity.files[0];
                fileToDelete.upload = <UploadFile>{};

                service.deleteFile(ngxUS, mockFormat1.id, mockPhase1.id, fileToDelete.id);

                expect(fileServiceStub._deleteFileCalls.length).toEqual(1);
                expect(ngxUS.abortFileUpload).toHaveBeenCalledWith(fileToDelete);
                const file = activity.files.find((f: FileMeta) => f.id === fileToDelete.id);
                expect(file).toBeUndefined();
            });

            it('delete file from database', fakeAsync(() => {
                const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

                const fileId = mockFileSet1[0].id;

                service.activityChanged.subscribe((activity: Activity) => {
                    const file = activity.files.find((f: FileMeta) => f.id === fileId);
                    expect(file).toBeUndefined();
                });

                service.deleteFile(ngxUS, mockFormat1.id, mockPhase1.id, fileId).subscribe(() => {});

                const parent = `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`;

                expect(fileServiceStub._toHaveBeenCalledWith('deleteFile', [parent, fileId])).toEqual(true);

                expect(nextSpy).toHaveBeenCalled();
            }));
        });
    });

    describe('uploadKeyVisualLink', () => {
        beforeEach(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, '123').subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/123`);
            req.flush(mockActivity1);
            httpMock.verify();
        });

        it('should update the keyvisual of an activity', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            const body = <Link>{ id: 'newLink', linkUrl: 'www.youtube.com' };
            const parent = `/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`;

            service.activityChanged.subscribe((activity: Activity) => {
                expect(activity.keyVisual.id).toBe('newLink');
            });

            service.uploadKeyVisualLink(parent, body).subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net${parent}/keyvisual`);
            expect(req.request.method).toBe('PUT');
            req.flush(body);
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('submissionCount', () => {
        let submissionCount;

        beforeEach(fakeAsync(() => {
            service.loadActivity(mockFormat1.id, mockPhase1.id, mockActivity1.id).subscribe();

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}`
            );
            req.flush(mockActivity1);
            httpMock.verify();
            submissionCount = mockActivity1.submissionCount;
        }));

        it('should set submission count onSubmissionsLoaded', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.activityChanged.subscribe((activity: Activity) => {
                expect(activity.submissionCount).toBe(5);
            });

            service.onSubmissionsLoaded(mockActivity1.id, 5);

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should increase submission count onSubmissionCreated', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.activityChanged.subscribe((activity: Activity) => {
                expect(activity.submissionCount).toBe(submissionCount + 1);
            });

            service.onSubmissionCreated(mockActivity1.id);

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should decrease submission count onSubmissionDeleted', fakeAsync(() => {
            const nextSpy = spyOn(service.activityChanged, 'next').and.callThrough();

            service.activityChanged.subscribe((activity: Activity) => {
                expect(activity.submissionCount).toBe(submissionCount - 1);
            });

            service.onSubmissionDeleted(mockActivity1.id);

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('current activities', () => {
        it('should load current activities', fakeAsync(() => {
            const phase = Object.assign({}, mockPhase1, {
                startDate: moment().subtract({ minutes: 100 })
            });

            service.loadCurrentActivities(mockFormat1.id, phase).subscribe((data) => {
                expect(data.length).toBe(1);
                expect(data[0].id).toBe(mockActivityList1.entities[1].id);
            });

            const req = httpMock.expectOne((request: HttpRequest<any>) =>
                request.url.startsWith(`https://api.joolia.net/format/${mockFormat1.id}/phase/${phase.id}/activity`)
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockActivityList1);
            httpMock.verify();
        }));
    });
});
