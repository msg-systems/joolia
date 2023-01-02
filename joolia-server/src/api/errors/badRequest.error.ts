import { AbstractError } from './abstract.error';

export class BadRequestError extends AbstractError {
    public constructor(message) {
        super(message);
        this.message = message;
        this.name = 'BadRequest';
        this.status = 400;
    }
}
