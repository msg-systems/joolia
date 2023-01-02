import { body } from 'express-validator/check';
import { validate } from './SharedValidator';

export const addTeamMemberValidation = [
    body('emails')
        .exists()
        .withMessage('The user email should be included')
        .isArray()
        .withMessage('Emails should be an array'),
    body('emails.*').normalizeEmail({ gmail_remove_dots: false }), // eslint-disable-line
    validate
];

export const createTeamValidation = [
    body('name')
        .exists()
        .withMessage('The team name should be included')
        .isString()
        .withMessage('Name should be a string')
        .isLength({ min: 1 })
        .withMessage('Name should be a string with length > 0'),
    validate
];

export const updateTeamValidation = [
    body('name')
        .exists()
        .withMessage('The team name should be included')
        .isString()
        .withMessage('Name should be a string')
        .isLength({ min: 1 })
        .withMessage('Name should be a string with length > 0'),
    validate
];
