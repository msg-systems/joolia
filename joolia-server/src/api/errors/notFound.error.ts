import { AbstractError } from './abstract.error';

export class NotFoundError extends AbstractError {
    public constructor(message) {
        super(message);
        this.message = message;
        this.name = 'NotFoundError';
        this.status = 404;
    }
}
