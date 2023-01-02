import { ChatSocketService } from '../../app/core/services';
import { ChatEvents } from '../../app/core/enum/global/chat.enum';
import { Message } from '../../app/core/models';

export class ChatSocketServiceStub implements Partial<ChatSocketService> {
    private callbacks: any = {};

    public _getSocketConnectionCalls: any[] = [];
    public _joinRoomCalls: any[] = [];
    public _onMessageReceiveCalls: any[] = [];
    public _onMessageHistoryReceiveCalls: any[] = [];
    public _onLastReadTimestampCalls: any[] = [];
    public _onErrorCalls: any[] = [];
    public _removeAllListenersCalls: any[] = [];
    public _leaveRoomCalls: any[] = [];
    public _setLastReadTimestampCalls: any[] = [];
    public _sendMessageCalls: any[] = [];

    getSocketConnection(): Promise<void> {
        this._getSocketConnectionCalls.push({});
        return Promise.resolve();
    }

    joinRoom(room: string, reconnect: boolean = false) {
        this._joinRoomCalls.push({ room, reconnect });
    }

    onMessageReceive(cb: Function): void {
        this._onMessageReceiveCalls.push({ cb });
        this.addListener(ChatEvents.MESSAGE, cb);
    }

    onMessageHistoryReceive(cb: Function): void {
        this._onMessageHistoryReceiveCalls.push({ cb });
        this.addListener(ChatEvents.MESSAGE_HISTORY, cb);
    }

    onLastReadTimestamp(cb: Function): void {
        this._onLastReadTimestampCalls.push({ cb });
        this.addListener(ChatEvents.LAST_READ_TIMESTAMP, cb);
    }

    onError(cb: Function): void {
        this._onErrorCalls.push({ cb });
        this.addListener(ChatEvents.MESSAGE_ERROR, cb);
        this.addListener(ChatEvents.ROOM_ERROR, cb);
    }

    leaveRoom(room: string) {
        this._leaveRoomCalls.push({ room });
    }

    setLastReadTimestamp(room: string, ts: string): void {
        this._setLastReadTimestampCalls.push({ room, ts });
    }

    removeAllListeners(): void {
        this._removeAllListenersCalls.push({});
        this.callbacks = {};
    }

    sendMessage(msg: Message, room: string): void {
        this._sendMessageCalls.push({ msg, room });
    }

    private addListener(eventName: string, callback: Function): void {
        this.callbacks[eventName] = callback;
    }

    isConnected(): boolean {
        return true;
    }

    _triggerEventWithMessage(eventName: string, msg) {
        this.callbacks[eventName](msg);
    }

    _resetStubCalls(): void {
        this._getSocketConnectionCalls.length = 0;
        this._joinRoomCalls.length = 0;
        this._onMessageReceiveCalls.length = 0;
        this._onMessageHistoryReceiveCalls.length = 0;
        this._onLastReadTimestampCalls.length = 0;
        this._onErrorCalls.length = 0;
        this._removeAllListenersCalls.length = 0;
        this._leaveRoomCalls.length = 0;
        this._setLastReadTimestampCalls.length = 0;
        this._sendMessageCalls.length = 0;
    }
}
