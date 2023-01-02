import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerJourneyCanvasComponent } from './customer-journey-canvas.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { getMockData, TranslateServiceStub } from '../../../../../testing/unitTest';
import { Canvas, CanvasSubmission } from '../../../../core/models';
import { SlotType } from '../../../../core/enum/global/slot-type.enum';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SubmissionModifySetting } from '../../../../core/enum/global/submission.enum';

const snackbarStub = {
    open() {}
};

describe('CustomerJourneyCanvasComponent', () => {
    let component: CustomerJourneyCanvasComponent;
    let fixture: ComponentFixture<CustomerJourneyCanvasComponent>;
    const canvas: Canvas = getMockData('canvas.canvas3');
    const canvasSubmissions: CanvasSubmission[] = getMockData('canvasSubmission.list.list1').entities;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomerJourneyCanvasComponent],
            providers: [{ provide: MatSnackBar, useValue: snackbarStub }],
            imports: [TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomerJourneyCanvasComponent);
        component = fixture.componentInstance;
        component.canvas = canvas;
        component.submissions = [];
        component.canvasInput = {
            isCanvasEditable: true,
            isOrganizer: true,
            isSubmissionCreatable: true,
            isSubmissionEditable: true,
            displaySubmitterName: true,
            submissionModifySetting: SubmissionModifySetting.MEMBER
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getSlotHeight', () => {
        it('should return arrow row height', () => {
            const slot = canvas.slots.find((s) => s.row === 1 && s.column === 1);
            expect(component.getSlotHeight(slot)).toMatch(/arrow$/);
        });

        it('should return normal row height', () => {
            const slot = canvas.slots.find((s) => s.row === 2 && s.column === 1);
            expect(component.getSlotHeight(slot)).toEqual('canvas-cell-height-1');
        });
    });

    describe('getSlotStyle', () => {
        it('should return arrow styles', () => {
            const slot = canvas.slots.find((s) => s.row === 1 && s.column === 2);
            expect(component.getSlotStyle(slot)).toEqual('canvas-cell-arrow canvas-cell-no-content');
        });

        it('should return first arrow styles', () => {
            const slot = canvas.slots.find((s) => s.row === 1 && s.column === 1);
            expect(component.getSlotStyle(slot)).toEqual('canvas-cell-arrow canvas-cell-no-content first-arrow');
        });

        it('should return row title styles', () => {
            const slot = canvas.slots.find((s) => s.row === 2 && s.column === 1);
            expect(component.getSlotStyle(slot)).toEqual('canvas-cell-no-content');
        });

        it('should return submission slot styles', () => {
            const slot = canvas.slots.find((s) => s.row === 2 && s.column === 2);
            expect(component.getSlotStyle(slot).trim()).toEqual('canvas-cell-square');
        });
    });

    describe('getArrowSlots', () => {
        it('should return arrow slots', () => {
            const arrowSlots = component.getArrowSlots();
            expect(arrowSlots.length).toEqual(5);
            arrowSlots.forEach((slot) => expect(slot.title).toMatch(/^Step [0-9]$/));
        });
    });

    describe('getRowTitleSlots', () => {
        it('should return row title slots', () => {
            const slots = component.getRowTitleSlots();
            expect(slots.length).toEqual(7);
            slots.forEach((slot) => {
                expect(slot.title).toBeTruthy();
                expect(slot.slotType).toEqual(SlotType.TITLE_ONLY);
            });
        });
    });

    describe('getContentSlot', () => {
        it('should return slot for a given column and row', () => {
            const slot = component.getContentSlot(2, 3);
            expect(slot).toBeTruthy();
            expect(slot.column).toEqual(2);
            expect(slot.row).toEqual(3);
            expect(slot.slotType).toEqual(SlotType.SUBMISSIONS_ONLY);
        });
    });

    describe('onVoteClicked', () => {
        it('should emit vote clicked event', () => {
            const submission = canvasSubmissions[0];
            const editSpy = spyOn(component.toggleLike, 'emit').and.callThrough();
            component.onVoteSubmissionClicked(submission);
            expect(editSpy).toHaveBeenCalledWith(submission);
        });
    });
});
