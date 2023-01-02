import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * The BasePasswordInputComponent is a input field that is used for passwords. It needs a FormGroup in which the input field is defined and
 * a controlName how the passwordFormControl is named in the parentForm. The password visibility can be toggled by an icon button in the
 * input field.
 */
@Component({
    selector: 'base-password-input',
    templateUrl: './base-password-input.component.html',
    styleUrls: ['./base-password-input.component.scss']
})
export class BasePasswordInputComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() passwordControlName: string;
    @Input() passwordRequired: boolean;
    @Input() showHint: boolean;

    showPassword: boolean;
    passwordInputType: string;
    passwordIcon: string;

    constructor() {}

    ngOnInit() {
        this.showPassword = false;
        this.passwordInputType = 'password';
        this.passwordIcon = 'visibility';
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;

        this.togglePasswordInputType();
        this.togglePasswordIcon();
    }

    togglePasswordInputType() {
        this.passwordInputType = this.showPassword ? 'text' : 'password';
    }

    togglePasswordIcon() {
        this.passwordIcon = this.showPassword ? 'visibility_off' : 'visibility';
    }

    getErrorTranslationKey() {
        const errors = Object.keys(this.parentForm.controls[this.passwordControlName].errors);
        const errorKey = errors.length > 0 ? errors[0] : '';

        return errorKey ? `errors.password.${errorKey}` : '';
    }
}
