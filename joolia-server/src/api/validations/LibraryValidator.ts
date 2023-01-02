import { body } from 'express-validator/check';
import { validate } from './SharedValidator';

// Validation for the body of a /user related request
export const libraryValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('name')
        .isLength({ max: 55 })
        .withMessage('The name should not be longer than 55 characters'),
    validate
];
