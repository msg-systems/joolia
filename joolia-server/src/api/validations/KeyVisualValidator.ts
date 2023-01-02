import { body } from 'express-validator/check';
import { validate } from './SharedValidator';

// Checks the link provided by the user as key visual
const youtubeRegEx = /^.*(youtu.be\/|embed\/)([^#\&\?]*).*/;

/**
 * Checks the link is a you tube video and can be transformed to embedded
 * @param link
 */
export function isVideoLink(link: string): boolean {
    if (!link) {
        return false;
    }

    const match = link.match(youtubeRegEx);
    return match !== null;
}

export const keyVisualValidation = [
    body('linkUrl')
        .isURL()
        .withMessage('linkUrl should be a valid URL')
        .custom((link) => isVideoLink(link))
        .withMessage('linkUrl should be a valid youtube video link')
        .optional(),
    validate
];
