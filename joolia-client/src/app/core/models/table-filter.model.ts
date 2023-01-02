/**
 * Model which defines a TableFilter for the TableFiltersComponent.
 */
export interface TableFilter {
    key: string;
    label: string;
    value: string;
    valueList?: string[];
}
