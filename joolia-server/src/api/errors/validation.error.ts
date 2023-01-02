import { AbstractError } from './abstract.error';

export class ValidationError extends AbstractError {
    public constructor(message) {
        super(message);
        this.message = message;
        this.name = 'ValidationError';
        this.status = 422;
    }
}
