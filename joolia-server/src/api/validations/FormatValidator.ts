import { body } from 'express-validator/check';
import { FormatMemberRoles } from '../models';
import * as sanitizeHtml from 'sanitize-html';
import { getConf } from '../../config';
import { validate } from './SharedValidator';

export const formatPostValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('workspace')
        .exists()
        .withMessage('The workspace id should be included in the body')
        .isUUID()
        .withMessage('Workspace should be an UUID'),
    body('name')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters'),
    body('shortDescription')
        .customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups))
        .custom((value) => sanitizeHtml(value, getConf().noMarkups).length <= 150)
        .withMessage('Short description should not be more than 150 characters'),
    body('shortDescription')
        .custom((value) => !/[\r\n]/.test(value))
        .withMessage('Short description should not contain linebreaks'),
    body('description').customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups)),
    validate
];

export const formatPatchValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    // TODO ask if the workspace can be updated
    body('workspace')
        .isUUID()
        .withMessage('Workspace should be an UUID')
        .optional(),
    body('name')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters'),
    body('shortDescription')
        .customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups))
        .custom((value) => sanitizeHtml(value, getConf().noMarkups).length <= 150)
        .withMessage('Short description should not be more than 150 characters'),
    body('shortDescription')
        .custom((value) => !/[\r\n]/.test(value))
        .withMessage('Short description should not contain linebreaks'),
    body('description').customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups)),
    validate
];

export const checkRoleValidation = [
    body('role')
        .exists()
        .withMessage('Role should be included')
        .isIn(Object.values(FormatMemberRoles))
        .withMessage('Role is not supported'),
    validate
];

export const formatPostTemplateValidation = [
    body('formatTemplateId')
        .exists()
        .withMessage('The formatTemplateId must be included in the body')
        .isUUID()
        .withMessage('The formatTemplateId must be of format uuid'),
    body('workspaceId')
        .exists()
        .withMessage('The workspace id must be included in the body')
        .isUUID()
        .withMessage('The workspace must be of format uuid'),
    validate
];
