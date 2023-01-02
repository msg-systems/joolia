import * as AWS from 'aws-sdk';
import { getConf } from '../../../config';
import { ReceiveMessageRequest, ReceiveMessageResult } from 'aws-sdk/clients/sqs';
import { logger } from '../../../logger';

// TODO: Too verbose. Integrate with current logger instead
// AWS.config.logger = console;

/**
 * Minimal Worker to deal with S3 event messages from SQS.
 * Hint: When a new kind of Worker is needed, please refactor this into a proper class for better reuse & test.
 */

/**
 * Describes the S3 object being consumed by this worker.
 */
export interface IS3Object {
    key: string;
    size: number;
    eTag: string;
    versionId: string;
}

/**
 * Function interface exposed to handle the S3 object.
 */
export interface IS3ObjectHandlerFn {
    (object: IS3Object): void;
}

const awsConf = getConf().awsConf;
const sqsConf = getConf().awsConf.sqs;

const sqs = new AWS.SQS({
    accessKeyId: awsConf.accessKeyId,
    secretAccessKey: awsConf.secretAccessKey,
    region: awsConf.region,
    apiVersion: sqsConf.apiVersion
});

/**
 * Delete the message consumed successfully.
 */
/* eslint-disable  @typescript-eslint/ban-types */
async function deleteMessage(receiptId: string): Promise<{}> {
    const params = {
        QueueUrl: sqsConf.params.QueueUrl,
        ReceiptHandle: receiptId
    };

    return new Promise<{}>((resolve, reject) => {
        logger.silly('Deleting message, receiptId: %s', receiptId);
        sqs.deleteMessage(params, (err, data) => {
            if (err) {
                reject(err);
            }

            resolve(data);
        });
    });
}
/* eslint-enable  @typescript-eslint/ban-types */

/**
 * Parses the message from SQS and handles to an external function.
 * The `fn` function should always throw error to flag an error.
 */
async function processMessage(fn: IS3ObjectHandlerFn, message: AWS.SQS.Message): Promise<void> {
    try {
        const receiptId = message.ReceiptHandle;
        const msgBody = JSON.parse(message.Body);
        const msg = msgBody.Records[0]; // TODO: sure there is always just one obj here?
        logger.silly('%o', msg);

        const s3Obj: IS3Object = {
            key: msg.s3.object.key,
            size: msg.s3.object.size,
            eTag: msg.s3.object.eTag,
            versionId: msg.s3.object.versionId
        };

        await fn(s3Obj); // real work is done here
        await deleteMessage(receiptId); // all good, get rid of this message
    } catch (e) {
        logger.error('Fail to process %o %o', message, e);
    }
}

/**
 * Interfaces with the AWS API to get messages from the SQS.
 */
async function fetchMessages(): Promise<ReceiveMessageResult> {
    return new Promise<ReceiveMessageResult>((resolve, reject) => {
        logger.silly('Polling queue');
        sqs.receiveMessage(sqsConf.params as ReceiveMessageRequest, (err, data) => {
            if (err) {
                reject(err);
            }

            resolve(data);
        });
    });
}

/**
 * Promises a bunch of message processing.
 */
async function processMessages(fn: IS3ObjectHandlerFn, messages: AWS.SQS.Message[]): Promise<void[]> {
    return Promise.all(messages.map((msg) => processMessage(fn, msg)));
}

/**
 * Schedules the polling of SQS with the desired interval.
 */
export function scheduleFSWorker(fn: IS3ObjectHandlerFn, ms = sqsConf.pollingIntervalTime): void {
    setTimeout(async (): Promise<void> => {
        try {
            const msgResult = await fetchMessages();
            logger.silly('%o', msgResult);
            if (!msgResult.Messages) {
                logger.silly('No messages found.');
            } else {
                await processMessages(fn, msgResult.Messages);
            }
        } catch (err) {
            logger.error('Error reading message %o', err);
        } finally {
            scheduleFSWorker(fn, ms); // always scheduling again even on error.
        }
    }, ms);
}
