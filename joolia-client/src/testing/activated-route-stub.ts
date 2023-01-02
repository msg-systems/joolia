import { ActivatedRouteSnapshot, convertToParamMap, ParamMap, Params } from '@angular/router';
import { of, ReplaySubject } from 'rxjs';

/**
 * An ActivateRoute test double
 */
export class ActivatedRouteStub {
    private subject = new ReplaySubject<ParamMap>();
    readonly params = this.subject.asObservable();
    readonly queryParams = of();
    snapshot = new ActivatedRouteSnapshot();

    constructor(initialParams?: Params) {
        this.setParams(initialParams);
        this.snapshot.queryParams = this.queryParams;
        if (initialParams) {
            this.snapshot.params = initialParams;
        }
    }

    setParams(params?: Params) {
        this.subject.next(convertToParamMap(params));
    }
}
