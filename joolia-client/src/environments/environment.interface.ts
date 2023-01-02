import { IConfig } from './global-config.interface';

export interface IEnvironment {
    production: boolean;
    hmr: boolean;
    stage: string;
    appBaseHref: string;
    serverConnection: string[];
    socketConnection: string;
    tokenCookieDomain: string[];
    configuration: IConfig;
}
