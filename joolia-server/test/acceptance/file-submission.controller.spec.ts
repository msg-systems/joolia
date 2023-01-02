import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures } from '../utils';
import { server } from './test.common.spec';
import * as YAML from 'yaml';
import * as fs from 'fs';
import { SubmissionFileEntry } from '../../src/api/models';
import { FileEntryResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

let token;
let formatSeed = null;
let activitySeed = null;
let phaseSeed = null;
let teamSubmissionSeed = null;
let submissionFileEntrySeed = null;
let tempFileEntry = null;

describe('Files on Submission', async () => {
    before(async () => {
        await loadFixtures();
        token = await getSignedIn(server);
        // TODO: refactor me, use seeds from utils
        activitySeed = YAML.parse(fs.readFileSync(`./test/fixture/activity.yml`, 'utf-8')).items;
        phaseSeed = YAML.parse(fs.readFileSync(`./test/fixture/phase.yml`, 'utf-8')).items;
        formatSeed = YAML.parse(fs.readFileSync('./test/fixture/format.yml', 'utf-8')).items;
        teamSubmissionSeed = YAML.parse(fs.readFileSync('./test/fixture/team-submission.yml', 'utf-8')).items;
        submissionFileEntrySeed = YAML.parse(fs.readFileSync('./test/fixture/submission-file-entry.yml', 'utf-8')).items;
    });

    after(async () => {
        await clearDatabases();
    });

    it('Request all files', async () => {
        return request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file'
            )
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(1)
                    .and.all.keys(FileEntryResponse.required);
            });
    });

    it('Request one stored file and get redirection (with download param)', async () => {
        return request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file/' +
                    submissionFileEntrySeed.SubmissionFileOne.id
            )
            .query({ download: true })
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Request one stored file and do not get redirection (with download param)', async () => {
        return request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file/' +
                    submissionFileEntrySeed.SubmissionFileOne.id
            )
            .query({ download: false })
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Request one stored file and do not get redirection (without download param)', async () => {
        return request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file/' +
                    submissionFileEntrySeed.SubmissionFileOne.id
            )
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Creates a new file entry for this submission', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file'
            )
            .set('Authorization', token)
            .send({ name: 'report.pdf' })
            .expect(201)
            .then((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
                tempFileEntry = new SubmissionFileEntry(res.body);
            });

        // check if fileCount has been increased
        await request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id
            )
            .set('Authorization', token)
            .expect((res) => {
                expect(res.body.fileCount).equals(2);
            })
            .expect(200);
    });

    it('Retrieves the newly created file entry', async () => {
        return request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file/' +
                    tempFileEntry.id
            )
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Updates the newly created file entry name', async () => {
        return request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file/' +
                    tempFileEntry.id
            )
            .set('Authorization', token)
            .send({ name: 'New file name.pdf' })
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(['id', 'name']);
                expect(res.body.name).eq('New file name.pdf');
            });
    });

    it('Deletes the new file entry for this activity', async () => {
        await request(server.application)
            .delete(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/file/' +
                    tempFileEntry.id
            )
            .set('Authorization', token)
            .expect(204)
            .expect((res) => {
                expect(res.body).to.be.empty;
            });

        // check if fileCount has been decreased
        await request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id
            )
            .set('Authorization', token)
            .expect((res) => {
                expect(res.body.fileCount).equals(1);
            })
            .expect(200);
    });
});
