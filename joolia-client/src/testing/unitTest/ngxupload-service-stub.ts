import { NgxUploadService } from '../../app/core/services';
import { UploaderOptions, UploadInput } from 'ngx-uploader';
import { EventEmitter } from '@angular/core';

export class NgxUploadServiceStub implements Partial<NgxUploadService> {
    getUploadInput(): EventEmitter<UploadInput> {
        return new EventEmitter<UploadInput>();
    }

    getUploaderOptions(): UploaderOptions {
        return <UploaderOptions>{};
    }

    isUploadActive(): boolean {
        return false;
    }
}
