import { Component } from '@angular/core';
import { ConfigurationService } from '../../services';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    version = ConfigurationService.getConfiguration().configuration.client.version;

    constructor() {}
}
