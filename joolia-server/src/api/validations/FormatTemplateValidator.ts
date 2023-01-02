import { body } from 'express-validator/check';
import { TemplateCategory } from '../models';
import { validate } from './SharedValidator';

export const formatTemplatePostValidation = [
    body('formatId')
        .exists()
        .withMessage('The formatId should be included in the body')
        .isUUID()
        .withMessage('Wrong formatId type'),
    body('category')
        .exists()
        .withMessage('The category should be included in the body')
        .isIn(Object.values(TemplateCategory))
        .withMessage('The category should be one of ' + Object.values(TemplateCategory)),
    validate
];
