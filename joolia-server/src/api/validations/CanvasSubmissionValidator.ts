import { body, oneOf } from 'express-validator/check';
import { validate } from './SharedValidator';

export enum CanvasSubmissionValidationError {
    ID_INCLUDED = 'The id should not be included in the body',
    CONTENT_NOT_INCLUDED = 'Please provide a content for the canvas submission',
    CONTENT_NOT_STRING = 'Content should be a string',
    CONTENT_TOO_LONG = 'Name should not be more than 200 characters',
    SUBMITTER_NOT_UUID = 'The submittedById must be a UUID',
    SUBMITTER_NOT_INCLUDED = 'Please provide the submitter as submittedById',
    COLOR_NOT_MATCHING_PATTERN = 'Color should match rgba(red, green, blue, alpha) pattern',
    COLOR_NOT_STRING = 'Color should be a string',
    CONTENT_OR_COLOR_PATCH = 'Only the content or the color can be patched in a canvas submission',
    VOTE_NO_BODY_EXPECTED = 'Request body should be empty'
}

export const submissionColorRegEx = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*((\d|.)+)\)/;

export const canvasSubmissionPostValidation = [
    body('id')
        .not()
        .exists()
        .withMessage(CanvasSubmissionValidationError.ID_INCLUDED),
    body('content')
        .exists()
        .withMessage(CanvasSubmissionValidationError.CONTENT_NOT_INCLUDED)
        .isString()
        .isLength({ max: 200 })
        .withMessage(CanvasSubmissionValidationError.CONTENT_TOO_LONG),
    body('submittedById')
        .exists()
        .withMessage(CanvasSubmissionValidationError.SUBMITTER_NOT_INCLUDED)
        .isUUID()
        .withMessage(CanvasSubmissionValidationError.SUBMITTER_NOT_UUID),
    body('color')
        .isString()
        .withMessage(CanvasSubmissionValidationError.COLOR_NOT_STRING)
        .matches(submissionColorRegEx)
        .withMessage(CanvasSubmissionValidationError.COLOR_NOT_MATCHING_PATTERN)
        .optional(),
    validate
];

export const canvasSubmissionPatchValidation = [
    oneOf([
        body('content')
            .isString()
            .withMessage(CanvasSubmissionValidationError.CONTENT_NOT_STRING)
            .isLength({ max: 200 })
            .withMessage(CanvasSubmissionValidationError.CONTENT_TOO_LONG),
        body('color')
            .isString()
            .withMessage(CanvasSubmissionValidationError.COLOR_NOT_STRING)
            .matches(submissionColorRegEx)
            .withMessage(CanvasSubmissionValidationError.COLOR_NOT_MATCHING_PATTERN)
    ]),
    body('*')
        .custom((value, { req }) => Object.keys(req.body).length === 1)
        .withMessage(CanvasSubmissionValidationError.CONTENT_OR_COLOR_PATCH),
    validate
];

export const canvasSubmissionVotePostValidation = [
    body('*')
        .not()
        .exists()
        .withMessage(CanvasSubmissionValidationError.VOTE_NO_BODY_EXPECTED),
    validate
];
