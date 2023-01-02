import { body, oneOf } from 'express-validator/check';
import { validate } from './SharedValidator';
import { CanvasSlot } from '../models';
import { SlotType } from '../models/CanvasSlotModel';
import { CanvasStatus, CanvasType } from '../models/CanvasModel';
import { DeepPartial } from 'typeorm';

export enum CanvasValidationError {
    ID_INCLUDED = 'The id should not be included in the body',
    NAME_NOT_INCLUDED = 'Please provide a name for the canvas',
    NAME_TOO_LONG = 'Name should not be more than 55 characters',
    NAME_NOT_PROVIDED = 'The name must be provided as a string',
    CANVAS_WRONG_STATUS = 'Canvas Status is invalid',
    CANVAS_NAME_EMPTY = 'The canvas name must not be empty',
    CANVAS_TYPE_NOT_INCLUDED = 'Please provide a type for the canvas',
    SLOTS_NOT_INCLUDED = 'Please provide the slots for the canvas',
    SLOTS_INVALID = 'The provided slots are invalid',
    ROWS_NOT_INCLUDED = 'Please provide the number of rows for the canvas',
    COLUMNS_NOT_INCLUDED = 'Please provide the number of columns for the canvas',
    SLOT_TITLE_NOT_INCLUDED = 'The slot title must be provided as a string',
    SLOT_TITLE_EMPTY = 'The slot title must not be empty',
    SLOT_TITLE_TOO_LONG = 'The slot title must be less than 55 characters',
    CANVAS_NAME_OR_STATUS_PATCH = 'Only name or status can be patched in a canvas',
    ONLY_TITLE_PATCH = 'Only the title can be patched in a slot'
}

export function validateSlot(slot: DeepPartial<CanvasSlot>): boolean {
    let titleValid: boolean;
    const slotTypeValid = slot.slotType && Object.values(SlotType).includes(slot.slotType);

    if (slot.slotType === SlotType.SUBMISSIONS_ONLY) {
        titleValid = slot.title === undefined || slot.title.length === 0;
    } else {
        titleValid = slot.title && slot.title.length <= 55;
    }

    return slotTypeValid && titleValid && !!slot.row && !!slot.column && !!slot.rowSpan && !!slot.columnSpan && !!slot.sortOrder;
}

export const createCanvasSlotValidator = [
    body('*')
        .custom((value, { req }) => validateSlot(req.body))
        .withMessage(CanvasValidationError.SLOTS_INVALID),
    validate
];

export const createCanvasValidator = [
    body('id')
        .not()
        .exists()
        .withMessage(CanvasValidationError.ID_INCLUDED),
    body('name')
        .exists()
        .withMessage(CanvasValidationError.NAME_NOT_INCLUDED)
        .isLength({ max: 55 })
        .withMessage(CanvasValidationError.NAME_TOO_LONG),
    body('rows')
        .exists()
        .withMessage(CanvasValidationError.ROWS_NOT_INCLUDED),
    body('columns')
        .exists()
        .withMessage(CanvasValidationError.COLUMNS_NOT_INCLUDED),
    body('canvasType')
        .exists()
        .withMessage(CanvasValidationError.CANVAS_TYPE_NOT_INCLUDED)
        .isIn(Object.values(CanvasType))
        .withMessage('The canvas type should be one of ' + Object.values(CanvasType)),
    body('slots')
        .exists()
        .withMessage(CanvasValidationError.SLOTS_NOT_INCLUDED)
        .custom((slots) => {
            return slots.length > 0 && slots.every((slot) => validateSlot(slot));
        })
        .withMessage(CanvasValidationError.SLOTS_INVALID),
    validate
];

export const updateCanvasValidator = [
    oneOf([
        body('name')
            .exists()
            .withMessage(CanvasValidationError.NAME_NOT_PROVIDED)
            .isLength({ min: 1 })
            .withMessage(CanvasValidationError.CANVAS_NAME_EMPTY)
            .isLength({ max: 55 })
            .withMessage(CanvasValidationError.NAME_TOO_LONG),
        body('status')
            .isIn(Object.values(CanvasStatus))
            .withMessage(CanvasValidationError.CANVAS_WRONG_STATUS)
    ]),
    body('*')
        .custom((value, { req }) => Object.keys(req.body).length === 1)
        .withMessage(CanvasValidationError.CANVAS_NAME_OR_STATUS_PATCH),
    validate
];
