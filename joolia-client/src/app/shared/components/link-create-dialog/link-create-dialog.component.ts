import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigurationService, ValidationService } from '../../../core/services';

@Component({
    selector: 'app-link-create-dialog',
    templateUrl: './link-create-dialog.component.html',
    styleUrls: ['./link-create-dialog.component.scss']
})
export class LinkCreateDialogComponent implements OnInit {
    linkCreationForm: FormGroup;
    linkDescriptionMaxLength: number;

    constructor(private dialogRef: MatDialogRef<LinkCreateDialogComponent>, private validationService: ValidationService) {}

    ngOnInit() {
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.link;
        this.linkDescriptionMaxLength = characterLimits.description;

        this.linkCreationForm = new FormGroup({
            linkUrl: new FormControl('', [Validators.required, this.validationService.validateUrl]),
            description: new FormControl('')
        });
    }

    onSubmit() {
        Object.values(this.linkCreationForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.linkCreationForm.valid) {
            this.dialogRef.close(this.linkCreationForm.value);
        }
    }
}
