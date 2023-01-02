import { User } from './user.model';
import { Moment } from 'moment';

export interface ChatRoom {
    room: string;
    title: string;
    newMessages: number;
    lastRead: Moment;
    entity: string;
    id: string;
}

/**
 * Model All Messages of one Room
 */
export interface MessageBox {
    room: string;
    messages: Message[];
}

/**
 * Model which defines the data for a message.
 */
export interface Message {
    text: string;
    createdAt: Moment;
    createdBy: string;
    user: User;
}

/**
 * Model which extends message data with format specific data
 */
export interface FormatMessage extends Message {
    formatId: string;
}
