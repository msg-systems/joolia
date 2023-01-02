import { body } from 'express-validator/check';
import { validate } from './SharedValidator';

const forbiddenFields = body(['id', 'position'])
    .not()
    .exists()
    .withMessage('Forbidden field found in body.');

export const stepPostValidation = [
    forbiddenFields,
    body('description')
        .exists()
        .withMessage('The description must be included in the body')
        .isLength({ max: 600 })
        .withMessage('Description should not be more than 600 characters'),
    body('done')
        .isBoolean()
        .withMessage('Done status must be a boolean value')
        .optional(),
    validate
];

export const stepPatchValidation = [
    forbiddenFields,
    body('description')
        .isLength({ max: 600 })
        .withMessage('Description should not be more than 600 characters')
        .optional(),
    body('done')
        .not()
        .exists()
        .withMessage('Done status should not be included'),
    validate
];

export const stepCheckPostValidation = [
    body('done')
        .exists()
        .withMessage('The field done must be included in the body')
        .isBoolean()
        .withMessage('The field done must be a boolean'),
    body('checkedById')
        .exists()
        .withMessage('The field checkedById must be included in the body')
        .isUUID()
        .withMessage('checkedById must be an uuid'),
    validate
];
