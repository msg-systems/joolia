import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { getMockData } from '../../../../../testing/unitTest';
import { Canvas, CanvasSubmission, Slot, UpdateEventBody } from '../../../../core/models';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SubmissionModifySetting } from '../../../../core/enum/global/submission.enum';
import { BaseCanvasComponent } from './base-canvas.component';
import { ConfigurationService } from '../../../../core/services';
import { orderBy } from 'lodash-es';
import { SlotType } from '../../../../core/enum/global/slot-type.enum';

const snackbarStub = {
    open() {}
};

describe('BaseCanvasComponent', () => {
    let component: BaseCanvasComponent;
    let fixture: ComponentFixture<BaseCanvasComponent>;
    const canvas: Canvas = getMockData('canvas.canvas1');
    const canvasSubmissions: CanvasSubmission[] = getMockData('canvasSubmission.list.list1').entities;
    const teamSubmission: CanvasSubmission = getMockData('canvasSubmission.canvasSubmission3');

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BaseCanvasComponent],
            providers: [{ provide: MatSnackBar, useValue: snackbarStub }],
            imports: [TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(BaseCanvasComponent);
        component = fixture.componentInstance;
        component.canvas = canvas;
        component.submissions = canvasSubmissions;
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

    it('ngOnInit should getConfig and sortSlots', () => {
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits;
        const sortedArray = orderBy(canvas.slots, ['sortOrder'], ['asc']);

        component.canvas.slots.sort((s1, s2) => s1.rowSpan - s2.rowSpan);
        component.ngOnInit();

        expect(component.canvasNameMaxLengthValue).toEqual(characterLimits.canvas.name);
        expect(component.slotTitleMaxLengthValue).toEqual(characterLimits.slot.title);
        expect(component.submissionMaxLengthValue).toEqual(characterLimits.canvasSubmission.text);
        expect(component.canvas.slots).toEqual(sortedArray);
    });

    describe('getSubmitter', () => {
        it('should return Team and User Name for Team Submission', () => {
            component.canvasInput.submissionModifySetting = SubmissionModifySetting.TEAM;
            const submitter = component.getSubmitter(teamSubmission);
            expect(submitter).toMatch(new RegExp('^' + teamSubmission.submittedBy.team.name + '.*' + teamSubmission.createdBy.name + '$'));
        });

        it('should return User Name for Member Submission', () => {
            component.canvasInput.submissionModifySetting = SubmissionModifySetting.MEMBER;
            const submitter = component.getSubmitter(canvasSubmissions[0]);
            expect(submitter).toEqual(canvasSubmissions[0].submittedBy.user.name);
        });
    });

    describe('Events', () => {
        describe('onEditCanvasName', () => {
            it('should do nothing', () => {
                const editSpy = spyOn(component.editedCanvas, 'emit').and.callThrough();
                component.onEditCanvasName(component.canvas.name);
                expect(component.editedCanvas.emit).not.toHaveBeenCalled();
            });

            it('should emit update event', () => {
                const updatedText = 'My new Canvas Name';
                const arg: UpdateEventBody = {
                    updatedObjectId: canvas.id,
                    updatedFieldName: 'name',
                    updatedFieldValue: updatedText
                };
                const editSpy = spyOn(component.editedCanvas, 'emit').and.callThrough();
                component.onEditCanvasName(updatedText);
                expect(editSpy).toHaveBeenCalledWith(arg);
            });
        });

        describe('onEditSlotTitle', () => {
            it('should do nothing', () => {
                const editSpy = spyOn(component.editedSlot, 'emit').and.callThrough();
                component.onEditSlotTitle(canvas.slots[0], canvas.slots[0].title);
                expect(editSpy).not.toHaveBeenCalled();
            });

            it('should emit update event', () => {
                const slot = canvas.slots[0];
                const updatedText = 'My new Slot Title';
                const arg: UpdateEventBody = {
                    updatedObjectId: slot.id,
                    updatedFieldName: 'title',
                    updatedFieldValue: updatedText
                };
                const editSpy = spyOn(component.editedSlot, 'emit').and.callThrough();
                component.onEditSlotTitle(slot, updatedText);
                expect(editSpy).toHaveBeenCalledWith(arg);
            });
        });

        describe('onClickAddSubmission', () => {
            it('should open snackbar if add submission not allowed', () => {
                spyOn(snackbarStub, 'open');
                const slot = canvas.slots[0];
                component.canvasInput.isSubmissionCreatable = false;
                component.onClickAddSubmission(slot);
                expect(snackbarStub.open).toHaveBeenCalled();
            });

            it('should show new empty submission for the slot', () => {
                const slot = canvas.slots[0];
                component.canvasInput.isSubmissionCreatable = true;
                component.onClickAddSubmission(slot);
                expect(component.showNewSubmission[slot.id]).toEqual(true);
                expect(component.newSubmissionText[slot.id]).toEqual('');
            });
        });

        describe('onAddSubmission', () => {
            it('should do nothing', () => {
                const slot = canvas.slots[0];
                component.showNewSubmission[slot.id] = true;
                const addedSpy = spyOn(component.addedSubmission, 'emit').and.callThrough();
                component.onAddSubmission(slot, '');
                expect(addedSpy).not.toHaveBeenCalled();
            });

            it('should emit added submission event', () => {
                const slot = canvas.slots[0];
                component.showNewSubmission[slot.id] = true;
                const newSubmissionText = 'this is a new submission';
                const arg: Partial<CanvasSubmission> = {
                    slotId: slot.id,
                    content: newSubmissionText,
                    color: 'rgba(255, 255, 255, 1)',
                    voteCount: 0,
                    me: { isVotedByMe: false }
                };
                const addedSpy = spyOn(component.addedSubmission, 'emit').and.callThrough();
                component.onAddSubmission(slot, newSubmissionText);
                expect(addedSpy).toHaveBeenCalledWith(arg);
            });
        });

        describe('onEditSubmissionContent', () => {
            it('should delete submission if text is deleted', () => {
                const submission = canvasSubmissions[0];
                const editSpy = spyOn(component.editedSubmissionContent, 'emit').and.callThrough();
                const deleteSpy = spyOn(component, 'onDeleteSubmission').and.callThrough();
                component.onEditSubmissionContent(submission, '');
                expect(editSpy).not.toHaveBeenCalled();
                expect(deleteSpy).toHaveBeenCalledWith(submission.slotId, submission.id);
            });

            it('should emit update event', () => {
                const submission = canvasSubmissions[0];
                const updatedText = 'this is an updated submission text';
                const arg: UpdateEventBody = {
                    updatedObjectId: { slotId: submission.slotId, submissionId: submission.id },
                    updatedFieldValue: updatedText
                };
                const editSpy = spyOn(component.editedSubmissionContent, 'emit').and.callThrough();
                component.onEditSubmissionContent(submission, updatedText);
                expect(editSpy).toHaveBeenCalledWith(arg);
            });
        });

        describe('onEditSubmissionColor', () => {
            it('should emit update event', () => {
                const submission = canvasSubmissions[0];
                const updatedColor = 'rgba(100, 255, 50, 0.65)';
                const arg: UpdateEventBody = {
                    updatedObjectId: { slotId: submission.slotId, submissionId: submission.id },
                    updatedFieldValue: updatedColor
                };
                const editSpy = spyOn(component.editedSubmissionColor, 'emit').and.callThrough();
                component.onEditSubmissionColor(submission, updatedColor);
                expect(editSpy).toHaveBeenCalledWith(arg);
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

        it('onDeleteSubmission should emit delete event', () => {
            const submission = canvasSubmissions[0];
            const deleteSpy = spyOn(component.deletedSubmission, 'emit').and.callThrough();
            component.onDeleteSubmission(submission.slotId, submission.id);
            expect(deleteSpy).toHaveBeenCalledWith({ slotId: submission.slotId, submissionId: submission.id });
        });
    });

    it('hasSlotTitle', () => {
        const slot = <Slot>{ slotType: SlotType.TITLE_AND_SUBMISSIONS };
        expect(component.hasSlotTitle(slot)).toEqual(true);
        slot.slotType = SlotType.TITLE_ONLY;
        expect(component.hasSlotTitle(slot)).toEqual(true);
        slot.slotType = SlotType.SUBMISSIONS_ONLY;
        expect(component.hasSlotTitle(slot)).toEqual(false);
    });

    it('hasSlotSubmissions', () => {
        const slot = <Slot>{ slotType: SlotType.TITLE_AND_SUBMISSIONS };
        expect(component.hasSlotSubmissions(slot)).toEqual(true);
        slot.slotType = SlotType.TITLE_ONLY;
        expect(component.hasSlotSubmissions(slot)).toEqual(false);
        slot.slotType = SlotType.SUBMISSIONS_ONLY;
        expect(component.hasSlotSubmissions(slot)).toEqual(true);
    });

    it('getSlotHeight', () => {
        const slot = <Slot>{ rowSpan: null };
        expect(component.getSlotHeight(slot)).toEqual('canvas-cell-height-1');
        slot.rowSpan = 2;
        expect(component.getSlotHeight(slot)).toEqual('canvas-cell-height-2');
    });

    it('getSlotGridPosition', () => {
        const slot = <Slot>{
            row: 2,
            rowSpan: 2,
            column: 3,
            columnSpan: 2
        };
        const position = component.getSlotGridPosition(slot);
        expect(position['grid-row-start']).toEqual(2);
        expect(position['grid-row-end']).toEqual(4);
        expect(position['grid-column-start']).toEqual(3);
        expect(position['grid-column-end']).toEqual(5);
    });
});
