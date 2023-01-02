import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractDialogData, MailData } from '../../../core/models';
import { ConfigurationService, ValidationService } from '../../../core/services';

/**
 * The SendMailDialogComponent is for inserting a mail-content that's send to all.
 */
@Component({
    selector: 'app-send-mail-dialog',
    templateUrl: './send-mail-dialog.component.html',
    styleUrls: ['./send-mail-dialog.component.scss']
})
export class SendMailDialogComponent implements OnInit {
    public sendMailForm: FormGroup;
    public maxMailMessageLength: number;
    public minMailMessageLength: number;

    constructor(
        private dialogRef: MatDialogRef<SendMailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AbstractDialogData,
        private formBuilder: FormBuilder,
        private validationService: ValidationService
    ) {
        this.maxMailMessageLength = ConfigurationService.getConfiguration().configuration.characterLimits.mailMessage.text.max;
        this.minMailMessageLength = ConfigurationService.getConfiguration().configuration.characterLimits.mailMessage.text.min;
        this.sendMailForm = this.formBuilder.group({
            mailMessage: [
                '',
                [Validators.required, Validators.minLength(this.minMailMessageLength), Validators.maxLength(this.maxMailMessageLength)]
            ]
        });
    }

    ngOnInit() {}

    onSubmit() {
        Object.values(this.sendMailForm.controls).forEach((control) => {
            control.markAsTouched();
        });
        if (this.sendMailForm.valid) {
            const mailMessage = this.sendMailForm.controls['mailMessage'].value;
            const mailData: MailData = {
                mailMessage: mailMessage
            };
            this.dialogRef.close(mailData);
        }
    }
}
