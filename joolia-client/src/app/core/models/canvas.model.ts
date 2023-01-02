import { CanvasSubmission } from './canvas-submission.model';
import { SlotType } from '../enum/global/slot-type.enum';
import { CanvasType } from '../enum/global/canvas-type.enum';
import { CanvasStatus } from '../enum/global/canvas-status.enum';
import { OrderObject } from '.';

export interface Canvas {
    id: string;
    name: string;
    canvasType: CanvasType;
    columns: number;
    rows: number;
    slots: Slot[];
    status: CanvasStatus;
}

export interface Slot {
    id?: string;
    title?: string;
    row: number;
    column: number;
    columnSpan: number;
    rowSpan: number;
    submissions?: CanvasSubmission[];
    slotType: SlotType;
    sortOrder: number;
    submissionsOrderBy?: OrderObject;
    submissionsOrderOptions?: OrderObject[];
}
