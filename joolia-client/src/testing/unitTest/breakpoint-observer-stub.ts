import { Observable, Subject } from 'rxjs';
import { BreakpointState } from '@angular/cdk/layout';

export class BreakpointObserverStub {
    triggerBreakpoint = new Subject<BreakpointState>();
    observableBreakpoint = new Observable<BreakpointState>((observer) => {
        this.triggerBreakpoint.subscribe((value) => observer.next(value));
    });

    observe(value: string | string[]): Observable<BreakpointState> {
        return this.observableBreakpoint;
    }
}
