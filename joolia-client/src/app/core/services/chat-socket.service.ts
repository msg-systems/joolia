import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { LoggerService } from './logger.service';
import { ConfigurationService } from './configuration.service';
import { BasicSocketService, SocketTransportObject } from './basic-socket.service';
import { Message } from '../models';
import { ChatEvents } from '../enum/global/chat.enum';

export interface IChatSocket {
    onMessageReceive(cb: Function);

    onError(cb: Function);
}

interface ISocketListener {
    eventName: string;
    callback: Function;
}

@Injectable({
    providedIn: 'root'
})
export class ChatSocketService extends BasicSocketService implements IChatSocket {
    private socketListeners: ISocketListener[] = [];
    private formatRoomPrefix: string;

    constructor(
        protected authenticationService: AuthenticationService,
        protected logger: LoggerService,
        protected config: ConfigurationService
    ) {
        super(authenticationService, logger, config);

        this.formatRoomPrefix = ConfigurationService.getConfiguration().configuration.websocket.rooms.chat.format;
    }

    private addListener(eventName: string, callback: Function): void {
        this.socketListeners.push({ eventName, callback });
        this.logEvent(eventName);
        this.socket.on(eventName, callback);
    }

    public removeAllListeners(): void {
        for (const socketListener of this.socketListeners) {
            this.socket.off(socketListener.eventName, socketListener.callback);
        }
    }

    public onMessageReceive(cb: Function): void {
        this.addListener(ChatEvents.MESSAGE, cb);
    }

    public onMessageHistoryReceive(cb: Function): void {
        this.addListener(ChatEvents.MESSAGE_HISTORY, cb);
    }

    public onLastReadTimestamp(cb: Function): void {
        this.addListener(ChatEvents.LAST_READ_TIMESTAMP, cb);
    }

    public onError(cb: Function): void {
        this.addListener(ChatEvents.MESSAGE_ERROR, cb);
        this.addListener(ChatEvents.ROOM_ERROR, cb);
    }

    public sendMessage(msg: Message, room: string): void {
        const message: SocketTransportObject = {
            room: room,
            data: msg
        };
        this.socket.emit(ChatEvents.MESSAGE, message);
    }

    public setLastReadTimestamp(room: string, ts: string): void {
        const message: SocketTransportObject = {
            room: room,
            data: { lastRead: ts }
        };

        this.socket.emit(ChatEvents.LAST_READ_TIMESTAMP, message);
    }
}
