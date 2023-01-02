import { Request, Response } from 'express';
import { NotificationUser, INotificationService } from '../services/notification';
import { TargetNotification } from '../services/notification/utils';
import { User } from '../models';

/***
 * Notification Controller based on HTTP Responses.
 */
export class NotificationController {
    public constructor(private service: INotificationService) {}

    /**
     * To be called after Response is sent to API User.
     *
     * Note: No NextFunction will be called after this handler.
     *
     * @param req User Request
     * @param res User Response - already sent
     */
    public notify(req: Request, res: Response): void {
        const notification = res.locals.notification as TargetNotification;
        if (notification) {
            const user = req.user as User;
            const notificationUser = new NotificationUser(user.id, user.email, user.name);
            this.service.notify(req.path, notification, notificationUser);
        }
    }
}
