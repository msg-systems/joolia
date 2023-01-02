import { AfterViewChecked, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Message, MessageBox } from '../../../core/models';
import { ConfigurationService, UserService } from '../../../core/services';

@Component({
    selector: 'app-messenger-chat',
    templateUrl: './messenger-chat.component.html',
    styleUrls: ['./messenger-chat.component.scss']
})
export class MessengerChatComponent implements OnInit, AfterViewChecked {
    @Input() messageBox: MessageBox;
    @Output() sendMessage: EventEmitter<Message> = new EventEmitter<Message>();

    public messageMaxLength: number;
    public messages: Message[];
    private container;

    constructor(private userService: UserService) {
        this.messageMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.message.text;
    }

    ngOnInit() {
        this.messages = this.messageBox.messages;
    }

    onSend(msg: HTMLInputElement) {
        if (msg.value.trim().length > 0) {
            // trim() makes sure the message is not just whitespace
            this.sendMessage.emit({ text: msg.value } as Message);
            msg.value = '';
        }
    }

    isOwnMessage(msg: Message) {
        return msg.createdBy === this.userService.getCurrentLoggedInUser().id;
    }

    ngAfterViewChecked() {
        this.container = document.getElementById('chat-view-container');
        if (this.container !== null) {
            this.container.scrollTop = this.container.scrollHeight;
        }
    }
}
