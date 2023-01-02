import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerChatComponent } from './messenger-chat.component';
import { UserService } from '../../../core/services';
import { getMockData, UserServiceStub } from '../../../../testing/unitTest';
import { Message } from '../../../core/models';
import { MomentPipe } from '../../pipes';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const userServiceStub = new UserServiceStub();
let messageBoxMock;
let userLuke;

describe('MessengerChatComponent', () => {
    let component: MessengerChatComponent;
    let fixture: ComponentFixture<MessengerChatComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MessengerChatComponent, MomentPipe],
            providers: [{ provide: UserService, useValue: userServiceStub }],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        messageBoxMock = getMockData('messageBox.messageBox1');
        userLuke = getMockData('user.luke');
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MessengerChatComponent);
        component = fixture.componentInstance;
        component.messageBox = messageBoxMock;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize message', () => {
        component.ngOnInit();
        expect(component.messages.length).toBe(messageBoxMock.messages.length);
    });

    describe('onSend', () => {
        it('should send message', () => {
            const text = 'user wrote some text';
            const msg = { value: text } as HTMLInputElement;
            const sendSpy = spyOn(component.sendMessage, 'emit').and.callThrough();
            component.onSend(msg);
            expect(sendSpy).toHaveBeenCalledWith(jasmine.objectContaining({ text }));
            expect(msg.value).toEqual('');
        });

        it('should not send empty message', () => {
            const msg = { value: '   ' } as HTMLInputElement;
            const sendSpy = spyOn(component.sendMessage, 'emit').and.callThrough();
            component.onSend(msg);
            expect(sendSpy).not.toHaveBeenCalled();
        });
    });

    it('should check if isOwnMessage', () => {
        const msg = { createdBy: userLuke.id } as Message;
        expect(component.isOwnMessage(msg)).toBe(true);
    });

    it('should scroll down on new message', () => {
        const container = { scrollHeight: 100 } as HTMLElement;
        spyOn(document, 'getElementById').and.returnValue(container);
        component.ngAfterViewChecked();
        expect(container.scrollTop).toEqual(container.scrollHeight);
    });
});
