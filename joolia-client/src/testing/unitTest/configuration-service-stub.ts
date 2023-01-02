import { ConfigurationService } from '../../app/core/services';

export class ConfigurationServiceStub implements Partial<ConfigurationService> {
    getServerConnection(): string {
        return 'https://api.joolia.net';
    }
}
