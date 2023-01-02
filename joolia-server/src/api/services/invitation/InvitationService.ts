import { Request } from 'express';
import { Format, Library, User, Workspace } from '../../models';
import { logger } from '../../../logger';
import { finishTransaction, startTransaction } from '../transaction';
import { UserRepo, WorkspaceMemberRepo } from '../../repositories';
import { uniq } from 'lodash';
import { MailService } from '../../services';
import { FormatMemberInvitation, Invitation, LibraryMemberInvitation, MemberOfType, WorkspaceMemberInvitation } from './types';
import { getLocale } from '../../utils/helpers';

/**
 * Handles Joolia's User Invitations.
 *
 * Long running Invitation processes are off loaded from the main Event Loop.
 *
 */
class InvitationServiceImpl {
    /**
     * Number of invitations processed per node tick
     * Bigger number means transaction locks are held longer.
     */
    private BATCH_SIZE = 10;

    public async add(o: Format, request: Request): Promise<void>;
    public async add(o: Library, request: Request): Promise<void>;
    public async add(o: Workspace, request: Request): Promise<void>;
    public async add(o: Format | Library | Workspace, request: Request): Promise<void> {
        let invitations: Array<Invitation<MemberOfType>>;

        if (o instanceof Format) {
            invitations = this.createFormatInvitations(o, request);
        } else if (o instanceof Library) {
            invitations = this.createLibraryInvitations(o, request);
        } else if (o instanceof Workspace) {
            invitations = this.createWorkspaceInvitations(o, request);
        } else {
            throw new Error('Unexpected invitation :/');
        }

        logger.info('Queue has %d pending invitations', invitations.length);

        setImmediate(this.process.bind(this), invitations);
    }

    private createWorkspaceInvitations(workspace: Workspace, request: Request): WorkspaceMemberInvitation[] {
        const invitations: WorkspaceMemberInvitation[] = [];
        const emails = uniq(request.body.emails);
        const locale = getLocale(request);
        const text = request.body.invitationText;
        const inviter = request.user;

        emails.forEach((email) => {
            const invitee = new User({ pending: true, email });
            const invitation = new WorkspaceMemberInvitation(locale, text, inviter, invitee, workspace);
            invitations.push(invitation);
        });

        return invitations;
    }

    private createLibraryInvitations(library: Library, request: Request): LibraryMemberInvitation[] {
        const invitations: LibraryMemberInvitation[] = [];
        const emails = uniq(request.body.emails);
        const locale = getLocale(request);
        const text = request.body.invitationText;
        const inviter = request.user;

        emails.forEach((email) => {
            const invitee = new User({ pending: true, email });
            const invitation = new LibraryMemberInvitation(locale, text, inviter, invitee, library);
            invitations.push(invitation);
        });

        return invitations;
    }

    private createFormatInvitations(format: Format, request: Request): FormatMemberInvitation[] {
        const invitations: FormatMemberInvitation[] = [];
        const emails = uniq(request.body.emails);
        const locale = getLocale(request);
        const text = request.body.invitationText;
        const inviter = request.user;
        const role = request.body.role;

        emails.forEach((email) => {
            const invitee = new User({ pending: true, email });
            const invitation = new FormatMemberInvitation(locale, text, inviter, invitee, role, format);
            invitations.push(invitation);
        });

        return invitations;
    }

    private async process(invitations: Array<Invitation<MemberOfType>>, start = 0): Promise<void> {
        const end = start + this.BATCH_SIZE;
        const batch = invitations.slice(start, end);

        if (batch.length === 0) {
            logger.info('No more invitations to process');
            return;
        }

        logger.info('Processing %d invitations', batch.length);

        const mailPromises: Array<Promise<void>> = [];

        const runner = await startTransaction();
        const userRepo = runner.manager.getCustomRepository(UserRepo);
        const workspaceMemberRepo = runner.manager.getCustomRepository(WorkspaceMemberRepo);

        try {
            const emails = batch.map((invitation) => invitation.invitee.email);
            const existingUsers = await userRepo.getUsersByEmail(emails);
            const userPromises: Array<Promise<void>> = [];
            const deferredUpdates = new Set();

            for (const invitation of batch) {
                const p = new Promise<void>(async (resolve) => {
                    try {
                        let isMember;

                        /**
                         * Improvement: When JOOLIA-2230 is solved this block of code will grow
                         * and should be moved out of this loop for better readability.
                         *
                         */
                        if (invitation instanceof WorkspaceMemberInvitation) {
                            const workspace = invitation.getEntity().workspace;
                            const user = invitation.invitee;
                            isMember = await workspaceMemberRepo.isMember(workspace, user.email);
                        } else {
                            isMember = invitation.isMember();
                        }

                        if (!isMember) {
                            logger.debug('Inviting %s', invitation.invitee.email);
                            const existingUser = existingUsers.find((u) => u.email === invitation.invitee.email);

                            if (!existingUser) {
                                invitation.invitee = await userRepo.saveEntity(invitation.invitee);
                            } else {
                                invitation.invitee = existingUser;
                            }

                            deferredUpdates.add(invitation.getEntity());
                            mailPromises.push(MailService.send(invitation, existingUser !== undefined));
                        } else {
                            logger.debug('User %s is already a member.', invitation.invitee.email);
                        }
                    } catch (e) {
                        logger.error(`Fail to invite ${invitation.invitee.email}`, e);
                    }
                    // Yes! It is always resolved to avoid rolling back the succeeded invitations.
                    resolve();
                });

                userPromises.push(p);
            }

            await Promise.all(userPromises);

            if (deferredUpdates.size !== 0) {
                logger.silly('Updating deferred relations..');
                await runner.manager.save(Array.from(deferredUpdates), { reload: false });
            }

            await finishTransaction(runner, true);
        } catch (e) {
            logger.error('%o', e);
            await finishTransaction(runner, false);
        }

        try {
            await Promise.all(mailPromises);
        } catch (e) {
            logger.error('Fail to send invitation emails: %o', e);
        }

        setImmediate(this.process.bind(this), invitations, end);
    }
}

export const InvitationService = new InvitationServiceImpl();
