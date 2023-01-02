import { AbstractError } from './abstract.error';

export class ConflictError extends AbstractError {
    public constructor(message) {
        super(message);
        this.message = message;
        this.name = 'ConflictError';
        this.status = 409;
    }
}
