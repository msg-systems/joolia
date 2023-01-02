import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export enum FormatCreationMethod {
    Blank,
    Template
}

@Component({
    selector: 'app-format-create-dialog',
    templateUrl: './format-create-dialog.component.html',
    styleUrls: ['./format-create-dialog.component.scss']
})
export class FormatCreateDialogComponent {
    constructor(private dialogRef: MatDialogRef<FormatCreateDialogComponent>) {}

    onBlankFormatCreate() {
        this.dialogRef.close(FormatCreationMethod.Blank);
    }

    onTemplateFormatCreate() {
        this.dialogRef.close(FormatCreationMethod.Template);
    }
}
