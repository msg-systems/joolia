import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigurationService } from '../../../core/services';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-workspace-create-dialog',
    templateUrl: './workspace-create-dialog.component.html',
    styleUrls: ['./workspace-create-dialog.component.scss']
})
export class WorkspaceCreateDialogComponent implements OnInit {
    workspaceCreationForm: FormGroup;
    workspaceNameMaxLength: number;
    workspaceDescriptionMaxLength: number;

    constructor(private dialogRef: MatDialogRef<WorkspaceCreateDialogComponent>) {}

    ngOnInit() {
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.workspace;
        this.workspaceNameMaxLength = characterLimits.name;
        this.workspaceDescriptionMaxLength = characterLimits.description;

        this.workspaceCreationForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            description: new FormControl(''),
            licensesCount: new FormControl(1)
        });
    }

    onSubmit() {
        Object.values(this.workspaceCreationForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.workspaceCreationForm.valid) {
            this.dialogRef.close(this.workspaceCreationForm.value);
        }
    }
}
