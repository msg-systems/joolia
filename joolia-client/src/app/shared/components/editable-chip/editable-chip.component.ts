import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectOption } from '../../../core/models';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'editable-chip',
    templateUrl: './editable-chip.component.html',
    styleUrls: ['./editable-chip.component.scss']
})
export class EditableChipComponent implements OnInit, OnChanges {
    @Input() message: string;
    @Input() entityValue: any;
    @Input() icon: string;
    @Input() disableEdit = false;
    @Input() deletable = false;
    @Input() options: SelectOption[];
    @Output() valueUpdate: EventEmitter<any> = new EventEmitter();
    @Output() valueDelete: EventEmitter<any> = new EventEmitter();

    formCtrl: FormControl;

    constructor() {}

    ngOnInit(): void {
        if (this.options) {
            const selectedOption = this.options.find((o) => o.value === this.entityValue);
            this.formCtrl = new FormControl(selectedOption ? selectedOption.value : this.options[0].value);
        }
    }

    ngOnChanges() {
        if (this.formCtrl) {
            const selectedOption = this.options.find((o) => o.value === this.entityValue);
            this.formCtrl.setValue(selectedOption ? selectedOption.value : this.options[0].value);
        }
    }

    onSelectionChanged(event: MatSelectChange) {
        this.valueUpdate.emit(event.value);
    }

    onDelete() {
        this.valueDelete.emit(this.entityValue);
    }
}
