import { Format, FormatMember, User } from '../../models';
import { FormatMessage, Message } from './types';
import { logger } from '../../../logger';
import { Request } from 'express';
import { MailService } from '../mail';
import { getLocale } from '../../utils/helpers';

class CourierServiceImpl {
    /**
     * Number of messages processed per node tick.
     */
    private BATCH_SIZE = 10;

    /**
     * Sends email messages for selected members of a Format or all them.
     *
     * @param request the original request from the sender of the message
     * @param format is the related entity of all members
     * @param formatMembers the selected members as message recipients.
     */
    public async send(request: Request, format: Format, formatMembers: FormatMember[]): Promise<void> {
        const sender = request.user as User;
        const message = request.body.message;
        const locale = getLocale(request);
        const messages: Array<Message<Format>> = [];

        if (!formatMembers || formatMembers.length == 0) {
            logger.error('No members to send message to');
            return;
        }

        formatMembers.forEach((formatMember) => {
            if (!formatMember.user.pending) {
                if (format.id !== formatMember.format.id) {
                    // just in case of a wrong query.
                    logger.error('Member format mismatch :/. Query bug?!');
                } else {
                    if (formatMember.user.id !== sender.id) {
                        messages.push(new FormatMessage(format, locale, message, sender, formatMember.user));
                    }
                }
            }
        });

        logger.info('Queue has %d pending messages', messages.length);

        setImmediate(this.process.bind(this), messages);
    }

    private async process(messages: Array<Message<unknown>>, start = 0): Promise<void> {
        const end = start + this.BATCH_SIZE;
        const batch = messages.slice(start, end);

        if (batch.length === 0) {
            logger.info('No more messages to process');
            return;
        }

        logger.info('Processing %d messages', batch.length);

        const mailPromises: Array<Promise<void>> = [];

        try {
            for (const message of batch) {
                mailPromises.push(MailService.send(message));
            }

            await Promise.all(mailPromises);
        } catch (e) {
            logger.error('Fail to send message emails: %o', e);
        }

        setImmediate(this.process.bind(this), messages, end);
    }
}

export const CourierService = new CourierServiceImpl();
