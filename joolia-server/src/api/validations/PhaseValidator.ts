import { body } from 'express-validator/check';
const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
import { validate } from './SharedValidator';

// validations for a POST request body on a phase
export const phasePostValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('name')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters')
        .optional(),
    body('durationUnit')
        .exists()
        .withMessage('The duration unit must be included.')
        .isIn(['minutes', 'days'])
        .withMessage('The duration unit is compulsory and must be minutes or days'),
    body('startDate')
        .matches(ISO_8601_FULL)
        .withMessage('The start date has to be in UTC format')
        .optional(),
    validate
];

// validations for a PATCH request body on a phase
export const phasePatchValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('name')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters')
        .optional(),
    body('startDate')
        .matches(ISO_8601_FULL)
        .withMessage('The start date has to be in UTC format')
        .optional({ nullable: true }),
    validate
];

export const phaseTemplateValidation = [
    body('phaseTemplateId')
        .exists()
        .withMessage('The phaseTemplateId must be included in the body')
        .isUUID()
        .withMessage('The phaseTemplateId must be of format uuid'),
    validate
];
