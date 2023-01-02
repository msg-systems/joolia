import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';
import { TranslateService } from '@ngx-translate/core';
import { FileServiceStub, LoggerServiceStub, TranslateServiceStub } from '../../../testing/unitTest';
import { SnackbarService } from './snackbar.service';
import { FileService } from './file.service';
import { NgxUploadService } from './ngx-upload.service';

const translateServiceStub = new TranslateServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['']);
const fileServiceStub = new FileServiceStub();

describe('NgxUploadService', () => {
    let service: NgxUploadService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                NgxUploadService,
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: SnackbarService, useValue: snackbarServiceSpy },
                { provide: FileService, useValue: fileServiceStub }
            ]
        });
        service = TestBed.inject(NgxUploadService);

        translateServiceStub._resetStubCalls();
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
