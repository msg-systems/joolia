import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { ConfigurationServiceStub, FormatServiceStub, getMockData, TranslateServiceStub } from '../../../testing/unitTest';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { PhaseService } from './phase.service';
import { assign } from 'lodash-es';
import { FormatService } from './format.service';
import { IQueryParams } from './util.service';
import { DurationUnit, Phase, PhaseState } from '../models';
import * as moment from 'moment';

const configurationServiceStub = new ConfigurationServiceStub();
const translationServiceStub = new TranslateServiceStub();
const formatServiceStub = new FormatServiceStub();

let mockPhaseList1;
let mockPhase1;
let mockPhaseTemplate1;
let mockFormat1;

const updatedPhase: Partial<Phase> = {
    startDate: moment('2019-03-13T16:15:00.000Z'),
    name: 'updated Phase b',
    activityCount: 6,
    duration: 300
};

const phaseURL = `https://api.joolia.net/format/` + formatServiceStub.getCurrentFormat().id + '/phase';

describe('PhaseService', () => {
    let service: PhaseService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PhaseService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: TranslateService, useValue: translationServiceStub },
                { provide: FormatService, useValue: formatServiceStub }
            ]
        });

        service = TestBed.inject(PhaseService);
        httpMock = TestBed.inject(HttpTestingController);

        mockPhaseList1 = getMockData('phase.list.list1');
        mockPhase1 = getMockData('phase.phase1');
        mockPhaseTemplate1 = getMockData('template.phase.template1');
        mockFormat1 = getMockData('format.format1');

        translationServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Create', () => {
        describe('Create Phase', () => {
            it('should create a phase', fakeAsync(() => {
                const body = {
                    name: mockPhase1.name,
                    format: mockFormat1.id,
                    durationUnit: mockPhase1.durationUnit
                };

                service.createPhase(body).subscribe((newPhase) => {
                    expect(newPhase.id).toBe('291a62c1-a668-47e2-bebe-b896b30ddd84');
                });

                const req = httpMock.expectOne(phaseURL);
                expect(req.request.method).toBe('POST');
                req.flush(assign({ id: '291a62c1-a668-47e2-bebe-b896b30ddd84' }, body));
                httpMock.verify();
            }));

            it('should create a phase from template', fakeAsync(() => {
                const body = {
                    name: mockPhase1.name,
                    format: mockFormat1.id,
                    phaseTemplateId: mockPhaseTemplate1.id
                };

                service.createPhaseFromTemplate(mockPhaseTemplate1.id).subscribe((newPhase) => {
                    expect(newPhase.id).toBe('aeefe93d-bc09-4b08-b55d-027dfda3dd8f');
                });

                const req = httpMock.expectOne(`${phaseURL}/_template`);
                expect(req.request.method).toBe('POST');
                expect(req.request.body).toEqual({
                    phaseTemplateId: mockPhaseTemplate1.id
                });
                req.flush(assign({ id: 'aeefe93d-bc09-4b08-b55d-027dfda3dd8f' }, body));
                httpMock.verify();
            }));
        });
    });

    describe('Load:', () => {
        describe('Phase', () => {
            it('load specific phase', fakeAsync(() => {
                const nextSpy = spyOn(service.phaseChanged, 'next').and.callThrough();

                const sub = service.phaseChanged.subscribe((p) => {
                    expect(p).toEqual(mockPhase1);
                });

                service.loadPhase(mockPhase1.id).subscribe();

                const req = httpMock.expectOne(`${phaseURL}/${mockPhase1.id}`);
                req.flush(mockPhase1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should return the loaded phase', fakeAsync(() => {
                service.loadPhase(mockPhase1.id).subscribe();

                const req = httpMock.expectOne(`${phaseURL}/${mockPhase1.id}`);
                req.flush(mockPhase1);
                httpMock.verify();

                expect(service.getCurrentPhase()).toEqual(mockPhase1);
            }));
        });

        describe('phases', () => {
            it('should load the phases', fakeAsync(() => {
                const nextSpy = spyOn(service.phaseListChanged, 'next').and.callThrough();

                const sub = service.phaseListChanged.subscribe((p) => {
                    expect(p).toEqual(mockPhaseList1);
                    expect(p.count).toBe(mockPhaseList1.count);
                });

                service.loadPhases().subscribe();
                const req = httpMock.expectOne(phaseURL);
                req.flush(mockPhaseList1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load more phases', fakeAsync(() => {
                service.loadPhases().subscribe();
                const req1 = httpMock.expectOne(phaseURL);
                req1.flush(mockPhaseList1);
                httpMock.verify();

                const nextSpy = spyOn(service.phaseListChanged, 'next').and.callThrough();

                const sub = service.phaseListChanged.subscribe((p) => {
                    expect(p.entities.length).toBe(6);
                });

                service.loadPhases({}, true).subscribe();
                const req2 = httpMock.expectOne(phaseURL);
                req2.flush(mockPhaseList1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load the ids of phases', fakeAsync(() => {
                const queryParams: IQueryParams = {
                    select: 'id'
                };

                service.loadPhases(queryParams).subscribe();

                const req = httpMock.expectOne(`${phaseURL}?select%5B%5D=id`);
                req.flush(mockPhaseList1);
                httpMock.verify();
            }));
        });
    });

    describe('edit:', () => {
        beforeEach(() => {
            // load specific phase
            service.loadPhase(mockPhase1.id).subscribe();
            httpMock.expectOne(() => true).flush({ ...mockPhase1 });
            httpMock.verify();
        });

        describe('edit phase', () => {
            it('edit phase', fakeAsync(() => {
                const currentPhase = service.getCurrentPhase();
                const mockStartMoment = moment(mockPhase1.startDate);
                expect(currentPhase.hasOwnProperty('name')).toBe(true);
                expect(currentPhase.name).toEqual(mockPhase1.name);
                expect(currentPhase.startDate).toEqual(mockStartMoment);
                expect(currentPhase.activityCount).toEqual(mockPhase1.activityCount);
                expect(currentPhase.duration).toEqual(mockPhase1.duration);

                const nextSpy = spyOn(service.phaseChanged, 'next').and.callThrough();

                const sub = service.phaseChanged.subscribe((loadedPhase) => {
                    expect(loadedPhase.hasOwnProperty('name')).toBe(true);
                    expect(loadedPhase.name).toEqual(updatedPhase.name);
                    expect(loadedPhase.startDate).toEqual(updatedPhase.startDate);
                    expect(loadedPhase.activityCount).toEqual(updatedPhase.activityCount);
                    expect(loadedPhase.duration).toEqual(updatedPhase.duration);
                });

                service.updatePhase(mockPhase1.id, updatedPhase).subscribe();

                const req = httpMock.expectOne(`${phaseURL}/${mockPhase1.id}`);
                req.flush(Object.assign(currentPhase, updatedPhase));
                expect(req.request.method).toBe('PATCH');
                expect(req.request.body).toEqual(updatedPhase);

                httpMock.verify();
                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('change phase type (duration unit)', fakeAsync(() => {
                const currentPhase = service.getCurrentPhase();

                const nextSpy = spyOn(service.phaseChanged, 'next').and.callThrough();

                const sub = service.phaseChanged.subscribe((loadedPhase) => {
                    expect(loadedPhase.durationUnit).toEqual(DurationUnit.DAYS);
                });

                const updatedBody = {
                    durationUnit: DurationUnit.DAYS
                };

                service.updatePhase(mockPhase1.id, updatedBody).subscribe();

                const req = httpMock.expectOne(`${phaseURL}/${mockPhase1.id}`);
                req.flush(Object.assign(currentPhase, updatedBody));
                expect(req.request.method).toBe('PATCH');
                expect(req.request.body).toEqual(updatedBody);

                httpMock.verify();
                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });
    });

    describe('current phases', () => {
        it('should return active phases', fakeAsync(() => {
            const phase1 = getMockData('phase.phase1');
            phase1.status = PhaseState.ACTIVE;
            phase1.startDate = moment();
            const phase2 = getMockData('phase.phase2');
            phase2.status = PhaseState.PAST;
            const phase3 = getMockData('phase.phase3');
            phase3.status = PhaseState.ACTIVE;
            phase3.startDate = moment().subtract({ minutes: 60 });
            const phaseList = { entities: [phase1, phase2, phase3], count: 3 };

            service.loadCurrentPhases().subscribe((data) => {
                expect(data.length).toBe(2);
                expect(data[0].id).toBe(phase3.id);
                expect(data[1].id).toBe(phase1.id);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase`);
            expect(req.request.method).toBe('GET');
            req.flush(phaseList);
            httpMock.verify();
        }));

        it('should return next planned phase', fakeAsync(() => {
            const phase1 = getMockData('phase.phase1');
            phase1.status = PhaseState.PLANNED;
            phase1.startDate = moment().add({ minutes: 20 });
            const phase2 = getMockData('phase.phase2');
            phase2.status = PhaseState.PAST;
            const phase3 = getMockData('phase.phase3');
            phase3.status = PhaseState.PLANNED;
            phase3.startDate = moment().add({ minutes: 30 });
            const phaseList = { entities: [phase1, phase2, phase3], count: 3 };

            service.loadCurrentPhases().subscribe((data) => {
                expect(data.length).toBe(1);
                expect(data[0].id).toBe(phase1.id);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/phase`);
            expect(req.request.method).toBe('GET');
            req.flush(phaseList);
            httpMock.verify();
        }));
    });
});
