import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { MessengerComponent } from './messenger.component';
import { MessengerService } from '../../core/services/messenger.service';
import {
    BreakpointObserverStub,
    FormatServiceStub,
    getMockData,
    LoggerServiceStub,
    MeetingServiceStub,
    MessengerServiceStub,
    SnackbarServiceStub,
    TranslateServiceStub
} from '../../../testing/unitTest';
import { ConfigurationService, FormatService, LoggerService, MeetingService, SnackbarService, UtilService } from '../../core/services';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MessengerContext, MessengerView } from '../../core/enum/global/messenger.enum';
import { Message } from '../../core/models';
import { MatDialog } from '@angular/material/dialog';
import { UtilServiceStub } from 'src/testing/unitTest/util-service-stub';
import { TranslateService } from '@ngx-translate/core';

const messengerServiceStub = new MessengerServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const breakpointObserverStub = new BreakpointObserverStub();
const meetingServiceStub = new MeetingServiceStub();
const formatServiceStub = new FormatServiceStub();
const snackbarServiceStub = new SnackbarServiceStub();
const utilServiceStub = new UtilServiceStub();
const translateServiceStub = new TranslateServiceStub();

let chatRoomMock;
let formatMock;

describe('MessengerComponent', () => {
    let component: MessengerComponent;
    let fixture: ComponentFixture<MessengerComponent>;
    let renderer;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                Renderer2,
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: BreakpointObserver, useValue: breakpointObserverStub },
                { provide: MeetingService, useValue: meetingServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: SnackbarService, useValue: snackbarServiceStub },
                { provide: MatDialog, useValue: {} },
                { provide: UtilService, useValue: utilServiceStub },
                { provide: TranslateService, useValue: translateServiceStub }
            ],
            declarations: [MessengerComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .overrideComponent(MessengerComponent, {
                set: {
                    providers: [{ provide: MessengerService, useValue: messengerServiceStub }]
                }
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MessengerComponent);
        renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2);
        spyOn(renderer, 'addClass').and.callThrough();
        spyOn(renderer, 'removeClass').and.callThrough();
        component = fixture.componentInstance;
        component.context = MessengerContext.FORMAT;
        fixture.detectChanges();

        chatRoomMock = getMockData('chatRoom.chatRoom1');
        formatMock = getMockData('format.format1');
        messengerServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should init component', () => {
        component.ngOnInit();
        expect(messengerServiceStub._navigateToViewCalls.length).toBe(1);
        expect(messengerServiceStub._navigateToViewCalls.pop().view).toEqual(MessengerView.OVERVIEW);
        expect(messengerServiceStub._initContextCalls.length).toEqual(1);
        expect(messengerServiceStub._initContextCalls.pop().context).toEqual(MessengerContext.FORMAT);
    });

    it('should cleanup component', () => {
        renderer.removeClass.calls.reset();
        component.ngOnDestroy();
        expect(messengerServiceStub._terminateContextCalls.length).toBe(1);
        expect(messengerServiceStub._terminateContextCalls.pop().context).toEqual(MessengerContext.FORMAT);
        expect(renderer.removeClass).toHaveBeenCalled();
    });

    describe('setMessengerButtonStyle', () => {
        it('should set style for messenger and reCaptcha enabled', () => {
            spyOn(ConfigurationService, 'getConfiguration').and.returnValue({
                configuration: {
                    reCaptcha: {
                        enabled: true
                    }
                }
            } as any);
            expect(component.setMessengerButtonStyle().bottom).toEqual('85px');
        });

        it('should set style for messenger and reCaptcha disabled', () => {
            spyOn(ConfigurationService, 'getConfiguration').and.returnValue({
                configuration: {
                    reCaptcha: {
                        enabled: false
                    }
                }
            } as any);
            expect(component.setMessengerButtonStyle().bottom).toEqual('40px');
        });

        it('should set style for opened XS messenger', () => {
            component.show = true;
            expect(component.setMessengerButtonStyle('xs').bottom).toEqual('80px');
        });

        it('should set style for opened XS messenger and reCaptcha enabled', () => {
            spyOn(ConfigurationService, 'getConfiguration').and.returnValue({
                configuration: {
                    reCaptcha: {
                        enabled: true
                    }
                }
            } as any);
            component.show = false;
            expect(component.setMessengerButtonStyle('xs').bottom).toEqual('85px');
        });
        it('should set style for opened XS messenger and reCaptcha disabled', () => {
            spyOn(ConfigurationService, 'getConfiguration').and.returnValue({
                configuration: {
                    reCaptcha: {
                        enabled: false
                    }
                }
            } as any);
            component.show = false;
            expect(component.setMessengerButtonStyle('xs').bottom).toEqual('40px');
        });
    });

    describe('toggleVisibility', () => {
        it('should set messenger visible', () => {
            const navSpy = spyOn(component, 'navigateBack').and.callThrough();
            const configSpy = spyOn(component, 'configureScroll').and.callThrough();
            component.show = false;
            component.toggleVisibility();
            expect(component.show).toBe(true);
            expect(navSpy).not.toHaveBeenCalled();
            expect(configSpy).toHaveBeenCalled();
        });

        it('should set messenger not visible', () => {
            const navSpy = spyOn(component, 'navigateBack').and.callThrough();
            const configSpy = spyOn(component, 'configureScroll').and.callThrough();
            component.show = true;
            component.toggleVisibility();
            expect(component.show).toBe(false);
            expect(navSpy).toHaveBeenCalled();
            expect(configSpy).toHaveBeenCalled();
        });
    });

    it('should configure scroll on window size change', () => {
        const configSpy = spyOn(component, 'configureScroll').and.callThrough();
        const state = { matches: true } as BreakpointState;
        breakpointObserverStub.triggerBreakpoint.next(state);
        expect(configSpy).toHaveBeenCalled();
    });

    describe('configureScroll', () => {
        beforeEach(() => {
            renderer.addClass.calls.reset();
            renderer.removeClass.calls.reset();
        });

        it('should remove no-background-scroll for big screen', () => {
            component.xsScreen = false;
            component.configureScroll();
            expect(renderer.removeClass).toHaveBeenCalled();
            expect(renderer.addClass).not.toHaveBeenCalled();
        });

        it('should remove no-background-scroll for closed messenger', () => {
            component.xsScreen = true;
            component.show = false;
            component.configureScroll();
            expect(renderer.removeClass).toHaveBeenCalled();
            expect(renderer.addClass).not.toHaveBeenCalled();
        });

        it('should add no-background-scroll for opened XS messenger', () => {
            component.xsScreen = true;
            component.show = true;
            component.configureScroll();
            expect(renderer.addClass).toHaveBeenCalled();
            expect(renderer.removeClass).not.toHaveBeenCalled();
        });
    });

    it('should navgiateBack', () => {
        component.navigateBack();
        expect(messengerServiceStub._navigateToViewCalls.length).toBe(1);
        expect(messengerServiceStub._navigateToViewCalls.pop().view).toEqual(MessengerView.OVERVIEW);
    });

    it('should open ChatRoom', () => {
        component.onOpenChatRoom(chatRoomMock.id);
        expect(messengerServiceStub._navigateToViewCalls.length).toBe(1);
        expect(messengerServiceStub._navigateToViewCalls.pop()).toEqual(
            jasmine.objectContaining({
                view: MessengerView.CHAT,
                roomId: chatRoomMock.id
            })
        );
    });

    it('should check if isOverviewActive', () => {
        expect(component.isOverviewActive()).toBe(false);
        expect(messengerServiceStub._isViewActiveCalls.length).toBe(1);
        expect(messengerServiceStub._isViewActiveCalls.pop().view).toEqual(MessengerView.OVERVIEW);
    });

    it('should check if isChatActive', () => {
        expect(component.isChatActive()).toBe(false);
        expect(messengerServiceStub._isViewActiveCalls.length).toBe(1);
        expect(messengerServiceStub._isViewActiveCalls.pop().view).toEqual(MessengerView.CHAT);
    });

    it('should getChatMessagesForCurrentRoom', () => {
        component.getChatMessagesForCurrentRoom();
        expect(messengerServiceStub._getChatMessagesForCurrentRoomCalls.length).toBe(1);
    });

    it('should send message', () => {
        const msg = { text: 'message text' } as Message;
        component.onSendMessage(msg);
        expect(messengerServiceStub._sendMessageCalls.length).toBe(1);
        expect(messengerServiceStub._sendMessageCalls.pop().m).toEqual(msg);
    });
});
