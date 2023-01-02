import { AbstractError } from './abstract.error';

export class UnauthorizedError extends AbstractError {
    public constructor(message = 'Unauthorized Access') {
        super(message);
        this.message = message;
        this.name = 'Unauthorized';
        this.status = 401;
    }
}
