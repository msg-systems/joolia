import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectOption } from '../../../core/models';

@Component({
    selector: 'base-form-radio-selection',
    templateUrl: './base-form-radio-selection.component.html',
    styleUrls: ['./base-form-radio-selection.component.scss']
})
export class BaseFormRadioSelectionComponent {
    @Input() initialValue: any;
    @Input() optionDescriptionKey: string;
    @Input() optionValues: SelectOption[];
    @Input() editable: boolean;
    @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

    constructor() {}

    onValueChange(newValue: any) {
        this.valueChange.emit(newValue);
    }
}
