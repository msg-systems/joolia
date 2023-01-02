import { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '../errors';
import { Format, FormatMember, Team, User } from '../models';
import { FormatMemberRepo, TeamRepository } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { QueryRunner } from 'typeorm';
import { logger } from '../../logger';
import { FormatMemberResponseBuilder, TeamResponseBuilder } from '../responses';
import { getTeamId } from '../utils/web';
import { isOrganizer, isTechnicalUser } from '../utils/helpers';

export class TeamController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const format = res.locals.format as Format;
                const repo = runner.manager.getCustomRepository(TeamRepository);

                let teams, count;

                if (isOrganizer(res) || isTechnicalUser(res)) {
                    [teams, count] = await repo.getEntities(format, req.query);
                } else {
                    [teams, count] = await repo.getEntities(format, req.query, user);
                }

                const builder = new TeamResponseBuilder(req.query);
                respond(res, builder.buildMany(teams, count));
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const format = res.locals.format as Format;

                const memberRepo: FormatMemberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                const creator = await memberRepo.getEntity(format, user.id);

                const newTeam = new Team({
                    name: req.body.name,
                    createdBy: req.user,
                    format: res.locals.format,
                    members: [creator],
                    avatar: null
                });

                await runner.manager.getCustomRepository(TeamRepository).saveEntity(newTeam);
                const builder = new TeamResponseBuilder(req.query);
                respond(res, builder.buildOne(newTeam), 201);
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
                const team = await repo.getEntity(teamId);

                if (!team) {
                    throw new NotFoundError(`Team ${teamId} not found.`);
                }

                res.locals.team = team;
            },
            res,
            next
        );
    }

    public static async showTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const builder = new TeamResponseBuilder(req.query);
                respond(res, builder.buildOne(res.locals.team));
            },
            res,
            next
        );
    }

    public static async deleteTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                await runner.manager.getCustomRepository(TeamRepository).deleteEntity(res.locals.team.id);
                respond(res);
            },
            res,
            next
        );
    }

    public static async getAvailableMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const team = res.locals.team as Team;
                const repo = runner.manager.getCustomRepository(FormatMemberRepo);
                const [availableMembers, count] = await repo.getAvailableTeamMembers(req.query, format, team);
                const builder = new FormatMemberResponseBuilder(req.query);
                respond(res, builder.buildMany(availableMembers, count));
            },
            res,
            next
        );
    }

    public static async getAvailableTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const formatMember = res.locals.formatMember as FormatMember;
                const user = req.user as User;
                const repo = runner.manager.getCustomRepository(TeamRepository);

                let availableTeams, count;

                if (isOrganizer(res) || isTechnicalUser(res)) {
                    [availableTeams, count] = await repo.getAvailableTeams(req.query, format, formatMember);
                } else {
                    [availableTeams, count] = await repo.getAvailableTeams(req.query, format, formatMember, user);
                }

                const builder = new TeamResponseBuilder(req.query);

                respond(res, builder.buildMany(availableTeams, count));
            },
            res,
            next
        );
    }

    public static async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const team = res.locals.team as Team;
                const format = res.locals.format as Format;
                const emails = req.body.emails as string[];

                const memberRepo: FormatMemberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                const newMembers = await memberRepo.getMembersByMail(format, emails);

                if (!newMembers || newMembers.length === 0) {
                    throw new BadRequestError('Users are not member of Format');
                }

                team.members.push(...newMembers);
                await runner.manager.getRepository(Team).save(team);

                const builder = new FormatMemberResponseBuilder(req.query);
                respond(res, builder.buildMany(newMembers));
            },
            res,
            next
        );
    }

    public static async deleteMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const team = res.locals.team as Team;
                const emails = req.body.emails as string[];

                const removed = [];
                team.members.forEach((member, idx) => {
                    if (emails.includes(member.user.email)) {
                        const member = team.members.splice(idx, 1)[0];
                        removed.push(member.user.email);
                    }
                });

                if (removed.length === 0) {
                    throw new BadRequestError('No team members found');
                }

                logger.debug('Removing member(s) %s from Team %s', removed, team.name);
                await runner.manager.getRepository(Team).save(team);

                respond(res);
            },
            res,
            next
        );
    }

    //TODO: This is called through a PUT, change to PATCH ;)
    public static async patchTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const team = res.locals.team as Team;
                const patched = await runner.manager.getCustomRepository(TeamRepository).patchEntity(team, req.body);
                respond(res, patched, 200);
            },
            res,
            next
        );
    }
}
