import { IEnvironment } from './environment.interface';
import { globalConfig } from './global-config';
// @ts-ignore
import * as testEnvironmentConfig from './test/test-environment-generated.json';

export const environment: IEnvironment = {
    production: true,
    hmr: false,
    stage: 'test',
    appBaseHref: testEnvironmentConfig.stack.appBaseHref || '/',
    serverConnection: [testEnvironmentConfig.stack.serverConnection] || ['http://localhost:3000'],
    socketConnection: '/socket.io-client',
    tokenCookieDomain: ['joolia.ninja'],
    configuration: {
        /*
         * Injection of global configuration
         */
        ...globalConfig,

        /*
         * Overwrite global config
         */
        mail: false,
        reCaptcha: {
            enabled: false,
            fake: true
        },
        microsoftTeamsBaseAuthorizationUrl:
            'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&client_id=29ec089d-e7ae-4c17-93b7-53b25904eb7a&scope=OnlineMeetings.ReadWrite'
    }
};
