import { Canvas } from '../models';
import { ResponseBuilder } from './builder';
import { CanvasSlotResponse, CanvasSlotResponseBuilder } from './canvasSlot.response';
import { CanvasStatus, CanvasType } from '../models/CanvasModel';

export class CanvasResponse {
    public static readonly attrs = ['id', 'name', 'columns', 'rows', 'canvasType', 'slots', 'status'];

    public id: string;
    public name: string;
    public rows: number;
    public columns: number;
    public canvasType: CanvasType;
    public slots: Array<Partial<CanvasSlotResponse>>;
    public status: CanvasStatus;

    public constructor(canvas: Canvas) {
        Object.assign(this, canvas);
        const slotResBuilder = new CanvasSlotResponseBuilder();
        this.slots = slotResBuilder.buildMany(canvas.slots);
    }
}

export class CanvasResponseBuilder extends ResponseBuilder<CanvasResponse> {
    public readonly responseAttrs: string[] = CanvasResponse.attrs;

    protected map(canvas: Canvas): Partial<CanvasResponse> {
        return new CanvasResponse(canvas);
    }
}
