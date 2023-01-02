import { body } from 'express-validator/check';
import { SubmissionModifySetting, SubmissionViewSetting } from '../models';
import * as sanitizeHtml from 'sanitize-html';
import { getConf } from '../../config';
import { validate } from './SharedValidator';

const shortDescCheck = body('shortDescription')
    .customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups))
    .custom((value) => sanitizeHtml(value, getConf().noMarkups).length <= 150)
    .withMessage('Short description should not be more than 150 characters')
    .optional();

const descriptionCheck = body('description').customSanitizer((value) => sanitizeHtml(value, getConf().allowedMarkups));

const confSubmissionViewCheck = body('configuration.submissionViewSetting')
    .isIn([SubmissionViewSetting.SUBMITTER, SubmissionViewSetting.MEMBER])
    .withMessage('Submission read setting should be one of ' + SubmissionViewSetting.SUBMITTER + ', ' + SubmissionViewSetting.MEMBER)
    .optional();

const confSubmissionModifyCheck = body('configuration.submissionModifySetting')
    .isIn([SubmissionModifySetting.MEMBER, SubmissionModifySetting.TEAM])
    .withMessage('Submission read setting should be one of ' + SubmissionModifySetting.TEAM + ', ' + SubmissionModifySetting.MEMBER)
    .optional();

export const activityPostValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('position')
        .exists()
        .withMessage('The position must be included in the body')
        .isInt({ min: 0 })
        .withMessage('The position must be a positive integer value'),
    body('name')
        .exists()
        .withMessage('The name must be included in the body')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters'),
    body('duration')
        .exists()
        .withMessage('The duration must be included in the body')
        .isInt({ min: 1 })
        .withMessage('Duration should be a number greater than 1'),
    shortDescCheck,
    descriptionCheck,
    confSubmissionViewCheck,
    confSubmissionModifyCheck,
    validate
];

export const activityPatchValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('position')
        .not()
        .exists()
        .withMessage('The position must not be included in the body'),
    body('name')
        .isLength({ max: 55 })
        .withMessage('Name should not be more than 55 characters')
        .optional(),
    body('duration')
        .isInt({ min: 1 })
        .withMessage('Duration should be a number greater than 1')
        .optional(),
    shortDescCheck,
    descriptionCheck,
    confSubmissionViewCheck,
    confSubmissionModifyCheck,
    body('collaborationLinks.*.linkUrl')
        .exists({ checkNull: false })
        .withMessage('Field linkUrl is required'),
    body('collaborationLinks.*.type')
        .not()
        .exists()
        .withMessage('Collaboration link cannot include type.'),
    body('collaborationLinks.*.createdAt')
        .not()
        .exists()
        .withMessage('Collaboration link cannot include createdAt.'),
    body('collaborationLinks.*.createdBy')
        .not()
        .exists()
        .withMessage('Collaboration link cannot include createdBy.'),
    validate
];

export const activityPatchPositionValidation = [
    body('id')
        .not()
        .exists()
        .withMessage('The id should not be included in the body'),
    body('position')
        .exists()
        .withMessage('Position is required')
        .isInt({ min: 0 })
        .withMessage('Position must be a positive number equal or greater than 0'),
    body('name')
        .not()
        .exists()
        .withMessage('Name must not be included here'),
    body('duration')
        .not()
        .exists()
        .withMessage('Duration must not be included here'),
    body('shortDescription')
        .not()
        .exists()
        .withMessage('Short description must not be included here'),
    body('configuration')
        .not()
        .exists()
        .withMessage('Configuration must not be included here'),
    validate
];

export const activityPostTemplateValidation = [
    body('activityTemplateId')
        .exists()
        .withMessage('The activityTemplateId must be included in the body')
        .isUUID()
        .withMessage('The activityTemplateId must be of format uuid'),
    body('position')
        .exists()
        .withMessage('The position must be included in the body')
        .isInt({ min: 0 })
        .withMessage('The position must be a positive integer value'),
    validate
];
