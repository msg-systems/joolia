import { ReferenceResolverService } from '../../app/core/services';
import { Format, Workspace } from '../../app/core/models';
import { Observable, of } from 'rxjs';

export class ReferenceResolverServiceStub implements Partial<ReferenceResolverService> {
    public _resolveRefCalls: any[] = [];

    public resolveRef(o: Format | Workspace): Observable<Format | Workspace> {
        this._resolveRefCalls.push(o);
        return new Observable<Format | Workspace>((subscriber) => subscriber.next(o));
    }

    _resetStubCalls() {
        this._resolveRefCalls.length = 0;
    }
}
