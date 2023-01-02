import { Injectable } from '@angular/core';
import { ChatRoom, Message, MessageBox, Team } from '../models';
import { MessengerView } from '../enum/global/messenger.enum';
import { ConfigurationService } from './configuration.service';
import { ChatSocketService } from './chat-socket.service';
import { FormatService } from './format.service';
import { LoggerService } from './logger.service';
import { UserService } from './user.service';
import { Subject, Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { TeamService } from './team.service';

@Injectable()
export class MessengerService {
    titleChanged: Subject<string> = new Subject();
    availableChatRoomsChanged: Subject<ChatRoom[]> = new Subject();
    newMessageCounter: Subject<string> = new Subject();
    totalMessageCountChanged: Subject<number> = new Subject<number>();
    messageBoxChanged: Subject<MessageBox[]> = new Subject<MessageBox[]>();
    private formatRoomPrefix: string;
    private defaultMessengerTitle: string;
    private activeView: MessengerView;
    private activeChatRoom: string;
    private activeMessengerTitle: string;
    private totalMessageCount: number;
    private availableChatRooms: ChatRoom[] = [];
    private availableMessageBoxes: MessageBox[];
    private subscriptions: Subscription[] = [];

    constructor(
        private chatSocketService: ChatSocketService,
        private formatService: FormatService,
        private teamService: TeamService,
        private logger: LoggerService,
        private userService: UserService,
        private titleService: Title,
        private translate: TranslateService
    ) {
        this.getConfiguration();
        this.totalMessageCount = 0;
        this.availableMessageBoxes = [];
        this.activeView = MessengerView.OVERVIEW;
        this.activeMessengerTitle = '';
        this.titleChanged.next(this.activeMessengerTitle);
        this.totalMessageCountChanged.subscribe((c) => this.setWindowTitle(c));
        this.translate.get('messenger.title').subscribe((title: string) => {
            this.defaultMessengerTitle = title;
        });
    }

    public initContext(context: string) {
        this.chatSocketService.getSocketConnection().then(() => {
            this.chatSocketService.joinRoom('/maintenance');

            switch (context) {
                case 'Format':
                    this.initFormatContext(context);
                    break;
                default:
                    this.logger.debug('[Messenger]: Not yet supported Messenger context initialization');
                    break;
            }

            this.setEventListeners();
        });
    }

    public terminateContext(context: string) {
        if (this.chatSocketService.isConnected()) {
            switch (context) {
                case 'Format':
                    this.terminateFormatContext();
                    break;
                default:
                    this.logger.debug('[Messenger]: Not yet supported Messenger context termination');
                    break;
            }
        }
    }

    public isViewActive(view: MessengerView): boolean {
        return this.activeView === view;
    }

    public navigateToView(view: MessengerView, roomId?: string) {
        this.activeChatRoom = roomId;
        this.activeView = view;
        this.getTitleForRoom(roomId);
        this.markAsRead(roomId);
        this.titleChanged.next(this.activeMessengerTitle);
    }

    public getChatMessagesForCurrentRoom() {
        if (this.activeChatRoom) {
            const roomMessages = this.availableMessageBoxes.find((mbe) => mbe.room === this.activeChatRoom);
            if (roomMessages) {
                return roomMessages;
            } else {
                this.logger.debug('[SOCKET][MessageBox] Box not found for current room: ' + this.activeChatRoom);
            }
        }
    }

    public sendMessage(m: Message) {
        this.chatSocketService.sendMessage(m, this.activeChatRoom);
    }

    private getConfiguration() {
        this.formatRoomPrefix = ConfigurationService.getConfiguration().configuration.websocket.rooms.chat.format;
    }

    private setEventListeners() {
        this.chatSocketService.onMessageReceive((msg) => {
            const msgs = {
                room: msg.room,
                data: [msg.data]
            };

            this.addMessageToMessageBox(msgs);
        });

        this.chatSocketService.onMessageHistoryReceive((msgs) => {
            this.addMessageToMessageBox(msgs);
        });

        this.chatSocketService.onLastReadTimestamp((msg) => {
            this.setLastReadOnChatRoom(msg.room, msg.data.lastRead);
            this.logger.debug('[SOCKET][ChatRoom] Set last read TS of room: ' + msg.room);
        });

        this.chatSocketService.onError((error) => {
            this.logger.error('[SOCKET] ' + error);
        });
    }

    private addMessageToMessageBox(msg) {
        const box = this.availableMessageBoxes.find((mbe) => mbe.room === msg.room);
        if (box) {
            for (let i = 0; i < msg.data.length; i++) {
                box.messages.push(msg.data[i]);

                if (this.isCountRelevant(msg.room, msg.data[i])) {
                    this.incrementMessagesInRoom(msg.room);
                } else if (i === msg.data.length - 1) {
                    // mark chat room as read only if the last message is read
                    this.markAsRead(msg.room);
                }
            }
            this.messageBoxChanged.next(this.availableMessageBoxes);
        } else {
            this.logger.debug('[MessageBox] Can´t find room' + msg.room + ' in Messagebox');
        }
    }

    private setLastReadOnChatRoom(room, newLastRead) {
        this.availableChatRooms.forEach((c) => {
            if (c.room === room) {
                c.lastRead = newLastRead;
            }
        });
    }

    private isCountRelevant(roomId, msg): boolean {
        let shouldCount;

        let lastReadChatRoom = this.availableChatRooms.find((c) => c.room === roomId).lastRead;
        lastReadChatRoom = lastReadChatRoom ? lastReadChatRoom : moment('1900-01-01T05:06:07');

        // do not count if
        shouldCount =
            // ...user is in the room
            roomId !== this.activeChatRoom &&
            // ...is owner of the message
            msg.createdBy !== this.userService.getCurrentLoggedInUser().id &&
            // ...read it already msgcreate > lastread of room
            moment(lastReadChatRoom).isBefore(msg.createdAt);

        return shouldCount;
    }

    private getTitleForRoom(roomId?: string) {
        if (roomId) {
            this.activeMessengerTitle = this.availableChatRooms.find((r) => r.room === roomId).title;
        } else {
            this.activeMessengerTitle = this.defaultMessengerTitle;
        }
    }

    private getFormatChatRoom() {
        const room =
            ConfigurationService.getConfiguration().configuration.websocket.rooms.chat.format + this.formatService.getCurrentFormat().id;

        const chatRoom = {
            room: room,
            title: this.formatService.getCurrentFormat().name,
            newMessages: 0,
            entity: 'Format',
            id: this.formatService.getCurrentFormat().id
        } as ChatRoom;

        if (!this.availableChatRooms.some((c) => c.room === chatRoom.room)) {
            this.addRoom(chatRoom);
        }
    }

    private getTeamChatRooms() {
        // get teams of format
        const formatTeams = this.teamService.getCurrentTeams();

        // reduce to my teams
        const myTeams = formatTeams.entities.filter((team: Team) => {
            return team.members.some((u, i, a) => {
                return u.id === this.userService.getCurrentLoggedInUser().id;
            });
        });

        // remove team chatrooms of deleted teams or where user was removed as a member
        this.availableChatRooms
            .filter(
                // check only the team chatrooms
                (room) =>
                    room.room.startsWith(ConfigurationService.getConfiguration().configuration.websocket.rooms.chat.format) &&
                    room.room.includes(ConfigurationService.getConfiguration().configuration.websocket.rooms.chat.team)
            )
            .forEach((room) => {
                if (!myTeams.some((team) => room.title === team.name)) {
                    this.removeRoom(room);
                }
            });

        // create chatrooms
        myTeams.forEach((team) => {
            const room =
                ConfigurationService.getConfiguration().configuration.websocket.rooms.chat.format +
                this.formatService.getCurrentFormat().id +
                ConfigurationService.getConfiguration().configuration.websocket.rooms.chat.team +
                team.id;

            if (!this.availableChatRooms.some((cr) => cr.room === room)) {
                const chatRoom = {
                    room: room,
                    title: team.name,
                    newMessages: 0,
                    entity: 'Team',
                    id: team.id
                } as ChatRoom;
                this.addRoom(chatRoom);
            }
        });
    }

    private markAsRead(roomId) {
        this.availableChatRooms.map((avChat) => {
            if (avChat.room === roomId) {
                avChat.newMessages = 0;
                const readNow = moment().toISOString();
                this.chatSocketService.setLastReadTimestamp(roomId, readNow);
                this.setLastReadOnChatRoom(roomId, readNow);
                this.determineTotalMessages();
            }
        });
    }

    private setWindowTitle(count) {
        let title = this.titleService.getTitle();
        const titleRegex = new RegExp('^\\([0-9]*\\)');

        // remove count from title
        if (titleRegex.test(title)) {
            const titleArray = title.split(' ');
            titleArray.shift();
            title = titleArray.join(' ');
        }

        // add count if neccessary
        if (count > 0) {
            title = '(' + count + ') ' + title;
        }
        this.logger.debug('[Messenger]: set title to: ' + title);
        this.titleService.setTitle(title);
    }

    private terminateSubscriptions() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    private initFormatContext(context: string) {
        const teamListChangedSubscription = this.teamService.teamListChanged.subscribe(() => {
            this.loadFormatChatRooms();
        });

        this.subscriptions.push(teamListChangedSubscription);

        this.teamService.loadTeams(this.formatService.getCurrentFormat().id).subscribe(() => {
            // subscription to formatChanged is only done AFTER loadedTeamList of teamService is updated.
            // otherwise the chatrooms for the previously loaded teams will also be added to the messenger
            const formatChangedSubscription = this.formatService.formatChanged.subscribe(() => {
                this.loadFormatChatRooms();
            });

            this.subscriptions.push(formatChangedSubscription);
        });
    }

    private loadFormatChatRooms() {
        this.getFormatChatRoom();
        this.getTeamChatRooms();
        this.availableChatRoomsChanged.next(this.availableChatRooms);
    }

    private terminateFormatContext() {
        this.availableChatRooms.forEach((chatRoom) => {
            if (chatRoom.room.includes('/format/' + this.formatService.getCurrentFormat().id)) {
                this.removeRoom(chatRoom);
            }
        });
        this.chatSocketService.removeAllListeners();
        this.terminateSubscriptions();
    }

    private addRoom(r) {
        this.chatSocketService.joinRoom(r.room);
        this.availableChatRooms.push(r);
        this.addRoomToMessageBox(r.room);
    }

    private removeRoom(r) {
        this.chatSocketService.leaveRoom(r.room);
        this.availableChatRooms = this.availableChatRooms.filter((room) => room.room !== r.room);
        this.removeRoomToMessageBox(r.room);
    }

    private addRoomToMessageBox(r): void {
        if (!this.availableMessageBoxes.some((m) => m.room === r)) {
            this.availableMessageBoxes.push({ room: r, messages: [] } as MessageBox);
            this.messageBoxChanged.next(this.availableMessageBoxes);
            this.logger.debug('[MessageBox] Room ' + r + ' added');
        }
    }

    private removeRoomToMessageBox(r): void {
        if (this.availableMessageBoxes.some((m) => m.room === r)) {
            this.availableMessageBoxes = this.availableMessageBoxes.filter((m) => m.room !== r);
            this.messageBoxChanged.next(this.availableMessageBoxes);
            this.logger.debug('[MessageBox] Room ' + r + ' removed');
        }
    }

    private incrementMessagesInRoom(room: string): void {
        this.availableChatRooms.map((avChat) => {
            if (avChat.room === room) {
                avChat.newMessages++;
                this.determineTotalMessages();
            }
        });

        // Trigger Event for new message in room
        this.newMessageCounter.next(room);
    }

    private determineTotalMessages(): void {
        const oldTotalMessageCount = this.totalMessageCount;
        this.totalMessageCount = 0;
        this.availableChatRooms.forEach((room) => (this.totalMessageCount += room.newMessages));
        if (oldTotalMessageCount !== this.totalMessageCount) {
            this.totalMessageCountChanged.next(this.totalMessageCount);
        }
    }
}
