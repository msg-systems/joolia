import { body } from 'express-validator/check';
import * as sanitizeHtml from 'sanitize-html';
import { getConf } from '../../config';
import { validate } from './SharedValidator';

const forbiddenFieldCheck = body(['id'])
    .not()
    .exists()
    .withMessage('Forbidden field found in body');

const sanitizerCheck = body('comment')
    .exists()
    .customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups));

export const userCommentPostValidation = [
    forbiddenFieldCheck,
    body('comment')
        .isString()
        .isLength({ min: 1 }),
    sanitizerCheck,
    validate
];

export const userCommentPatchValidation = [
    forbiddenFieldCheck,
    body('comment')
        .isString()
        .isLength({ min: 1 }),
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
    sanitizerCheck,
    validate
];
