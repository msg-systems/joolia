import { ResponseBuilder } from './builder';
import { CanvasSubmission, Team, TeamCanvasSubmission, User, UserCanvasSubmission } from '../models';
import { DeepPartial } from 'typeorm';

export class CanvasSubmissionResponse {
    public static readonly required = ['id', 'content', 'color', 'slotId', 'createdBy', 'submittedBy', 'voteCount', 'me', 'createdAt'];
    public static readonly attrs = CanvasSubmissionResponse.required;

    private static DEFAULT_COLOR = 'rgba(255, 255, 255, 1)';

    public id: string;
    public content: string;
    public color: string;
    public slotId: string;
    public createdBy: User;
    public submittedBy: { user?: User; team?: Team };
    public voteCount: number;
    public me: { isVotedByMe: boolean };
    public createdAt: Date;

    public constructor(canvasSubmission: CanvasSubmission, user: DeepPartial<User>) {
        this.id = canvasSubmission.id;
        this.content = canvasSubmission.content;
        this.color = canvasSubmission.color ? canvasSubmission.color : CanvasSubmissionResponse.DEFAULT_COLOR;
        this.slotId = canvasSubmission.slot.id;
        this.createdBy = canvasSubmission.createdBy;
        this.voteCount = canvasSubmission.voteCount ? canvasSubmission.voteCount : 0;
        this.me = { isVotedByMe: this.isVotedByUser(canvasSubmission, user) };
        this.createdAt = canvasSubmission.createdAt;
    }

    private isVotedByUser(canvasSubmission: CanvasSubmission, user: DeepPartial<User>) {
        if (canvasSubmission.votes) {
            for (const vote of canvasSubmission.votes) {
                if (vote.createdBy.id === user.id) {
                    return true;
                }
            }
        }
        return false;
    }
}

export class CanvasSubmissionResponseBuilder extends ResponseBuilder<CanvasSubmissionResponse> {
    public readonly responseAttrs: string[] = CanvasSubmissionResponse.attrs;

    protected map(canvasSubmission: CanvasSubmission): Partial<CanvasSubmissionResponse> {
        const response = new CanvasSubmissionResponse(canvasSubmission, this.user);
        if (canvasSubmission instanceof UserCanvasSubmission) {
            response.submittedBy = { user: (canvasSubmission as UserCanvasSubmission).user };
        } else {
            response.submittedBy = { team: (canvasSubmission as TeamCanvasSubmission).team };
        }
        return response;
    }
}
