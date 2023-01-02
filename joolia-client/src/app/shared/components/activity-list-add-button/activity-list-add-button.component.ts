import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'activity-list-add-button',
    templateUrl: './activity-list-add-button.component.html',
    styleUrls: ['./activity-list-add-button.component.scss']
})
export class ActivityListAddButtonComponent {
    @Input() isEndAddButton: boolean;
    @Output() add: EventEmitter<any> = new EventEmitter();
    @Output() addFromTemplate: EventEmitter<any> = new EventEmitter();

    constructor() {}

    addActivity() {
        this.add.emit();
    }

    addActivityFromTemplate() {
        this.addFromTemplate.emit();
    }
}
