import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';

export class AbstractService {
    protected readonly serverConnection: string;

    constructor(protected http: HttpClient, protected config: ConfigurationService) {
        this.serverConnection = config.getServerConnection();
    }
}
