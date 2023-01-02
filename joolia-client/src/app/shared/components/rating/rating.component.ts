import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ConfigurationService } from '../../../core/services';

@Component({
    selector: 'app-rating',
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnChanges {
    @Input() rating: number;
    @Input() averageRating: number;
    @Input() editable = false;
    @Output() ratingUpdated: EventEmitter<number> = new EventEmitter();

    maxRating: number;
    stars: { index: number; icon: string }[] = [];

    constructor() {
        this.maxRating = ConfigurationService.getConfiguration().configuration.ranges.rating.to;
        this.stars = [];
        for (let index = 0; index < this.maxRating; index++) {
            this.stars.push({
                index,
                icon: 'star_border'
            });
        }
    }

    ngOnChanges(): void {
        this.setIcons(this.rating);
    }

    private getIcon(index: number, rating: number) {
        if (index <= rating - 1) {
            return 'star';
        } else if (index < rating && rating < Math.round(rating)) {
            return 'star_half';
        } else {
            return 'star_border';
        }
    }

    onClick(rating: number) {
        if (this.editable) {
            this.ratingUpdated.emit(rating);
        }
    }

    onMouseover(rating: number) {
        if (this.editable) {
            this.setIcons(rating);
        }
    }

    onMouseleave() {
        if (this.editable) {
            this.setIcons(this.rating);
        }
    }

    private setIcons(rating: number) {
        this.stars.forEach((star) => {
            star.icon = this.getIcon(star.index, rating);
        });
    }
}
