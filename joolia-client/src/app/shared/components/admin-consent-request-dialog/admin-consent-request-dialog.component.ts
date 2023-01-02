import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminConsentEmail } from 'src/app/core/models';
import { ConfigurationService, ValidationService } from '../../../core/services';

@Component({
    selector: 'app-admin-consent-request-dialog',
    templateUrl: './admin-consent-request-dialog.component.html',
    styleUrls: ['./admin-consent-request-dialog.component.scss']
})
export class AdminConsentDialogComponent implements OnInit {
    public consentEmailForm: FormGroup;
    public maxConsentEmailTextLength: number;

    constructor(
        private dialogRef: MatDialogRef<AdminConsentDialogComponent>,
        private formBuilder: FormBuilder,
        private validationService: ValidationService
    ) {
        this.consentEmailForm = this.formBuilder.group({
            message: this.formBuilder.control(''),
            domain: this.formBuilder.control(''),
            email: this.formBuilder.control('', [this.validationService.validateEmail, Validators.required])
        });
        this.maxConsentEmailTextLength = ConfigurationService.getConfiguration().configuration.characterLimits.mailMessage.text.max;
    }

    ngOnInit(): void {}

    private getAdminConsentRedirectUri() {
        return location.origin + ConfigurationService.getConfiguration().appBaseHref + 'callback';
    }

    onSubmit() {
        Object.values(this.consentEmailForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.consentEmailForm.valid) {
            const message = this.consentEmailForm.controls['message'].value;
            const domain = this.consentEmailForm.controls['domain'].value;
            const email = this.consentEmailForm.controls['email'].value;
            const consentEmailData: AdminConsentEmail = {
                message: message,
                adminEmail: email,
                redirectUri: this.getAdminConsentRedirectUri(),
                domain: domain
            };
            this.dialogRef.close(consentEmailData);
        }
    }
}
