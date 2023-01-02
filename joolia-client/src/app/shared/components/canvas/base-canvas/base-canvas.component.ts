import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Canvas, CanvasSubmission, OrderObject, Slot, UpdateEventBody } from '../../../../core/models';
import { ConfigurationService, SnackbarService } from '../../../../core/services';
import { SubmissionModifySetting } from '../../../../core/enum/global/submission.enum';
import { CanvasSlotTypeConfig } from '../../../../../environments/canvas-config';
import { SlotType } from '../../../../core/enum/global/slot-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { OrderBy } from 'src/app/core/enum/global/order-by.enum';
import * as moment from 'moment';

export interface ICanvasInput {
    isCanvasEditable: boolean;
    isOrganizer: boolean;
    isSubmissionEditable: boolean;
    isSubmissionCreatable: boolean;
    displaySubmitterName: boolean;
    submissionModifySetting: SubmissionModifySetting;
}

@Component({
    selector: 'base-canvas',
    templateUrl: './base-canvas.component.html',
    styleUrls: ['./base-canvas.component.scss']
})
export class BaseCanvasComponent implements OnInit {
    @Input() canvas: Canvas;
    @Input() canvasInput: ICanvasInput;
    @Input() submissions: Array<CanvasSubmission>;
    @Output() editedCanvas: EventEmitter<UpdateEventBody> = new EventEmitter();
    @Output() editedSlot: EventEmitter<UpdateEventBody> = new EventEmitter();
    @Output() addedSubmission: EventEmitter<Partial<CanvasSubmission>> = new EventEmitter();
    @Output() addedEmptySubmission: EventEmitter<Partial<CanvasSubmission>> = new EventEmitter();
    @Output() editedSubmissionContent: EventEmitter<UpdateEventBody> = new EventEmitter();
    @Output() editedSubmissionColor: EventEmitter<UpdateEventBody> = new EventEmitter();
    @Output() deletedSubmission: EventEmitter<Object> = new EventEmitter();
    @Output() toggleLike: EventEmitter<CanvasSubmission> = new EventEmitter();

    showNewSubmission = {};
    newSubmissionText = {};

    canvasNameMaxLengthValue: number;
    slotTitleMaxLengthValue: number;
    submissionMaxLengthValue: number;

    canvasSlotType: Array<CanvasSlotTypeConfig>;

    orderObjects: OrderObject[] = [];

    self;

    constructor(protected snackbarService: SnackbarService, protected translate: TranslateService) {
        this.canvasSlotType = ConfigurationService.getConfiguration().configuration.canvas.canvasSlotTypes;
        this.self = this;
    }

    ngOnInit() {
        this.getConfig();
        this.sortSlots();
        this.addDefaultSortingToSlots();
        this.ngOnInitEnd();
    }

    private addDefaultSortingToSlots() {
        this.canvas.slots.forEach((slot) => {
            slot.submissionsOrderOptions = this.initOrderOptions();
            slot.submissionsOrderBy = slot.submissionsOrderOptions[0];
        });
    }

    getSubmissionsForSlot(slot: Slot) {
        this.sortSlotSubmissions(slot, slot.submissionsOrderBy.queryParam);
        return slot.submissions;
    }

    onEditCanvasName(text: string) {
        if (this.canvas.name !== text) {
            const updateEventBody: UpdateEventBody = {
                updatedObjectId: this.canvas.id,
                updatedFieldName: 'name',
                updatedFieldValue: text
            };
            this.editedCanvas.emit(updateEventBody);
        }
    }

    onEditSlotTitle(slot: Slot, text: string) {
        if (slot.title !== text) {
            text =
                (slot.slotType === SlotType.TITLE_ONLY && text === '') || (slot.slotType === SlotType.TITLE_AND_SUBMISSIONS && text === '')
                    ? this.translate.instant('labels.untitledSlot')
                    : text;

            const updateEventBody: UpdateEventBody = {
                updatedObjectId: slot.id,
                updatedFieldName: 'title',
                updatedFieldValue: text
            };
            this.editedSlot.emit(updateEventBody);
        }
    }

    onClickAddSubmission(slot: Slot) {
        if (this.canvasInput.isSubmissionCreatable) {
            this.showNewSubmission[slot.id] = true;
            this.newSubmissionText[slot.id] = '';
            this.addedEmptySubmission.emit();
        } else {
            this.snackbarService.openWithMessage('hints.canvas.teamNotSelected');
        }
    }

    onAddSubmission(slot: Slot, text: string) {
        if (this.showNewSubmission[slot.id] && text) {
            this.newSubmissionText[slot.id] = text;
            const submission: Partial<CanvasSubmission> = {
                slotId: slot.id,
                content: this.newSubmissionText[slot.id],
                color: 'rgba(255, 255, 255, 1)',
                voteCount: 0,
                me: { isVotedByMe: false }
            };
            this.showNewSubmission[slot.id] = false;
            this.newSubmissionText[slot.id] = '';
            this.addedSubmission.emit(submission);
        }
    }

    onEditSubmissionContent(submission: CanvasSubmission, text: string) {
        if (text === '') {
            this.onDeleteSubmission(submission.slotId, submission.id);
        } else if (submission.content !== text) {
            const updateEventBody: UpdateEventBody = {
                updatedObjectId: { slotId: submission.slotId, submissionId: submission.id },
                updatedFieldValue: text
            };
            this.editedSubmissionContent.emit(updateEventBody);
        }
    }

