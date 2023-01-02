import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileMeta } from '../../../core/models';
import { FileService, NgxUploadService, UtilService } from '../../../core/services';
import { UploaderOptions, UploadInput, UploadOutput, UploadStatus } from 'ngx-uploader';
import { isEmpty } from 'lodash-es';

export interface IDownloadOptions {
    fileId: string;
    download: boolean;
}

@Component({
    selector: 'file-list',
    templateUrl: './file-list.component.html',
    styleUrls: ['./file-list.component.scss']
})
export class FileListComponent {
    @Input() files: FileMeta[];
    @Input() editable = false;
    @Output() fileEditClicked: EventEmitter<FileMeta> = new EventEmitter();
    @Output() fileDeleteClicked: EventEmitter<string> = new EventEmitter();
    @Output() fileDownloadClicked: EventEmitter<IDownloadOptions> = new EventEmitter();
    @Output() fileUploadOutput: EventEmitter<UploadOutput> = new EventEmitter();

    uploadInput: EventEmitter<UploadInput>;
    uploadOptions: UploaderOptions;
    uploadedFiles = new Set();
    statusUploading: number;
    isTouchDevice = false;
    isHovering = false;

    constructor(private fileService: FileService, private ngxUS: NgxUploadService) {
        if (this.ngxUS) {
            this.uploadInput = this.ngxUS.getUploadInput();
            this.uploadOptions = this.ngxUS.getUploaderOptions();
        }
        this.statusUploading = UploadStatus.Uploading;
        this.isTouchDevice = UtilService.isTouchDevice();
    }

    onFileDeleteClicked(fileId: FileMeta['id']): void {
        this.fileDeleteClicked.emit(fileId);
    }

    getDownloadLink(file: FileMeta, download: boolean) {
        if (!this.isProcessing(file)) {
            this.fileDownloadClicked.emit({ fileId: file.id, download: download });
        }
    }

    getUploaderOptions(): UploaderOptions {
        return this.uploadOptions;
    }

    onUploadOutput(output: UploadOutput): void {
        if (output.type === 'done') {
            this.uploadedFiles.add(this.files.find((file) => file.upload && output.file.id === file.upload.id).id);
        }
        this.fileUploadOutput.emit(output);
    }

    onUploadInput() {
        return this.ngxUS.getUploadInput();
    }

    onHover(fileId: string) {
        this.isHovering = true;
        this.uploadedFiles.delete(fileId);
    }

    onFileEditClicked(file: FileMeta) {
        this.fileEditClicked.emit(file);
    }

    isProcessing(file) {
        return file.upload && isEmpty(file.upload);
    }
}
