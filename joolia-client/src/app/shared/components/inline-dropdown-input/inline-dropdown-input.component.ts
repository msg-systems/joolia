import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { SelectOption } from '../../../core/models';

@Component({
    selector: 'inline-dropdown-input',
    templateUrl: './inline-dropdown-input.component.html',
    styleUrls: ['./inline-dropdown-input.component.scss']
})
export class InlineDropdownInputComponent {
    @Input() inputClasses: string;
    @Input() selectedEntry: number;
    @Input() dropdownValues: SelectOption[];
    @Input() displayPipe: string;
    @Input() editable = false;
    @Output() inputChange: EventEmitter<number> = new EventEmitter();
    @ViewChild('dropdownInput') editField: MatSelect;

    editMode = false;

    constructor() {}

    toggleDropdown() {
        if (this.editField.panelOpen === false) {
            this.editMode = !this.editMode;
        }
    }

    toggleEdit() {
        if (!this.editable) {
            return;
        }

        this.editMode = !this.editMode;

        if (this.editMode) {
            setTimeout(() => {
                // this will make the execution after the above boolean has changed
                this.editField.open();
            }, 0);
        }
    }

    onSelectionChanged() {
        this.inputChange.emit(this.selectedEntry);
        this.toggleEdit();
    }
}