    onEditSubmissionColor(submission: CanvasSubmission, color: string) {
        const updateEventBody: UpdateEventBody = {
            updatedObjectId: { slotId: submission.slotId, submissionId: submission.id },
            updatedFieldValue: color
        };
        this.editedSubmissionColor.emit(updateEventBody);
    }

    onVoteSubmissionClicked(submission: CanvasSubmission) {
        this.toggleLike.emit(submission);
    }

    onDeleteSubmission(slotId: string, submissionId: string) {
        this.deletedSubmission.emit({ slotId, submissionId });
    }

    getSlotHeight(slot: Slot): string {
        const height = slot.rowSpan ? slot.rowSpan : 1;
        return `canvas-cell-height-${height}`;
    }

    getSlotGridPosition(slot: Slot) {
        return {
            'grid-row-start': slot.row,
            'grid-row-end': slot.rowSpan ? slot.row + slot.rowSpan : null,
            'grid-column-start': slot.column,
            'grid-column-end': slot.columnSpan ? slot.column + slot.columnSpan : null
        };
    }

    getSlotStyle(slot: Slot): string {
        return 'canvas-cell-square';
    }

    hasSlotTitle(slot: Slot): boolean {
        let hasTitle = false;
        if (slot.slotType) {
            hasTitle = this.canvasSlotType.find((f) => f.slotType === slot.slotType).hasTitle;
        }
        return hasTitle;
    }

    hasSlotSubmissions(slot: Slot): boolean {
        let hasSubmission = false;
        if (slot.slotType) {
            hasSubmission = this.canvasSlotType.find((f) => f.slotType === slot.slotType).hasSubmission;
        }
        return hasSubmission;
    }

    getSubmitter(submission: CanvasSubmission): String {
        let submitterName = '';
        if (this.canvasInput.submissionModifySetting === SubmissionModifySetting.TEAM) {
            submitterName = `${submission.submittedBy.team.name} - ${submission.createdBy.name}`;
        } else if (this.canvasInput.submissionModifySetting === SubmissionModifySetting.MEMBER) {
            submitterName = submission.submittedBy.user.name;
        }
        return submitterName;
    }

    onOrderSlotSubmissions(slot: Slot, key: string) {
        if (key === OrderBy.TIME) {
            if (this.isDescending(slot, key)) {
                slot.submissionsOrderOptions[0].queryParam = OrderBy.TIME_DESC;
                slot.submissionsOrderOptions[0].icon = 'keyboard_arrow_down';
            } else {
                slot.submissionsOrderOptions[0].queryParam = OrderBy.TIME;
                slot.submissionsOrderOptions[0].icon = 'keyboard_arrow_up';
            }
            slot.submissionsOrderBy = slot.submissionsOrderOptions[0];
        } else {
            if (key === OrderBy.NUMBER_OF_VOTES) {
                if (this.isDescending(slot, key)) {
                    slot.submissionsOrderOptions[1].queryParam = OrderBy.NUMBER_OF_VOTES_DESC;
                    slot.submissionsOrderOptions[1].icon = 'keyboard_arrow_down';
                } else {
                    slot.submissionsOrderOptions[1].queryParam = OrderBy.NUMBER_OF_VOTES;
                    slot.submissionsOrderOptions[1].icon = 'keyboard_arrow_up';
                }
                slot.submissionsOrderBy = slot.submissionsOrderOptions[1];
            }
        }
        this.sortSlotSubmissions(slot, slot.submissionsOrderBy.queryParam);
    }

    private isDescending(slot: Slot, key: string) {
        return slot.submissionsOrderBy.queryParam === key;
    }

    private sortSlotSubmissions(slot: Slot, order: string) {
        switch (order) {
            case OrderBy.TIME:
                slot.submissions.sort((a, b) => (moment(a.createdAt).isAfter(b.createdAt) ? 1 : -1));
                break;
            case OrderBy.TIME_DESC:
                slot.submissions.sort((a, b) => (moment(a.createdAt).isBefore(b.createdAt) ? 1 : -1));
                break;
            case OrderBy.NUMBER_OF_VOTES:
                slot.submissions.sort((a, b) => a.voteCount - b.voteCount);
                break;
            case OrderBy.NUMBER_OF_VOTES_DESC:
                slot.submissions.sort((a, b) => b.voteCount - a.voteCount);
        }
    }

    protected ngOnInitEnd() {}

    private getConfig() {
        this.canvasNameMaxLengthValue = ConfigurationService.getConfiguration().configuration.characterLimits.canvas.name;
        this.slotTitleMaxLengthValue = ConfigurationService.getConfiguration().configuration.characterLimits.slot.title;
        this.submissionMaxLengthValue = ConfigurationService.getConfiguration().configuration.characterLimits.canvasSubmission.text;
    }

    private sortSlots() {
        // Sorting of slots needed for correct mobile view
        this.canvas.slots = this.canvas.slots.sort((slot1, slot2) => slot1.sortOrder - slot2.sortOrder);
    }

    public initOrderOptions() {
        return [
            {
                key: OrderBy.TIME,
                queryParam: OrderBy.TIME,
                icon: 'keyboard_arrow_up'
            },
            {
                key: OrderBy.NUMBER_OF_VOTES,
                queryParam: OrderBy.NUMBER_OF_VOTES,
                icon: 'keyboard_arrow_up'
            }
        ];
    }
}
