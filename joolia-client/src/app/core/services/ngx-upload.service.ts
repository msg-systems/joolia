import { EventEmitter, Injectable } from '@angular/core';
import { UploaderOptions, UploadInput, UploadOutput, UploadStatus } from 'ngx-uploader';
import { ConfigurationService } from './configuration.service';
import { FileMeta } from '../models';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';
import { FileService } from './file.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxInputEvents } from '../enum/global/upload.enum';
import { isEmpty } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NgxUploadService {
    private filesToUpload = 0;
    // collects references to files
    private uploadingFiles: FileMeta[] = [];

    uploadInput: EventEmitter<UploadInput>;

    constructor(
        private logger: LoggerService,
        private snackbarService: SnackbarService,
        private translate: TranslateService,
        private fileService: FileService
    ) {
        this.uploadInput = new EventEmitter<UploadInput>();
    }

    getUploadInput() {
        return this.uploadInput;
    }

    isUploadActive(): boolean {
        this.removeFinishedUploads();
        return this.uploadingFiles.length > 0;
    }

    getUploadingFiles() {
        this.removeFinishedUploads();
        return this.uploadingFiles;
    }

    removeFinishedUploads() {
        this.uploadingFiles = this.uploadingFiles.filter((f) => {
            return (
                f.upload &&
                f.upload.progress &&
                (f.upload.progress.status === UploadStatus.Uploading || f.upload.progress.status === UploadStatus.Queue)
            );
        });
    }

    getUploadProgressForFiles(files: FileMeta[]): FileMeta[] {
        const uploadFiles = this.uploadingFiles;
        if (uploadFiles) {
            // add upload progress for each file
            files.forEach((file) => {
                const uploadFile = uploadFiles.find((f) => file.id === f.id);
                file.upload = uploadFile ? uploadFile.upload : undefined;
            });
        }
        return files;
    }

    getUploaderOptions(): UploaderOptions {
        const uploaderConfig = ConfigurationService.getConfiguration().configuration.ngxUploadServiceConfig.UploaderOptions;
        this.logger.debug(uploaderConfig, this, this.getUploaderOptions);
        return uploaderConfig;
    }

    onallAddedToQueue(output: UploadOutput, files: FileMeta[], parent: string): FileMeta[] {
        this.filesToUpload = 0;

        // get signed URLs for all uploads - each file which is not yet uploading
        files.forEach((file: FileMeta) => {
            if (file.upload && !isEmpty(file.upload) && file.upload.progress.status === 0) {
                this.filesToUpload++;
                this.fileService.loadUploadMetaForFile(parent, file).subscribe((res) => {
                    file.fileUrl = res.fileUrl;
                    this.performUpload(file);
                    file.id = res.id;
                    file.parent = parent;
                });
            }
        });

        // Only add files which start to be uploaded
        this.uploadingFiles.push(
            ...files.filter((file: FileMeta) => file.upload && !isEmpty(file.upload) && file.upload.progress.status === 0)
        );

        this.logger.debug(output, this, this.onallAddedToQueue);

        return files;
    }

    onaddedToQueue(output: UploadOutput, files: FileMeta[]) {
        if (typeof output.file !== 'undefined') {
            // File mapping ngxUploadFile -> FileMeta
            const newFile = <FileMeta>{
                id: output.file.id,
                name: output.file.name,
                upload: output.file
            };

            files.push(newFile);

            this.logger.debug(newFile, this, this.onaddedToQueue);

            return files;
        }
    }

    onuploading(output: UploadOutput, files: FileMeta[]): FileMeta[] {
        this.logger.debug(output, this, this.onuploading);

        const file = files.find((f) => f.id === output.file.id);
        if (file) {
            file.upload = output.file;
        }

        return files;
    }

    onremoved(output: UploadOutput, files: FileMeta[]): FileMeta[] {
        this.logger.debug(output, this, this.onremoved);
        this.uploadingFiles = files.filter((f) => !(f.id === output.file.id));
        return this.uploadingFiles;
    }

    onremovedAll(output: UploadOutput, files: FileMeta[]): FileMeta[] {
        this.logger.debug(output, this, this.onremovedAll);
        this.uploadingFiles = files.filter((fileEntry) => !fileEntry.upload);
        return this.uploadingFiles;
    }

    ondragOver(output: UploadOutput, files: FileMeta[]) {
        this.logger.debug(output, this, this.ondragOver);
    }

    ondragOut(output: UploadOutput, files: FileMeta[]) {
        this.logger.debug(output, this, this.ondragOut);
    }

    ondrop(output: UploadOutput, files: FileMeta[]) {
        this.logger.debug(output, this, this.ondrop);
    }

    onstart(output: UploadOutput, files: FileMeta[]) {
        this.logger.debug(output, this, this.onstart);
    }

    ondone(output: UploadOutput, files: FileMeta[], suppressSnackbar?: boolean) {
        this.filesToUpload--;
        this.uploadingFiles = this.uploadingFiles.filter((f) => !(f.upload && f.upload.id === output.file.id));

        if (!suppressSnackbar) {
            this.snackbarService.openWithMessage('upload.successful', { fileName: output.file.name });
        }

        this.logger.debug(output, this, this.ondone);
    }

    onrejected(output: UploadOutput, files: FileMeta[]) {
        this.filesToUpload--;
        this.snackbarService.openWithMessage('upload.failed', { fileName: output.file.name });
        this.logger.debug(output, this, this.onrejected);
    }

    oncancelled(output: UploadOutput, files: FileMeta[]) {
        this.snackbarService.openWithMessage('upload.cancelled', { fileName: output.file.name });
        this.logger.debug(output, this, this.oncancelled);
    }

    performUpload(fileToUpload: FileMeta) {
        if (fileToUpload.fileUrl) {
            this.uploadInput.emit({
                type: NgxInputEvents.UPLOADFILE,
                url: fileToUpload.fileUrl,
                method: 'PUT',
                file: fileToUpload.upload,
                includeWebKitFormBoundary: false,
                headers: { 'Content-Type': fileToUpload.upload.type, 'ngsw-bypass': 'true' }
            });
        } else {
            this.snackbarService.openWithMessage('upload.failed', { fileName: fileToUpload.name });
        }

        this.logger.debug(fileToUpload, this, this.performUpload);
    }

    abortFileUpload(file: FileMeta) {
        file.upload.progress.data.percentage > 0 ? this.cancelFileUpload(file.upload.id) : this.removeFileFromQueue(file.upload.id);
    }

    removeFileFromQueue(fileUploadId: string) {
        this.uploadingFiles = this.uploadingFiles.filter((f) => !(f.upload && f.upload.id === fileUploadId));
        this.uploadInput.emit({ type: NgxInputEvents.REMOVE, id: fileUploadId });
        this.logger.debug('UploadID: ' + fileUploadId, this, this.removeFileFromQueue);
    }

    cancelFileUpload(fileUploadId: string) {
        this.uploadingFiles = this.uploadingFiles.filter((f) => !(f.upload && f.upload.id === fileUploadId));
        this.uploadInput.emit({ type: 'cancel', id: fileUploadId });
        this.logger.debug('UploadID: ' + fileUploadId, this, this.cancelFileUpload);
    }

    checkAllUploadDone() {
        return this.filesToUpload === 0;
    }
}
