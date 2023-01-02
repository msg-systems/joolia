import { Component, Input, OnInit } from '@angular/core';
import { KeyVisual } from '../../../core/models';
import { ConfigurationService } from '../../../core/services';

/**
 * The KeyVisualComponent displays the key visual of an entity (video or image).
 */
@Component({
    selector: 'key-visual',
    templateUrl: './key-visual.component.html',
    styleUrls: ['./key-visual.component.scss']
})
export class KeyVisualComponent implements OnInit {
    @Input() keyVisual: KeyVisual;
    @Input() zoom = false;
    @Input() smallerBorderRadius = false;
    @Input() emptyStateKey: string = undefined;
    @Input() showVideoThumbnail = false;

    constructor() {}

    ngOnInit(): void {
        if (this.keyVisual && this.showVideoThumbnail && this.keyVisual.linkUrl) {
            const match = this.keyVisual.linkUrl.match(ConfigurationService.getConfiguration().configuration.validations.videoURL);
            if (match && match[2]) {
                this.keyVisual.linkUrl = 'https://img.youtube.com/vi/' + match[2] + '/hqdefault.jpg';
            }
        }
    }
}
