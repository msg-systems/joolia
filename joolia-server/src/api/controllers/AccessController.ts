import { NextFunction, Request, Response } from 'express';
import { withErrorHandler, withTransaction } from './utils';
import { BadRequestError, ForbiddenError, ValidationError } from '../errors';
import {
    Activity,
    ActivityCanvas,
    ActivityConfiguration,
    CanvasSlot,
    Format,
    Submission,
    SubmissionModifySetting,
    SubmissionViewSetting,
    Team,
    TeamSubmission,
    User,
    UserComment,
    Workspace
} from '../models';
import { isCreator, isFormatMember, isMember, isOrganizer, isTechnicalUser } from '../utils/helpers';
import { ActivityCanvasRepo, ActivityRepo, FormatMemberRepo, TeamRepository, WorkspaceMemberRepo } from '../repositories';
import { CanvasStatus, CanvasType } from '../models/CanvasModel';
import { CanvasValidationError, validateSlot } from '../validations';
import { logger } from '../../logger';

/**
 * Concentrates business logic rules for CRUD operation
 * Improvement: Is  better split like TeamPermissionController, CommentPermissionController .. etc?
 */
export class AccessController {
    public static async checkTeamAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                const team = res.locals.team as Team;
                const format = res.locals.format as Format;
                const user = req.user as User;

                if (!user || !team || !format) {
                    throw new Error('Unexpected :/');
                }

                const allowed = isMember(user, team) || isCreator(user, team) || isOrganizer(res) || isTechnicalUser(res);

