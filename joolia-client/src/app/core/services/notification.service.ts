import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { NotificationsSocketService } from './notifications-socket.service';
import { Subject } from 'rxjs';
import { SocketTransportObject } from './basic-socket.service';
import { User } from '../models';
import { UserService } from './user.service';

type Modify<T, R> = Omit<T, keyof R> & R;

interface NotificationTransportObjectExtension {
    data: {
        target: string;
        notification: string;
        user: Pick<User, 'id' | 'email' | 'name'>;
        ts: string;
    };
}

export interface NotificationTransportObject extends Modify<SocketTransportObject, NotificationTransportObjectExtension> {}

@Injectable()
export class NotificationService {
    public canvasChangedWS = new Subject<NotificationTransportObject>();
    public formatChangedWS = new Subject<NotificationTransportObject>();
    public submissionChangedWS = new Subject<NotificationTransportObject>();
    public activityChangedWS = new Subject<NotificationTransportObject>();

    constructor(
        private notificationSocketService: NotificationsSocketService,
        private logger: LoggerService,
        private userService: UserService
    ) {}

    public init(): Promise<any> {
        return this.notificationSocketService.getSocketConnection().then(() => {
            this.setEventListeners();
        });
    }

    public terminate(): void {
        this.terminateSubscriptions();
    }

    public joinRoom(room): void {
        this.notificationSocketService.joinRoom(room);
    }

    public leaveRoom(room): void {
        this.notificationSocketService.leaveRoom(room);
    }

    private setEventListeners(): void {
        this.notificationSocketService.onNotification((notification: NotificationTransportObject) => {
            if (!this.isOwnNotification(notification)) {
                try {
                    this[`${notification.room.split('/')[2]}Notification`](notification);
                } catch (e) {
                    this.logger.fatal(e);
                }
            }
        });
    }

    private canvasNotification(notification: NotificationTransportObject): void {
        this.canvasChangedWS.next(notification);
    }

    private formatNotification(notification: NotificationTransportObject): void {
        this.formatChangedWS.next(notification);
    }

    private submissionNotification(notification: NotificationTransportObject): void {
        this.submissionChangedWS.next(notification);
    }

    private activityNotification(notification: NotificationTransportObject): void {
        this.activityChangedWS.next(notification);
    }

    private isOwnNotification(notification) {
        return notification.data.user.id === this.userService.getCurrentLoggedInUser().id;
    }

    private terminateSubscriptions(): void {
        this.notificationSocketService.removeAllListeners();
    }
}
