import { body } from 'express-validator/check';
import { validate } from './SharedValidator';

const emailRegex = '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$';
const passwordRegex = '^(?=.*[^a-zA-Z]).{8,}$';

const forbiddenFieldCheck = body(['id', 'admin', 'failedLoginAttempts', 'failedLoginTimeout'])
    .not()
    .exists()
    .withMessage('Forbidden field found in body');

// Validation for the body of a /user related request
export const userValidation = [
    forbiddenFieldCheck,
    body('name')
        .isLength({ min: 1 })
        .withMessage('The name is required')
        .isLength({ max: 40 })
        .withMessage('Name should not be more than 40 characters'),
    body('email')
        .isLength({ min: 1 })
        .withMessage('The email required')
        .matches(emailRegex)
        .withMessage('This is not a correct email')
        .normalizeEmail({ gmail_remove_dots: false }), // eslint-disable-line
    body('password')
        .matches(passwordRegex)
        .withMessage('This is not a correct password'),
    body('company')
        .isLength({ max: 100 })
        .withMessage('Company should not be more than 100 characters'),
    validate
];

export const profilePatchValidation = [
    forbiddenFieldCheck,
    body('email')
        .not()
        .exists()
        .withMessage('The email should not be included in the body'),
    body('password')
        .not()
        .exists()
        .withMessage('The password should not be included in the body'),
    body('avatar')
        .not()
        .exists()
        .withMessage('The avatar should not be included in the body'),
    body('name')
        .isLength({ max: 200 })
        .withMessage('Name should not be more than 200 characters')
        .optional(),
    body('company')
        .isLength({ max: 100 })
        .withMessage('Company should not be more than 100 characters')
        .optional(),
    validate
];

export const userEmailValidation = [
    body('email')
        .matches(emailRegex)
        .withMessage('This is not a correct email')
        .normalizeEmail({ gmail_remove_dots: false }), // eslint-disable-line
    validate
];

export const userPasswordValidation = [
    body('password')
        .matches(passwordRegex)
        .withMessage('This is not a correct password'),
    validate
];
