import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigurationServiceStub } from '../../../testing/unitTest';
import { CommentService } from './comment.service';
import { ConfigurationService } from './configuration.service';

const configurationServiceStub = new ConfigurationServiceStub();

describe('CommentService', () => {
    let service: CommentService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommentService, { provide: ConfigurationService, useValue: configurationServiceStub }]
        });

        service = TestBed.inject(CommentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    xit('service should be created', () => {
        expect(service).toBeDefined();
    });

    xdescribe('todo', () => {
        xit('todo', () => {
            console.log('to be implemented');
        });
    });
});
