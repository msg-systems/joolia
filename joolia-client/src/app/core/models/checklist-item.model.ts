/**
 * Model which defines a single item used in checklists
 */
export interface ChecklistItem {
    itemId: string;
    content: string;
    checked: boolean;
}
