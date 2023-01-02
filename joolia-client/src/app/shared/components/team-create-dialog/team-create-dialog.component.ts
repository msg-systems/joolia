import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfigurationService } from '../../../core/services';

@Component({
    selector: 'app-team-create-dialog',
    templateUrl: './team-create-dialog.component.html',
    styleUrls: ['./team-create-dialog.component.scss']
})
export class TeamCreateDialogComponent implements OnInit {
    teamCreationForm: FormGroup;
    teamNameMaxLength: number;

    constructor(private dialogRef: MatDialogRef<TeamCreateDialogComponent>) {}

    ngOnInit() {
        this.teamNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.team.name;
        this.teamCreationForm = new FormGroup({
            name: new FormControl('', [Validators.required])
        });
    }

    onSubmit() {
        Object.values(this.teamCreationForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.teamCreationForm.valid) {
            this.dialogRef.close(this.teamCreationForm.value);
        }
    }
}
