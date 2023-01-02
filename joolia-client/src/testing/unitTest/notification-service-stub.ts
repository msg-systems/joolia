import { NotificationService, NotificationTransportObject } from '../../app/core/services';
import { Subject } from 'rxjs';

export class NotificationServiceStub implements Partial<NotificationService> {
    public _initCalls: any[] = [];
    public _joinRoomCalls: any[] = [];
    public _leaveRoomCalls: any[] = [];
    public _terminateCalls: any[] = [];

    public canvasChangedWS = new Subject<NotificationTransportObject>();
    public formatChangedWS = new Subject<NotificationTransportObject>();
    public submissionChangedWS = new Subject<NotificationTransportObject>();
    public activityChangedWS = new Subject<NotificationTransportObject>();

    public init(): Promise<any> {
        this._initCalls.push({});
        return Promise.resolve();
    }

    public joinRoom(room): void {
        this._joinRoomCalls.push({ room });
    }

    public leaveRoom(room): void {
        this._leaveRoomCalls.push({ room });
    }

    public terminate(): void {
        this._terminateCalls.push({});
    }

    _resetStubCalls() {
        this._initCalls.length = 0;
        this._joinRoomCalls.length = 0;
        this._leaveRoomCalls.length = 0;
        this._terminateCalls.length = 0;
    }
}
