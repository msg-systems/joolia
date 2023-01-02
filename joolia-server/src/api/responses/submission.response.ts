import { ResponseBuilder } from './builder';
import { Activity, Submission, Team, TeamSubmission, User, UserRating, UserSubmission } from '../models';

export class SubmissionResponse {
    public static readonly required = [
        'id',
        'name',
        'description',
        'createdBy',
        'submittedBy',
        'createdAt',
        'commentCount',
        'averageRating',
        'fileCount'
    ];
    public static readonly attrs = SubmissionResponse.required.concat('activity');

    public id: string;
    public name: string;
    public description: string;
    public createdBy: User;
    public createdAt: Date;
    public submittedBy: { user?: User; team?: Team };
    public commentCount: number;
    public averageRating: number;
    public fileCount: number;
    public activity?: Activity;

    public constructor(submission: Submission) {
        this.id = submission.id;
        this.name = submission.name;
        this.description = submission.description;
        this.createdBy = submission.createdBy;
        this.createdAt = submission.createdAt;
        this.activity = submission.activity ? submission.activity : undefined;
        this.commentCount = submission.commentCount;
        this.fileCount = submission.fileCount;
        this.averageRating = submission.averageRating > 0 ? UserRating.roundRating(submission.averageRating) : 0;
    }
}

export class SubmissionResponseBuilder extends ResponseBuilder<SubmissionResponse> {
    public readonly responseAttrs: string[] = SubmissionResponse.attrs;

    protected map(submission: Submission): Partial<SubmissionResponse> {
        const response = new SubmissionResponse(submission);
        if (submission instanceof UserSubmission) {
            response.submittedBy = { user: (submission as UserSubmission).user };
        } else {
            response.submittedBy = { team: (submission as TeamSubmission).team };
        }

        return response;
    }
}

export class PostSubmissionResponseBuilder extends SubmissionResponseBuilder {
    public readonly responseAttrs: string[] = SubmissionResponse.required;
}
