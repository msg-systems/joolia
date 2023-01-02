import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { environment } from '../../../environments/environment';
import { ConfigurationService } from './configuration.service';

enum DebugLevel {
    NO_OVERRIDE,
    TRACE,
    DEBUG,
    INFO,
    LOG,
    WARN,
    ERROR,
    FATAL,
    OFF
}

@Injectable()
export class LoggerService {
    overrideDebugLevel: DebugLevel;

    constructor(private logger: NGXLogger) {
        this.logger.updateConfig({
            level: ConfigurationService.getConfiguration().configuration.loggerConfig.level,
            disableConsoleLogging: environment.configuration.loggerConfig.disableConsoleLogging
        });
        this.overrideDebugLevel = DebugLevel.NO_OVERRIDE;
    }

    private doLogging(loggingFunction: Function, message: any, classObj?: Object, method?: Object) {
        const logName = this.getLogName(classObj, method);
        if (this.overrideDebugLevel) {
            loggingFunction = this.getOverriddenLoggingFunction();
        }
        if (logName) {
            loggingFunction(logName, message);
        } else {
            loggingFunction(message);
        }
    }

    trace(message: any, classObj?: Object, method?: Object) {
        this.doLogging(this.logger.trace.bind(this.logger), message, classObj, method);
    }

    debug(message: any, classObj?: Object, method?: Object) {
        this.doLogging(this.logger.debug.bind(this.logger), message, classObj, method);
    }

    info(message: any, classObj?: Object, method?: Object) {
        this.doLogging(this.logger.info.bind(this.logger), message, classObj, method);
    }

    log(message: any, classObj?: Object, method?: Object) {
        this.doLogging(this.logger.log.bind(this.logger), message, classObj, method);
    }

    warn(message: any, classObj?: Object, method?: Object) {
        this.doLogging(this.logger.warn.bind(this.logger), message, classObj, method);
    }

    error(message: any, classObj?: Object, method?: Object) {
        this.doLogging(this.logger.error.bind(this.logger), message, classObj, method);
    }

    fatal(message: String, classObj?: Object, method?: Object) {
        this.doLogging(this.logger.fatal.bind(this.logger), message, classObj, method);
    }

    private getLogName(classObj?: Object, method?: Object) {
        try {
            if (!(classObj && classObj.constructor.name)) {
                return '';
            }
            const methodName = this.getMethodName(classObj, method);
            return classObj.constructor.name + '.' + methodName + ': ';
        } catch (err) {
            this.logger.error(err, this);
            return '';
        }
    }

    private getMethodName(classObj: Object, method: Object) {
        if (!classObj || !method) {
            return '';
        }
        const methodName = Object.getOwnPropertyNames(classObj).find((prop) => classObj[prop] === method);

        if (methodName) {
            return methodName;
        }

        const proto = Object.getPrototypeOf(classObj);
        if (proto) {
            return this.getMethodName(proto, method);
        }
        return '';
    }

    private getOverriddenLoggingFunction(): Function {
        switch (this.overrideDebugLevel) {
            case DebugLevel.TRACE:
                return this.logger.trace.bind(this.logger);
            case DebugLevel.DEBUG:
                return this.logger.debug.bind(this.logger);
            case DebugLevel.INFO:
                return this.logger.info.bind(this.logger);
            case DebugLevel.LOG:
                return this.logger.log.bind(this.logger);
            case DebugLevel.WARN:
                return this.logger.warn.bind(this.logger);
            case DebugLevel.ERROR:
                return this.logger.error.bind(this.logger);
            case DebugLevel.FATAL:
                return this.logger.fatal.bind(this.logger);
            case DebugLevel.OFF:
            default:
                return () => {};
        }
    }
}
