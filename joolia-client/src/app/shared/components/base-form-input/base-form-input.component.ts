import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../../core/services';

/**
 * The BaseFormInputComponent is the standard input field used in the application. It needs a FormGroup in which the input field is defined
 * and a controlName to determine which FormControl has to be used in this component. Further attributes are needed to customize the input
 * field such as which translations should be used (entityName) or what type the input field has (inputType).
 */
@Component({
    selector: 'base-form-input',
    templateUrl: './base-form-input.component.html',
    styleUrls: ['./base-form-input.component.scss']
})
export class BaseFormInputComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() entityName: string;
    @Input() isLabelPlural: number;
    @Input() inputControlName: string;
    @Input() inputType: string;
    @Input() inputRequired: boolean;
    @Input() inputMaxLength: number;
    @Input() inputMinNumber: number;
    @Input() errorMessage: string;

    inputMaxLengthValue: number;

    constructor() {}

    ngOnInit() {
        this.inputMaxLengthValue = this.inputMaxLength
            ? this.inputMaxLength
            : ConfigurationService.getConfiguration().configuration.supportedBrowserMaxLengthValue;
    }

    getErrorTranslationKey() {
        if (this.errorMessage) {
            return this.errorMessage;
        }

        const errors = Object.keys(this.parentForm.controls[this.inputControlName].errors);
        const errorKey = errors.length > 0 ? errors[0] : '';

        return errorKey ? `errors.${this.inputControlName}.${errorKey}` : '';
    }
}
