import { S3 } from 'aws-sdk';
import { getConf } from '../../src/config';

/*
 * All tests are disable, just keeping as scratch code here.
 */

const awsConf = getConf().awsConf;

xdescribe('S3 playground', () => {
    const s3 = new S3({
        accessKeyId: awsConf.accessKeyId,
        secretAccessKey: awsConf.secretAccessKey,
        region: 'eu-central-1',
        apiVersion: '2006-03-01',
        signatureVersion: 'v4'
    });

    const bucket = 'jooliafiles-dev';
    const objectKey = 'vader.jpg'; // The same key in database
    const contentType = 'image/jpeg'; // metadata that should come from database
    const expiration = 432000; // Expires in 5 days

    it('Get Signed S3 URL for downloading a file', () => {
        const params = {
            Bucket: bucket,
            Key: objectKey,
            Expires: expiration,
            ResponseContentType: contentType
            // ResponseContentDisposition: 'attachment; filename="0000.png"' // metadata that should come from database
        };

        const url = s3.getSignedUrl('getObject', params);
        console.log('GET: ' + url);
    });

    it('Get Signed S3 URL for uploading a file', () => {
        const params = { Bucket: bucket, Key: objectKey, Expires: expiration };
        const url = s3.getSignedUrl('putObject', params);
        console.log('PUT: ' + url);
    });
});
