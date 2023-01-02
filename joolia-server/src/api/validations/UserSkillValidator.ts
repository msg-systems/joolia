import { body } from 'express-validator/check';
import { validate } from './SharedValidator';
import { getConf } from '../../config';

const conf = getConf();

export enum UserSkillValidatorError {
    SKILLS_FIELD_NOT_INCLUDED = 'You must provide a list of skills',
    SKILLS_FIELD_NOT_ARRAY = 'Provided field is not an Array',
    TOO_MANY_SKILLS = 'Maximum number of Skills exceeded'
}

export const addSkillsValidator = [
    body('skillIds')
        .exists()
        .withMessage(UserSkillValidatorError.SKILLS_FIELD_NOT_INCLUDED)
        .isArray()
        .withMessage(UserSkillValidatorError.SKILLS_FIELD_NOT_ARRAY)
        .custom((f) => f.length > 0 && f.length <= conf.maxSkillsPerUser)
        .withMessage(UserSkillValidatorError.TOO_MANY_SKILLS),
    validate
];
