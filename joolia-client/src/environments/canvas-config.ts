import { SlotType } from '../app/core/enum/global/slot-type.enum';
import { Canvas } from '../app/core/models';
import { CanvasType } from '../app/core/enum/global/canvas-type.enum';
import { GridsterConfig, GridType } from 'angular-gridster2';

export interface CanvasImageConfig {
    canvasType: CanvasType;
    src: string;
}

export interface CanvasSlotTypeConfig {
    slotType: SlotType;
    hasTitle: boolean;
    hasSubmission: boolean;
}

export interface CanvasConfig {
    canvases: Partial<Canvas>[];
    canvasSlotType: Array<CanvasSlotTypeConfig>;
    canvasImages: Array<CanvasImageConfig>;
    canvasGridsterConfig: Array<GridsterConfig>;
    canvasSubmissionColorPresents: Array<string>;
}

export const canvasTemplateConfig: CanvasConfig = {
    canvases: [
        {
            name: 'Canvas',
            canvasType: CanvasType.BUSINESS_CANVAS,
            columns: 10,
            rows: 3,
            slots: [
                {
                    title: 'Slot 1',
                    row: 1,
                    column: 1,
                    columnSpan: 2,
                    rowSpan: 2,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 1
                },
                {
                    title: 'Slot 2',
                    row: 1,
                    column: 3,
                    columnSpan: 2,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 2
                },
                {
                    title: 'Slot 3',
                    row: 1,
                    column: 5,
                    columnSpan: 2,
                    rowSpan: 2,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 3
                },
                {
                    title: 'Slot 4',
                    row: 1,
                    column: 7,
                    columnSpan: 2,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 4
                },
                {
                    title: 'Slot 5',
                    row: 1,
                    column: 9,
                    columnSpan: 2,
                    rowSpan: 2,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 5
                },
                {
                    title: 'Slot 6',
                    row: 2,
                    column: 3,
                    columnSpan: 2,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 6
                },
                {
                    title: 'Slot 7',
                    row: 2,
                    column: 7,
                    columnSpan: 2,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 7
                },
                {
                    title: 'Slot 8',
                    row: 3,
                    column: 1,
                    columnSpan: 5,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 8
                },
                {
                    title: 'Slot 9',
                    row: 3,
                    column: 6,
                    columnSpan: 5,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 9
                }
            ]
        },
        {
            name: 'Questionnaire',
            canvasType: CanvasType.QUESTIONNAIRE,
            columns: 2,
            rows: 3,
            slots: [
                {
                    title: 'Question 1',
                    row: 1,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 1
                },
                {
                    title: 'Question 2',
                    row: 2,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 2
                },
                {
                    title: 'Question 3',
                    row: 3,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 3
                },
                {
                    title: 'Question 4',
                    row: 1,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 4
                },
                {
                    title: 'Question 5',
                    row: 2,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 5
                },
                {
                    title: 'Question 6',
                    row: 3,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 6
                }
            ]
        },
        {
            name: 'Journey',
            canvasType: CanvasType.CUSTOMER_JOURNEY,
            columns: 6,
            rows: 8,
            slots: [
                {
                    title: 'Step',
                    row: 1,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 1
                },
                {
                    title: 'Doing',
                    row: 2,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 2
                },
                {
                    title: 'Thinking',
                    row: 3,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 3
                },
                {
                    title: 'Feeling',
                    row: 4,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 4
                },
                {
                    title: 'Touchpoint',
                    row: 5,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 5
                },
                {
                    title: 'Channel',
                    row: 6,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 6
                },
                {
                    title: 'Pain Points',
                    row: 7,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 7
                },
                {
                    title: 'Opportunities',
                    row: 8,
                    column: 1,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 8
                },

                {
                    title: 'Step 1',
                    row: 1,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 9
                },
                {
                    row: 2,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 10
                },
                {
                    row: 3,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 11
                },
                {
                    row: 4,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 12
                },
                {
                    row: 5,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 13
                },
                {
                    row: 6,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 14
                },
                {
                    row: 7,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 15
                },
                {
                    row: 8,
                    column: 2,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 16
                },

                {
                    title: 'Step 2',
                    row: 1,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 17
                },
                {
                    row: 2,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 18
                },
                {
                    row: 3,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 19
                },
                {
                    row: 4,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 20
                },
                {
                    row: 5,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 21
                },
                {
                    row: 6,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 22
                },
                {
                    row: 7,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 23
                },
                {
                    row: 8,
                    column: 3,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 24
                },

                {
                    title: 'Step 3',
                    row: 1,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 25
                },
                {
                    row: 2,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 26
                },
                {
                    row: 3,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 27
                },
                {
                    row: 4,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 28
                },
                {
                    row: 5,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 29
                },
                {
                    row: 6,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 30
                },
                {
                    row: 7,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 31
                },
                {
                    row: 8,
                    column: 4,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 32
                },

                {
                    title: 'Step 4',
                    row: 1,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 33
                },
                {
                    row: 2,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 34
                },
                {
                    row: 3,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 35
                },
                {
                    row: 4,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 36
                },
                {
                    row: 5,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 37
                },
                {
                    row: 6,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 38
                },
                {
                    row: 7,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 39
                },
                {
                    row: 8,
                    column: 5,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 40
                },

                {
                    title: 'Step 5',
                    row: 1,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.TITLE_ONLY,
                    sortOrder: 41
                },
                {
                    row: 2,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 42
                },
                {
                    row: 3,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 43
                },
                {
                    row: 4,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 44
                },
                {
                    row: 5,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 45
                },
                {
                    row: 6,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 46
                },
                {
                    row: 7,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 47
                },
                {
                    row: 8,
                    column: 6,
                    columnSpan: 1,
                    rowSpan: 1,
                    slotType: SlotType.SUBMISSIONS_ONLY,
                    sortOrder: 48
                }
            ]
        },
        {
            name: 'Custom',
            canvasType: CanvasType.CUSTOM_CANVAS,
            columns: 10,
            rows: 10,
            slots: [
                {
                    title: 'Slot 1',
                    row: 1,
                    column: 1,
                    columnSpan: 2,
                    rowSpan: 2,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 1
                },
                {
                    title: 'Slot 2',
                    row: 1,
                    column: 2,
                    columnSpan: 2,
                    rowSpan: 2,
                    slotType: SlotType.TITLE_AND_SUBMISSIONS,
                    sortOrder: 2
                }
            ]
        }
    ],
    canvasSlotType: [
        { slotType: SlotType.SUBMISSIONS_ONLY, hasTitle: false, hasSubmission: true },
        { slotType: SlotType.TITLE_AND_SUBMISSIONS, hasTitle: true, hasSubmission: true },
        { slotType: SlotType.TITLE_ONLY, hasTitle: true, hasSubmission: false }
    ],
    canvasImages: [
        { canvasType: CanvasType.BUSINESS_CANVAS, src: 'business-canvas.png' },
        { canvasType: CanvasType.QUESTIONNAIRE, src: 'questionare-canvas.png' },
        { canvasType: CanvasType.CUSTOMER_JOURNEY, src: 'customer-journey-canvas.png' },
        { canvasType: CanvasType.CUSTOM_CANVAS, src: 'custom-canvas.png' }
    ],
    canvasGridsterConfig: [
        {
            canvasType: CanvasType.CUSTOM_CANVAS,
            config: {
                setGridSize: true,
                gridType: GridType.ScrollVertical,
                draggable: {
                    enabled: true
                },
                resizable: {
                    enabled: true,
                    handles: {
                        s: true,
                        e: true,
                        n: true,
                        w: true,
                        se: true,
                        ne: true,
                        sw: true,
                        nw: true
                    }
                },
                minCols: 10,
                maxCols: 100,
                minRows: 10,
                maxRows: 8,
                pushItems: true
            },
            maxDashboardItems: 25
        }
    ],
    canvasSubmissionColorPresents: [
        'rgba(184, 0, 0, 1)',
        'rgba(219, 62, 0, 1)',
        'rgba(245, 148, 63, 1)',
        'rgba(252, 203, 0, 1)',
        'rgba(53, 203, 82, 1)',
        'rgba(161, 164, 253, 1)',
        'rgba(0, 77, 207, 1)',
        'rgba(0, 0, 0, 1)',
        'rgba(235, 150, 148, 1)',
        'rgba(250, 208, 195, 1)',
        'rgba(255, 219, 187, 1)',
        'rgba(254, 243, 189, 1)',
        'rgba(193, 225, 197, 1)',
        'rgba(227, 222, 255, 1)',
        'rgba(190, 211, 243, 1)',
        'rgba(255, 255, 255, 1)'
    ]
};
