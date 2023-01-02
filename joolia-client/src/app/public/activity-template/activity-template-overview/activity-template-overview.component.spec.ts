import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ActivityTemplateOverviewComponent } from './activity-template-overview.component';
import { ActivityTemplateService, LibraryService, ViewTypeService } from '../../../core/services';
import { MaterialModule } from '../../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';
import { DialogStub, getMockData, LibraryServiceStub, ViewTypeServiceStub } from '../../../../testing/unitTest';
import { ActivityTemplateServiceStub } from '../../../../testing/unitTest';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

const activityTemplateServiceStub = new ActivityTemplateServiceStub();
const libraryServiceStub = new LibraryServiceStub();
const dialogStub = new DialogStub(true);
const viewTypeServiceStub = new ViewTypeServiceStub();
const routeStub = new ActivatedRouteStub({ id: 99999 });
const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: ''
};

let mockLibrary1;
let mockActivityTemplate1;
let mockActivityTemplateList1;

describe('ActivityTemplateOverviewComponent', () => {
    let component: ActivityTemplateOverviewComponent;
    let fixture: ComponentFixture<ActivityTemplateOverviewComponent>;
    let libraryService: LibraryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ActivityTemplateOverviewComponent],
            imports: [MaterialModule, TranslateModule.forRoot(), SharedModule, NoopAnimationsModule, InfiniteScrollModule],
            providers: [
                { provide: LibraryService, useValue: libraryServiceStub },
                { provide: ActivityTemplateService, useValue: activityTemplateServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: routeStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: ViewTypeService, useValue: viewTypeServiceStub }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ActivityTemplateOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        libraryService = TestBed.inject(LibraryService);
        activityTemplateServiceStub._resetStubCalls();

        mockLibrary1 = getMockData('library.library1');
        mockActivityTemplate1 = getMockData('template.activity.template1');
        mockActivityTemplateList1 = getMockData('template.activity.list.list1');
    });

    it('should load activity templates', () => {
        component.getInitialActivityTemplates();
        expect(activityTemplateServiceStub._loadActivityTemplatesCalls.length).toBe(1);
    });

    it('should navigate to activity templates', () => {
        component.onActivityTemplateClick(mockActivityTemplate1.id);
        expect(routerSpy.navigate.calls.mostRecent().args[0][0]).toBe(
            `library/${mockLibrary1.id}/template/details/activity/${mockActivityTemplate1.id}`
        );
    });

    it('should delete an activity template', () => {
        component.activityTemplates = mockActivityTemplateList1;
        component.onActivityTemplateDelete('4a53989c-6d22-409e-acb7-5bd1b20db8d2');
        expect(activityTemplateServiceStub._deleteActivityTemplateCalls.length).toBe(1);
        expect(activityTemplateServiceStub._deleteActivityTemplateCalls.pop().activityTemplateId).toBe(
            '4a53989c-6d22-409e-acb7-5bd1b20db8d2'
        );
    });

    it('should detect category selection changes', fakeAsync(() => {
        spyOn(component, 'getInitialActivityTemplates').and.callThrough();
        const categoriesPassed = ['explore', ' test'];
        libraryService.selectCategories(categoriesPassed);
        fixture.detectChanges();
        fixture.whenStable();
        expect(component.getInitialActivityTemplates).toHaveBeenCalledWith(categoriesPassed);
    }));

    it('should load the view type', () => {
        expect(component.activityViewType).toBe(ViewType.CARD_VIEW);
    });

    it('should verify view type usage consistency', () => {
        component.activityViewType = ViewType.LIST_VIEW;
        expect(component.isListViewType()).toBeTruthy('List View enum is not consistent with its usage');
        component.activityViewType = ViewType.CARD_VIEW;
        expect(component.isCardViewType()).toBeTruthy('Card View enum is not consistent with its usage');
    });
});
