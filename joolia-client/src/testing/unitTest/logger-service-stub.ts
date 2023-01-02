import { LoggerService } from '../../app/core/services';

export class LoggerServiceStub implements Partial<LoggerService> {
    public _traceCalls: any[] = [];
    public _errorCalls: any[] = [];

    fatal(a1, a2, a3) {}
    error(a1, a2, a3) {
        this._errorCalls.push({ a1, a2, a3 });
    }

    trace(a1, a2, a3) {
        this._traceCalls.push('');
    }

    debug(message: any, classObj?: Object, method?: Object) {
        this._traceCalls.push({ type: 'debug', message: message, classObj: classObj, method: method });
    }

    _resetStubCalls() {
        this._traceCalls.length = 0;
        this._errorCalls.length = 0;
    }
}
