import { body } from 'express-validator/check';
import { TemplateCategory } from '../models';
import { validate } from './SharedValidator';

export const phaseTemplatePostValidation = [
    body('phaseId')
        .exists()
        .withMessage('The phaseId should be included in the body')
        .isUUID()
        .withMessage('The phaseId must be of format uuid'),
    body('category')
        .exists()
        .withMessage('The category should be included in the body')
        .isIn(Object.values(TemplateCategory))
        .withMessage('The category should be one of ' + Object.values(TemplateCategory)),
    validate
];
