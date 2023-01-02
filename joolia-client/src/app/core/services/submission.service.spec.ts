import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import {
    ActivityServiceStub,
    ConfigurationServiceStub,
    FileServiceStub,
    FormatServiceStub,
    getMockData,
    PhaseServiceStub
} from '../../../testing/unitTest';
import { ConfigurationService } from './configuration.service';
import { FileService } from './file.service';
import { SubmissionService } from './submission.service';
import { FormatService } from './format.service';
import { ActivityService } from './activity.service';
import { PhaseService } from './phase.service';
import { HttpRequest } from '@angular/common/http';

const configurationServiceStub = new ConfigurationServiceStub();
const fileServiceStub = new FileServiceStub();
const formatServiceStub = new FormatServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const activityServiceStub = new ActivityServiceStub();

let mockFormat1;
let mockPhase1;
let mockActivity1;
let mockSubmission1;

describe('SubmissionService', () => {
    let service: SubmissionService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                SubmissionService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: FileService, useValue: fileServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: ActivityService, useValue: activityServiceStub }
            ]
        });
        service = TestBed.inject(SubmissionService);
        httpMock = TestBed.inject(HttpTestingController);

        mockFormat1 = getMockData('format.format1');
        mockPhase1 = getMockData('phase.phase1');
        mockActivity1 = getMockData('activity.activity1');
        mockSubmission1 = getMockData('submission.submission1');
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    xdescribe('todo', () => {
        xit('todo', () => {
            console.log('to be implemented');
        });
    });

    it('should get averageRating', fakeAsync(() => {
        service.getAverageRating(mockSubmission1.id).subscribe((averageRating) => {
            expect(averageRating).toBe(mockSubmission1.averageRating);
        });

        const req = httpMock.expectOne((request: HttpRequest<any>) =>
            request.url.startsWith(
                `https://api.joolia.net/format/` +
                    `${mockFormat1.id}/phase/${mockPhase1.id}/activity/${mockActivity1.id}/submission/${mockSubmission1.id}`
            )
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockSubmission1);
        httpMock.verify();
    }));
});
