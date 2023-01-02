import { ViewTypeService } from '../../app/core/services';
import { ViewType } from '../../app/core/enum/global/view-type.enum';
import { Subject } from 'rxjs';

export class ViewTypeServiceStub implements Partial<ViewTypeService> {
    libraryViewTypeChanged = new Subject<ViewType>();
    formatViewTypeChanged = new Subject<ViewType>();
    memberViewTypeChanged = new Subject<ViewType>();

    public _setLibraryViewTypeChangedCalls: any[] = [];
    public _setMemberViewTypeChangedCalls: any[] = [];

    getFormatViewType() {
        return ViewType.CARD_VIEW;
    }

    getLibraryViewType(): ViewType {
        return ViewType.CARD_VIEW;
    }

    getMemberViewType(): ViewType {
        return ViewType.CARD_VIEW;
    }

    setLibraryViewType(libraryViewType: ViewType) {
        this._setLibraryViewTypeChangedCalls.push(libraryViewType);
    }

    setMemberViewType(viewType: ViewType) {
        this._setMemberViewTypeChangedCalls.push(viewType);
    }

    _resetStubCalls() {
        this._setLibraryViewTypeChangedCalls.length = 0;
        this._setMemberViewTypeChangedCalls.length = 0;
    }
}
