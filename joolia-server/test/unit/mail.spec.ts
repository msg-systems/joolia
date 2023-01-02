import { describe } from 'mocha';
import { expect } from 'chai';
import { MailService } from '../../src/api/services';
import { logger } from '../../src/logger';
import { FormatMemberRoles, User } from '../../src/api/models';
import { seeds } from '../utils';
import { FormatMemberInvitation, LibraryMemberInvitation, WorkspaceMemberInvitation } from '../../src/api/services/invitation/types';
import { FormatMessage } from '../../src/api/services/courier/types';
import { AdminConsentRequest } from '../../src/api/services/adminConsent/types';

const users = seeds.users;

describe('MailService Tests - Template Rendering only', () => {
    before(async () => {
        await MailService.configure();
    });

    describe('Format Invitation', () => {
        const format = seeds.formats.FormatFour;

        it('New User', async () => {
            const someone = new User({ email: 'someone@example.com' });
            const invitation = new FormatMemberInvitation('de', 'Join us!', users.Luke, someone, FormatMemberRoles.PARTICIPANT, format);

            const res = await MailService.send(invitation, false);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.messageId);
            logger.info(res.originalMessage.text);
            expect(res.originalMessage.text).contains('Format auf Joolia eingeladen');
            expect(res.originalMessage.text).contains(`http://localhost:9000/signup?email=${someone.email}`);
        });

        it('Existing User', async () => {
            const someone = new User({ name: 'Someone', email: 'someone@example.com' });
            const invitation = new FormatMemberInvitation('de', 'Join us!', users.Luke, someone, FormatMemberRoles.PARTICIPANT, format);

            const res = await MailService.send(invitation, true);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.messageId);
            logger.info(res.originalMessage.text);
            expect(res.originalMessage.text).contains('Format auf Joolia eingeladen');
            expect(res.originalMessage.text).contains(`http://localhost:9000/format/${format.id}`);
        });
    });

    describe('Library Invitation', () => {
        const library = seeds.libraries.library3;

        it('New User', async () => {
            const someone = new User({ email: 'someone@example.com' });
            const invitation = new LibraryMemberInvitation('de', 'Join us!', users.Luke, someone, library);

            const res = await MailService.send(invitation, false);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.messageId);
            logger.info(res.originalMessage.text);
            expect(res.originalMessage.text).contains('Bibliothek auf Joolia eingeladen');
            expect(res.originalMessage.text).contains(`http://localhost:9000/signup?email=${someone.email}`);
        });

        it('Existing User', async () => {
            const someone = new User({ name: 'Someone', email: 'someone@example.com' });
            const invitation = new LibraryMemberInvitation('de', 'Join us!', users.Luke, someone, library);

            const res = await MailService.send(invitation, true);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.messageId);
            logger.info(res.originalMessage.text);
            expect(res.originalMessage.text).contains('Bibliothek auf Joolia eingeladen');
            expect(res.originalMessage.text).contains(`http://localhost:9000/library/${library.id}`);
        });
    });

    describe('Workspace Invitation', () => {
        const workspace = seeds.workspaces.Workspace3;

        it('New User', async () => {
            const someone = new User({ email: 'someone@example.com' });
            const invitation = new WorkspaceMemberInvitation('de', 'Join us!', users.Luke, someone, workspace);

            const res = await MailService.send(invitation, false);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.messageId);
            logger.info(res.originalMessage.text);
            expect(res.originalMessage.text).contains('Workspace auf Joolia eingeladen');
            expect(res.originalMessage.text).contains(`http://localhost:9000/signup?email=${someone.email}`);
        });

        it('Existing User', async () => {
            const someone = new User({ name: 'Someone', email: 'someone@example.com' });
            const invitation = new WorkspaceMemberInvitation('de', 'Join us!', users.Luke, someone, workspace);

            const res = await MailService.send(invitation, true);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.messageId);
            logger.info(res.originalMessage.text);
            expect(res.originalMessage.text).contains('Workspace auf Joolia eingeladen');
            expect(res.originalMessage.text).contains(`http://localhost:9000/workspace/${workspace.id}`);
        });
    });

    describe('Message to members in a Format', () => {
        const format = seeds.formats.FormatOne;

        it('Send to member', async () => {
            const msg = 'Meet me on Anakin home planet!';
            const luke = new User(users.Luke);
            const shaak = new User(users.Shaak);
            const message = new FormatMessage(format, 'de', msg, shaak, luke);

            const res = await MailService.send(message);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.originalMessage.from);
            logger.info(res.originalMessage.to);
            logger.info(res.originalMessage.subject);
            logger.info(`>>> ${res.originalMessage.text} <<<`);
            expect(res.originalMessage.text).contains(msg);
        });
    });

    describe('Admin Consent', () => {
        it('Request admin consent', async () => {
            const msg = 'Please grant me access to this application.';
            const luke = new User(users.Luke);
            const leia = new User(users.Leia);
            const adminConsentUrl = 'dummyConsentURL';
            const request = new AdminConsentRequest('en', msg, leia.name, luke.email, adminConsentUrl);

            const res = await MailService.send(request);
            expect(res).to.be.an('object');
            expect(res).to.have.keys(['envelope', 'message', 'messageId', 'originalMessage']);
            logger.info(res.originalMessage.from);
            logger.info(res.originalMessage.to);
            logger.info(res.originalMessage.subject);
            logger.info(`>>> ${res.originalMessage.text} <<<`);
            expect(res.originalMessage.text).contains(msg);
            expect(res.originalMessage.text).contains(adminConsentUrl);
        });
    });
});
