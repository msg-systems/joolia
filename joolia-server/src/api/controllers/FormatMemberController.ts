import { NextFunction, Request, Response } from 'express';
import { QueryRunner } from 'typeorm';
import { BadRequestError, NotFoundError, ValidationError } from '../errors';
import { Format, FormatMember, FormatMemberRoles, User } from '../models';
import { FormatMemberRepo, FormatRepo } from '../repositories';
import { InvitationService } from '../services/invitation';
import { respond, withTransaction } from './utils';
import { FormatMemberResponseBuilder } from '../responses';
import { logger } from '../../logger';
import { UserMemberRepository } from '../repositories/UserMemberRepository';
import { CourierService } from '../services/courier';
import { isOrganizer } from '../utils/helpers';
import { getConf } from '../../config';

export class FormatMemberController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const repo = runner.manager.getCustomRepository(FormatMemberRepo);
                const [members, count] = await repo.getEntities(req.query, format);
                const builder = new FormatMemberResponseBuilder(req.query);
                respond(res, builder.buildMany(members, count));
            },
            res,
            next
        );
    }

    public static async getMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const format = res.locals.format as Format;
                const repo = runner.manager.getCustomRepository(FormatMemberRepo);
                res.locals.formatMember = await repo.getEntity(format, req.params.memberId);

                if (!res.locals.formatMember) {
                    throw new NotFoundError(`Format Member ${req.params.memberId} not found.`);
                }
            },
            res,
            next
        );
    }

    public static async showMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const format = res.locals.format as Format;
                const currentUser = req.user as User;
                const currentUserIsOrganizer = isOrganizer(res);
                const repo = runner.manager.getCustomRepository(FormatMemberRepo);
                const member = await repo.getMemberDetails(format, req.params.memberId);
                const builder = new FormatMemberResponseBuilder(req.query, currentUser, currentUserIsOrganizer);
                respond(res, builder.buildOne(member));
            },
            res,
            next
        );
    }

    public static async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const repo: FormatRepo = runner.manager.getCustomRepository(FormatRepo);
                const formatWithMembers = await repo.getFormatWithMembers(format.id);

                if (req.body.role === FormatMemberRoles.TECHNICAL) {
                    if (!req.body.emails.length && !format.containsTechnicalUser) {
                        const patchedFormat = {
                            containsTechnicalUser: true
                        };
                        await repo.patchEntity(format, patchedFormat);

                        req.body.emails.push(getConf().technicalUserMail);
                    } else {
                        throw new ValidationError('Emails should be an empty list. Format should not already contain a technical user');
                    }
                }

                await InvitationService.add(formatWithMembers, req);
                respond(res);
            },
            res,
            next
        );
    }

    public static async updateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const format = res.locals.format as Format;
                const formatMember = res.locals.formatMember as FormatMember;
                const repo = runner.manager.getCustomRepository(FormatMemberRepo);

                const organizerCount = await repo.countMembersByRole(format, FormatMemberRoles.ORGANIZER);
                const newRole = req.body.role;

                // checks if user is last organizer and wants to change his role to participant
                if (organizerCount === 1 && user.id === req.params.memberId && newRole === FormatMemberRoles.PARTICIPANT) {
                    throw new BadRequestError('Last organizer cannot change its role to participant.');
                }

                formatMember.role = newRole;
                await repo.saveEntity(formatMember);
                respond(res, { id: formatMember.user.id, role: formatMember.role }, 200);
            },
            res,
            next
        );
    }

    public static async deleteMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const format = res.locals.format as Format;
                const emails = req.body.emails;
                const userMemberRepo: UserMemberRepository = runner.manager.getCustomRepository(UserMemberRepository);

                if (req.body.role && req.body.role === FormatMemberRoles.TECHNICAL) {
                    if (!emails.length && format.containsTechnicalUser) {
                        const patchedFormat = {
                            containsTechnicalUser: false
                        };
                        const formatRepo: FormatRepo = runner.manager.getCustomRepository(FormatRepo);
                        await formatRepo.patchEntity(format, patchedFormat);

                        await userMemberRepo.deleteFormatMembers(format, [getConf().technicalUserMail]);
                    } else {
                        throw new ValidationError('Emails should be an empty list. Format should contain the technical user');
                    }
                } else {
                    const repo: FormatMemberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                    const allMembersOfFormat = await repo.countMembers(format);

                    if (allMembersOfFormat == 1) {
                        throw new BadRequestError('The Format must have at least one member');
                    } else {
                        const membersToDelete = await repo.countMembersByMail(format, emails);

                        if (membersToDelete > 0) {
                            if (allMembersOfFormat - membersToDelete <= 0) {
                                throw new BadRequestError('The Format must have at least one member');
                            }

                            await userMemberRepo.deleteFormatMembers(format, emails);
                        } else {
                            logger.warn('User(s) %o not found.', emails);
                        }
                    }
                }

                respond(res);
            },
            res,
            next
        );
    }

    public static async sendMail(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const memberIds = req.body.memberIds;
                const format = res.locals.format as Format;
                const repo: FormatMemberRepo = runner.manager.getCustomRepository(FormatMemberRepo);

                let members: FormatMember[];

                if (memberIds && memberIds.length > 0) {
                    members = await repo.getMembersById(format, memberIds); // Sending messages to selected members
                } else {
                    members = await repo.getAllMembers(format); // Sending messages to all members
                }

                await CourierService.send(req, format, members);

                respond(res);
            },
            res,
            next
        );
    }
}
