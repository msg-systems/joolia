import { Observable } from 'rxjs';
import { NgxUploadService } from '../services';
import { UploadOutput } from 'ngx-uploader';

export interface KeyVisualUploadDialogDataModel {
    parent: string;
    onImageUploadOutput(parent: string, ngxUS: NgxUploadService, output: UploadOutput): void;
    uploadLink(parent: string, body: any): Observable<any>;
}
