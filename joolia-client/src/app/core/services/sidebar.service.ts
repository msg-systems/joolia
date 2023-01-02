import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { SidebarMode } from '../enum/global/sidebar-mode.enum';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    mode: SidebarMode;
    opened: boolean;
    mobile = false;

    constructor(private breakpointObserver: BreakpointObserver) {
        this.breakpointObserver.observe(Breakpoints.XSmall).subscribe((state: BreakpointState) => {
            this.mobile = state.matches;
            this.sizeChanged();
        });
        this.sizeChanged();
    }

    entryClicked(): void {
        if (this.mobile) {
            setTimeout(() => {
                this.setOpened(false);
            }, 0);
        }
    }

    toggleOpened(): void {
        this.opened = !this.opened;
    }

    setOpened(opened: boolean): void {
        this.opened = opened;
    }

    private sizeChanged(): void {
        this.opened = !this.mobile;
        this.mode = this.mobile ? SidebarMode.OVER : SidebarMode.SIDE;
    }
}
