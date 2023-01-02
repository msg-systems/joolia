import { fakeAsync, TestBed } from '@angular/core/testing';
import { ViewTypeService } from './view-type.service';
import { ViewType } from '../enum/global/view-type.enum';

describe('ViewTypeService', () => {
    let service: ViewTypeService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ViewTypeService]
        });
        service = TestBed.inject(ViewTypeService);
    });

    describe('FormatViewType', () => {
        it('getFormatViewType should initially return list view', () => {
            expect(service.getFormatViewType()).toBe(ViewType.LIST_VIEW);
        });

        it('setFormatViewType should set format view type ', fakeAsync(() => {
            service.formatViewTypeChanged.subscribe((viewType: ViewType) => {
                expect(viewType).toBe(ViewType.CARD_VIEW);
            });
            service.setFormatViewType(ViewType.CARD_VIEW);
        }));
    });

    describe('LibraryViewType', () => {
        it('getLibraryViewType should initially return list view', () => {
            expect(service.getLibraryViewType()).toBe(ViewType.LIST_VIEW);
        });

        it('setFormatViewType should set format view type ', fakeAsync(() => {
            service.libraryViewTypeChanged.subscribe((viewType: ViewType) => {
                expect(viewType).toBe(ViewType.CARD_VIEW);
            });
            service.setLibraryViewType(ViewType.CARD_VIEW);
        }));
    });

    describe('MemberViewType', () => {
        it('getMemberViewType should initially return list view', () => {
            expect(service.getMemberViewType()).toBe(ViewType.LIST_VIEW);
        });

        it('setFormatViewType should set format view type ', fakeAsync(() => {
            service.memberViewTypeChanged.subscribe((viewType: ViewType) => {
                expect(viewType).toBe(ViewType.CARD_VIEW);
            });
            service.setMemberViewType(ViewType.CARD_VIEW);
        }));
    });
});
