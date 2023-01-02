import { TargetNotification } from './utils';
import { NotificationUser } from './NotificationUser';

/**
 * Push Notification contract.
 */
export interface INotificationService {
    /**
     * Notifies all clients connected to the Room resolved for the Target.
     *
     * @param target Represents the target of the Notification. Resource being modified.
     * @param notification See {@link TargetNotification}.
     * @param user The user that triggered the Notification.
     */
    notify(target: string, notification: TargetNotification, user: NotificationUser): void;
}
