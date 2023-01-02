import { NgxUploadService } from '../services';
import { UploadOutput } from 'ngx-uploader';

export interface AvatarUploadDialogDataModel {
    headingKey: string;
    roundAvatar: boolean;
    onImageUploadOutput(ngxUS: NgxUploadService, output: UploadOutput): void;
}
