import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridsterItem } from 'angular-gridster2';
import { assign, cloneDeep, isEqual } from 'lodash-es';
import { CanvasType } from '../../../../core/enum/global/canvas-type.enum';
import { CanvasService, ConfigurationService, LoggerService, SnackbarService } from '../../../../core/services';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';
import { Canvas, CanvasSubmission, Slot, UpdateEventBody } from '../../../../core/models';
import { SlotType } from '../../../../core/enum/global/slot-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { CanvasStatus } from '../../../../core/enum/global/canvas-status.enum';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

export interface CustomCanvasGridsterItem extends GridsterItem {
    slot: Slot;
    submissionStyle: string;
    hasSubmissions: boolean;
    hasSlotTitle: boolean;
}

@Component({
    selector: 'custom-canvas',
    templateUrl: './custom-canvas.component.html',
    styleUrls: ['../base-canvas-template/base-canvas-template.component.scss', './custom-canvas.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CustomCanvasComponent extends BaseCanvasComponent {
    @Output() deletedSlot: EventEmitter<string> = new EventEmitter();
    @Output() addedSlot: EventEmitter<Slot> = new EventEmitter();

    options: GridsterConfig;
    dashboard: CustomCanvasGridsterItem[] = [];
    gridsterEditable = true;
    maxDashboardItems: number;
    addItemEnabled: boolean;
    publishEnabled = true;
    canvasStatusButtonText: string;

    slotType = SlotType;
    public xsScreen = false;

    constructor(
        snackbarService: SnackbarService,
        translate: TranslateService,
        private canvasService: CanvasService,
        private logger: LoggerService,
        private breakpointObserver: BreakpointObserver
    ) {
        super(snackbarService, translate);

        this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((state: BreakpointState) => {
            this.xsScreen = state.matches;
        });
    }

    itemChange(item) {
        const slot = this.mapDashboardItemToCanvasSlot(item);
        if (isEqual(slot, item.slot)) {
            return;
        }

        this.logger.debug(`[CUSTOMCANVAS] ItemChanged`);
        this.logger.debug(item);
        this.triggerSlotEdited(slot);
    }

    itemResize(item) {
        const slot = this.mapDashboardItemToCanvasSlot(item);
        if (isEqual(slot, item.slot)) {
            return;
        }

        this.logger.debug(`[CUSTOMCANVAS] ItemResized`);
        this.logger.debug(item);
        this.triggerSlotEdited(slot);
    }

    itemInit(item) {
        if (item.slot.id) {
            return;
        }

        this.logger.debug(`[CUSTOMCANVAS] ItemInit`);
        this.logger.debug(item);
        const slot = this.mapDashboardItemToCanvasSlot(item);
        this.addedSlot.emit(slot);
    }

    ngOnInitEnd() {
        super.ngOnInitEnd();

        this.getCanvasConfig();

        this.mapCanvasToDashboard();

        this.gridsterEditable = this.isGridsterEditable();
        this.canvasStatusButtonText = this.getCanvasStatusButtonText();

        this.canvasService.canvasChanged.subscribe((canvas: Canvas) => {
            this.canvas = canvas;
            this.gridsterEditable = this.isGridsterEditable();
            this.canvasStatusButtonText = this.getCanvasStatusButtonText();
            this.changedOptions();
        });

        this.addedEmptySubmission.subscribe(() => {
            this.gridsterEditable = false;
            this.changedOptions();
        });

        this.changedOptions();

        this.checkMaxDashboardItemsReached();
    }

    changedOptions() {
        if (!this.options.api) {
            return;
        }

        if (this.isGridsterEditable()) {
            this.logger.debug(`[CUSTOMCANVAS] Gridster Edit Mode: Enable`);
            this.options.draggable = { enabled: true };
            this.options.resizable = { enabled: true };
            this.options.pushItems = true;
            this.options.displayGrid = DisplayGrid.Always;
        } else {
            this.logger.debug(`[CUSTOMCANVAS] Gridster Edit Mode: Disable)`);
            this.options.draggable = { enabled: false };
            this.options.resizable = { enabled: false };
            this.options.pushItems = false;
            this.options.displayGrid = DisplayGrid.None;
        }

        this.logger.debug(`[CUSTOMCANVAS] Gridster Options: Changed`);
        this.options.api.optionsChanged();
    }

    removeItem(item) {
        if (this.dashboard.length === 1) {
            this.snackbarService.openWithMessage('snackbar.deleteLastSlotCustomCanvas');
            return;
        }

        this.logger.debug(`[CUSTOMCANVAS] Remove Items and Slots`);
        this.dashboard = this.dashboard.filter((i) => i.slot.id !== item.slot.id);
        this.checkMaxDashboardItemsReached();
        this.checkPublishEnabled();
        this.deletedSlot.emit(item.slot.id);
    }

    checkMaxDashboardItemsReached(): boolean {
        const reached = this.dashboard.length === this.maxDashboardItems;
        this.addItemEnabled = !reached;
        return reached;
    }

    addItem() {
        if (this.checkMaxDashboardItemsReached()) {
            this.logger.debug(`[CUSTOMCANVAS] Max Items in Dashboard reached`);
            return;
        }

        const initialTitle = this.translate.instant('labels.untitledSlot');
        const newSlot = {
            title: initialTitle,
            row: undefined,
            column: undefined,
            rowSpan: 2,
            columnSpan: 2,
            slotType: SlotType.TITLE_AND_SUBMISSIONS,
            sortOrder: 1,
            submissions: [],
            submissionsOrderOptions: this.initOrderOptions(),
            submissionsOrderBy: this.initOrderOptions()[0]
        };

        this.logger.debug(`[CUSTOMCANVAS] Slot Added`);
        this.canvas.slots.push(newSlot);
        this.mapCanvasToDashboard(newSlot);
    }

    hasCanvasSubmissions(): boolean {
        return !!this.canvas.slots.find((s) => {
            if (s.submissions) {
                return s.submissions.length > 0;
            }
        });
    }

    changeSlotType(item: CustomCanvasGridsterItem, type: string) {
        item.slot.slotType = SlotType[type.toUpperCase()];

        if (item.slot.slotType === SlotType.TITLE_ONLY) {
            item.slot.title = item.slot.title ? item.slot.title : this.translate.instant('labels.untitledSlot');
            item.slot.submissions = [] as Array<CanvasSubmission>;
        } else if (item.slot.slotType === SlotType.SUBMISSIONS_ONLY) {
            item.slot.submissions = item.slot.submissions ? item.slot.submissions : ([] as Array<CanvasSubmission>);
            item.slot.title = '';
        } else if (item.slot.slotType === SlotType.TITLE_AND_SUBMISSIONS) {
            item.slot.submissions = item.slot.submissions ? item.slot.submissions : ([] as Array<CanvasSubmission>);
            item.slot.title = item.slot.title ? item.slot.title : this.translate.instant('labels.untitledSlot');
        }

        item.submissionStyle = this.getSubmissionStyle(item.slot);
        item.hasSubmissions = this.hasSlotSubmissions(item.slot);
        item.hasSlotTitle = this.hasSlotTitle(item.slot);
        this.triggerSlotEdited(item.slot);
    }

    getSubmissionStyle(slot) {
        return this.hasSlotSubmissions(slot) ? 'canvas-cell-content' : 'canvas-cell-blocked-content';
    }

    triggerSlotEdited(slot) {
        if (!slot.id) {
            return;
        }

        const updateEventBody: UpdateEventBody = {
            updatedObjectId: slot.id,
            updatedFieldName: 'slot',
            updatedFieldValue: slot
        };
        this.editedSlot.emit(updateEventBody);
    }

    isGridsterEditable(): boolean {
        return this.canvas.status !== CanvasStatus.PUBLISHED;
    }

    getCanvasStatusButtonText(): string {
        let buttonText;

        switch (this.canvas.status) {
            case CanvasStatus.PUBLISHED:
                buttonText = 'buttons.canvasStatus.draft';
                break;
            case CanvasStatus.DRAFT:
                buttonText = 'buttons.canvasStatus.publish';
                break;
            default:
                this.logger.error('[CUSTOMCANVAS] Missing Canvas Status');
                break;
        }

        return buttonText;
    }

    changeCanvasStatus() {
        if (!this.publishEnabled) {
            this.snackbarService.openWithMessage('snackbar.publishEmptyCustomCanvas');
            return;
        }

        if (this.hasCanvasSubmissions()) {
            this.snackbarService.openWithMessage('snackbar.blockStatusChangeWithSubmissionsCustomCanvas');
            return;
        }

        let newStatus;

        switch (this.canvas.status) {
            case CanvasStatus.PUBLISHED:
                newStatus = CanvasStatus.DRAFT;
                break;
            case CanvasStatus.DRAFT:
                newStatus = CanvasStatus.PUBLISHED;
                break;
            default:
                this.logger.error('[CUSTOMCANVAS] Missing Canvas Status');
                break;
        }

        const updateEventBody: UpdateEventBody = {
            updatedObjectId: this.canvas.id,
            updatedFieldName: 'status',
            updatedFieldValue: newStatus
        };

        this.editedCanvas.emit(updateEventBody);
    }

    customCanvasAvailable() {
        return !(this.canvas.status !== CanvasStatus.PUBLISHED && this.xsScreen);
    }

    private mapDashboardItemToCanvasSlot(item): Slot {
        let slot = {} as Slot;
        slot = cloneDeep(item.slot);
        slot.column = item.x + 1;
        slot.row = item.y + 1;
        slot.rowSpan = item.rows;
        slot.columnSpan = item.cols;
        return slot;
    }

    private mapCanvasToDashboard(newSlot?: Slot) {
        if (this.dashboard.length === 0) {
            this.logger.debug(`[CUSTOMCANVAS] Map Canvas: All`);
            this.canvas.slots.forEach((s) => {
                this.dashboard.push({
                    cols: s.columnSpan,
                    rows: s.rowSpan,
                    y: s.row - 1,
                    x: s.column - 1,
                    slot: s,
                    submissionStyle: this.getSubmissionStyle(s),
                    hasSubmissions: this.hasSlotSubmissions(s),
                    hasSlotTitle: this.hasSlotTitle(s)
                } as CustomCanvasGridsterItem);
            });
        } else {
            this.logger.debug(`[CUSTOMCANVAS] Map Canvas: One`);

            this.dashboard.push({
                cols: newSlot.columnSpan,
                rows: newSlot.rowSpan,
                x: newSlot.column,
                y: newSlot.row,
                slot: newSlot,
                submissionStyle: this.getSubmissionStyle(newSlot),
                hasSubmissions: this.hasSlotSubmissions(newSlot),
                hasSlotTitle: this.hasSlotTitle(newSlot)
            } as CustomCanvasGridsterItem);
        }

        this.checkPublishEnabled();
    }

    private getCanvasConfig() {
        const canvasConfig = ConfigurationService.getConfiguration().configuration.canvas.canvasGridsterConfig.find(
            (conf) => conf.canvasType === CanvasType.CUSTOM_CANVAS
        );

        const optionsCallbacks = {
            itemChangeCallback: this.itemChange.bind(this),
            itemResizeCallback: this.itemResize.bind(this),
            itemInitCallback: this.itemInit.bind(this)
        };

        this.options = assign(canvasConfig.config, optionsCallbacks);
        this.maxDashboardItems = canvasConfig.maxDashboardItems;
        this.logger.debug(`[CUSTOMCANVAS] Gridster Config: ${this.options}`);
    }

    private checkPublishEnabled(): void {
        this.publishEnabled = this.dashboard.length > 0;
    }
}
