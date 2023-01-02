import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action, Format, List } from '../../../core/models';
import * as moment from 'moment';

@Component({
    selector: 'format-list',
    templateUrl: './format-list.component.html',
    styleUrls: ['./format-list.component.scss']
})
export class FormatListComponent implements OnInit {
    @Input() formatList: List<Format>;
    @Input() formatMenuActions: { format: Format; actions: Action[] }[];
    @Output() formatClicked: EventEmitter<string> = new EventEmitter();

    ngOnInit(): void {}

    getFormatMenuActions(format: Format) {
        return this.formatMenuActions.find((f) => f.format === format).actions;
    }

    onFormatClick(id: string) {
        this.formatClicked.emit(id);
    }

    hasEqualStartAndEnd(format: Format) {
        return moment(format.startDate).isSame(format.endDate, 'day');
    }

    hasNoMenuActions(format: Format): boolean {
        const menuActions = this.getFormatMenuActions(format);
        return menuActions && menuActions.length === 0;
    }
}
