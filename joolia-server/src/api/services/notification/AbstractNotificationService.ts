import { AbstractSocket, getRoom, logger } from '../../../sockets/abstractSocket';
import { INotificationService } from './INotificationService';
import * as socketIO from 'socket.io';
import { TargetNotification } from './utils';
import { NotificationUser } from './NotificationUser';
import { ISocketPayload } from '../../../sockets';

/**
 * Inherit from here to create a new NotificationService.
 */
export abstract class AbstractNotificationService extends AbstractSocket implements INotificationService {
    protected constructor(protected io: socketIO.Server, protected namespace: string) {
        super(io, namespace);
    }

    public notify(target: string, notification: TargetNotification, user: NotificationUser): void {
        if (target && notification && user) {
            const payload = this.createPayload(notification, target, user);

            if (payload) {
                logger.debug('Notifying %o', payload);
                this.doNotify(payload);
            }
        } else {
            logger.error('Cannot send notification :/');
        }
    }

    protected createPayload(notification: TargetNotification, target: string, user: NotificationUser): ISocketPayload {
        try {
            const room = getRoom(target);

            if (room) {
                return {
                    room,
                    data: {
                        target,
                        notification,
                        user,
                        ts: new Date()
                    }
                };
            }

            logger.error('Socket payload not created (%s %s)', notification, target);
        } catch (e) {
            logger.error(`Error creating socket payload %o`, e);
        }
    }

    protected abstract doNotify(payload: ISocketPayload);
}
