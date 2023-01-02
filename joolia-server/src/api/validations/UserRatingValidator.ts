import { body } from 'express-validator/check';
import { validate } from './SharedValidator';

export const userRatingPatchValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('rating')
        .exists()
        .withMessage('The rating must be included in the body')
        .isFloat({ min: 0.5, max: 5 })
        .withMessage('The rating field should be float in range [0.5,5]'),
    body('createdBy')
        .not()
        .exists()
        .withMessage('The createdBy must not be included in the body'),
    body('createdAt')
        .not()
        .exists()
        .withMessage('The createdAt must not be included in the body'),
    body('submission')
        .not()
        .exists()
        .withMessage('The submission must not be included in the body'),
    validate
];
