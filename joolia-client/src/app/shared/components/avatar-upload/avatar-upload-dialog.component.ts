import { Component, EventEmitter, Inject, OnInit, Self } from '@angular/core';
import { NgxUploadService } from '../../../core/services';
import { UploaderOptions, UploadFile, UploadInput, UploadOutput } from 'ngx-uploader';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AvatarUploadDialogDataModel } from '../../../core/models';
import * as moment from 'moment';
import { NgxOutputEvents } from '../../../core/enum/global/upload.enum';

@Component({
    selector: 'app-avatar-upload',
    templateUrl: './avatar-upload-dialog.component.html',
    styleUrls: ['./avatar-upload-dialog.component.scss']
})
export class AvatarUploadDialogComponent implements OnInit {
    uploadInput: EventEmitter<UploadInput>;
    uploadOptions: UploaderOptions;
    file: UploadFile;
    imageFileChanged: Blob = null;
    dragOver: boolean;
    isUploading: boolean;

    constructor(
        public dialogRef: MatDialogRef<AvatarUploadDialogComponent>,
        private ngxUS: NgxUploadService,
        @Inject(MAT_DIALOG_DATA) public data: AvatarUploadDialogDataModel
    ) {}

    ngOnInit() {
        this.uploadInput = this.ngxUS.getUploadInput();
        this.uploadOptions = this.ngxUS.getUploaderOptions();
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
            case NgxOutputEvents.DONE:
            case NgxOutputEvents.REJECTED:
                this.data.onImageUploadOutput(this.ngxUS, output);
                this.dialogRef.close();
                break;
            default:
                this.data.onImageUploadOutput(this.ngxUS, output);
                break;
        }
    }

    onUploadAvatar() {
        if (this.file) {
            this.isUploading = true;

            this.data.onImageUploadOutput(this.ngxUS, {
                type: NgxOutputEvents.ALLADDEDTOQUEUE,
                file: this.file
            });
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
