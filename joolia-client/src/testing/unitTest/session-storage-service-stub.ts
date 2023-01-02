import { SessionStorageService } from 'ngx-webstorage';

export class SessionStorageServiceStub implements Partial<SessionStorageService> {
    store(key: string, value: any): void {
        return;
    }

    retrieve(key: string): any {
        return null;
    }
}
