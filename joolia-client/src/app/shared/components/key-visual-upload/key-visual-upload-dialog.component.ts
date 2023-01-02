import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { ConfigurationService, NgxUploadService, UtilService, ValidationService } from '../../../core/services';
import { UploaderOptions, UploadFile, UploadInput, UploadOutput } from 'ngx-uploader';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { KeyVisualUploadDialogDataModel } from '../../../core/models';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as moment from 'moment';
import { NgxOutputEvents } from '../../../core/enum/global/upload.enum';

@Component({
    selector: 'app-keyvisual-upload',
    templateUrl: './key-visual-upload-dialog.component.html',
    styleUrls: ['./key-visual-upload-dialog.component.scss']
})
export class KeyVisualUploadDialogComponent implements OnInit {
    activeTab = 0;

    uploadInput: EventEmitter<UploadInput>;
    uploadOptions: UploaderOptions;
    embeddedVideoUrl: string = null;
    file: UploadFile;
    imageFileChanged: Blob = null;
    dragOver: boolean;
    isUploading: boolean;

    videoForm: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<KeyVisualUploadDialogComponent>,
        private ngxUS: NgxUploadService,
        @Inject(MAT_DIALOG_DATA) public data: KeyVisualUploadDialogDataModel,
        private validationService: ValidationService,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        this.uploadInput = this.ngxUS.getUploadInput();
        this.uploadOptions = this.ngxUS.getUploaderOptions();

        this.videoForm = new FormGroup({
            video: new FormControl('', [Validators.required, this.validationService.validateVideoUrl])
        });

        this.videoForm.valueChanges
            .pipe(debounceTime(ConfigurationService.getConfiguration().configuration.validations.debounceTime), distinctUntilChanged())
            .subscribe((value) => (this.embeddedVideoUrl = UtilService.getEmbeddedYouTubeUrl(value.video)));
    }

    onTabChange(event: MatTabChangeEvent) {
        this.activeTab = event.index;
    }

    imageCropped(event: ImageCroppedEvent) {
        if (this.file && event.file) {
            this.file.size = event.file.size;
            this.file.type = event.file.type;
            this.file.nativeFile = Object.assign(event.file, {
                lastModified: moment().unix(),
                name: this.file.name
            });
        }
    }

    onUploadOutput(output: UploadOutput) {
        switch (output.type) {
            case NgxOutputEvents.DRAGOVER:
                this.dragOver = true;
                break;
            case NgxOutputEvents.DRAGOUT:
            case NgxOutputEvents.DROP:
                this.dragOver = false;
                break;
            case NgxOutputEvents.ALLADDEDTOQUEUE:
                // perform upload on click 'okay'
                break;
            case NgxOutputEvents.ADDEDTOQUEUE:
                if (output.file) {
                    this.file = output.file;
                    this.imageFileChanged = output.file.nativeFile;
                }
                break;
            case NgxOutputEvents.UPLOADING:
                this.file = output.file;
                break;
            case NgxOutputEvents.DONE:
            case NgxOutputEvents.REJECTED:
                this.data.onImageUploadOutput(this.data.parent, this.ngxUS, output);
                this.dialogRef.close();
                break;
            default:
                this.data.onImageUploadOutput(this.data.parent, this.ngxUS, output);
                break;
        }
    }

    onUploadKeyVisual() {
        switch (this.activeTab) {
            case 0:
                this.isUploading = true;
                this.onUploadImage();
                break;
            case 1:
                this.onUploadLink();
                break;
        }
    }

    onUploadImage() {
        if (this.file) {
            this.data.onImageUploadOutput(this.data.parent, this.ngxUS, {
                type: NgxOutputEvents.ALLADDEDTOQUEUE,
                file: this.file
            });
        }
    }

    onUploadLink() {
        if (this.videoForm.touched && this.videoForm.valid) {
            this.data
                .uploadLink(this.data.parent, {
                    linkUrl: this.embeddedVideoUrl
                })
                .subscribe(() => {
                    this.dialogRef.close();
                });
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
