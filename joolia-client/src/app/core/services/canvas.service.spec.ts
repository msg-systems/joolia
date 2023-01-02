import { fakeAsync, TestBed } from '@angular/core/testing';
import { ActivityService } from './activity.service';
import { FormatService } from './format.service';
import { PhaseService } from './phase.service';
import { ConfigurationService } from './configuration.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Canvas, CanvasSubmission, List, Slot } from '../models';
import {
    ActivityServiceStub,
    AuthenticationServiceStub,
    ConfigurationServiceStub,
    FormatServiceStub,
    getMockData,
    LoggerServiceStub,
    PhaseServiceStub,
    TranslateServiceStub
} from '../../../testing/unitTest';
import { LoggerService } from './logger.service';
import { AuthenticationService } from './authentication.service';
import { CanvasService } from './canvas.service';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { SlotType } from '../enum/global/slot-type.enum';

let mockFormat1;
let mockPhase1;
let mockActivity1;
let mockCanvas1;
let mockCanvasList1;
let mockCanvasSubmission1;
let mockCanvasSubmissionList1;

const formatServiceStub = new FormatServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const activityServiceStub = new ActivityServiceStub();
const authenticationServiceStub = new AuthenticationServiceStub();
const configurationServiceStub = new ConfigurationServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const translationServiceStub = new TranslateServiceStub();

