import { expect } from 'chai';
import { describe } from 'mocha';
import { clearDatabases, loadFixtures, seeds } from '../utils';
import { DummyFileService } from '../mock';
import { FileEntry, IFileEntry, KeyVisualFileEntry } from '../../src/api/models';
import { getRepository } from 'typeorm';
import { server } from '../acceptance/test.common.spec';

const keyVisualFileEntries = seeds.files.keyVisuals;
const activityKeyVisualOne = keyVisualFileEntries.ActivityKeyVisualOne;
const activityTemplateKeyVisualOne = keyVisualFileEntries.ActivityTemplateKeyVisualOne;

describe('S3 Events Tests', async () => {
    before(async () => {
        if (!server) {
            throw new Error('Server instance not created.');
        }
        await loadFixtures();
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Update Files Metadata', async () => {
        it('Should update database entries according to S3 event', async () => {
            const updatedFileEntry: Partial<IFileEntry> = {
                fileId: activityKeyVisualOne.fileId,
                size: 251348, // Data coming from SQS Event
                contentType: 'image/png', // Data inferred from stream
                versionId: '1000' // Data coming from SQS Event
            };

            await DummyFileService.updateMetadata(updatedFileEntry);

            const fileEntries = await getRepository(KeyVisualFileEntry).find({ fileId: activityKeyVisualOne.fileId });
            expect(fileEntries)
                .to.be.an('array')
                .lengthOf(2);
            fileEntries.forEach((entry) => {
                expect(entry.id).to.be.oneOf([activityTemplateKeyVisualOne.id, activityKeyVisualOne.id]);
                expect(entry.contentType).equal(updatedFileEntry.contentType);
                expect(entry.size).equal(updatedFileEntry.size);
                expect(entry.versionId).equal(updatedFileEntry.versionId);
            });
        });

        it('Should not fail to update missing database entry according to S3 event', async () => {
            const updatedFileEntry: Partial<FileEntry> = {
                fileId: 'unknown',
                size: 1000,
                contentType: 'image/png',
                versionId: '1'
            };

            await DummyFileService.updateMetadata(updatedFileEntry);
        });
    });
});
