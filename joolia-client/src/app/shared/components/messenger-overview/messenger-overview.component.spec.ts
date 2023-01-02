import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerOverviewComponent } from './messenger-overview.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getMockData } from '../../../../testing/unitTest';
import { ChatRoom } from '../../../core/models';

let messageBoxes, chatRooms;

describe('MessengerOverviewComponent', () => {
    let component: MessengerOverviewComponent;
    let fixture: ComponentFixture<MessengerOverviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MessengerOverviewComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        messageBoxes = [getMockData('messageBox.messageBox1')];
        chatRooms = [getMockData('chatRoom.chatRoom1')];
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MessengerOverviewComponent);
        component = fixture.componentInstance;
        component.chatRooms = chatRooms;
        component.messageBoxes = messageBoxes;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open chatroom', () => {
        const openSpy = spyOn(component.openChatRoom, 'emit').and.callThrough();
        component.onOpenChatRoom(chatRooms[0].id);
        expect(openSpy).toHaveBeenCalledWith(chatRooms[0].id);
    });

    it('should start meeting', () => {
        const startSpy = spyOn(component.startMeeting, 'emit').and.callThrough();
        component.onStartMeeting(chatRooms[0]);
        expect(startSpy).toHaveBeenCalledWith(chatRooms[0]);
    });
});
