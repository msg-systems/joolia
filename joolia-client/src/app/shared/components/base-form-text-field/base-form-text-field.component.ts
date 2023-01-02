import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../../core/services';

@Component({
    selector: 'base-form-text-field',
    templateUrl: './base-form-text-field.component.html',
    styleUrls: ['./base-form-text-field.component.scss']
})
export class BaseFormTextFieldComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() entityName: string;
    @Input() inputControlName: string;
    @Input() inputType: string;
    @Input() inputRequired: boolean;
    @Input() inputMaxLength: number;

    inputMaxLengthValue: number;

    constructor() {}

    ngOnInit() {
        this.inputMaxLengthValue = this.inputMaxLength
            ? this.inputMaxLength
            : ConfigurationService.getConfiguration().configuration.supportedBrowserMaxLengthValue;
    }

    getErrorTranslationKey() {
        const errors = Object.keys(this.parentForm.controls[this.inputControlName].errors);
        const errorKey = errors.length > 0 ? errors[0] : '';

        return errorKey ? `errors.${this.inputControlName}.${errorKey}` : '';
    }
}
