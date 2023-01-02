import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerChatRoomCardComponent } from './messenger-chat-room-card.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getMockData } from '../../../../testing/unitTest';
import { TranslateModule } from '@ngx-translate/core';

let messageBoxes;
let chatRoom;

describe('MessengerChatRoomCardComponent', () => {
    let component: MessengerChatRoomCardComponent;
    let fixture: ComponentFixture<MessengerChatRoomCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [MessengerChatRoomCardComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        messageBoxes = [getMockData('messageBox.messageBox1')];
        chatRoom = getMockData('chatRoom.chatRoom1');
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MessengerChatRoomCardComponent);
        component = fixture.componentInstance;
        component.chatRoom = chatRoom;
        component.messageBoxes = messageBoxes;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigateToChatRoom', () => {
        const openSpy = spyOn(component.openChatRoom, 'emit').and.callThrough();
        component.navigateToChatRoom(chatRoom.id);
        expect(openSpy).toHaveBeenCalledWith(chatRoom.id);
    });

    it('should check if isFormatCard', () => {
        expect(component.isFormatCard()).toBe(true);
        component.chatRoom.entity = 'someOtherEntity';
        expect(component.isFormatCard()).toBe(false);
    });

    it('should startMeeting', () => {
        const startSpy = spyOn(component.startMeetingClicked, 'emit').and.callThrough();
        component.startMeeting(chatRoom);
        expect(startSpy).toHaveBeenCalledWith(chatRoom);
    });
});
