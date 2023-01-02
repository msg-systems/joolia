import { CookieService } from 'ngx-cookie-service';

export class CookieServiceStub implements Partial<CookieService> {
    getReturnValues: { [key: string]: string } = {};

    constructor(getReturnValues: { [key: string]: string }) {
        this.getReturnValues = getReturnValues;
    }

    get(key: string): string {
        return this.getReturnValues[key];
    }
}
