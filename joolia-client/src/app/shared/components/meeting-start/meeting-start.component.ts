import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-meeting-start',
    templateUrl: './meeting-start.component.html',
    styleUrls: ['./meeting-start.component.scss']
})
export class MeetingStartComponent implements OnInit {
    @Output() startMeetingClicked: EventEmitter<void> = new EventEmitter();

    ngOnInit() {}

    constructor() {}

    startMeeting() {
        this.startMeetingClicked.emit();
    }
}
