import { body } from 'express-validator/check';
import * as sanitizeHtml from 'sanitize-html';
import { getConf } from '../../config';
import { validate } from './SharedValidator';

const forbiddenFieldCheck = body(['id', 'commentCount', 'averageRating', 'fileCount'])
    .not()
    .exists()
    .withMessage('Forbidden field found in body');

export const submissionPostValidation = [
    forbiddenFieldCheck,
    body('name')
        .exists()
        .withMessage('The name must be included in the body')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters'),
    body('description')
        .exists()
        .customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups)),
    body('submittedById')
        .exists()
        .withMessage('The submittedById must be included in the body')
        .isUUID()
        .withMessage('submittedById should be an UUID'),
    validate
];

export const submissionPatchValidation = [
    forbiddenFieldCheck,
    body('name')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters')
        .optional(),
    body('description').customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups)),
    body('submittedBy')
        .not()
        .exists()
        .withMessage('The submittedBy must not be included in the body'),
    body('createdBy')
        .not()
        .exists()
        .withMessage('The createdBy must not be included in the body'),
    body('createdAt')
        .not()
        .exists()
        .withMessage('The createdAt must not be included in the body'),
    body('activity')
        .not()
        .exists()
        .withMessage('The activity must not be included in the body'),
    body('files')
        .not()
        .exists()
        .withMessage('The files must not be included in the body'),
    validate
];
