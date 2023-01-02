import * as socketIo from 'socket.io-client';
import { AuthenticationService } from './authentication.service';
import { ConfigurationService } from './configuration.service';
import { LoggerService } from './logger.service';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { SocketConnectionStatus } from '../enum/global/socket.enum';

export interface SocketTransportObject {
    room: string;
    data: Object;
}

@Injectable()
export abstract class BasicSocketService {
    protected logoutSubscription: Subscription;
    protected loginSubscription: Subscription;
    protected socket;
    protected path;
    protected availableRooms;
    protected serverConnection: string;
    private activeRooms: string[] = [];
    private connectionStatus: string = SocketConnectionStatus.DISCONNECTED;

    protected constructor(
        protected authenticationService: AuthenticationService,
        protected logger: LoggerService,
        protected config: ConfigurationService,
        protected nsp?: string
    ) {
        this.availableRooms = ConfigurationService.getConfiguration().configuration.websocket.rooms;
        this.path = nsp || ConfigurationService.getConfiguration().configuration.websocket.namespaces.app;

        this.loginSubscription = this.authenticationService.loginExecuted.subscribe(() => {
            this.getSocketConnection();
        });
    }

    public initSocket(params?: any): Promise<void> {
        if (this.path === '') {
            throw new Error();
        }

        this.serverConnection = this.config.getServerConnection();
        const connStr = this.serverConnection.concat(this.path);

        this.socket = socketIo(connStr, {
            transports: ConfigurationService.getConfiguration().configuration.websocket.transport
        });

        this.setLogoutSubscription();

        const token = this.authenticationService.jwtToken.substring(4, this.authenticationService.jwtToken.length);

        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => {
                if (this.connectionStatus === SocketConnectionStatus.DISCONNECTED) {
                    this.connectionStatus = SocketConnectionStatus.CONNECTING;
                    this.logger.debug('[SOCKET][connection-status] connecting (Namespace: ' + this.path + ' )');
                    this.socket
                        .emit('authenticate', { token: token })
                        .on('authenticated', () => {
                            if (this.connectionStatus !== SocketConnectionStatus.CONNECTED) {
                                this.activeRooms.forEach((r) => this.joinRoom(r, true));
                                this.logger.debug(`[SOCKET] connected - authenticated ( Namespace: ${this.path} )`);
                                this.connectionStatus = SocketConnectionStatus.CONNECTED;
                                this.logger.debug(`[SOCKET][connection-status] connected ( Namespace: ${this.path} )`);
                            }
                            return resolve();
                        })
                        .on('unauthorized', (msg) => {
                            this.logger.debug(`[SOCKET] authentication failed! ( Namespace: ${this.path} )`);
                            this.logger.debug(`[SOCKET][connection-status] disconnected ( Namespace: ${this.path} )`);
                            this.connectionStatus = SocketConnectionStatus.DISCONNECTED;
                            return reject(msg);
                        });
                } else if (this.connectionStatus === SocketConnectionStatus.CONNECTED) {
                    this.logger.debug(`[SOCKET][connection-status] connected ( Namespace: ${this.path} )`);
                    resolve();
                }
            });

            this.socket.on('connect_error', () => {
                this.connectionStatus = SocketConnectionStatus.DISCONNECTED;
                this.logger.debug(`[SOCKET] Connection error ( Namespace: ${this.path} )`);
            });

            this.socket.on('connect_timeout', () => {
                this.connectionStatus = SocketConnectionStatus.DISCONNECTED;
                this.logger.debug(`[SOCKET] Connection timeout ( Namespace: ${this.path} )`);
            });

            this.socket.on('reconnect', () => {
                this.logger.debug(`[SOCKET] reconnecting... ( Namespace: ${this.path} )`);
                this.getSocketConnection();
            });
        });
    }

    public getSocketConnection(): Promise<void> {
        if (!this.isConnected()) {
            return this.initSocket();
        } else {
            return Promise.resolve();
        }
    }

    public joinRoom(room: string, reconnect: boolean = false) {
        const message: SocketTransportObject = {
            room: room,
            data: { reconnect: reconnect }
        };
        this.socket.emit('join', message);

        if (!this.activeRooms.some((r) => r === room)) {
            this.activeRooms.push(room);
        }

        this.logger.debug(`[SOCKET] JOINED ROOM: ${room} ( Namespace: ${this.path} )`);
    }

    public leaveRoom(room: string) {
        if (this.socket) {
            this.socket.emit('leave', room);
            this.activeRooms = this.activeRooms.filter((r) => r !== room);
            this.logger.debug('[SOCKET] LEFT ROOM: ' + room);
        } else {
            this.logger.debug('[SOCKET] LEFT ROOM: Can´t leave room ' + room + ' socket connection down');
        }
    }

    public closeSocket(params?: any): void {
        this.socket.disconnect();
        this.logger.debug('[SOCKET][connection-status] disconnected');
        this.logoutSubscription.unsubscribe();
        this.resetSocketService();
    }

    public isConnected(): boolean {
        return !!this.socket;
    }

    public logEvent(event: string) {
        this.logger.trace('[SOCKET][event] ' + event);
    }

    private setLogoutSubscription() {
        this.logoutSubscription = this.authenticationService.logoutExecuted.subscribe(() => {
            this.closeSocket();
            this.connectionStatus = SocketConnectionStatus.DISCONNECTED;
            this.logoutSubscription.unsubscribe();
        });
    }

    private resetSocketService() {
        this.socket = undefined;
        this.activeRooms.length = 0;
    }
}
