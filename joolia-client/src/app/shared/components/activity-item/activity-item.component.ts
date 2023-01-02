import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { Activity, DurationUnit } from '../../../core/models';

@Component({
    selector: 'app-activity-item',
    templateUrl: './activity-item.component.html',
    styleUrls: ['./activity-item.component.scss']
})
export class ActivityItemComponent implements OnInit {
    @Input() activity: Activity;
    @Input() biggerAddButton: boolean;
    @Input() timeslot: moment.Moment;
    @Input() showButtons = false;
    @Input() dragged = false;
    @Input() focused = false;
    @Input() isHourSchedule = true;
    @Input() deleteAllowed = false;
    @Input() addAllowed = false;
    @Output() deleted: EventEmitter<any> = new EventEmitter();
    private durationFormat: DurationUnit;

    constructor() {}

    ngOnInit() {
        this.durationFormat = this.isHourSchedule ? DurationUnit.MINUTES : DurationUnit.DAYS;
    }

    delete() {
        this.deleted.emit(this.activity);
    }
}