                if (!allowed) {
                    throw new ForbiddenError(`User is not a Team ${team.id} member nor a Format ${format.id} Organizer`);
                }
            },
            res,
            next
        );
    }

    public static async checkTeamUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                const team = res.locals.team as Team;
                const user = req.user as User;

                if (!user || !team) {
                    throw new Error('Unexpected :/');
                }

                if (!isCreator(user, team) && !isOrganizer(res) && !isTechnicalUser(res)) {
                    throw new ForbiddenError('User is not the Creator of Team or Organizer of the Format');
                }
            },
            res,
            next
        );
    }

    public static async checkCanvasStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const canvas = res.locals.canvas as ActivityCanvas;

                if (canvas.status !== CanvasStatus.PUBLISHED) {
                    throw new BadRequestError('Canvas is not published');
                }
            },
            res,
            next
        );
    }

    public static async checkSubmissionCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const user = req.user as User;
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;
                const submittedById = req.body.submittedById;

                let allowed = false;

                if (isFormatMember(res)) {
                    if (activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM) {
                        const submittingTeam = await runner.manager.getCustomRepository(TeamRepository).getEntity(submittedById);
                        if (!submittingTeam || submittingTeam.format.id !== format.id) {
                            throw new BadRequestError('Submitting Team not found');
                        }

                        allowed = isMember(user, submittingTeam) || isOrganizer(res);
                    } else if (activityCfg.submissionModifySetting === SubmissionModifySetting.MEMBER) {
                        const submittingUser = await runner.manager.getRepository(User).findOne(submittedById);
                        if (!submittingUser) {
                            throw new BadRequestError('Submitting user not found');
                        }
                        if (!isOrganizer(res) && user.id !== submittingUser.id) {
                            throw new ForbiddenError('The member of the format can not post as another member');
                        }

                        const memberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                        allowed = await memberRepo.isMember(format, submittingUser.id);
                    } else {
                        throw new Error('Unexpected activity configuration');
                    }
                }

                if (!allowed) {
                    throw new ForbiddenError('User is not allowed to create submissions');
                }
            },
            res,
            next
        );
    }

    public static async checkSubmissionView(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const submission = res.locals.submission;
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;

                let allowed = false;

                if (isOrganizer(res) || isTechnicalUser(res)) {
                    allowed = true;
                } else if (activityCfg.submissionViewSetting === SubmissionViewSetting.MEMBER) {
                    allowed = isFormatMember(res);
                } else if (activityCfg.submissionViewSetting === SubmissionViewSetting.SUBMITTER) {
                    if (submission instanceof TeamSubmission) {
                        const team = await runner.manager.getCustomRepository(TeamRepository).getEntity(submission.team.id);
                        allowed = isMember(user, team);
                    } else {
                        // Is a UserSubmission
                        allowed = isCreator(user, submission);
                    }
                } else {
                    throw new Error('Unexpected activity configuration');
                }

                if (!allowed) {
                    throw new ForbiddenError('User is not allowed to view this submission');
                }
            },
            res,
            next
        );
    }

    public static async checkSubmissionUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const submission = res.locals.submission;
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;

                let allowed = false;

                if (isOrganizer(res)) {
                    allowed = true;
                } else if (activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM) {
                    const team = await runner.manager.getCustomRepository(TeamRepository).getEntity(submission.team.id);
                    allowed = isMember(user, team);
                } else if (activityCfg.submissionModifySetting === SubmissionModifySetting.MEMBER) {
                    allowed = isCreator(user, submission);
                } else {
                    throw new Error('Unexpected activity configuration');
                }

                if (!allowed) {
                    throw new ForbiddenError('User is not allowed to update this submission');
                }
            },
            res,
            next
        );
    }

    public static async checkSubmissionAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const user = req.user as User;

                if (!res.locals.userRole) {
                    const repo = runner.manager.getCustomRepository(FormatMemberRepo);
                    const role = await repo.getRole(format, user.id);
                    res.locals.userRole = role;
                }

                const hasAccess = isOrganizer(res) || isTechnicalUser(res);

                if (!hasAccess) {
                    throw new ForbiddenError(`User ${user.id} is not an organizer or a technical user`);
                }
            },
            res,
            next
        );
    }

    public static async checkCommentUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const user = req.user as User;
                const comment = res.locals.comment as UserComment;

                const allowed = isCreator(user, comment);

                if (!allowed) {
                    throw new ForbiddenError('User is not allowed to update this Comment');
                }
            },
            res,
            next
        );
    }

    public static async checkCommentDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const user = req.user as User;
                const comment = res.locals.comment as UserComment;

                const allowed = isCreator(user, comment) || isOrganizer(res);

                if (!allowed) {
                    throw new ForbiddenError('User is not allowed to delete this Comment');
                }
            },
            res,
            next
        );
    }

    public static async checkCommentAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const submission = res.locals.submission as Submission;
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;

                let allowed = false;

                if (isOrganizer(res)) {
                    allowed = true;
                } else {
                    if (activityCfg.submissionViewSetting === SubmissionViewSetting.MEMBER) {
                        allowed = isFormatMember(res);
                    } else if (activityCfg.submissionViewSetting === SubmissionViewSetting.SUBMITTER) {
                        if (submission instanceof TeamSubmission) {
                            const team = await runner.manager.getCustomRepository(TeamRepository).getEntity(submission.team.id);
                            allowed = isMember(user, team);
                        } else {
                            // It is a UserSubmission
                            allowed = isCreator(user, submission);
                        }
                    }
                }

                if (!allowed) {
                    throw new ForbiddenError('User is not allowed to access this Comment');
                }
            },
            res,
            next
        );
    }

    public static async checkStepCheckUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;
                const checkedById = req.body.checkedById; // Can be a user id or a team id

                let allowed: boolean;

                if (isOrganizer(res)) {
                    allowed = true;
                } else {
                    if (activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM) {
                        const team = await runner.manager.getCustomRepository(TeamRepository).getEntity(checkedById);
                        allowed = isMember(user, team);
                    } else {
                        allowed = isFormatMember(res);
                    }
                }

                if (!allowed) {
                    throw new ForbiddenError('User is not allowed to check this Step');
                }
            },
            res,
            next
        );
    }

    public static async checkActivityUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const activity = res.locals.activity as Activity;

                const repo: ActivityCanvasRepo = runner.manager.getCustomRepository(ActivityCanvasRepo);
                const hasCanvasSubmission = await repo.hasCanvasSubmissions(activity);

                const activityWithSubmissions = await runner.manager
                    .getCustomRepository(ActivityRepo)
                    .getEntityWithSubmissions(req.params.activityId);
                const activityWithSteps = await runner.manager.getCustomRepository(ActivityRepo).getEntityWithSteps(req.params.activityId);
                activity.submissions = activityWithSubmissions.submissions;
                activity.steps = activityWithSteps.steps;
                res.locals.activity = activity;

                if (!isOrganizer(res)) {
                    throw new ForbiddenError();
                } else {
                    /**
                     * Read as "Try to change configuration in a running Activity?
                     * TODO: JOOLIA-2190 - Use a view instead and has(Progress|Submission) can be removed.
                     */
                    if (req.body.configuration && (activity.hasProgress() || hasCanvasSubmission)) {
                        throw new BadRequestError('Cannot update configuration of an Activity in progress.');
                    }
                }
            },
            res,
            next
        );
    }

    public static async checkActivityDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                if (!isOrganizer(res)) {
                    throw new ForbiddenError();
                }
            },
            res,
            next
        );
    }

    public static async checkActivityCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                if (!isOrganizer(res)) {
                    throw new ForbiddenError();
                }
            },
            res,
            next
        );
    }

    public static async checkCanvasSlotUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async () => {
                const canvas = res.locals.canvas as ActivityCanvas;
                const canvasSlot = res.locals.slot as CanvasSlot;

                if (!isOrganizer(res)) {
                    throw new BadRequestError('Canvas in Status DRAFT can be modified only by Organizers');
                }

                if (canvas.canvasType !== CanvasType.CUSTOM_CANVAS) {
                    if (Object.keys(req.body).length > 1) {
                        throw new ValidationError(CanvasValidationError.ONLY_TITLE_PATCH);
                    }
                    if (!('title' in req.body)) {
                        throw new ValidationError(CanvasValidationError.SLOT_TITLE_NOT_INCLUDED);
                    } else {
                        if (req.body.title.length <= 1) {
                            throw new ValidationError(CanvasValidationError.SLOT_TITLE_EMPTY);
                        } else if (req.body.title.length > 55) {
                            throw new ValidationError(CanvasValidationError.SLOT_TITLE_TOO_LONG);
                        }
                    }
                } else {
                    if (canvas.status !== CanvasStatus.DRAFT) {
                        throw new BadRequestError('Custom canvas can only be modified in Status DRAFT');
                    }

                    const modifiedSlot = Object.assign({}, canvasSlot, req.body);
                    if (!validateSlot(modifiedSlot)) {
                        logger.debug('Slot: %s', modifiedSlot);
                        throw new ValidationError(CanvasValidationError.SLOTS_INVALID);
                    }
                }
            },
            res,
            next
        );
    }

    public static async checkCanvasUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                if (!isOrganizer(res)) {
                    throw new ForbiddenError();
                }

                const newStatus = req.body.status;
                const canvas = res.locals.canvas as ActivityCanvas;

                if (canvas.status === CanvasStatus.PUBLISHED && newStatus === CanvasStatus.DRAFT) {
                    const repo: ActivityCanvasRepo = runner.manager.getCustomRepository(ActivityCanvasRepo);
                    const hasSubmissions = await repo.hasSubmissions(canvas.id);

                    if (hasSubmissions) {
                        throw new BadRequestError('Canvas cannot be modified after is published.');
                    }
                }
            },
            res,
            next
        );
    }

    public static async isFormatOrganizer(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const user = req.user as User;

                if (!user || !format) {
                    throw new Error('Unexpected :/');
                }

                let organizer: boolean;

                if (res.locals.userRole) {
                    organizer = isOrganizer(res);
                } else {
                    const repo = runner.manager.getCustomRepository(FormatMemberRepo);
                    organizer = await repo.isOrganizer(format, user.id);
                }

                if (!organizer) {
                    throw new ForbiddenError(`User ${user.id} is not an Organizer`);
                }
            },
            res,
            next
        );
    }

    public static async isFormatMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                const format = res.locals.format as Format;
                const user = req.user as User;

                if (!user || !format) {
                    throw new Error('Unexpected :/');
                }

                if (!isFormatMember(res)) {
                    throw new ForbiddenError('User is not a member in this Format');
                }
            },
            res,
            next
        );
    }

    public static async isTeamMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                const team = res.locals.team as Team;
                const user = req.user as User;

                if (!user || !team) {
                    throw new Error('Unexpected :/');
                }

                if (!isMember(user, team)) {
                    throw new ForbiddenError('User is not a team member');
                }
            },
            res,
            next
        );
    }

    public static async isWorkspaceAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const workspace = res.locals.workspace as Workspace;
                const user = req.user as User;

                if (!user || !workspace) {
                    throw new Error('Unexpected :/');
                }

                const repo: WorkspaceMemberRepo = runner.manager.getCustomRepository(WorkspaceMemberRepo);
                const isWorkspaceAdmin = await repo.isWorkspaceAdmin(workspace, user.id);

                if (!isWorkspaceAdmin) {
                    throw new ForbiddenError('User is not an administrator in this workspace');
                }
            },
            res,
            next
        );
    }

    public static async isSystemAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const user = req.user as User;

                if (!user.admin) {
                    throw new ForbiddenError('User is not system administrator');
                }
            },
            res,
            next
        );
    }

    public static async isSelf(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async (): Promise<void> => {
                if (req.params.userId !== req.user.id) {
                    throw new ForbiddenError();
                }
            },
            res,
            next
        );
    }

    public static async isSelfInBody(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async (): Promise<void> => {
                const user = req.user as User;
                const emails = req.body.emails as string[];

                if (emails) {
                    if (emails.some((e) => user.email === e)) {
                        throw new BadRequestError('User cannot modify himself.');
                    }
                }
            },
            res,
            next
        );
    }
}
