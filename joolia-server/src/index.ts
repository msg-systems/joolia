import { logger } from './logger';
import { createServer } from './server';
import { getConf } from './config';
import { S3FileService, scheduleFSWorker } from './api/services';
import { Environment } from './config/configuration';

if (getConf().environment === Environment.development) {
    /* eslint-disable */
    console.log(
        '   __              _ _         ____  \n' +
            '   \\ \\  ___   ___ | (_) __ _  |___ \\ \n' +
            '    \\ \\/ _ \\ / _ \\| | |/ _` |   __) |\n' +
            ' /\\_/ / (_) | (_) | | | (_| |  / __/ \n' +
            ' \\___/ \\___/ \\___/|_|_|\\__,_| |_____|\n' +
            '                                     \n'
    );
    /* eslint-enable */
}

const server = createServer();

function stopServer(): void {
    logger.info('Exiting ..');
    server.stop();
    process.exit(0);
}

server.start().catch((err: any) => {
    logger.error('Fail to start server: ', err);
    process.exit(1);
});

process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);

if (getConf().awsConf.sqs.enabled) {
    if (getConf().awsConf.accessKeyId) {
        scheduleFSWorker((s3Obj) => S3FileService.processNewS3Object(s3Obj, server));
    } else {
        logger.error('Missing AWS credentials, SQS Workers WILL NOT start.');
    }
} else {
    logger.warn('SQS Workers disabled.');
}
