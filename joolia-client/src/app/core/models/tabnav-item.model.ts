/**
 * Model which defines the Tabnav item used for the tab-navbar component.
 */

export interface TabnavItem {
    tabKey: string;
    tabArgument?: () => object;
    path: string;
}
