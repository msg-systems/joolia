import * as socketIO from 'socket.io';
import { getConf } from '../config';
import { FormatMember, User } from '../api/models';
import { getRepository } from 'typeorm';
import * as path from 'path';
import { AbstractSocket, BaseEvent, logger, withRoomValidation } from './abstractSocket';
import { ISocketPayload } from './ISocketPayload';

enum Event {
    MESSAGE = 'message',
    MESSAGE_HISTORY = 'message_history',
    MESSAGE_ERROR = 'error_message',
    LAST_READ_TIMESTAMP = 'lrts'
}

/**
 * Data persisted in storage
 */
interface ChatHistoryEntry {
    text: string;
    createdAt: Date;
    createdBy: string;
}

export class ChatSocket extends AbstractSocket {
    public constructor(protected io: socketIO.Server) {
        super(io, '/');
    }

    protected subscribeEvents(user: User, socket): void {
        socket.on(Event.MESSAGE, (payload: ISocketPayload) => {
            withRoomValidation(payload, async () => await this.onMessage(socket, user, payload));
        });

        socket.on(Event.LAST_READ_TIMESTAMP, (payload: ISocketPayload) => {
            withRoomValidation(payload, async () => await this.onLastReadTimestamp(socket, user, payload));
        });
    }

    private static async isFormatMember(userId: string, formatId: string): Promise<boolean> {
        // By default cache result will last for 1s
        const member = await getRepository(FormatMember).findOne({
            relations: ['format', 'user'],
            cache: true,
            where: { format: { id: formatId }, user: { id: userId } }
        });

        if (!member) {
            logger.warn('User %s is not member of %s', userId, formatId);
        }

        return !!member;
    }

    private static getFormatId(room: string): string {
        return room.match(/\/format\/.*\/?/)[0].split('/')[2];
    }

    private static isMaintenanceRoom(room: string): boolean {
        const conf = getConf().websocket;
        return conf.rooms.maintenance.test(room);
    }

    private static async isAllowed(room: string, userId: string): Promise<boolean> {
        if (!ChatSocket.isMaintenanceRoom(room)) {
            /*
             * Check Format Member membership
             */
            const formatId = ChatSocket.getFormatId(room);
            if (!(await ChatSocket.isFormatMember(userId, formatId))) {
                return false;
            }
        }

        return true;
    }

    private static createLastReadTimestampKey(room: string, userId: string): string {
        return path.normalize(`${room}/lrts/${userId}`);
    }

    private sendLastReadTimestamp(socket, room: string, userId: string): void {
        if (this.redisClient && this.redisClient.connected) {
            const k = ChatSocket.createLastReadTimestampKey(room, userId);
            logger.silly('Fetching lrts %s', k);
            this.redisClient.get(k, (err, res) => {
                if (err) {
                    logger.error('Error fetching lrts', err);
                } else {
                    if (res) {
                        const data = { lastRead: JSON.parse(res) };
                        const payload: ISocketPayload = { room, data };
                        logger.silly('Sending lrts, %o', payload);
                        socket.emit(Event.LAST_READ_TIMESTAMP, payload);
                    }
                }
            });
        }
    }

    private updateLastReadTimestamp(room: string, userId: string): void {
        if (this.redisClient && this.redisClient.connected) {
            const k = ChatSocket.createLastReadTimestampKey(room, userId);
            logger.silly('Persisting lrts %s', k);
            this.redisClient.set(k, JSON.stringify(new Date()));
        }
    }

    private async fetchUserOfHistory(history: ChatHistoryEntry): Promise<unknown> {
        const user = await this.getUser(history.createdBy);

        if (user) {
            return {
                ...history,
                user
            };
        }

        return null;
    }

    private sendChatHistory(socket, room: string): void {
        if (this.redisClient && this.redisClient.connected) {
            const conf = getConf().redis;
            this.redisClient.lrange(room, conf.storage.messageRangeMin, conf.storage.messageRangeMax, async (err, entries) => {
                if (!err) {
                    const historyPromises: Array<Promise<unknown>> = [];

                    for (const entry of entries) {
                        const historyEntry: ChatHistoryEntry = JSON.parse(entry);
                        historyPromises.push(this.fetchUserOfHistory(historyEntry));
                    }

                    const data = await Promise.all(historyPromises);
                    const payload: ISocketPayload = { room: room, data };
                    socket.emit(Event.MESSAGE_HISTORY, payload);
                } else {
                    logger.error('Error fetching history', err);
                }
            });
        }
    }

    private broadcast(room: string, text: string, user: User): void {
        const historyEntry: ChatHistoryEntry = {
            text,
            createdAt: new Date(),
            createdBy: user.id
        };

        if (this.redisClient && this.redisClient.connected) {
            this.redisClient.rpush(room, JSON.stringify(historyEntry));
        }

        const payload: ISocketPayload = {
            room,
            data: {
                ...historyEntry,
                user
            }
        };

        logger.silly('Broadcasting %o', payload);

        this.nsp.to(room).emit(Event.MESSAGE, payload);
    }

    protected async onJoin(socket, user: User, payload: ISocketPayload): Promise<void> {
        const room = payload.room;

        if (room in socket.rooms) {
            logger.silly('User %s already joined room %s', user.id, room);
            return;
        }

        logger.silly('User %s joining in %o', user.id, payload);

        if (await ChatSocket.isAllowed(room, user.id)) {
            socket.join(room);
            logger.info('User %s joined %s', user.id, room);

            if (!!!payload.data.reconnect) {
                this.sendLastReadTimestamp(socket, room, user.id);
                this.sendChatHistory(socket, room);
            }
        } else {
            logger.warn('User %s not allowed in %s', user.id, room);
            socket.emit(BaseEvent.ROOM_ERROR, 'You are not allowed in this chat room');
        }
    }

    private async onMessage(socket, user: User, payload: ISocketPayload): Promise<void> {
        const room = payload.room;
        const text = payload.data.text as string;

        if (!text || text.length > 1000) {
            logger.error('Message discarded. Text is too long.');
            return socket.emit(BaseEvent.ROOM_ERROR, 'Text message is too long.');
        }

        if (!(room in socket.rooms)) {
            logger.error('Message discarded. User %s is not in room %s', user.id, room);
            return socket.emit(BaseEvent.ROOM_ERROR, 'Unknown Room');
        }

        if (await ChatSocket.isAllowed(room, user.id)) {
            this.broadcast(room, text, user);
        } else {
            socket.emit(BaseEvent.ROOM_ERROR, 'You are not allowed in this chat room');
        }
    }

    private async onLastReadTimestamp(socket, user: User, payload: ISocketPayload): Promise<void> {
        const room = payload.room;

        if (!(room in socket.rooms)) {
            logger.error('Message discarded. User %s is not in room %s', user.id, room);
            return socket.emit(BaseEvent.ROOM_ERROR, 'Unknown Room');
        }

        if (await ChatSocket.isAllowed(room, user.id)) {
            this.updateLastReadTimestamp(room, user.id);
        } else {
            socket.emit(BaseEvent.ROOM_ERROR, 'You are not allowed in this chat room');
        }
    }
}
