/**
 * The ViewTypeService handles the view type setting for all entites like format, members etc.
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ViewType } from '../enum/global/view-type.enum';

@Injectable({
    providedIn: 'root'
})
export class ViewTypeService {
    formatViewTypeChanged = new Subject<ViewType>();
    memberViewTypeChanged = new Subject<ViewType>();
    libraryViewTypeChanged = new Subject<ViewType>();
    private formatViewType = ViewType.LIST_VIEW;
    private memberViewType = ViewType.LIST_VIEW;
    private libraryViewType = ViewType.LIST_VIEW;

    setFormatViewType(newViewType: ViewType) {
        this.formatViewType = newViewType;
        this.formatViewTypeChanged.next(this.formatViewType);
    }

    getFormatViewType(): ViewType {
        return this.formatViewType;
    }

    setMemberViewType(newViewType: ViewType) {
        this.memberViewType = newViewType;
        this.memberViewTypeChanged.next(this.memberViewType);
    }

    getMemberViewType(): ViewType {
        return this.memberViewType;
    }

    setLibraryViewType(newViewType: ViewType) {
        this.libraryViewType = newViewType;
        this.libraryViewTypeChanged.next(this.libraryViewType);
    }

    getLibraryViewType(): ViewType {
        return this.libraryViewType;
    }
}