describe('CanvasService', () => {
    let service: CanvasService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CanvasService,
                { provide: FormatService, useValue: formatServiceStub },
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: ActivityService, useValue: activityServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: TranslateService, useValue: translationServiceStub }
            ]
        });

        service = TestBed.inject(CanvasService);
        httpMock = TestBed.inject(HttpTestingController);

        mockFormat1 = getMockData('format.format1');
        mockPhase1 = getMockData('phase.phase1');
        mockActivity1 = getMockData('activity.activity1');
        mockCanvas1 = getMockData('canvas.canvas1');
        mockCanvasList1 = getMockData('canvas.list.list1');
        mockCanvasSubmission1 = getMockData('canvasSubmission.canvasSubmission1');
        mockCanvasSubmissionList1 = getMockData('canvasSubmission.list.list1');

        translationServiceStub._resetStubCalls();
    });

    it('should create Canvas Service', () => {
        expect(service).toBeDefined();
    });

    function _loadCanvasList() {
        service.loadCanvasList().subscribe();
        const req = httpMock.expectOne(
            `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/canvas`
        );
        expect(req.request.method).toBe('GET');
        return req;
    }

    function _loadCanvas() {
        service.loadCanvas(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id).subscribe();
        const req = httpMock.expectOne(
            `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                `${mockActivity1.id}/canvas/${mockCanvas1.id}`
        );
        expect(req.request.method).toBe('GET');
        return req;
    }

    function _loadSubmissions() {
        service.loadSubmissions(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id).subscribe();
        const req = httpMock.expectOne(
            `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                `${mockActivity1.id}/canvas/${mockCanvas1.id}/submission`
        );
        expect(req.request.method).toBe('GET');
        return req;
    }

    describe('Canvas:', () => {
        beforeEach(() => {
            _loadCanvasList().flush({ count: 0, entities: [] });
            httpMock.verify();
        });
        describe('Create:', () => {
            it('should create a new Canvas', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasListChanged, 'next').and.callThrough();

                service.canvasListChanged.subscribe((canvasList: List<Canvas>) => {
                    expect(canvasList.count).toEqual(1);
                    expect(canvasList.entities[0].id).toEqual(mockCanvas1.id);
                });

                service.createCanvas(mockCanvas1).subscribe((canvas) => expect(canvas.name).toEqual(mockCanvas1.name));

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/canvas`
                );
                expect(req.request.method).toBe('POST');
                req.flush(mockCanvas1);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('Load:', () => {
            it('should load a Canvas List', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasListChanged, 'next').and.callThrough();

                service.canvasListChanged.subscribe((canvasList: List<Canvas>) => expect(canvasList.count).toEqual(mockCanvasList1.count));

                service.loadCanvasList().subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/canvas`
                );
                expect(req.request.method).toBe('GET');
                req.flush(mockCanvasList1);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load specific canvas', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                service.canvasChanged.subscribe((canvas: Canvas) => expect(canvas.id).toEqual(mockCanvas1.id));

                service
                    .loadCanvas(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id)
                    .subscribe((canvas) => expect(canvas.id).toEqual(mockCanvas1.id));

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}`
                );
                expect(req.request.method).toBe('GET');
                req.flush(mockCanvas1);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('Delete:', () => {
            beforeEach(() => {
                _loadCanvasList().flush(cloneDeep(mockCanvasList1));
                httpMock.verify();
            });

            it('should delete specific canvas', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasListChanged, 'next').and.callThrough();
                let subscriptionExecuted = false;

                service.canvasListChanged.subscribe((canvasList: List<Canvas>) => {
                    expect(canvasList.count).toEqual(mockCanvasList1.count - 1);
                    expect(canvasList.entities.find((c) => c.id === mockCanvas1.id)).toBeUndefined();
                    expect(service['loadedCanvasList'].count).toEqual(mockCanvasList1.count - 1);
                    expect(service['loadedCanvasList'].entities.find((c) => c.id === mockCanvas1.id)).toBeUndefined();
                    subscriptionExecuted = true;
                });

                service.deleteCanvas(mockCanvas1.id).subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}`
                );
                expect(req.request.method).toBe('DELETE');
                req.flush({});
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
                expect(subscriptionExecuted).toBeTruthy();
            }));
        });

        describe('Update', () => {
            beforeEach(() => {
                _loadCanvas().flush(mockCanvas1);
                httpMock.verify();
            });

            it('should update specific canvas', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                const body: Partial<Canvas> = { name: 'My new canvas name' };

                service.canvasChanged.subscribe((canvas: Canvas) => expect(canvas.name).toEqual(body.name));

                service.updateCanvas(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id, body).subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}`
                );
                expect(req.request.method).toBe('PATCH');
                req.flush({ id: mockCanvas1.id, name: body.name });
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should update specific canvas with empty canvas name', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                const body: Partial<Canvas> = { name: '' };

                service.canvasChanged.subscribe((canvas: Canvas) => {
                    expect(translationServiceStub._instantCalls.length).toEqual(1);
                    expect(canvas.name).toEqual('test translation');
                });

                service.updateCanvas(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id, body).subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}`
                );
                expect(req.request.method).toBe('PATCH');
                req.flush({ id: mockCanvas1.id, name: body.name });
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });
    });

    describe('Canvas Slot:', () => {
        describe('Create:', () => {
            beforeEach(() => {
                _loadCanvas().flush(mockCanvas1);
                httpMock.verify();
            });

            it('should create a slot', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                const newSlot: Partial<Slot> = {
                    title: 'This is a new slot',
                    row: 1,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 1
                };

                const body = newSlot;
                service['loadedCanvas'].slots.push(newSlot as Slot);

                service.canvasChanged.subscribe((canvas: Canvas) => {
                    const updatedSlot = canvas.slots.find((s) => s.id === '2578372f-d998-4880-ad0c-6c3ed9038d4a');
                    expect(updatedSlot.title).toEqual(body.title);
                    expect(updatedSlot.row).toEqual(body.row);
                    expect(updatedSlot.column).toEqual(body.column);
                    expect(updatedSlot.columnSpan).toEqual(body.columnSpan);
                    expect(updatedSlot.rowSpan).toEqual(body.rowSpan);
                    expect(updatedSlot.slotType).toEqual(body.slotType);
                    expect(updatedSlot.sortOrder).toEqual(body.sortOrder);
                });

                service.createSlot(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id, body).subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot`
                );
                expect(req.request.method).toBe('POST');
                req.flush({ id: '2578372f-d998-4880-ad0c-6c3ed9038d4a', ...newSlot });
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('Delete:', () => {
            beforeEach(() => {
                _loadCanvas().flush(mockCanvas1);
                httpMock.verify();
            });

            it('should delete a slot', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                service['loadedCanvas'].slots.forEach((slot, i) => (slot.id = i.toString()));
                const slotsBeforeDelete = service['loadedCanvas'].slots.length;

                service.canvasChanged.subscribe((canvas: Canvas) => {
                    expect(canvas.slots.length).toEqual(slotsBeforeDelete - 1);
                    expect(canvas.slots.findIndex((s) => s.id === '1')).toEqual(-1);
                });

                service.deleteSlot(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id, '1').subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot/1`
                );
                expect(req.request.method).toBe('DELETE');
                req.flush({});
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('Update:', () => {
            beforeEach(() => {
                _loadCanvas().flush(mockCanvas1);
                httpMock.verify();
            });

            it('should update specific slot', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                const slot = mockCanvas1.slots[0];
                const body: Partial<Slot> = { title: 'My new slot title' };

                service.canvasChanged.subscribe((canvas: Canvas) => {
                    const updatedSlot = canvas.slots.find((s) => s.id === slot.id);
                    expect(updatedSlot.title).toEqual(body.title);
                });

                service.updateSlot(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id, slot.id, body).subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot/${slot.id}`
                );
                expect(req.request.method).toBe('PATCH');
                req.flush({ id: slot.id, title: body.title });
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });
    });

    describe('Canvas Submissions:', () => {
        beforeEach(() => {
            _loadCanvas().flush(mockCanvas1);
            httpMock.verify();
        });

        describe('Create:', () => {
            beforeEach(() => {
                _loadSubmissions().flush(mockCanvasSubmissionList1);
                httpMock.verify();
            });

            it('should create submission', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                const slotId = mockCanvasSubmission1.slotId;
                const body: Partial<CanvasSubmission> = { content: 'This is a new canvas submission' };

                service.canvasChanged.subscribe((canvas: Canvas) => {
                    const slotWithSubmissions = canvas.slots.find((s) => s.id === slotId);
                    expect(slotWithSubmissions.submissions.length).toEqual(mockCanvasSubmissionList1.count + 1);
                });

                service
                    .createSubmission(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id, slotId, body)
                    .subscribe((createdSubmission) => expect(createdSubmission.content).toEqual(body.content));

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot/${slotId}/submission`
                );
                expect(req.request.method).toBe('POST');
                req.flush(Object.assign(body, { id: '123', slotId }));
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('Load:', () => {
            it('should load submissions', fakeAsync(() => {
                const nextSpy = spyOn(service.canvasChanged, 'next').and.callThrough();

                const slotId = mockCanvasSubmission1.slotId;

                service.canvasChanged.subscribe((canvas: Canvas) => {
                    const slotWithSubmissions = canvas.slots.find((s) => s.id === slotId);
                    expect(slotWithSubmissions.submissions.length).toEqual(mockCanvasSubmissionList1.count);
                });

                service.loadSubmissions(mockFormat1.id, mockPhase1.id, mockActivity1.id, mockCanvas1.id).subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/submission`
                );
                expect(req.request.method).toBe('GET');
                req.flush(mockCanvasSubmissionList1);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('Delete:', () => {
            beforeEach(() => {
                _loadSubmissions().flush(mockCanvasSubmissionList1);
                httpMock.verify();
            });

            it('should delete submission', fakeAsync(() => {
                let isSubscriptionExecuted = false;
                service.canvasChanged.subscribe((canvas: Canvas) => {
                    const slot = canvas.slots.find((s) => s.id === mockCanvasSubmission1.slotId);
                    let isSubmissionDeleted = !slot.submissions.find((sub) => sub.id === mockCanvasSubmission1.id);
                    isSubscriptionExecuted = true;
                    expect(isSubmissionDeleted).toBeTruthy();
                });
                service
                    .deleteSubmission(
                        mockFormat1.id,
                        mockPhase1.id,
                        mockActivity1.id,
                        mockCanvas1.id,
                        mockCanvasSubmission1.slotId,
                        mockCanvasSubmission1.id
                    )
                    .subscribe();
                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot/${mockCanvasSubmission1.slotId}/submission/${mockCanvasSubmission1.id}`
                );
                expect(req.request.method).toBe('DELETE');
                req.flush({});
                httpMock.verify();
                expect(isSubscriptionExecuted).toBeTruthy();
            }));
        });

        describe('Update:', () => {
            beforeEach(() => {
                _loadSubmissions().flush(mockCanvasSubmissionList1);
                httpMock.verify();
            });

            it('should update submission', fakeAsync(() => {
                const body: Partial<CanvasSubmission> = { content: 'This is an updated canvas submission' };

                service
                    .updateSubmission(
                        mockFormat1.id,
                        mockPhase1.id,
                        mockActivity1.id,
                        mockCanvas1.id,
                        mockCanvasSubmission1.slotId,
                        mockCanvasSubmission1.id,
                        body
                    )
                    .subscribe((updatedSubmission) => expect(updatedSubmission.content).toEqual(body.content));

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot/${mockCanvasSubmission1.slotId}/submission/${mockCanvasSubmission1.id}`
                );
                expect(req.request.method).toBe('PATCH');
                req.flush(body);
                httpMock.verify();
            }));
        });

        describe('Vote:', () => {
            beforeEach(() => {
                _loadSubmissions().flush(mockCanvasSubmissionList1);
                httpMock.verify();
            });

            it('should vote submission', fakeAsync(() => {
                service
                    .voteSubmission(
                        mockFormat1.id,
                        mockPhase1.id,
                        mockActivity1.id,
                        mockCanvas1.id,
                        mockCanvasSubmission1.slotId,
                        mockCanvasSubmission1.id
                    )
                    .subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot/${mockCanvasSubmission1.slotId}/submission/${mockCanvasSubmission1.id}/vote`
                );
                expect(req.request.method).toBe('POST');
                req.flush('');
                httpMock.verify();
            }));

            it('should remove the vote for submission', fakeAsync(() => {
                service
                    .removeVoteSubmission(
                        mockFormat1.id,
                        mockPhase1.id,
                        mockActivity1.id,
                        mockCanvas1.id,
                        mockCanvasSubmission1.slotId,
                        mockCanvasSubmission1.id
                    )
                    .subscribe();

                const req = httpMock.expectOne(
                    `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                        `${mockActivity1.id}/canvas/${mockCanvas1.id}/slot/${mockCanvasSubmission1.slotId}/submission/${mockCanvasSubmission1.id}/vote`
                );
                expect(req.request.method).toBe('DELETE');
                req.flush('');
                httpMock.verify();
            }));
        });
    });
});
