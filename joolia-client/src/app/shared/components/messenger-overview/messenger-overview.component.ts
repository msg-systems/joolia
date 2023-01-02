import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatRoom, MessageBox } from '../../../core/models';

@Component({
    selector: 'app-messenger-overview',
    templateUrl: './messenger-overview.component.html',
    styleUrls: ['./messenger-overview.component.scss']
})
export class MessengerOverviewComponent implements OnInit {
    @Input() chatRooms: ChatRoom[] = [];
    @Input() messageBoxes: MessageBox[] = [];
    @Output() openChatRoom: EventEmitter<string> = new EventEmitter<string>();
    @Output() startMeeting: EventEmitter<ChatRoom> = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    onOpenChatRoom(roomId: string) {
        this.openChatRoom.emit(roomId);
    }

    onStartMeeting(chatRoom: ChatRoom) {
        this.startMeeting.emit(chatRoom);
    }
}
