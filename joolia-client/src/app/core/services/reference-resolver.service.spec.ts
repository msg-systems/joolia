import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigurationService } from './configuration.service';
import { ConfigurationServiceStub, LoggerServiceStub } from '../../../testing/unitTest';
import { LoggerService } from './logger.service';
import { ReferenceResolverService } from './reference-resolver.service';

const configurationServiceStub = new ConfigurationServiceStub();
const loggerServiceStub = new LoggerServiceStub();

describe('ReferenceResolverService', () => {
    let service: ReferenceResolverService;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ReferenceResolverService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub }
            ]
        });
        service = TestBed.inject(ReferenceResolverService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    xdescribe('dosomething', () => {
        it('should dosomething', () => {
            console.log('do');
        });
    });
});
