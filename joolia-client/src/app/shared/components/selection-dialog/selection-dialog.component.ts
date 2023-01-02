import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MultiSelectionDialogData, MultiSelectOptionData } from '../../../core/models';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-selection-dialog',
    templateUrl: './selection-dialog.component.html',
    styleUrls: ['./selection-dialog.component.scss']
})
export class SelectionDialogComponent implements OnInit {
    selectionDialogForm: FormGroup;

    constructor(
        protected dialogRef: MatDialogRef<SelectionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MultiSelectionDialogData
    ) {}

    ngOnInit() {
        this.selectionDialogForm = new FormGroup({});
        this.data.selectionDetails.forEach((selectionDetail: MultiSelectOptionData) => {
            this.selectionDialogForm.addControl(
                selectionDetail.entityName,
                new FormControl(selectionDetail.selectOptions[0].value, selectionDetail.required ? [Validators.required] : [])
            );
        });
    }

    onSubmit() {
        Object.values(this.selectionDialogForm.controls).forEach((control) => {
            control.markAsTouched();
        });
        if (this.selectionDialogForm.valid) {
            const dialogResponse = {};
            Object.keys(this.selectionDialogForm.controls).forEach((controlName) => {
                dialogResponse[controlName] = this.selectionDialogForm.value[controlName];
            });

            this.dialogRef.close(dialogResponse);
        }
    }
}
