import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractDialogData, InvitationData } from '../../../core/models';
import { ConfigurationService, ValidationService } from '../../../core/services';

/**
 * The InvitationDialogComponent displays the content of an invitation dialog in which an invitation text can be written and several mail
 * addresses can be added as invitations.
 */
@Component({
    selector: 'app-invitation-dialog',
    templateUrl: './invitation-dialog.component.html',
    styleUrls: ['./invitation-dialog.component.scss']
})
export class InvitationDialogComponent implements OnInit {
    // TODO make chips editable for correcting
    // TODO SEPARATE CHIPS COMPONENT AS A SHARED COMPONENT IF POSSIBLE
    @ViewChild('chipList') chipList: MatChipList;
    public invitationForm: FormGroup;
    public emails: string[] = [];
    public emailControl: FormArray;
    readonly separatorKeysCodes: number[] = [ENTER, SPACE];
    public maxEmailAddresses = 1;
    public maxInvitationTextLength: number;

    constructor(
        private dialogRef: MatDialogRef<InvitationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AbstractDialogData,
        private formBuilder: FormBuilder,
        private validationService: ValidationService
    ) {
        this.invitationForm = this.formBuilder.group({
            invitationText: this.formBuilder.control(''),
            emails: this.formBuilder.array(this.emails, [this.validationService.validateEmails, Validators.required])
        });
        this.emailControl = this.invitationForm.get('emails') as FormArray;
        this.maxEmailAddresses = data.contentParams.maxEmailAddresses;
        this.maxInvitationTextLength = ConfigurationService.getConfiguration().configuration.characterLimits.invitation.text;
    }

    ngOnInit() {
        this.emailControl.statusChanges.subscribe((status) => (this.chipList.errorState = status === 'INVALID'));
    }

    initEmail(email: string): FormControl {
        return this.formBuilder.control(email);
    }

    onAddChip(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            value.split(/[ ,;]+/).forEach((possibleEmail) => {
                if (possibleEmail.trim() !== '') {
                    this.emailControl.push(this.initEmail(possibleEmail.trim()));
                }
            });
        }

        if (input) {
            input.value = '';
        }
    }

    onRemoveChip(index) {
        this.emailControl.removeAt(index);
    }

    onClearEmailInput() {
        this.invitationForm.setControl('emails', this.formBuilder.array([], [this.validationService.validateEmails, Validators.required]));
        this.emailControl = this.invitationForm.get('emails') as FormArray;
    }

    onSubmit() {
        Object.values(this.invitationForm.controls).forEach((control) => {
            control.markAsTouched();
        });
        const emails = this.emailControl.value;
        if (emails.length > this.maxEmailAddresses) {
            this.invitationForm.controls['emails'].setErrors({ count: true });
        }
        if (this.invitationForm.valid) {
            const invitationText = this.invitationForm.controls['invitationText'].value;
            const invitationData: InvitationData = {
                invitationText: invitationText,
                emails: emails
            };
            this.dialogRef.close(invitationData);
        }
    }
}
