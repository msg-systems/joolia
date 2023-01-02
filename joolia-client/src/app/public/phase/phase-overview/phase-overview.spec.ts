import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { has } from 'lodash';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormatService, PhaseService, PhaseTemplateService, SnackbarService } from 'src/app/core/services';
import { FormatServiceStub, getMockData, PhaseServiceStub } from '../../../../testing/unitTest';
import { PhaseOverviewComponent } from './phase-overview.component';

const formatServiceStub = new FormatServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const phaseTemplateServiceStub = new PhaseServiceStub();

let mockPhaseList1;

describe('PhaseOverviewComponent', () => {
    let component: PhaseOverviewComponent;
    let fixture: ComponentFixture<PhaseOverviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), InfiniteScrollModule, MatMenuModule],
            declarations: [PhaseOverviewComponent],
            providers: [
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: PhaseTemplateService, useValue: phaseTemplateServiceStub },
                { provide: TranslateService, useValue: {} },
                { provide: SnackbarService, useValue: {} },
                { provide: MatDialog, useValue: {} },
                { provide: Router, useValue: {} }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(PhaseOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockPhaseList1 = getMockData('phase.list.list1');
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('addActionMenu should attach menuActions to phase', async () => {
        component.phaseList = mockPhaseList1;

        component.addActionMenu();

        expect(has(component.phaseList.entities[0], 'menuactions')).toBeTruthy();
        expect(component.phaseList.entities[0]['menuactions'][1].actionKey).toEqual('buttons.hidePhase');

        expect(has(component.phaseList.entities[1], 'menuactions')).toBeTruthy();
        expect(component.phaseList.entities[1]['menuactions'][1].actionKey).toEqual('buttons.showPhase');
    });

    it('toggleVisibility of phase1 should return false', async () => {
        component.phaseList = mockPhaseList1;

        component.toggleVisibility(mockPhaseList1.entities[0].id); // phase 1 visibilitiy is true

        expect(phaseServiceStub.toggledPhase.visible).toEqual(false);
    });
});
