import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { FormatTemplateOverviewComponent } from './format-template-overview.component';
import { FormatTemplateService, LibraryService, ViewTypeService } from '../../../core/services';
import { MaterialModule } from '../../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';
import { DialogStub, FormatTemplateServiceStub, getMockData, LibraryServiceStub, ViewTypeServiceStub } from '../../../../testing/unitTest';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

const libraryServiceStub = new LibraryServiceStub();
const viewTypeServiceStub = new ViewTypeServiceStub();
const formatTemplateServiceStub = new FormatTemplateServiceStub();
const dialogStub = new DialogStub(true);
const routeStub = new ActivatedRouteStub({ id: 99999 });
const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: ''
};

let mockFormatTemplate1;
let mockFormatTemplateList1;
let mockLibrary1;

describe('FormatTemplateOverviewComponent', () => {
    let component: FormatTemplateOverviewComponent;
    let fixture: ComponentFixture<FormatTemplateOverviewComponent>;
    let libraryService: LibraryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FormatTemplateOverviewComponent],
            imports: [MaterialModule, TranslateModule.forRoot(), SharedModule, NoopAnimationsModule, InfiniteScrollModule],
            providers: [
                { provide: LibraryService, useValue: libraryServiceStub },
                { provide: FormatTemplateService, useValue: formatTemplateServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: routeStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: ViewTypeService, useValue: viewTypeServiceStub }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FormatTemplateOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        libraryService = TestBed.inject(LibraryService);
        formatTemplateServiceStub._resetStubCalls();

        mockFormatTemplate1 = getMockData('template.format.template1');
        mockFormatTemplateList1 = getMockData('template.format.list.list1');
        mockLibrary1 = getMockData('library.library1');
    });

    it('should load format templates', () => {
        component.getInitialFormatTemplates();
        expect(formatTemplateServiceStub._loadFormatTemplatesCalls.length).toBe(1);
    });

    it('should navigate to format templates', () => {
        component.onFormatTemplateClick(mockFormatTemplate1.id);
        expect(routerSpy.navigate.calls.mostRecent().args[0][0]).toBe(
            `library/${mockLibrary1.id}/template/details/format/${mockFormatTemplate1.id}`
        );
    });

    it('should delete an format template', () => {
        component.formatTemplates = mockFormatTemplateList1;
        component.onFormatTemplateDelete(mockFormatTemplateList1.entities[0].id);
        expect(formatTemplateServiceStub._deleteFormatTemplateCalls.length).toBe(1);
        expect(formatTemplateServiceStub._deleteFormatTemplateCalls.pop().formatTemplateId).toBe(mockFormatTemplateList1.entities[0].id);
    });

    it('should detect category selection changes', async () => {
        const getSpy = spyOn(component, 'getInitialFormatTemplates').and.callThrough();
        const categoriesPassed = ['explore', ' test'];
        libraryService.selectCategories(categoriesPassed);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getSpy).toHaveBeenCalledWith(categoriesPassed);
    });

    it('should load the view type', () => {
        expect(component.formatViewType).toBe(ViewType.CARD_VIEW);
    });

    it('should verify view type usage consistency', () => {
        component.formatViewType = ViewType.LIST_VIEW;
        expect(component.isListViewType()).toBeTruthy('List View enum is not consistent with its usage');
        component.formatViewType = ViewType.CARD_VIEW;
        expect(component.isCardViewType()).toBeTruthy('Card View enum is not consistent with its usage');
    });
});
