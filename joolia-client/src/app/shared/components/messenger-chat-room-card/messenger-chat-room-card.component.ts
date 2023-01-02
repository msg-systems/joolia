import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatRoom, Format, MessageBox, Team } from '../../../core/models';

@Component({
    selector: 'app-messenger-chat-room-card',
    templateUrl: './messenger-chat-room-card.component.html',
    styleUrls: ['./messenger-chat-room-card.component.scss']
})
export class MessengerChatRoomCardComponent {
    @Input() chatRoom: ChatRoom;
    @Input() messageBoxes: MessageBox[];

    @Output() openChatRoom: EventEmitter<string> = new EventEmitter<string>();
    @Output() startMeetingClicked: EventEmitter<ChatRoom> = new EventEmitter();

    public team = {} as Team;
    public format = {} as Format;

    constructor() {}

    navigateToChatRoom(roomId: string) {
        this.openChatRoom.emit(roomId);
    }

    isFormatCard() {
        return this.chatRoom.entity === 'Format';
    }

    startMeeting(chatRoom: ChatRoom) {
        this.startMeetingClicked.emit(chatRoom);
    }
}
