import { Format, User } from '../../models';

export abstract class Message<T> {
    protected constructor(public locale: string, public text: string, public sender: User, public recipient: User) {}

    public abstract getUrlId(): string;
}

export class FormatMessage extends Message<Format> {
    //TODO: Improvement - the Format instance is not really needed
    public constructor(protected format: Format, locale: string, text: string, sender: User, recipient: User) {
        super(locale, text, sender, recipient);
    }

    public getUrlId(): string {
        return this.format.id;
    }
}
