import { CanvasSlot } from '../models';
import { ResponseBuilder } from './builder';
import { SlotType } from '../models/CanvasSlotModel';

export class CanvasSlotResponse {
    public static readonly attrs = ['id', 'title', 'row', 'column', 'rowSpan', 'columnSpan', 'slotType', 'sortOrder'];

    public id: string;
    public title: string;
    public row: number;
    public column: number;
    public rowSpan: number;
    public columnSpan: number;
    public sortOrder: number;
    public slotType: SlotType;

    public constructor(slot: CanvasSlot) {
        Object.assign(this, slot);
    }
}

export class CanvasSlotResponseBuilder extends ResponseBuilder<CanvasSlotResponse> {
    public readonly responseAttrs: string[] = CanvasSlotResponse.attrs;

    protected map(slot: CanvasSlot): Partial<CanvasSlotResponse> {
        return new CanvasSlotResponse(slot);
    }
}
