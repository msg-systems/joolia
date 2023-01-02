import * as AWS from 'aws-sdk';
import { IFileEntry } from '../../models';
import { getConf } from '../../../config';
import { logger } from '../../../logger';
import { NotFoundError } from '../../errors';
import { IS3Object } from '../../services';
import { getCustomRepository } from 'typeorm';
import { FileEntryRepository } from '../../repositories/FileEntryRepository';
import { Server } from '../../../server';
import { TargetNotification } from '../notification/utils';
import { NotificationUser } from '../notification';

enum S3Operation {
    PUT = 'putObject',
    GET = 'getObject'
}

enum OwnerType {
    FORMAT = 'format',
    ACTIVITY = 'activity',
    SUBMISSION = 'submission',
    OTHER = 'other'
}
interface FileOwner {
    id: string;
    type: OwnerType;
}

const fsConf = getConf().fileServiceConf;
const awsConf = getConf().awsConf;

const s3 = new AWS.S3({
    accessKeyId: awsConf.accessKeyId,
    secretAccessKey: awsConf.secretAccessKey,
    region: awsConf.region,
    apiVersion: awsConf.s3.apiVersion,
    signatureVersion: awsConf.s3.signatureVersion
});

/**
 * Basic contract for a file storage service.
 */
export abstract class FileService {
    public abstract deleteFile(fileEntry: IFileEntry): Promise<void>;

    public abstract createAccessUrl(fileEntry: IFileEntry, download: boolean): Promise<string>;

    public abstract createUploadUrl(fileEntry: IFileEntry): Promise<string>;

    public static async updateMetadata(fileEntry: Partial<IFileEntry>): Promise<FileOwner> {
        logger.info('Updating file metadata (fileId: %s)', fileEntry.fileId);

        await getCustomRepository(FileEntryRepository).update({ fileId: fileEntry.fileId }, fileEntry);

        const updatedFileEntry = (
            await getCustomRepository(FileEntryRepository).find({
                join: {
                    alias: 'file_entry',
                    leftJoinAndSelect: {
                        format: 'file_entry.format',
                        activity: 'file_entry.activity',
                        submission: 'file_entry.submission'
                    }
                },
                where: {
                    fileId: fileEntry.fileId
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })
        )[0] as any;

        if (updatedFileEntry) {
            if (updatedFileEntry.format != null && updatedFileEntry.format != undefined) {
                return { id: updatedFileEntry.format.id, type: OwnerType.FORMAT };
            } else if (!!updatedFileEntry.submission) {
                return { id: updatedFileEntry.submission.id, type: OwnerType.SUBMISSION };
            } else if (!!updatedFileEntry.activity) {
                return { id: updatedFileEntry.activity.id, type: OwnerType.ACTIVITY };
            } else {
                return { id: '', type: OwnerType.OTHER };
            }
        } else {
            return { id: '', type: OwnerType.OTHER };
        }
    }
}

/**
 * Manages the stored files in AWS S3 creating entries and granting accesses.
 */
export class S3FileService extends FileService {
    /**
     * Deletes a file from the storage.
     *
     * @param fileEntry is an instance of the file stored in the database.
     */
    public async deleteFile(fileEntry: IFileEntry): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            s3.deleteObject({ Bucket: fsConf.bucketName, Key: fileEntry.fileId }, (err) => {
                if (err) {
                    if (err.statusCode === 404) {
                        return reject(new NotFoundError('File not found'));
                    }
                    return reject(err);
                }
                logger.silly('File key=%s removed from storage', fileEntry.fileId);
                resolve();
            });
        });
    }

    /**
     * TODO: Better to avoid receiving message that does not match the base prefix
     * instead of throwing the error below that is needed to prevent message being
     * removed from the Queue.
     */
    public static async processNewS3Object(object: IS3Object, server: Server): Promise<void> {
        let eventPrefix;
        let fileId = object.key;
        const [bucketName, confPrefix] = fsConf.bucketName.split('/');

        if (confPrefix) {
            [eventPrefix, fileId] = object.key.split('/');
            if (confPrefix !== eventPrefix) {
                throw new Error('Got a message that is not for me ;)');
            }
        }

        const params = {
            Bucket: bucketName,
            Key: object.key,
            VersionId: object.versionId
        };

        /**
         * Content-Type is set through client. Yes we trust it so far.
         * See JOOLIA-1786.
         */
        const metadata = await new Promise<AWS.S3.HeadObjectOutput>((resolve, reject) => {
            s3.headObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        logger.silly('%o', metadata);

        const fileEntry: Partial<IFileEntry> = {
            fileId,
            versionId: object.versionId,
            contentType: metadata.ContentType,
            size: object.size
        };

        const fileOwner = await this.updateMetadata(fileEntry);
        if (fileOwner.type != OwnerType.OTHER) {
            const notificationUser = new NotificationUser('', '', '');
            server.getNotificationService().notify(`/${fileOwner.type}/${fileOwner.id}/file`, TargetNotification.UPDATED, notificationUser);
        }
    }

    private static async getSignedUrl(operation: S3Operation, params: unknown): Promise<string> {
        logger.silly('Sign %s request %o', operation, params);
        return new Promise<string>((resolve, reject) => {
            s3.getSignedUrl(operation, params, (err, url) => {
                if (err) {
                    return reject(err);
                }
                resolve(url);
            });
        });
    }

    /**
     * Grants temporary access to store a file.
     *
     * @param fileEntry is an instance of the file stored in the database.
     */
    public createUploadUrl(fileEntry: IFileEntry): Promise<string> {
        const params = { Bucket: fsConf.bucketName, Key: fileEntry.fileId, Expires: fsConf.urlSignatureExpirationTime };
        return S3FileService.getSignedUrl(S3Operation.PUT, params);
    }

    /**
     * Grants temporary access to read a stored file.
     *
     * @param fileEntry is an instance of the file stored in the database.
     * @param download when true the accessUrl will have the appropriate Response Content Disposition header set.
     */
    public async createAccessUrl(fileEntry: IFileEntry, download: boolean): Promise<string> {
        const params: { [k: string]: unknown } = {
            Bucket: fsConf.bucketName,
            Key: fileEntry.fileId,
            Expires: fsConf.urlSignatureExpirationTime
        };

        if (fileEntry.contentType) {
            params.ResponseContentType = fileEntry.contentType;
        }

        if (download) {
            params.ResponseContentDisposition = `attachment; filename="${fileEntry.name}"`;
        } else {
            params.ResponseContentDisposition = `inline`;
        }

        return S3FileService.getSignedUrl(S3Operation.GET, params);
    }
}
