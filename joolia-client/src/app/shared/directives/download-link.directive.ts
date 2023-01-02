import { Directive, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

/**
 * Directive for adding download Links
 * Documentation will follow
 *
 * example for usage places:
 * <a>
 *     <button appDownloadLink>
 * </a>
 */
@Directive({
    selector: '[appDownloadLink]'
})
export class DownloadLinkDirective implements OnChanges {
    @Output() appDownloadLinkgetURL: EventEmitter<void> = new EventEmitter();
    @Input() appDownloadLinkURL: string;
    @Input() appDownloadAttr: string;

    constructor() {}

    @HostListener('click', ['$event']) click(event: any) {
        if (this.appDownloadLinkURL) {
            this.openDownloadTab();
        } else {
            this.appDownloadLinkgetURL.emit();
        }
        event.stopPropagation();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.appDownloadLinkURL) {
            this.openDownloadTab();
        }
    }

    openDownloadTab() {
        window.open(this.appDownloadLinkURL, '_blank');
    }
}
