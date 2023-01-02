import { globalConfig } from './global-config';
import { IEnvironment } from './environment.interface';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: IEnvironment = {
    production: true,
    hmr: false,
    stage: 'production',
    appBaseHref: '/6FEB3BD5-566E-4931-ACE2-5AEA4399B110/',
    serverConnection: ['https://api.joolia.net'],
    socketConnection: '/socket.io-client',
    tokenCookieDomain: ['joolia.net'],
    configuration: {
        /*
         * Injection of global configuration
         */
        ...globalConfig,

        /*
         * Overwrite global config
         */
        loggerConfig: {
            level: NgxLoggerLevel.FATAL,
            disableConsoleLogging: true
        },

        mail: true,
        reCaptcha: {
            enabled: true,
            siteKey: '6LcvI68UAAAAAB-0WDEwbRX6ZC0cToQRU0wWwekd',
            fake: false
        },
        microsoftTeamsBaseAuthorizationUrl:
            'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&client_id=29ec089d-e7ae-4c17-93b7-53b25904eb7a&scope=OnlineMeetings.ReadWrite'
    }
};
