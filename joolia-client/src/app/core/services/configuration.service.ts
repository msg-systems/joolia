import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';
import { IEnvironment } from '../../../environments/environment.interface';
import { Injectable } from '@angular/core';
import { PermissionsRole } from '../models';

/**
 * The ConfigurationService loads the configuration for the client and can be used anywhere in the client.
 */
@Injectable()
export class ConfigurationService {
    constructor(private logger: LoggerService) {
        this.originUrl = this.getOrigin();
        logger.debug('Configuration of Client:');
        logger.debug(environment);
    }

    private static configuration: IEnvironment;
    private originUrl: string;

    /**
     * Returns a copied version of the configuration object.
     * @returns Copied client configuration
     */
    static getConfiguration(): IEnvironment {
        if (!this.configuration) {
            this.configuration = <IEnvironment>JSON.parse(JSON.stringify(environment));

            // do only use getServerConnection for retrieving this
            this.configuration.serverConnection.length = 0;
            this.configuration.tokenCookieDomain.length = 0;
        }

        return this.configuration;
    }

    static getQueryParams() {
        return ConfigurationService.getConfiguration().configuration.queryParams;
    }

    static getPermissions(): PermissionsRole[] {
        return ConfigurationService.getConfiguration().configuration.permission.permissions;
    }

    static getFilters() {
        return ConfigurationService.getConfiguration().configuration.filters;
    }

    /**
     * Retrieves the serverConnection dependent on the used Distribution (origin)
     * @returns serverConnection
     */
    public getServerConnection(): string {
        const serverConnection = environment.serverConnection.find((u) => u.includes(this.originUrl));
        if (serverConnection) {
            this.logger.trace('ServerConnection retrieved: ' + serverConnection, this, this.getServerConnection);
        } else {
            this.logger.fatal('No valid ServerConnection found', this, this.getServerConnection);
        }

        return serverConnection;
    }

    /**
     * Retrieves the used Distribution (origin)
     * @returns origin
     */
    private getOrigin() {
        // get rid of port
        let origin = location.origin.replace(/:([0-9]+)$/, '');

        // get rid of protocol
        origin = origin.replace(/^https?:\/\//, '');

        // get rid of app.
        origin = origin.replace(/^app\./, '');

        this.logger.debug('Configuration requesting Origin: ' + origin, this, this.getServerConnection);
        return origin;
    }
}
