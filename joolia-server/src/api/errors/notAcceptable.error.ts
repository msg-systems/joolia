import { AbstractError } from './abstract.error';

export class NotAcceptableError extends AbstractError {
    public constructor(message) {
        super(message);
        this.message = message;
        this.name = 'NotAcceptableError';
        this.status = 406;
    }
}
