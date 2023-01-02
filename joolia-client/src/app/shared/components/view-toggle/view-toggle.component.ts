import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewType } from '../../../core/enum/global/view-type.enum';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
    selector: 'view-toggle',
    templateUrl: './view-toggle.component.html',
    styleUrls: ['./view-toggle.component.scss']
})
export class ViewToggleComponent {
    @Input() viewType: ViewType;
    @Output() viewChanged: EventEmitter<ViewType> = new EventEmitter();

    constructor() {}

    onViewChanged(event: MatButtonToggleChange) {
        this.viewChanged.emit(event.value);
    }
}
