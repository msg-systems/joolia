/**
 * Model which defines the Sidenav Item.
 */
export interface SidenavItem {
    sidenavKey: string;
    sidenavRouterLink: string;
    queryParams?: Object;
    icon?: string;
}
