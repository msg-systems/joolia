import { Component, Input } from '@angular/core';
import { Action, FileMeta, KeyVisual } from '../../../core/models';

/**
 * The MediaComponent displays a key visual. On the lower right corner a menu is shown with specified
 * actions.
 */
@Component({
    selector: 'app-media',
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent {
    @Input() menuActions: Action[] = [];
    @Input() keyVisual: KeyVisual;
    @Input() emptyStateKey = '';
    @Input() smallerBorderRadius = false;

    constructor() {}
}
