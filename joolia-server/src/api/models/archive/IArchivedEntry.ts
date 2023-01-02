/**
 * Base definition of any deleted Entity.
 */
export interface IArchivedEntry {
    id: string;
    requestId: string;
    deletedAt: Date;
    deletedById: string;
    [k: string]: unknown;
}
