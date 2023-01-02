import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from './configuration.service';
import { LoggerService } from './logger.service';
import { LoggerServiceStub } from '../../../testing/unitTest';

const loggerServiceStub = new LoggerServiceStub();

describe('ConfigurationService', () => {
    let service: ConfigurationService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ConfigurationService, { provide: LoggerService, useValue: loggerServiceStub }]
        });

        service = TestBed.inject(ConfigurationService);
        httpMock = TestBed.inject(HttpTestingController);
        loggerServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('getConfiguration', () => {
        it('should reply with the config object', () => {
            expect(ConfigurationService.getConfiguration()).not.toBeNull();
        });

        it('should not reply with serverConfiguration', () => {
            expect(ConfigurationService.getConfiguration().serverConnection.length).toBe(0);
        });

        it('should not reply with tokenCookieDomain', () => {
            expect(ConfigurationService.getConfiguration().tokenCookieDomain.length).toBe(0);
        });
    });
});
