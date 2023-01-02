import { BreakpointObserver } from '@angular/cdk/layout';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { cloneDeep, orderBy } from 'lodash-es';
import { CanvasServiceStub, getMockData, LoggerServiceStub } from '../../../../../testing/unitTest';
import { CanvasStatus } from '../../../../core/enum/global/canvas-status.enum';
import { SlotType } from '../../../../core/enum/global/slot-type.enum';
import { SubmissionModifySetting } from '../../../../core/enum/global/submission.enum';
import { Canvas, CanvasSubmission, Slot, UpdateEventBody } from '../../../../core/models';
import { CanvasService, ConfigurationService, LoggerService } from '../../../../core/services';

import { CustomCanvasComponent } from './custom-canvas.component';

const snackbarStub = {
    open() {}
};
const canvasServiceStub = new CanvasServiceStub();
const loggerServiceStub = new LoggerServiceStub();

describe('CustomCanvasComponent', () => {
    let component: CustomCanvasComponent;
    let fixture: ComponentFixture<CustomCanvasComponent>;

    const canvas: Canvas = getMockData('canvas.canvas4') as Canvas;
    const canvasSubmissions: CanvasSubmission[] = getMockData('canvasSubmission.list.list1').entities;
    const teamSubmission: CanvasSubmission = getMockData('canvasSubmission.canvasSubmission3') as CanvasSubmission;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomCanvasComponent],
            providers: [
                { provide: MatSnackBar, useValue: snackbarStub },
                { provide: BreakpointObserver },
                { provide: CanvasService, useValue: canvasServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: ConfigurationService }
            ],
            imports: [TranslateModule.forRoot(), MatMenuModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CustomCanvasComponent);
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

    it('ngOnInit should getConfig and sortSlots', () => {
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits;
        const sortedArray = orderBy(canvas.slots, ['sortOrder'], ['asc']);

        component.canvas.slots.sort((s1, s2) => s1.rowSpan - s2.rowSpan);

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
    describe('User Actions', () => {
        describe('Slots', () => {
            it('should fail addSlot for non organizer', () => {
                component.canvasInput.isOrganizer = false;
                expect(fixture.debugElement.query(By.css('#addButton'))).toBeNull();
            });

            it('should fail addSlot if not editable', () => {
                component.canvasInput.isCanvasEditable = false;
                component.canvasInput.isOrganizer = true;
                expect(fixture.debugElement.query(By.css('.add-button'))).toBeNull();
            });

            it('should success addSlot for organizer', () => {
                component['gridsterEditable'] = true;
                component.canvas.status = CanvasStatus.UNPUBLISHED;
                component.canvasInput.isOrganizer = true;
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('.add-button'))).toBeDefined();
            });

            it('should fail moving item', () => {
                component.canvas.status = CanvasStatus.PUBLISHED;
                expect(component.isGridsterEditable()).toBeFalsy();
            });

            it('should success moving item', () => {
                component.canvas.status = CanvasStatus.DRAFT;
                expect(component.isGridsterEditable()).toBeTruthy();
                component.canvas.status = CanvasStatus.UNPUBLISHED;
                expect(component.isGridsterEditable()).toBeTruthy();
            });
        });

        describe('Publish', () => {
            it('should fail publish for non organizer', () => {
                component.canvasInput.isOrganizer = false;
                fixture.detectChanges();
                expect(fixture.nativeElement.querySelector('#changeCustomCanvasStatusButton')).toBeNull();
            });

            it('should success change status for organizer', () => {
                component.canvasInput.isOrganizer = true;
                fixture.detectChanges();
                expect(document.getElementById('changeCustomCanvasStatusButton')).toBeDefined();
            });

            it('should success publish for organizer', () => {
                spyOn(component.editedCanvas, 'emit').and.callThrough();
                component.canvasInput.isOrganizer = true;
                canvas.slots.forEach((slot) => (slot.submissions = []));
                fixture.detectChanges();
                component['publishEnabled'] = true;
                component.changeCanvasStatus();
                expect(component.editedCanvas.emit).toHaveBeenCalled();
            });

            it('should fail publish for organizer', () => {
                component.canvasInput.isOrganizer = true;
                component['publishEnabled'] = false;
                spyOn(component.editedCanvas, 'emit').and.callThrough();
                component.changeCanvasStatus();
                expect(component.editedCanvas.emit).not.toHaveBeenCalled();
            });

            it('should fail publish when submissions exist', () => {
                spyOn(component.editedCanvas, 'emit').and.callThrough();
                component.canvasInput.isOrganizer = true;
                component.canvas.status = CanvasStatus.PUBLISHED;
                component.canvas.slots[0].submissions = [canvasSubmissions[0]];
                component.changeCanvasStatus();
                expect(component.editedCanvas.emit).not.toHaveBeenCalled();
            });
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

        it('onChangeCanvas', () => {
            const canvas = component.canvas;
            canvas.status = CanvasStatus.PUBLISHED;
            canvasServiceStub.canvasChanged.next(canvas);
            expect(component.gridsterEditable).toBeFalsy();
            expect(component.canvasStatusButtonText).toEqual('buttons.canvasStatus.draft');

            canvas.status = CanvasStatus.DRAFT;
            canvasServiceStub.canvasChanged.next(canvas);
            expect(component.gridsterEditable).toBeTruthy();
            expect(component.canvasStatusButtonText).toEqual('buttons.canvasStatus.publish');

            canvas.status = CanvasStatus.UNPUBLISHED;
            canvasServiceStub.canvasChanged.next(canvas);
            expect(component.gridsterEditable).toBeTruthy();
            expect(loggerServiceStub._errorCalls.find((call) => call.a1 === '[CUSTOMCANVAS] Missing Canvas Status')).not.toBeNull();
        });

        describe('change Item', () => {
            it('should init item', () => {
                const slot = cloneDeep(canvas.slots[0]);
                slot.id = undefined;
                const addedSlot = spyOn(component.addedSlot, 'emit').and.callThrough();
                component.addedSlot.subscribe((newSlot) => {
                    expect(newSlot.column).not.toEqual(slot.column);
                });
                component.itemInit({ slot: slot });

                expect(loggerServiceStub._traceCalls).toBeDefined();
                expect(addedSlot).toHaveBeenCalled();
            });

            it('should add item', () => {
                let slotLength = canvas.slots.length;
                component.addItem();

                expect(loggerServiceStub._traceCalls.find((call) => call.message === '[CUSTOMCANVAS] Slot Added')).toBeDefined();
                expect(component.canvas.slots.length).toEqual(slotLength + 1);
            });

            it('should delete item', () => {
                const slot = canvas.slots[0] as Slot;
                const deletedSlot = spyOn(component.deletedSlot, 'emit').and.callThrough();

                component.removeItem({ slot: slot });

                expect(
                    loggerServiceStub._traceCalls.find((call) => call.message === '[CUSTOMCANVAS] Remove Items and Slots')
                ).toBeDefined();
                expect(deletedSlot).toHaveBeenCalled();
            });

            it('should change item', () => {
                const slot = canvas.slots[0] as Slot;
                const editedSlot = spyOn(component.editedSlot, 'emit').and.callThrough();
                component.editedSlot.subscribe((newSlot) => {
                    expect(newSlot.column).not.toEqual(slot.column);
                });
                component.itemChange({ slot: slot });

                expect(loggerServiceStub._traceCalls).toBeDefined();
                expect(editedSlot).toHaveBeenCalled();
            });

            it('should resize item', () => {
                const slot = cloneDeep(canvas.slots[0]);
                const editedSlot = spyOn(component.editedSlot, 'emit').and.callThrough();
                component.editedSlot.subscribe((newSlot) => {
                    expect(newSlot.column).not.toEqual(slot.column);
                });
                component.itemResize({ slot: slot });

                expect(loggerServiceStub._traceCalls).toBeDefined();
                expect(editedSlot).toHaveBeenCalled();
            });

            it('should change status', () => {
                let canvas = component.canvas;
                component.publishEnabled = true;
                canvas.slots.forEach((slot) => (slot.submissions = []));
                const editedCanvas = spyOn(component.editedCanvas, 'emit').and.callThrough();

                canvas.status = CanvasStatus.UNPUBLISHED;
                loggerServiceStub._resetStubCalls();
                component.changeCanvasStatus();
                expect(loggerServiceStub._errorCalls.find((call) => call.a1 === '[CUSTOMCANVAS] Missing Canvas Status')).toBeDefined();
                expect(editedCanvas).toHaveBeenCalled();
                editedCanvas.calls.reset();

                canvas.status = CanvasStatus.PUBLISHED;
                component.changeCanvasStatus();
                expect(editedCanvas).toHaveBeenCalled();
                editedCanvas.calls.reset();

                canvas.status = CanvasStatus.DRAFT;
                component.changeCanvasStatus();
                expect(editedCanvas).toHaveBeenCalled();
                editedCanvas.calls.reset();
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

    it('changedOptions', () => {
        component.canvas.status = CanvasStatus.UNPUBLISHED;
        component['getCanvasConfig']();
        component.options.api = {
            optionsChanged: () => {}
        };
        component.changedOptions();
        expect(component.options.draggable.enabled).toBeTruthy();

        component.canvas.status = CanvasStatus.PUBLISHED;
        component.changedOptions();
        expect(component.options.draggable.enabled).toBeFalsy();
    });

    describe('change slotType', () => {
        let slot;
        let gridsterItem;
        let editedSlot;

        beforeEach(() => {
            slot = canvas.slots[0] as Slot;
            gridsterItem = {
                slot: slot,
                submissionStyle: 'string',
                hasSubmissions: true,
                hasSlotTitle: true,
                x: 0,
                y: 0,
                rows: 0,
                cols: 0
            };
            editedSlot = spyOn(component.editedSlot, 'emit').and.callThrough();
        });

        afterEach(() => {
            editedSlot.calls.reset();
        });

        it('changeSlotType', () => {
            gridsterItem.slot.slotType = SlotType.SUBMISSIONS_ONLY;
            component.editedSlot.subscribe((changedSlot) => {
                expect(changedSlot.updatedFieldValue.slotType).toEqual(SlotType.TITLE_AND_SUBMISSIONS);
            });
            component.changeSlotType(gridsterItem, SlotType.TITLE_AND_SUBMISSIONS);
            expect(editedSlot).toHaveBeenCalled();
        });

        it('changeSlotType', () => {
            gridsterItem.slot.slotType = SlotType.SUBMISSIONS_ONLY;
            component.editedSlot.subscribe((changedSlot) => {
                expect(changedSlot.updatedFieldValue.slotType).toEqual(SlotType.TITLE_ONLY);
            });
            component.changeSlotType(gridsterItem, SlotType.TITLE_ONLY);
            expect(editedSlot).toHaveBeenCalled();
        });

        it('changeSlotType', () => {
            gridsterItem.slot.slotType = SlotType.TITLE_ONLY;
            component.editedSlot.subscribe((changedSlot) => {
                expect(changedSlot.updatedFieldValue.slotType).toEqual(SlotType.SUBMISSIONS_ONLY);
            });
            component.changeSlotType(gridsterItem, SlotType.SUBMISSIONS_ONLY);
            expect(editedSlot).toHaveBeenCalled();
        });
    });
});
