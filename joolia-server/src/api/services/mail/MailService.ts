import { createTransport, SentMessageInfo } from 'nodemailer';
import * as AWS from 'aws-sdk';
import { getClientUrl, getConf } from '../../../config';
import * as Email from 'email-templates';
import { join } from 'path';
import { logger } from '../../../logger';
import { Environment } from '../../../config/configuration';
import { FormatMemberInvitation, Invitation, LibraryMemberInvitation, MemberOfType, WorkspaceMemberInvitation } from '../invitation/types';
import { FormatMessage, Message } from '../courier/types';
import { Format } from '../../models';
import { AdminConsentRequest } from '../adminConsent/types';

enum EmailTemplate {
    MESSAGE = 'message',
    RESET_PASSWORD = 'resetPassword',
    ENTITY_INVITATION_NEW = 'entityInvitationNew',
    ENTITY_INVITATION_USER = 'entityInvitationUser',
    ADMIN_CONSENT = 'adminConsent'
}

const awsConf = getConf().awsConf;
const i18n = getConf().emailI18N;

export class MailService {
    private static transport;

    public static async configure(): Promise<void> {
        try {
            if (awsConf.ses.enabled) {
                logger.info('Using SES MailService (%s)', getConf().environment);

                const ses = new AWS.SES({
                    accessKeyId: awsConf.ses.accessKeyId,
                    secretAccessKey: awsConf.ses.secretAccessKey,
                    apiVersion: awsConf.ses.apiVersion,
                    region: awsConf.ses.region
                });

                MailService.transport = createTransport({
                    SES: ses
                });

                const verified = await MailService.transport.verify();
                logger.info('Email Transport verified: %s', verified);
            } else {
                logger.info('Using local MailService');
                MailService.transport = createTransport({ jsonTransport: true });
            }
        } catch (e) {
            logger.error('Error configuring Mail Service', e);
        }
    }

    //TODO: Origin/Locale is handled in MailService - refactor me. See send method here.
    public static async sendPasswordReset(
        recipient: string,
        token: string,
        name: string,
        origin: string,
        locale: string
    ): Promise<SentMessageInfo> {
        return MailService.sendEmail(recipient, EmailTemplate.RESET_PASSWORD, {
            url: origin + getConf().clientConf.baseHref + '/reset-password?token=' + token,
            name: name,
            locale: locale
        });
    }

    public static async send(o: Message<Format>): Promise<SentMessageInfo>;
    public static async send(o: Invitation<MemberOfType>, existingUser: boolean): Promise<SentMessageInfo>;
    public static async send(o: AdminConsentRequest): Promise<SentMessageInfo>;
    public static async send(
        o: Invitation<MemberOfType> | Message<Format> | AdminConsentRequest,
        existingUser?: boolean
    ): Promise<SentMessageInfo> {
        if (o instanceof Invitation) {
            return MailService.sendInvitation(o, existingUser);
        }

        if (o instanceof Message) {
            return MailService.sendMessage(o);
        }

        if (o instanceof AdminConsentRequest) {
            return MailService.sendAdminConsentRequest(o);
        }

        throw new Error('Unknown Type :/');
    }

    private static async sendMessage(m: Message<Format>): Promise<SentMessageInfo> {
        const recipient = m.recipient;
        const sender = m.sender;
        const message = m.text;
        const locale = m.locale;

        const urlId = m.getUrlId();

        if (m instanceof FormatMessage) {
            return MailService.dispatchMessage(recipient.name, recipient.email, sender.name, urlId, locale, message);
        }

        throw new Error('Unknown Message Type :/');
    }

    private static async sendInvitation(invitation: Invitation<MemberOfType>, existingUser: boolean): Promise<SentMessageInfo> {
        const recipient = invitation.invitee.email;
        const recipientName = existingUser ? invitation.invitee.name : undefined;
        const inviter = invitation.inviter;
        const message = invitation.text;
        const locale = invitation.locale;

        const urlId = invitation.getUrlInvitationId();

        if (invitation instanceof FormatMemberInvitation) {
            return MailService.dispatchInvitation('format', recipient, inviter.name, urlId, locale, message, recipientName);
        }

        if (invitation instanceof LibraryMemberInvitation) {
            return MailService.dispatchInvitation('library', recipient, inviter.name, urlId, locale, message, recipientName);
        }

        if (invitation instanceof WorkspaceMemberInvitation) {
            return MailService.dispatchInvitation('workspace', recipient, inviter.name, urlId, locale, message, recipientName);
        }

        throw new Error('Unknown Invitation Type :/');
    }

    private static async sendAdminConsentRequest(request: AdminConsentRequest): Promise<SentMessageInfo> {
        const emailTemplate = EmailTemplate.ADMIN_CONSENT;

        return MailService.sendEmail(request.recipientEmail, emailTemplate, {
            userName: request.senderName,
            url: request.url,
            locale: request.locale,
            message: request.message
        });
    }

    private static async dispatchInvitation(
        entityName: string,
        recipient: string,
        userName: string,
        entityId: string,
        locale: string,
        message?: string,
        name?: string
    ): Promise<SentMessageInfo> {
        let emailTemplate;
        let url;

        if (name) {
            emailTemplate = EmailTemplate.ENTITY_INVITATION_USER;
            url = `${getClientUrl()}/${entityName}/${entityId}`;
        } else {
            emailTemplate = EmailTemplate.ENTITY_INVITATION_NEW;
            url = `${getClientUrl()}/signup?email=${recipient}`;
        }

        return MailService.sendEmail(recipient, emailTemplate, {
            userName: userName,
            url: url,
            locale: locale,
            message: message,
            name: name,
            entityName: entityName
        });
    }

    private static async dispatchMessage(
        recipientName: string,
        recipientEmail: string,
        senderName: string,
        entityId: string,
        locale: string,
        message: string
    ): Promise<SentMessageInfo> {
        const entityName = 'format'; // Until now only messages to format members are sent
        const emailTemplate = EmailTemplate.MESSAGE;
        const url = `${getClientUrl()}/${entityName}/${entityId}`;

        return MailService.sendEmail(recipientEmail, emailTemplate, {
            userName: senderName,
            url: url,
            locale: locale,
            message: message,
            name: recipientName,
            entityName: entityName
        });
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private static async sendEmail(recipient: string, template: EmailTemplate, locals: object): Promise<SentMessageInfo> {
        const email = new Email({
            juice: false,
            send: true,
            preview: false,
            transport: MailService.transport,
            i18n: i18n
        });

        try {
            const res = await email.send({
                template: join(getConf().eMailServiceConf.templateDirectory, template),
                message: {
                    from: 'no-reply@joolia.net',
                    to: recipient
                },
                locals
            });

            if (getConf().environment === Environment.development) {
                logger.silly('Email from %s to %o', res.envelope.from, res.envelope.to);
            }

            return res;
        } catch (e) {
            logger.error('Error sending mail', e);
        }
    }
}
