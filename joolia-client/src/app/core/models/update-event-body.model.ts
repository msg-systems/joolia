/**
 * Model which defines a general update event.
 */
export interface UpdateEventBody {
    updatedObjectId: any;
    updatedFieldName?: string;
    updatedFieldValue: any;
}
