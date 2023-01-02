import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comment, List } from '../models';
import { ActivityService } from './activity.service';
import { ConfigurationService } from './configuration.service';
import { FormatService } from './format.service';
import { PhaseService } from './phase.service';
import { SubmissionService } from './submission.service';
import { IQueryParams, UtilService } from './util.service';

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private readonly serverConnection: string;

    commentListChanged = new Subject<List<Comment>>();
    private loadedCommentList: List<Comment> = { count: 0, entities: [] };

    constructor(
        private http: HttpClient,
        private config: ConfigurationService,
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private submissionService: SubmissionService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    fetchCommentsOfSubmission(queryParams?: IQueryParams): Observable<List<Comment>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        const format = this.formatService.getCurrentFormat();
        const phase = this.phaseService.getCurrentPhase();
        const activity = this.activityService.getCurrentActivity();
        const submission = this.submissionService.getCurrentSubmission();

        return this.http
            .get<List<Comment>>(
                `${this.serverConnection}/format/${format.id}/phase/${phase.id}/activity/${activity.id}/submission/${submission.id}/` +
                    'comment',
                { params: httpParams }
            )
            .pipe(
                map((commentList: List<Comment>) => {
                    this.loadedCommentList = commentList;

                    this.commentListChanged.next(this.loadedCommentList);

                    return commentList;
                })
            );
    }

    postComment(body: Partial<Comment>): Observable<Comment> {
        const format = this.formatService.getCurrentFormat();
        const phase = this.phaseService.getCurrentPhase();
        const activity = this.activityService.getCurrentActivity();
        const submission = this.submissionService.getCurrentSubmission();

        return this.http
            .post<Comment>(
                `${this.serverConnection}/format/${format.id}/phase/${phase.id}/activity/${activity.id}/submission/${submission.id}/` +
                    'comment',
                body
            )
            .pipe(
                map((comment: Comment) => {
                    this.loadedCommentList.entities.unshift(comment);
                    this.loadedCommentList.count = this.loadedCommentList.entities.length;
                    this.commentListChanged.next(this.loadedCommentList);
                    return comment;
                })
            );
    }

    deleteComment(id: string) {
        const format = this.formatService.getCurrentFormat();
        const phase = this.phaseService.getCurrentPhase();
        const activity = this.activityService.getCurrentActivity();
        const submission = this.submissionService.getCurrentSubmission();

        return this.http
            .delete(
                `${this.serverConnection}/format/${format.id}/phase/${phase.id}/activity/${activity.id}/submission/${submission.id}/` +
                    `comment/${id}`
            )
            .pipe(
                map(() => {
                    if (this.loadedCommentList) {
                        this.loadedCommentList.entities = this.loadedCommentList.entities.filter((post) => post.id !== id);
                        this.loadedCommentList.count = this.loadedCommentList.entities.length;

                        this.commentListChanged.next(this.loadedCommentList);
                    }
                })
            );
    }
}
