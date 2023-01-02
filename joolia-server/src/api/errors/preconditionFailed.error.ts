import { AbstractError } from './abstract.error';

export class PreconditionFailedError extends AbstractError {
    public constructor(message) {
        super(message);
        this.message = message;
        this.name = 'PreconditionFailedError';
        this.status = 412;
    }
}
