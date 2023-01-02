import * as socketIO from 'socket.io';
import { ISocketPayload } from '../../../sockets';
import { NotificationSocketEvent } from './utils';
import { AbstractNotificationService } from './AbstractNotificationService';

/**
 * One-way Notification WS Implementation - a.k.a. Push Events.
 */
export class NotificationService extends AbstractNotificationService {
    public constructor(protected io: socketIO.Server) {
        super(io, '/notifications');
    }

    protected doNotify(payload: ISocketPayload): void {
        this.nsp.to(payload.room).emit(NotificationSocketEvent.NOTIFICATION, payload);
    }
}
