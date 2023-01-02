import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { assign } from 'lodash-es';
import { ActivityServiceStub, ConfigurationServiceStub, FormatServiceStub, getMockData, PhaseServiceStub } from '../../../testing/unitTest';
import { Rating } from '../models';
import { ActivityService } from './activity.service';
import { ConfigurationService } from './configuration.service';
import { FormatService } from './format.service';
import { PhaseService } from './phase.service';
import { RatingService } from './rating.service';

const configurationServiceStub = new ConfigurationServiceStub();
const formatServiceStub = new FormatServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const activityServiceStub = new ActivityServiceStub();

let mockFormat1;
let mockPhase1;
let mockActivity1;
let mockSubmission1;
let mockRating1;

describe('RatingService', () => {
    let service: RatingService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                RatingService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: ActivityService, useValue: activityServiceStub }
            ]
        });

        service = TestBed.inject(RatingService);
        httpMock = TestBed.inject(HttpTestingController);

        mockFormat1 = getMockData('format.format1');
        mockPhase1 = getMockData('phase.phase1');
        mockActivity1 = getMockData('activity.activity1');
        mockSubmission1 = getMockData('submission.submission1');
        mockRating1 = getMockData('rating.rating1');
    });

    it('service should be created', () => {
        expect(service).toBeDefined();
    });

    describe('Load', () => {
        it('should load rating', fakeAsync(() => {
            const nextSpy = spyOn(service.ratingChanged, 'next').and.callThrough();

            const sub = service.ratingChanged.subscribe((rating) => {
                expect(rating.id).toEqual(mockRating1.id);
            });

            service.loadRating(mockSubmission1.id).subscribe((l) => expect(l).toEqual(mockRating1));

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                    `${mockActivity1.id}/submission/${mockSubmission1.id}/rating`
            );

            expect(req.request.method).toBe('GET');
            req.flush(mockRating1);
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('Create and Update', () => {
        beforeEach(() => {
            service.loadRating(mockSubmission1.id).subscribe();
            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                    `${mockActivity1.id}/submission/${mockSubmission1.id}/rating`
            );
            req.flush(mockRating1);
            httpMock.verify();
        });

        it('should create or update rating', fakeAsync(() => {
            const newRating: Partial<Rating> = { rating: 1.5 };
            const newRatingId = '2e1b563e-af9a-4e42-8d76-43fac5ccf169';

            const nextSpy = spyOn(service.ratingChanged, 'next').and.callThrough();

            const sub = service.ratingChanged.subscribe((rating) => {
                expect(rating.id).toEqual(newRatingId);
            });

            service.patchRating(mockSubmission1.id, newRating.rating).subscribe();

            const req = httpMock.expectOne(
                `https://api.joolia.net/format/${mockFormat1.id}/phase/${mockPhase1.id}/activity/` +
                    `${mockActivity1.id}/submission/${mockSubmission1.id}/rating`
            );
            expect(req.request.method).toBe('PATCH');
            req.flush(assign({ id: newRatingId }, newRating));
            httpMock.verify();

            sub.unsubscribe();
            expect(nextSpy).toHaveBeenCalled();
        }));
    });
});
