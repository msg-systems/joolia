import { NextFunction, Request, Response } from 'express';
import { QueryRunner } from 'typeorm';
import { respond, withErrorHandler, withTransaction } from './utils';
import { MSTeamsService, IMSTeamsMeetingEntity, BBBService, IBBBMeetingUser } from '../services/meeting';
import { Format, LinkEntry, Team, User } from '../models';
import { FormatMemberRepo, FormatRepo, TeamRepository } from '../repositories';
import { LinkType } from '../models/LinkModel';
import { createMeetingLink, isOrganizer } from '../utils/helpers';
import { MeetingAccessResponseBuilder } from '../responses';
import { ForbiddenError, NotFoundError } from '../errors';
import { getFormatId, getTeamId } from '../utils/web';

enum MeetingEntityType {
    FORMAT,
    TEAM
}

export class MeetingController {
    public static async createMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const entity: Format | Team = res.locals.entityType === MeetingEntityType.FORMAT ? res.locals.format : res.locals.team;
                const meeting: IMSTeamsMeetingEntity = {
                    name: entity.name,
                    authorizationCode: req.body.authorizationCode,
                    redirectUri: req.body.redirectUri
                };
                let meetingUrl: string;

                switch (req.body.type) {
                    case LinkType.MSTEAMS:
                        meetingUrl = await MSTeamsService.createMeeting(meeting);
                        break;
                    case LinkType.BBB:
                        const user = req.user as User;
                        const meetingUser: IBBBMeetingUser = {
                            ...user,
                            isModerator: res.locals.canCreateMeeting
                        };
                        meetingUrl = await BBBService.createMeeting(entity, meetingUser);
                        break;
                    default:
                        meetingUrl = await MSTeamsService.createMeeting(meeting);
                        break;
                }

                res.locals.meetingUrl = meetingUrl;
            },
            res,
            next
        );
    }

    public static async saveMeetingUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const entityType: MeetingEntityType = res.locals.entityType;
                const entity: Format | Team = entityType === MeetingEntityType.FORMAT ? res.locals.format : res.locals.team;
                const meetingUrl: string = res.locals.meetingUrl;
                const builder = new MeetingAccessResponseBuilder();

                if (meetingUrl && req.body.type !== LinkType.BBB) {
                    const meetingLinkEntry: LinkEntry = createMeetingLink(meetingUrl);
                    await runner.manager.save(meetingLinkEntry);
                    entity.meetingLink = meetingLinkEntry;

                    if (entityType === MeetingEntityType.FORMAT) {
                        const repo = runner.manager.getCustomRepository(FormatRepo);
                        await repo.saveEntity(entity);
                    } else {
                        const repo = runner.manager.getCustomRepository(TeamRepository);
                        await repo.saveEntity(entity);
                    }

                    respond(
                        res,
                        builder.buildOne({ url: meetingUrl, expirationTime: MeetingController.getExpirationTime(meetingLinkEntry) }),
                        200
                    );
                } else {
                    respond(res, builder.buildOne({ url: meetingUrl, expirationTime: MeetingController.getExpirationTime() }), 200);
                }
            },
            res,
            next
        );
    }

    public static async getMeetingUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const entityType: MeetingEntityType = res.locals.entityType;
                const entity: Format | Team = entityType === MeetingEntityType.FORMAT ? res.locals.format : res.locals.team;
                const builder = new MeetingAccessResponseBuilder();

                if (entity.meetingLink) {
                    const hasExceededExpirationTime: boolean = MeetingController.hasExceededExpirationTime(entity.meetingLink);
                    if (hasExceededExpirationTime) {
                        const meetingLinkId = entity.meetingLink.id;
                        const patchedEntityLink = {
                            meetingLink: null
                        };
                        if (entityType === MeetingEntityType.FORMAT) {
                            const repo = runner.manager.getCustomRepository(FormatRepo);
                            await repo.patchEntity(entity, patchedEntityLink);
                        } else {
                            const repo = runner.manager.getCustomRepository(TeamRepository);
                            await repo.patchEntity(entity, patchedEntityLink);
                        }
                        const repo = runner.manager.getRepository(LinkEntry);
                        await repo.delete(meetingLinkId);
                        respond(res, {}, 204);
                    } else {
                        entity.meetingLink.lastAccessedAt = new Date();
                        await runner.manager.save(entity.meetingLink);
                        respond(
                            res,
                            builder.buildOne({
                                url: entity.meetingLink.linkUrl,
                                expirationTime: MeetingController.getExpirationTime(entity.meetingLink)
                            }),
                            200
                        );
                    }
                } else {
                    respond(res, {}, 204);
                }
            },
            res,
            next
        );
    }

    private static hasExceededExpirationTime(meetingLink: LinkEntry): boolean {
        switch (meetingLink.type) {
            case LinkType.MSTEAMS:
                return MSTeamsService.hasExceededExpirationTime(meetingLink);
            default:
                return false;
        }
    }

    private static getExpirationTime(meetingLink?: LinkEntry): Date {
        if (meetingLink && meetingLink.type === LinkType.MSTEAMS) {
            return MSTeamsService.getExpirationTime(meetingLink);
        } else {
            return new Date();
        }
    }

    public static async getFormat(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as User;
                const formatId = getFormatId(req);
                const repo = runner.manager.getCustomRepository(FormatRepo);
                const format = await repo.getFormatWithMeetingLink(formatId);

                if (!format) {
                    throw new NotFoundError(`Format ${formatId} not found`);
                }

                res.locals.format = format;
                res.locals.entityType = MeetingEntityType.FORMAT;

                const memberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                const userRole = await memberRepo.getRole(format, user.id);

                if (userRole) {
                    res.locals.userRole = userRole;
                    res.locals.canCreateMeeting = isOrganizer(res);
                } else {
                    throw new ForbiddenError();
                }
            },
            res,
            next
        );
    }

    public static async getTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const teamId = getTeamId(req);
                const repo = runner.manager.getCustomRepository(TeamRepository);
                const team = await repo.getTeamWithMeetingLink(teamId);

                if (!team) {
                    throw new NotFoundError(`Team ${teamId} not found.`);
                }

                res.locals.team = team;
                res.locals.entityType = MeetingEntityType.TEAM;
                res.locals.canCreateMeeting = true;
            },
            res,
            next
        );
    }

    public static async deleteMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const entityType: MeetingEntityType = res.locals.entityType;
                const entity: Format | Team = entityType === MeetingEntityType.FORMAT ? res.locals.format : res.locals.team;

                if (entity.meetingLink) {
                    const meetingLinkId = entity.meetingLink.id;
                    const patchedEntityLink = {
                        meetingLink: null
                    };
                    if (entityType === MeetingEntityType.FORMAT) {
                        const repo = runner.manager.getCustomRepository(FormatRepo);
                        await repo.patchEntity(entity, patchedEntityLink);
                    } else {
                        const repo = runner.manager.getCustomRepository(TeamRepository);
                        await repo.patchEntity(entity, patchedEntityLink);
                    }
                    const repo = runner.manager.getRepository(LinkEntry);
                    await repo.delete(meetingLinkId);
                    respond(res, {}, 200);
                } else {
                    const user = req.user as User;
                    const meetingUser: IBBBMeetingUser = {
                        ...user,
                        isModerator: entityType === MeetingEntityType.FORMAT ? isOrganizer(res) : true
                    };
                    const deletedExistingMeeting = await BBBService.deleteMeeting(entity, meetingUser);
                    if (deletedExistingMeeting) {
                        respond(res, {}, 200);
                    } else {
                        respond(res, {}, 404);
                    }
                }
            },
            res,
            next
        );
    }
}
