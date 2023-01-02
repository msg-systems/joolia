/**
 * Data sent back and forth to clients
 */
export interface ISocketPayload {
    room: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
}
