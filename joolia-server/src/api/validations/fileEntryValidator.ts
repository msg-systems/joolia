import { body } from 'express-validator/check';
import { validate } from './SharedValidator';
import * as validFilename from 'valid-filename';

const forbiddenFieldCheck = body(['id', 'fileId', 'versionId', 'contentType', 'size', 'ownerType', 'createdBy', 'updatedAt'])
    .not()
    .exists()
    .withMessage('Forbidden field found in body');

export const createOrUpdateFileValidation = [
    forbiddenFieldCheck,
    body('name')
        .isString()
        .withMessage('Name should be a string')
        .isLength({ min: 1, max: 255 }),
    body('name')
        .custom((name) => validFilename(name))
        .withMessage('Invalid file name'),
    validate
];
