/**
 * Model which defines a generic list of entities.
 */
export interface List<T> {
    count: number;
    entities: T[];
}
