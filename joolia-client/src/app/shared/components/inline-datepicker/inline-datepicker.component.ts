import { Component, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { Moment } from 'moment';

@Component({
    selector: 'inline-datepicker',
    templateUrl: './inline-datepicker.component.html',
    styleUrls: ['./inline-datepicker.component.scss']
})
export class InlineDatepickerComponent {
    @Input() inputClasses: string;
    @Input() inputDate: Moment;
    @Input() inputPlaceholderKey: string;
    @Input() editable = true;
    @Input() datetimePickerType: string;
    @Output() dateChanged: EventEmitter<Moment> = new EventEmitter<Moment>();

    editMode = false;
    hover = false;

    constructor(private renderer: Renderer2) {}

    toggleEdit() {
        this.editMode = !this.editMode;
        this.hover = false;

        if (this.editMode) {
            setTimeout(() => {
                // this will make the execution after the above boolean has changed
                this.renderer.selectRootElement('#dateInput').focus();
            }, 0);
        }
    }

    onDateChanged(changedDate) {
        this.dateChanged.emit(changedDate);
        this.hover = false;

        if (this.editMode) {
            this.toggleEdit();
        }
    }

    onMouseEntered() {
        this.hover = true;
    }

    onMouseLeft() {
        this.hover = false;
    }

    onClick(event) {
        if (this.editable) {
            event.stopPropagation();
            this.toggleEdit();
        }
    }
}
