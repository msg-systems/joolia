import { body, oneOf, validationResult } from 'express-validator/check';
import { TemplateCategory } from '../models';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logger';

/**
 * Checks outcome of previous validations and send HTTP 422 in case of any failure.
 */
export async function validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        logger.debug('Validation Errors: %o', validationErrors.array());
        res.status(422).json({ errors: validationErrors.array() });
    } else {
        next();
    }
}

export const deleteMembersValidation = [
    oneOf([
        body('emails')
            .isArray()
            .isLength({ min: 1, max: 500 })
            .withMessage('Emails should be a list not exceeding 500 entries'),
        body('role')
            .isString()
            .equals('technical')
            .withMessage('Technical user should be requested')
    ]),
    body('emails.*').normalizeEmail({ gmail_remove_dots: false }), // eslint-disable-line
    validate
];

export const addMembersValidation = [
    oneOf([
        body('emails')
            .isArray()
            .isLength({ min: 1, max: 500 })
            .withMessage('Emails should be a list not exceeding 500 entries'),
        body('role')
            .isString()
            .equals('technical')
            .withMessage('Technical user should be requested')
    ]),
    body('emails.*').normalizeEmail({ gmail_remove_dots: false }), // eslint-disable-line
    body('invitationText')
        .isString()
        .withMessage('Invitation text should be a string')
        .isLength({ max: 1000 })
        .withMessage('Invitation text should not exceed 1000 characters')
        .optional(),
    validate
];

export const sendMailValidation = [
    body('memberIds')
        .isArray()
        .isLength({ min: 1 })
        .withMessage('MemberIds should be a list with at least one Id')
        .optional(),
    body('memberIds.*')
        .isString()
        .withMessage('MemberId should be a string'),
    body('message')
        .isString()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message should be a text with more than 10 characters and less than 1000.'),
    validate
];

export const templatePatchValidation = [
    body('category')
        .exists()
        .withMessage('The category must be included in the body')
        .isIn(Object.values(TemplateCategory))
        .withMessage(`Template category should be one of ${Object.values(TemplateCategory).join(', ')}`),
    body('*')
        .custom((value, { req }) => Object.keys(req.body).length === 1)
        .withMessage('Only category should be included in the body'),
    validate
];
