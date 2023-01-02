import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FileEditDialogDataModel } from '../../../core/models';
import { UtilService, ValidationService } from '../../../core/services';

@Component({
    selector: 'edit-file-dialog',
    templateUrl: './edit-file-dialog.component.html',
    styleUrls: ['./edit-file-dialog.component.scss']
})
export class EditFileDialogComponent implements OnInit {
    editFileDialogForm: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: FileEditDialogDataModel,
        private dialogRef: MatDialogRef<EditFileDialogComponent>,
        private validationService: ValidationService
    ) {}

    ngOnInit() {
        const fileName = UtilService.removeFileExtension(this.data.fileName);
        const extension = UtilService.extractFileExtension(this.data.fileName);

        this.editFileDialogForm = new FormGroup(
            {
                fileName: new FormControl(fileName),
                extension: new FormControl(extension)
            },
            [this.validationService.validateFileNameExtensionLength]
        );
    }

    onSubmit() {
        Object.values(this.editFileDialogForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.editFileDialogForm.valid) {
            const extension = this.editFileDialogForm.controls['extension'].value;
            let fileName = this.editFileDialogForm.controls['fileName'].value;

            if (extension && extension.length > 0) {
                fileName = [fileName, extension].join('.');
            }

            this.dialogRef.close(fileName);
        }
    }
}
