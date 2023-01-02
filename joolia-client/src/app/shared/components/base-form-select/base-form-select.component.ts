import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectOption } from '../../../core/models';

@Component({
    selector: 'base-form-select',
    templateUrl: './base-form-select.component.html',
    styleUrls: ['./base-form-select.component.scss']
})
export class BaseFormSelectComponent {
    @Input() parentForm: FormGroup;
    @Input() selectControlName: string;
    @Input() entityName: string;
    @Input() selectRequired: boolean;
    @Input() selectionOptions: SelectOption[];

    constructor() {}

    getErrorTranslationKey() {
        const errors = Object.keys(this.parentForm.controls[this.selectControlName].errors);
        const errorKey = errors.length > 0 ? errors[0] : '';

        return errorKey ? `errors.${this.selectControlName}.${errorKey}` : '';
    }
}
