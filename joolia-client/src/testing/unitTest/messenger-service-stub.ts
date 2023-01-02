import { MessengerService } from '../../app/core/services/messenger.service';
import { Subject } from 'rxjs';
import { ChatRoom, Message, MessageBox } from '../../app/core/models';
import { MessengerView } from '../../app/core/enum/global/messenger.enum';
import { getMockData } from './mock-data';

export class MessengerServiceStub implements Partial<MessengerService> {
    titleChanged: Subject<string> = new Subject();
    availableChatRoomsChanged: Subject<ChatRoom[]> = new Subject();
    newMessageCounter: Subject<string> = new Subject();
    totalMessageCountChanged: Subject<number> = new Subject<number>();
    messageBoxChanged: Subject<MessageBox[]> = new Subject<MessageBox[]>();

    public _initContextCalls: any[] = [];
    public _terminateContextCalls: any[] = [];
    public _isViewActiveCalls: any[] = [];
    public _navigateToViewCalls: any[] = [];
    public _getChatMessagesForCurrentRoomCalls: any[] = [];
    public _sendMessageCalls: any[] = [];

    public initContext(context: string) {
        this._initContextCalls.push({ context });
    }

    public terminateContext(context: string) {
        this._terminateContextCalls.push({ context });
    }

    public isViewActive(view: MessengerView): boolean {
        this._isViewActiveCalls.push({ view });
        return false;
    }

    public navigateToView(view: MessengerView, roomId?: string) {
        this._navigateToViewCalls.push({ view, roomId });
    }

    public getChatMessagesForCurrentRoom() {
        this._getChatMessagesForCurrentRoomCalls.push(undefined);
        return getMockData('messageBox.messageBox1');
    }

    public sendMessage(m: Message) {
        this._sendMessageCalls.push({ m });
    }

    _resetStubCalls() {
        this._initContextCalls.length = 0;
        this._terminateContextCalls.length = 0;
        this._isViewActiveCalls.length = 0;
        this._navigateToViewCalls.length = 0;
        this._getChatMessagesForCurrentRoomCalls.length = 0;
        this._sendMessageCalls.length = 0;
    }
}
