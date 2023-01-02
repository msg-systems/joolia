import { body } from 'express-validator/check';
import { WorkspaceMemberRole } from '../models';
import { validate } from './SharedValidator';

const forbiddenFieldCheck = body(['id', 'createdBy'])
    .not()
    .exists()
    .withMessage('Forbidden field found in body');

export const workspaceCreateValidation = [
    forbiddenFieldCheck,
    body('name')
        .isLength({ min: 1 })
        .withMessage('The name is required')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters')
        .optional(),
    body('licensesCount')
        .exists()
        .withMessage('licensesCount is required')
        .isNumeric()
        .withMessage('numberLicenses should be a number'),
    validate
];

export const workspacePatchValidation = [
    forbiddenFieldCheck,
    body('name')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters')
        .optional(),
    body('licensesCount')
        .not()
        .exists()
        .withMessage('numberLicenses should not be updated'),
    body('tenant')
        .isUUID()
        .withMessage('tenant should be an UUID')
        .optional(),
    body('domain')
        .isString()
        .withMessage('domain should be a string')
        .optional(),
    body('consentDate')
        .isISO8601()
        .withMessage('consentDate is not a date')
        .optional(),
    validate
];

export const workspaceUpdateMemberValidation = [
    body('role')
        .exists()
        .withMessage('Role should be included')
        .isIn(Object.values(WorkspaceMemberRole))
        .withMessage('Role should be either participant or admin'),
    validate
];
