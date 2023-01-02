import { RequestBuilder, ResponseBuilder } from './builder';

/**
 * Hypothetical internal business object.
 */
export class Echo {
    public readonly id: string;
    public readonly field3: Date;
    public constructor(public field1: string, public field2: number) {
        this.id = Math.random()
            .toString(36)
            .substring(4);
        this.field3 = new Date();
    }
}

/**
 * User API Response.
 */
export class EchoResponse {
    public constructor(public id: string, public f1: string, public f2: number) {}
}

export class EchoRequestBuilder extends RequestBuilder<Echo> {
    protected map(o: any): Echo {
        return new Echo(o.field1, o.field2);
    }
}

export class EchoResponseBuilder extends ResponseBuilder<EchoResponse> {
    public readonly responseAttrs: string[] = ['id', 'f1', 'f2'];

    protected map(o: Echo): EchoResponse {
        return new EchoResponse(o.id, o.field1, o.field2);
    }
}
