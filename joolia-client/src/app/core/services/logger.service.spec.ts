import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { LoggerService } from './logger.service';

const ngxLoggerSpy = jasmine.createSpyObj('NGXLogger', ['updateConfig', 'trace', 'debug', 'info', 'log', 'warn', 'error', 'fatal']);

describe('LoggerService', () => {
    let service: LoggerService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LoggerService, { provide: NGXLogger, useValue: ngxLoggerSpy }]
        });
        service = TestBed.inject(LoggerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    xdescribe('todo', () => {
        xit('todo', () => {
            console.log('to be implemented');
        });
    });
});
