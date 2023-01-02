import { AbstractNotificationService } from './AbstractNotificationService';
import { ISocketPayload } from '../../../sockets';
import { logger } from '../../../sockets/abstractSocket';

/**
 * Log notifications when WS is disabled - Nothing is pushed to client.
 */
export class LogNotificationService extends AbstractNotificationService {
    public constructor() {
        super(undefined, undefined);
    }

    protected doNotify(payload: ISocketPayload): void {
        logger.info('%o', payload);
    }
}
