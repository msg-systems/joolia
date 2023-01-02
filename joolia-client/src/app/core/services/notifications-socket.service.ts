import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { ConfigurationService } from './configuration.service';
import { LoggerService } from './logger.service';
import { BasicSocketService } from './basic-socket.service';
import { NotificationEvents } from '../enum/global/notification.enum';

export interface INotificationsSocket {
    onNotification(cb: Function);
}

interface ISocketListener {
    eventName: string;
    callback: Function;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationsSocketService extends BasicSocketService implements INotificationsSocket {
    private socketListeners: ISocketListener[] = [];

    constructor(
        protected authenticationService: AuthenticationService,
        protected logger: LoggerService,
        protected config: ConfigurationService
    ) {
        super(
            authenticationService,
            logger,
            config,
            ConfigurationService.getConfiguration().configuration.websocket.namespaces.notifications
        );
    }

    public removeAllListeners(): void {
        if (this.isConnected()) {
            for (const socketListener of this.socketListeners) {
                this.socket.off(socketListener.eventName, socketListener.callback);
            }
        }
    }

    public onNotification(cb: Function): void {
        this.addListener(NotificationEvents.NOTIFICATION, cb);
    }

    private addListener(eventName: string, callback: Function): void {
        this.socketListeners.push({ eventName, callback });
        this.logEvent(eventName);
        this.socket.on(eventName, callback);
    }
}
