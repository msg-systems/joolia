/**
 * Model which defines the Actionbar Action.
 */
export interface Action {
    actionKey: string;
    actionFunction?: Function;
    beta?: boolean;
    subActions?: Action[];
    icon?: string;
    emptyAction?: boolean;
    disabled?: boolean;
}
