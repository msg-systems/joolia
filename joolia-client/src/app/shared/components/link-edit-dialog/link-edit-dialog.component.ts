import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LinkEditDialogDataModel } from '../../../core/models';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty } from 'lodash-es';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-link-edit-dialog',
    templateUrl: './link-edit-dialog.component.html',
    styleUrls: ['./link-edit-dialog.component.scss']
})
export class LinkEditDialogComponent implements OnInit {
    editLinkDialogForm: FormGroup;
    deleteDisabled = true;
    invalidLinkError = false;

    @Output() deleteLinkClicked: EventEmitter<string> = new EventEmitter<string>();
    @Output() editLinkClicked: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: LinkEditDialogDataModel,
        private translate: TranslateService,
        private dialogRef: MatDialogRef<LinkEditDialogComponent>,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.editLinkDialogForm = new FormGroup({
            linkUrl: new FormControl()
        });

        if (!isEmpty(this.data.link)) {
            this.editLinkDialogForm.get('linkUrl').setValue(this.data.link.linkUrl);
            this.deleteDisabled = false;
        }
    }

    onSubmit() {
        Object.values(this.editLinkDialogForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.editLinkDialogForm.valid) {
            this.editLinkClicked.emit(this.editLinkDialogForm.value);
        }
    }

    onDelete() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.linkDeletion',
                contentParams: {},
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.deleteLinkClicked.emit();
                this.dialogRef.close();
            }
        });
    }
}
