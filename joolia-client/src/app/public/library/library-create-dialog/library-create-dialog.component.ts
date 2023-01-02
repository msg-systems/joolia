import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfigurationService, LibraryService } from '../../../core/services';

@Component({
    selector: 'app-library-create-dialog',
    templateUrl: './library-create-dialog.component.html',
    styleUrls: ['./library-create-dialog.component.scss']
})
export class LibraryCreateDialogComponent implements OnInit {
    libraryNameMaxLength: number;
    libraryCreationForm: FormGroup;

    constructor(
        private libraryService: LibraryService,
        private router: Router,
        private dialogRef: MatDialogRef<LibraryCreateDialogComponent>
    ) {}

    ngOnInit() {
        this.libraryNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.library.name;

        this.libraryCreationForm = new FormGroup({
            name: new FormControl('', [Validators.required])
        });
    }

    onSubmit() {
        Object.values(this.libraryCreationForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.libraryCreationForm.valid) {
            this.dialogRef.close(this.libraryCreationForm.value);
        }
    }
}
