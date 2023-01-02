/**
 * Events sent to Client's Rooms. We hope they are listening to ;)
 */
export enum NotificationSocketEvent {
    NOTIFICATION = 'notification'
}

/**
 * Notification detail sent in SocketPayload that Client can react on.
 */
export enum TargetNotification {
    CREATED = 'created',
    UPDATED = 'updated',
    DELETED = 'deleted'
}
