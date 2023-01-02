import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { PhaseTemplateOverviewComponent } from './phase-template-overview.component';
import { PhaseTemplateService, LibraryService, ViewTypeService } from '../../../core/services';
import { MaterialModule } from '../../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';
import { LibraryServiceStub, DialogStub, getMockData, ViewTypeServiceStub } from '../../../../testing/unitTest';
import { PhaseTemplateServiceStub } from '../../../../testing/unitTest';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

const libraryServiceStub = new LibraryServiceStub();
const viewTypeServiceStub = new ViewTypeServiceStub();
const phaseTemplateServiceStub = new PhaseTemplateServiceStub();
const dialogStub = new DialogStub(true);
const routeStub = new ActivatedRouteStub({ id: 99999 });
const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: ''
};

let mockLibrary1;
let mockPhaseTemplate1;
let mockPhaseTemplateList1;

describe('PhaseTemplateOverviewComponent', () => {
    let component: PhaseTemplateOverviewComponent;
    let fixture: ComponentFixture<PhaseTemplateOverviewComponent>;
    let libraryService: LibraryService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PhaseTemplateOverviewComponent],
            imports: [MaterialModule, TranslateModule.forRoot(), SharedModule, NoopAnimationsModule, InfiniteScrollModule],
            providers: [
                { provide: LibraryService, useValue: libraryServiceStub },
                { provide: PhaseTemplateService, useValue: phaseTemplateServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: routeStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: ViewTypeService, useValue: viewTypeServiceStub }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PhaseTemplateOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        libraryService = TestBed.inject(LibraryService);
        phaseTemplateServiceStub._resetStubCalls();

        mockLibrary1 = getMockData('library.library1');
        mockPhaseTemplate1 = getMockData('template.phase.template1');
        mockPhaseTemplateList1 = getMockData('template.phase.list.list1');
    }));

    it('should load phase templates', () => {
        component.getInitialPhaseTemplates();
        expect(phaseTemplateServiceStub._loadPhaseTemplatesCalls.length).toBe(1);
    });

    it('should navigate to phase templates', () => {
        component.onPhaseTemplateClick(mockPhaseTemplate1.id);
        expect(routerSpy.navigate.calls.mostRecent().args[0][0]).toBe(
            `library/${mockLibrary1.id}/template/details/phase/${mockPhaseTemplate1.id}`
        );
    });

    it('should delete an phase template', () => {
        component.phaseTemplates = mockPhaseTemplateList1;
        component.onPhaseTemplateDelete(mockPhaseTemplateList1.entities[0].id);
        expect(phaseTemplateServiceStub._deletePhaseTemplateCalls.length).toBe(1);
        expect(phaseTemplateServiceStub._deletePhaseTemplateCalls.pop().phaseTemplateId).toBe(mockPhaseTemplateList1.entities[0].id);
    });

    it('should detect category selection changes', async () => {
        const getSpy = spyOn(component, 'getInitialPhaseTemplates').and.callThrough();
        const categoriesPassed = ['explore', ' test'];
        libraryService.selectCategories(categoriesPassed);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getSpy).toHaveBeenCalledWith(categoriesPassed);
    });

    it('should load the view type', () => {
        expect(component.phaseViewType).toBe(ViewType.CARD_VIEW);
    });

    xit('should verify view type usage consistency', () => {
        component.phaseViewType = ViewType.LIST_VIEW;
        expect(component.isListViewType()).toBeTruthy('List View enum is not consistent with its usage');
        component.phaseViewType = ViewType.CARD_VIEW;
        expect(component.isCardViewType()).toBeTruthy('Card View enum is not consistent with its usage');
    });
});
