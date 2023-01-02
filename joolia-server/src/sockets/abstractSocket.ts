import * as socketIO from 'socket.io';
import * as socketioJWT from 'socketio-jwt';
import * as redisAdapter from 'socket.io-redis';
import { createClient, RedisClient } from 'redis';
import { getConf } from '../config';
import { wsLogger } from '../logger';
import { Logger } from 'winston';
import { User } from '../api/models';
import { getRepository } from 'typeorm';
import { ISocketPayload } from './ISocketPayload';

export const logger: Logger = wsLogger;

export enum BaseEvent {
    ROOM_ERROR = 'error_room'
}

function isChatRoom(room: string): boolean {
    const conf = getConf().websocket;
    return Object.values(conf.rooms.chat).some((pattern: RegExp) => pattern.test(room));
}

function isNotificationRoom(room: string): boolean {
    const conf = getConf().websocket;
    return Object.values(conf.rooms.notification).some((cfg: { room: RegExp }) => cfg.room.test(room));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function withRoomValidation(payload: ISocketPayload, fn: Function): void {
    logger.silly('Validating payload %o', payload);

    if ('room' in payload) {
        const room = payload.room;
        const conf = getConf().websocket;
        const isMaintenance = conf.rooms.maintenance.test(room);
        const isValidRoomName = isMaintenance || isChatRoom(room) || isNotificationRoom(room);

        if (isMaintenance || isValidRoomName) {
            fn();
        } else {
            logger.error('Room %s not valid/allowed', payload.room);
        }
    } else {
        logger.error('Unknown payload %o', payload);
    }
}

export function getRoom(target: string): string {
    const conf = getConf().websocket;
    const obj = Object.values<{ room: RegExp; target: RegExp }>(conf.rooms.notification).find((cfg) => cfg.target.test(target));

    if (obj) {
        // Gets the id from the named group in RegExp
        const match = obj.target.exec(target);
        // All ids are UUIDs of length 36 - This also keeps the RegExp simple and cheap.
        const id = match.groups.id.slice(0, 36);
        // Only need the room name - no RegExp characters allowed
        const rawStr = obj.room.source.replace(/[\\|\^]/g, '');
        return `${rawStr}/${id}`; // Returns /notification/<something>/<id>
    }
}

export abstract class AbstractSocket {
    protected nsp: socketIO.Namespace;
    protected redisClient: RedisClient;

    protected constructor(protected io: socketIO.Server, protected namespace: string) {
        if (io && namespace) {
            this.nsp = this.io.of(namespace);
            this.setupSocket();
            this.connectRedis();
            logger.info('WS created for %s', this.namespace);
        }
    }

    private setupSocket(): void {
        this.nsp
            .on(
                'connection',
                socketioJWT.authorize({
                    secret: getConf().authConf.jwtSecret,
                    timeout: getConf().websocket.authTimeout
                })
            )
            .on('authenticated', async (socket) => {
                const user = await this.onAuthenticated(socket);

                if (!user) {
                    return;
                }

                socket.on('join', (payload: ISocketPayload) => {
                    withRoomValidation(payload, async () => await this.onJoin(socket, user, payload));
                });

                socket.on('logout', async () => await this.onLogout(socket, user));

                socket.on('disconnect', async () => await this.onDisconnect(socket, user));

                socket.on('leave', async (room) => await this.onLeave(socket, user, room));

                this.subscribeEvents(user, socket);
            });
    }

    // eslint-disable-next-line no-unused-vars
    protected subscribeEvents(user: User, socket): void {
        /**
         * Override me if you need to listen to specific events
         */
    }

    protected onJoin(socket, user: User, payload: ISocketPayload): void {
        const room = payload.room;

        if (room in socket.rooms) {
            logger.debug('User %s already joined room %s (%s)', user.id, room, this.namespace);
            return;
        }

        socket.join(room);

        logger.info('User %s joined %s (%s)', user.id, room, this.namespace);
    }

    protected async onAuthenticated(socket): Promise<User> {
        try {
            const subject = socket.decoded_token.sub;
            const user = await this.getUser(subject.email);

            if (user) {
                socket.emit('connected');
                logger.info('User %s authenticated (%s)', user.id, this.namespace);
            } else {
                logger.warn('User %s cannot be authenticated (%s)', subject.email, this.namespace);
            }

            return user;
        } catch (e) {
            logger.error('Error authenticating: %s', e.message);
        }
    }

    protected async getUser(userIdOrEmail: string): Promise<User> {
        const repo = getRepository(User);
        // By default cache result will last for 1s
        const user = await repo.findOne({ cache: true, where: [{ email: userIdOrEmail }, { id: userIdOrEmail }] });
        if (!user) {
            logger.silly('User %s not found', userIdOrEmail);
        }

        return user;
    }

    protected async onLogout(socket, user: User): Promise<void> {
        logger.info('User %s logged out (%s)', user.id, this.namespace);
    }

    protected async onDisconnect(socket, user: User): Promise<void> {
        logger.info('User %s disconnected socket (%s)', user.id, this.namespace);
    }

    protected async onLeave(socket, user: User, room: string): Promise<void> {
        logger.info('User %s leaving room %s (%s)', user.id, room, this.namespace);
        socket.leave(room);
    }

    private connectRedis(): void {
        const redisConf = getConf().redis;

        if (!redisConf.enabled) {
            logger.warn('Redis disabled. Message persistency & broadcasting may not work properly.');
            return;
        }

        const options = {
            // eslint-disable-next-line
            retry_strategy: (options) => {
                logger.error('[Redis]: connection lost, connection retry: ' + options.attempt);

                if (options.total_retry_time > redisConf.connection.retryMaxTime) {
                    // End reconnecting after a specific timeout and flush all commands with a individual error
                    logger.error('[Redis]: maximum retry time exhausted');
                    return new Error('Maximum retry time exhausted');
                }
                if (options.attempt > redisConf.connection.retryAttempt) {
                    // End reconnecting with built in error
                    logger.error('[Redis]: maximum connection retry reached');
                    return new Error('Maximum connection retry reached');
                }
                return redisConf.connection.retryTimeout;
            }
        };

        this.redisClient = createClient(redisConf.port, redisConf.host, options);

        this.io.adapter(
            redisAdapter({
                pubClient: createClient(redisConf.port, redisConf.host, options),
                subClient: createClient(redisConf.port, redisConf.host, options)
            })
        );

        logger.info('Message persistency is enabled');
    }
}
