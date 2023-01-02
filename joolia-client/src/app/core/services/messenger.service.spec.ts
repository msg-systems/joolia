import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';
import { ChatSocketService } from './chat-socket.service';
import { FormatService } from './format.service';
import { UserService } from './user.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MessengerService } from './messenger.service';
import {
    ChatSocketServiceStub,
    FormatServiceStub,
    getMockData,
    LoggerServiceStub,
    TeamServiceStub,
    TranslateServiceStub,
    UserServiceStub
} from '../../../testing/unitTest';
import { TeamService } from './team.service';
import { MessengerContext, MessengerView } from '../enum/global/messenger.enum';
import { ChatEvents } from '../enum/global/chat.enum';
import { ChatRoom, Message, MessageBox } from '../models';
import * as moment from 'moment';

const titleSpy = jasmine.createSpyObj('Title', { getTitle: 'title', setTitle: null });
const translateServiceStub = new TranslateServiceStub();
const userServiceStub = new UserServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const formatServiceStub = new FormatServiceStub();
const chatSocketServiceStub = new ChatSocketServiceStub();
const teamServiceStub = new TeamServiceStub();

let mockChatRoom;
let mockFormat;
let mockTeamList;
let mockUserLuke;
let mockUserLeia;

describe('MessengerService', () => {
    let service: MessengerService;

    beforeEach(async () =>
        TestBed.configureTestingModule({
            providers: [
                MessengerService,
                { provide: ChatSocketService, useValue: chatSocketServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: TeamService, useValue: teamServiceStub },
                { provide: Title, useValue: titleSpy },
                { provide: TranslateService, useValue: translateServiceStub }
            ]
        })
    );

    beforeEach(() => {
        service = TestBed.inject(MessengerService);
        mockChatRoom = getMockData('chatRoom.chatRoom1');
        mockFormat = getMockData('format.format1');
        mockTeamList = getMockData('team.list.list1');
        mockUserLeia = getMockData('user.leia');
        mockUserLuke = getMockData('user.luke');

        translateServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('initContext', () => {
        beforeEach(() => {
            chatSocketServiceStub._resetStubCalls();
        });

        it('should join room /maintenance', fakeAsync(() => {
            service.initContext('somecontext');

            flush();

            expect(chatSocketServiceStub._getSocketConnectionCalls.length).toBe(1);
            expect(chatSocketServiceStub._joinRoomCalls.length).toBe(1);
            expect(chatSocketServiceStub._joinRoomCalls.pop().room).toBe('/maintenance');
        }));

        it('should load format chat rooms', fakeAsync(() => {
            let availableRooms: ChatRoom[] = null;
            let messageBoxes: MessageBox[] = null;
            spyOn(service.availableChatRoomsChanged, 'next').and.callThrough();
            spyOn(service.messageBoxChanged, 'next').and.callThrough();
            service.availableChatRoomsChanged.subscribe((rooms: ChatRoom[]) => (availableRooms = rooms));
            service.messageBoxChanged.subscribe((boxes: MessageBox[]) => (messageBoxes = boxes));
            service.initContext(MessengerContext.FORMAT);

            // flush twice after initContext if you want chatRooms to be loaded because of nested Promise and Observable
            flush();
            flush();

            const roomCount = mockTeamList.count + 1;
            // + 1 for room /maintenance
            expect(chatSocketServiceStub._joinRoomCalls.length).toBe(roomCount + 1);
            expect(service.availableChatRoomsChanged.next).toHaveBeenCalled();
            expect(service.messageBoxChanged.next).toHaveBeenCalled();
            expect(availableRooms.length).toBe(roomCount);
            expect(messageBoxes.length).toBe(roomCount);
        }));

        it('should set event listeners', fakeAsync(() => {
            service.initContext(MessengerContext.FORMAT);

            flush();

            expect(chatSocketServiceStub._onMessageReceiveCalls.length).toBe(1);
            expect(chatSocketServiceStub._onMessageHistoryReceiveCalls.length).toBe(1);
            expect(chatSocketServiceStub._onLastReadTimestampCalls.length).toBe(1);
            expect(chatSocketServiceStub._onErrorCalls.length).toBe(1);
        }));
    });

    it('terminateContext should leave rooms and remove listeners', fakeAsync(() => {
        let messageBoxes: MessageBox[] = null;
        spyOn(service.messageBoxChanged, 'next').and.callThrough();
        service.messageBoxChanged.subscribe((boxes: MessageBox[]) => (messageBoxes = boxes));
        service.initContext(MessengerContext.FORMAT);

        flush();
        flush();

        service.terminateContext(MessengerContext.FORMAT);
        expect(service.messageBoxChanged.next).toHaveBeenCalled();
        expect(chatSocketServiceStub._leaveRoomCalls.length).toBe(mockTeamList.count + 1);
        expect(chatSocketServiceStub._removeAllListenersCalls.length).toBe(1);
        expect(messageBoxes.length).toBe(0);
    }));

    describe('Event Listeners', () => {
        beforeEach(fakeAsync(() => {
            service.initContext(MessengerContext.FORMAT);
            flush();
            flush();
            loggerServiceStub._resetStubCalls();
            chatSocketServiceStub._resetStubCalls();
        }));

        it('should add message to box and mark room as read on MESSAGE', fakeAsync(() => {
            let messageBoxes = null;
            spyOn(service.messageBoxChanged, 'next').and.callThrough();
            spyOn(service.totalMessageCountChanged, 'next').and.callThrough();
            spyOn(service.newMessageCounter, 'next').and.callThrough();
            service.messageBoxChanged.subscribe((boxes) => (messageBoxes = boxes));
            const newMsg = {
                room: mockChatRoom.room,
                data: <Message>{
                    text: 'this is a new chat message',
                    createdAt: moment(),
                    createdBy: mockUserLuke.id,
                    user: mockUserLuke
                }
            };
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.MESSAGE, newMsg);

            flush();

            expect(chatSocketServiceStub._setLastReadTimestampCalls.length).toBe(1);
            expect(service.messageBoxChanged.next).toHaveBeenCalled();
            expect(service.totalMessageCountChanged.next).not.toHaveBeenCalled();
            expect(service.newMessageCounter.next).not.toHaveBeenCalled();
            const box = messageBoxes.find((b) => b.room === mockChatRoom.room);
            expect(box.messages.length).toBe(1);
        }));

        it('should add message to box and increment newMessageCount on MESSAGE', fakeAsync(() => {
            let messageBoxes = null;
            let totalMessageCount = null;
            let newMessageCounter = null;
            spyOn(service.messageBoxChanged, 'next').and.callThrough();
            spyOn(service.totalMessageCountChanged, 'next').and.callThrough();
            spyOn(service.newMessageCounter, 'next').and.callThrough();
            service.messageBoxChanged.subscribe((boxes) => (messageBoxes = boxes));
            service.totalMessageCountChanged.subscribe((count) => (totalMessageCount = count));
            service.newMessageCounter.subscribe((room) => (newMessageCounter = room));
            const newMsg = {
                room: mockChatRoom.room,
                data: <Message>{
                    text: 'this is a new chat message',
                    createdAt: moment(),
                    createdBy: mockUserLeia.id,
                    user: mockUserLeia
                }
            };
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.MESSAGE, newMsg);

            flush();

            expect(chatSocketServiceStub._setLastReadTimestampCalls.length).toBe(0);
            expect(service.messageBoxChanged.next).toHaveBeenCalled();
            expect(service.totalMessageCountChanged.next).toHaveBeenCalled();
            expect(service.newMessageCounter.next).toHaveBeenCalled();
            const box = messageBoxes.find((b) => b.room === mockChatRoom.room);
            expect(box.messages.length).toBe(1);
            expect(totalMessageCount).toBe(1);
            expect(newMessageCounter).toBe(mockChatRoom.room);
            expect(titleSpy.setTitle).toHaveBeenCalled();
        }));

        it('should add message to box and mark room as read on MESSAGE_HISTORY', fakeAsync(() => {
            let messageBoxes = null;
            spyOn(service.messageBoxChanged, 'next').and.callThrough();
            spyOn(service.totalMessageCountChanged, 'next').and.callThrough();
            spyOn(service.newMessageCounter, 'next').and.callThrough();
            service.messageBoxChanged.subscribe((boxes) => (messageBoxes = boxes));
            const newMsg = {
                room: mockChatRoom.room,
                data: [
                    <Message>{
                        text: 'this is a new chat message',
                        createdAt: moment(),
                        createdBy: mockUserLuke.id,
                        user: mockUserLuke
                    }
                ]
            };
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.MESSAGE_HISTORY, newMsg);

            flush();

            expect(chatSocketServiceStub._setLastReadTimestampCalls.length).toBe(1);
            expect(service.messageBoxChanged.next).toHaveBeenCalled();
            expect(service.totalMessageCountChanged.next).not.toHaveBeenCalled();
            expect(service.newMessageCounter.next).not.toHaveBeenCalled();
            const box = messageBoxes.find((b) => b.room === mockChatRoom.room);
            expect(box.messages.length).toBe(1);
        }));

        it('should add message to box and increment newMessageCount on MESSAGE_HISTORY', fakeAsync(() => {
            let messageBoxes = null;
            let totalMessageCount = null;
            let newMessageCounter = null;
            spyOn(service.messageBoxChanged, 'next').and.callThrough();
            spyOn(service.totalMessageCountChanged, 'next').and.callThrough();
            spyOn(service.newMessageCounter, 'next').and.callThrough();
            service.messageBoxChanged.subscribe((boxes) => (messageBoxes = boxes));
            service.totalMessageCountChanged.subscribe((count) => (totalMessageCount = count));
            service.newMessageCounter.subscribe((room) => (newMessageCounter = room));
            const newMsg = {
                room: mockChatRoom.room,
                data: [
                    <Message>{
                        text: 'this is a new chat message',
                        createdAt: moment(),
                        createdBy: mockUserLeia.id,
                        user: mockUserLeia
                    }
                ]
            };
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.MESSAGE_HISTORY, newMsg);

            flush();

            expect(chatSocketServiceStub._setLastReadTimestampCalls.length).toBe(0);
            expect(service.messageBoxChanged.next).toHaveBeenCalled();
            expect(service.totalMessageCountChanged.next).toHaveBeenCalled();
            expect(service.newMessageCounter.next).toHaveBeenCalled();
            const box = messageBoxes.find((b) => b.room === mockChatRoom.room);
            expect(box.messages.length).toBe(1);
            expect(totalMessageCount).toBe(1);
            expect(newMessageCounter).toBe(mockChatRoom.room);
            expect(titleSpy.setTitle).toHaveBeenCalled();
        }));

        it('should set lastRead timestamp of chatroom on LAST_READ_TIMESTAMP', () => {
            const lastRead = moment();
            const msg = {
                room: mockChatRoom.room,
                data: {
                    lastRead
                }
            };
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.LAST_READ_TIMESTAMP, msg);
            const chatRoom = service['availableChatRooms'].find((r) => r.room === mockChatRoom.room) as ChatRoom;
            expect(chatRoom.lastRead).toEqual(lastRead);
        });

        it('should log error on MESSAGE_ERROR', () => {
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.MESSAGE_ERROR, 'error');
            expect(loggerServiceStub._errorCalls.length).toBe(1);
        });

        it('should log error on ROOM_ERROR', () => {
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.ROOM_ERROR, 'error');
            expect(loggerServiceStub._errorCalls.length).toBe(1);
        });
    });

    describe('', () => {
        beforeEach(fakeAsync(() => {
            service.initContext(MessengerContext.FORMAT);
            flush();
            flush();
            chatSocketServiceStub._resetStubCalls();
        }));

        it('should check if isViewActive', () => {
            expect(service.isViewActive(MessengerView.OVERVIEW)).toBe(true);
            expect(service.isViewActive(MessengerView.CHAT)).toBe(false);
            service.navigateToView(MessengerView.CHAT, mockChatRoom.room);
            expect(service.isViewActive(MessengerView.CHAT)).toBe(true);
            expect(service.isViewActive(MessengerView.OVERVIEW)).toBe(false);
        });

        it('should navigateToView Overview', fakeAsync(() => {
            let title = null;
            spyOn(service.titleChanged, 'next').and.callThrough();
            service.titleChanged.subscribe((t) => (title = t));
            service.navigateToView(MessengerView.OVERVIEW);

            flush();

            expect(chatSocketServiceStub._setLastReadTimestampCalls.length).toBe(0);
            expect(service.titleChanged.next).toHaveBeenCalled();
            expect(title).toBe(service['defaultMessengerTitle']);
            expect(service.isViewActive(MessengerView.OVERVIEW)).toBe(true);
        }));

        it('should navigateToView Chat Room', fakeAsync(() => {
            let title = null;
            spyOn(service.titleChanged, 'next').and.callThrough();
            service.titleChanged.subscribe((t) => (title = t));
            service.navigateToView(MessengerView.CHAT, mockChatRoom.room);

            flush();

            expect(chatSocketServiceStub._setLastReadTimestampCalls.length).toBe(1);
            expect(service.titleChanged.next).toHaveBeenCalled();
            expect(title).toBe(mockChatRoom.title);
            expect(service.isViewActive(MessengerView.CHAT)).toBe(true);
        }));

        it('should sendMessage', () => {
            const newMsg = <Message>{
                text: 'this is a new chat message',
                createdAt: moment(),
                createdBy: mockUserLeia.id,
                user: mockUserLeia
            };
            service.navigateToView(MessengerView.CHAT, mockChatRoom.room);
            service.sendMessage(newMsg);
            expect(chatSocketServiceStub._sendMessageCalls.length).toBe(1);
            expect(chatSocketServiceStub._sendMessageCalls.pop()).toEqual(
                jasmine.objectContaining({
                    msg: newMsg,
                    room: mockChatRoom.room
                })
            );
        });

        it('should getChatMessagesforCurrentRoom', fakeAsync(() => {
            service.navigateToView(MessengerView.CHAT, mockChatRoom.room);
            const newMsg = {
                room: mockChatRoom.room,
                data: [
                    <Message>{
                        text: 'this is a new chat message',
                        createdAt: moment(),
                        createdBy: mockUserLeia.id,
                        user: mockUserLeia
                    }
                ]
            };
            chatSocketServiceStub._triggerEventWithMessage(ChatEvents.MESSAGE_HISTORY, newMsg);
            flush();

            const messageBox = service.getChatMessagesForCurrentRoom();
            expect(messageBox.room).toBe(mockChatRoom.room);
            expect(messageBox.messages.length).toBe(1);
        }));
    });
});
