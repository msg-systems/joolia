import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarUploadDialogComponent } from './avatar-upload-dialog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FileService, LoggerService, NgxUploadService, SnackbarService } from 'src/app/core/services';
import { MaterialModule } from 'src/app/core/components';
import { UploadOutput } from 'ngx-uploader';
import {
    DialogStub,
    FileServiceStub,
    getMockData,
    LoggerServiceStub,
    NgxUploadServiceStub,
    TranslateServiceStub
} from '../../../../testing/unitTest';

let uploadedFile;

const dialogRef = new DialogStub('');
const translateServiceStub = new TranslateServiceStub();
const fileServiceStub = new FileServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const uploadServiceStub = new NgxUploadServiceStub();

const matDialogDataMock = {
    onImageUploadOutput(ngxUS: NgxUploadService, output: UploadOutput) {
        uploadedFile = output.file;
    }
};

let mockFileUpload1;

describe('AvatarUploadDialogComponent', () => {
    let component: AvatarUploadDialogComponent;
    let fixture: ComponentFixture<AvatarUploadDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaterialModule],
            declarations: [AvatarUploadDialogComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: MatDialogRef, useValue: dialogRef },
                { provide: NgxUploadService, useValue: uploadServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: SnackbarService, useValue: {} },
                { provide: FileService, useValue: fileServiceStub },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarUploadDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockFileUpload1 = getMockData('fileupload.fileupload1');

        translateServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should upload', () => {
        component.file = mockFileUpload1;
        component.onUploadAvatar();

        expect(uploadedFile).toEqual(component.file);
    });
});
