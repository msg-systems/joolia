import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhaseGridListComponent } from './phase-grid-list.component';
import { DurationUnit } from 'src/app/core/models';
import { PhaseService } from 'src/app/core/services';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MomentPipe, DurationPipe } from '../../pipes';
import { getMockData, PhaseServiceStub } from '../../../../testing/unitTest';

const phaseServiceStub = new PhaseServiceStub();

let mockPhaseSet1;

describe('PhaseGridListComponent', () => {
    let component: PhaseGridListComponent;
    let fixture: ComponentFixture<PhaseGridListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [PhaseGridListComponent, MomentPipe, DurationPipe],
            providers: [{ provide: PhaseService, useValue: phaseServiceStub }],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        mockPhaseSet1 = getMockData('phase.set.set1');

        fixture = TestBed.createComponent(PhaseGridListComponent);
        component = fixture.componentInstance;
        component.headerText = 'Test';
        component.phases = mockPhaseSet1;
        component.editable = true;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Click phase should emit sendClickEvent', () => {
        const emitSpy = spyOn(component.itemClick, 'emit').and.callThrough();

        // do not click html element, as it is a child component and the tests should not rely on child component
        component.onPhaseClick(mockPhaseSet1[0].id);
        fixture.detectChanges();

        expect(emitSpy).toHaveBeenCalledWith(mockPhaseSet1[0].id);
    });

    it('Changing title event should emit sendUpdateEvent', () => {
        const emitSpy = spyOn(component.itemUpdate, 'emit').and.callThrough();
        const values = {
            updatedObjectId: mockPhaseSet1[0].id,
            updatedFieldName: 'name',
            updatedFieldValue: 'new name'
        };
        component.onPhaseUpdate(values.updatedObjectId, values.updatedFieldName, values.updatedFieldValue);
        fixture.detectChanges();

        expect(emitSpy).toHaveBeenCalledWith(values);
    });

    it('Should return date for days and datetime for minutes', () => {
        expect(component.getPhaseDatePickerType(DurationUnit.DAYS)).toEqual('date');
        expect(component.getPhaseDatePickerType(DurationUnit.MINUTES)).toEqual('datetime');
    });
});
