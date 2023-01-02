import { AbstractError } from './abstract.error';

export class ForbiddenError extends AbstractError {
    public constructor(message = 'Permission denied.') {
        super(message);
        this.message = message;
        this.name = 'ForbiddenError';
        this.status = 403;
    }
}
