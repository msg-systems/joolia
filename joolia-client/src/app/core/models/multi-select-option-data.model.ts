import { SelectOption } from './select-option.model';

/**
 * Model which defines multiple selection objects.
 */
export interface MultiSelectOptionData {
    entityName: string;
    selectOptions: SelectOption[];
    required: boolean;
}
