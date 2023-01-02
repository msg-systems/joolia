import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Rating } from '../models';
import { ActivityService } from './activity.service';
import { ConfigurationService } from './configuration.service';
import { FormatService } from './format.service';
import { PhaseService } from './phase.service';

@Injectable({
    providedIn: 'root'
})
export class RatingService {
    ratingChanged = new Subject<Rating>();
    private readonly serverConnection: string;
    private loadedRating: Rating;

    constructor(
        private http: HttpClient,
        private config: ConfigurationService,
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    loadRating(submissionId: string): Observable<Rating> {
        const format = this.formatService.getCurrentFormat();
        const phase = this.phaseService.getCurrentPhase();
        const activity = this.activityService.getCurrentActivity();

        return this.http
            .get<Rating>(
                `${this.serverConnection}/format/${format.id}/phase/${phase.id}/activity/${activity.id}/submission/${submissionId}/` +
                    'rating'
            )
            .pipe(
                map((response: Rating) => {
                    this.loadedRating = response;
                    this.ratingChanged.next(this.loadedRating);

                    return response;
                })
            );
    }

    patchRating(submissionId: string, rating: number): Observable<Rating> {
        const format = this.formatService.getCurrentFormat();
        const phase = this.phaseService.getCurrentPhase();
        const activity = this.activityService.getCurrentActivity();
        const body = { rating: rating };
        return this.http
            .patch<Rating>(
                `${this.serverConnection}/format/${format.id}/phase/${phase.id}/activity/${activity.id}/submission/${submissionId}/` +
                    'rating',
                body
            )
            .pipe(
                map((response: Rating) => {
                    this.loadedRating = Object.assign(this.loadedRating, response);
                    this.ratingChanged.next(this.loadedRating);

                    return response;
                })
            );
    }
}
