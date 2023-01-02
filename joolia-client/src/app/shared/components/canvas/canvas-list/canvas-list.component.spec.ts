import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivityService, ConfigurationService, FormatService, PhaseService } from '../../../../core/services';
import { CanvasListComponent } from './canvas-list.component';
import { ActivityServiceStub, FormatServiceStub, getMockData, PhaseServiceStub } from '../../../../../testing/unitTest';
import { Router } from '@angular/router';

const formatServiceStub = new FormatServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const activityServiceStub = new ActivityServiceStub();
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

const mockFormat = getMockData('format.format1');
const mockPhase = getMockData('phase.phase1');
const mockActivity = getMockData('activity.activity1');
const mockCanvas = getMockData('canvas.canvas1');

describe('CanvasListComponent', () => {
    let component: CanvasListComponent;
    let fixture: ComponentFixture<CanvasListComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: FormatService, useValue: formatServiceStub },
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: ActivityService, useValue: activityServiceStub },
                { provide: Router, useValue: routerSpy }
            ],
            declarations: [CanvasListComponent],
            imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CanvasListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should show delete and navigate actions', () => {
            component.displayActions = true;
            component.editable = true;
            component.ngOnInit();
            expect(component.formatId).toEqual(mockFormat.id);
            expect(component.phaseId).toEqual(mockPhase.id);
            expect(component.activityId).toEqual(mockActivity.id);
            expect(component.actions.length).toEqual(2);
        });

        it('should show navigate action', () => {
            component.displayActions = true;
            component.editable = false;
            component.ngOnInit();
            expect(component.formatId).toEqual(mockFormat.id);
            expect(component.phaseId).toEqual(mockPhase.id);
            expect(component.activityId).toEqual(mockActivity.id);
            expect(component.actions.length).toEqual(1);
        });

        it('should no actions', () => {
            component.displayActions = false;
            component.ngOnInit();
            expect(component.formatId).toBeUndefined();
            expect(component.phaseId).toBeUndefined();
            expect(component.activityId).toBeUndefined();
            expect(component.actions.length).toEqual(0);
        });
    });

    describe('Events', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('onAddCanvas', () => {
            const addSpy = spyOn(component.add, 'emit').and.callThrough();
            component.onAddCanvas();
            expect(addSpy).toHaveBeenCalled();
        });

        it('deleteCanvas', () => {
            const deleteSpy = spyOn(component.delete, 'emit').and.callThrough();
            component.deleteCanvas(mockCanvas);
            expect(deleteSpy).toHaveBeenCalledWith(mockCanvas);
        });

        it('navigateToCanvas', () => {
            const route = `/format/${mockFormat.id}/phase/${mockPhase.id}/activity/${mockActivity.id}/canvas/${mockCanvas.id}`;
            component.navigateToCanvas(mockCanvas);
            expect(routerSpy.navigate.calls.mostRecent().args[0][0]).toBe(route);
        });
    });

    it('getImage', () => {
        expect(
            component.getImage(mockCanvas).endsWith(ConfigurationService.getConfiguration().configuration.canvas.canvasImages[0].src)
        ).toBeTruthy();
    });
});
