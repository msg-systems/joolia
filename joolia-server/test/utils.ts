import * as path from 'path';
import * as request from 'supertest';
import { Builder, fixturesIterator, Parser, Resolver } from 'typeorm-fixtures-cli';
import { Connection, getConnection, QueryRunner } from 'typeorm';
import { logger } from '../src/logger';
import { Server } from '../src/server';
import { User } from '../src/api/models';
import { Loader } from 'typeorm-fixtures-cli/dist';
import { getConf } from '../src/config';
import * as fs from 'fs';
import * as YAML from 'yaml';
import { Request } from 'express';
import { assert, expect } from 'chai';
import { createKnexConn } from '../src/database';
import { IArchivedEntry } from '../src/api/models/archive';

async function clearArchiveDatabase(): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */

    const knex = createKnexConn();
    const schema = getConf().dbConf.archive.database;

    const allTables = await knex
        .withSchema('information_schema')
        .from('tables')
        .where({ table_schema: schema })
        .select('table_name');

    const promises = [];

    for (const row of allTables) {
        promises.push(
            knex
                .withSchema(schema)
                .from(row.table_name)
                .truncate()
        );
    }

    await Promise.all(promises);
}

async function clearDatabase(connectionName = 'default'): Promise<void> {
    logger.silly('Clearing %s database..', connectionName);
    const connection: Connection = await getConnection(connectionName);
    const queryRunner: QueryRunner = await connection.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');

        const promises = [];
        for (const entityMeta of connection.entityMetadatas) {
            if (!!!entityMeta.expression) {
                // avoids Views
                promises.push(queryRunner.query(`TRUNCATE TABLE \`${entityMeta.tableName}\`;`));
            }
        }

        await Promise.all(promises);

        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
        await queryRunner.commitTransaction();

        logger.silly('Database %s cleared.', connectionName);
    } finally {
        await queryRunner.release();
    }
}

export async function clearDatabases(): Promise<void> {
    await Promise.all([clearDatabase(), clearArchiveDatabase()]);
}

export async function getSignedIn(server: Server, asUser?: Partial<User>): Promise<string> {
    const userLogin = asUser ? asUser : { email: 'luke@alliance.com', password: '12345678' };
    const signInRes = await request(server.application)
        .post('/signin')
        .set('Accept', 'application/json')
        .send({
            email: userLogin.email,
            password: userLogin.password
        });

    const cookie = extractAuthCookie(signInRes);
    const authConf = getConf().authConf;

    const jwtRes = await request(server.application)
        .get('/token')
        .set('Cookie', `${authConf.cookieTokenName}=${cookie.token}`) // Must use a valid Cookie
        .send();

    return jwtRes.body.token;
}

export async function getSignedInAsAdmin(server: Server): Promise<string> {
    return getSignedIn(server, { email: 'princess@alliance.com', password: '12345678' });
}

export async function loadFixtures(): Promise<void> {
    logger.debug('Loading fixtures..');
    const fixturesPath = path.resolve(__dirname, 'fixture');
    const loader = new Loader();
    loader.load(fixturesPath);

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);

    if (fixtures && fixtures.length == 0) {
        throw new Error('Fixtures not found!');
    }

    const connection = await getConnection();
    const queryRunner: QueryRunner = await connection.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const builder = new Builder(connection, new Parser());

        for (const fixture of fixturesIterator(fixtures)) {
            /**
             * Fixtures has a loading order hence Linter disabled here.
             */
            const entity = await builder.build(fixture);
            await queryRunner.manager.save(entity);
        }

        await queryRunner.commitTransaction();

        logger.silly('Fixtures loaded.');
    } finally {
        await queryRunner.release();
    }
}

export function qSelect(fields: string[]): string {
    const selects = fields.map((f) => `select[]=${f}`);
    return selects.join('&');
}

export function createRandomEmails(n = 10000): string[] {
    const emails = [];
    for (let i = 0; i < n; i++) {
        const r = Math.random()
            .toString(36)
            .substring(8);
        emails.push(`user${r}@example.com`);
    }
    return emails;
}

export function fakeRequest(user: Partial<User>, f: { query?: unknown; params?: unknown; body?: unknown }): Request {
    const r = {
        acceptsLanguages: () => ['en'],
        user,
        ...f
    };
    return r as Request;
}

export function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function checkArchiveMetaData(archived: IArchivedEntry, userId: string): void {
    expect(archived.deletedById).equals(userId);
    expect(archived.deletedAt).is.not.null;
    expect(archived.requestId).is.not.null;
}

export function checkErrorMessages(requestBody, messages: string[]): void {
    logger.silly('%o', requestBody);
    messages.forEach((message) =>
        assert(
            requestBody.errors.some((error) => {
                /**
                 * When using oneOf in Validators this field may appear.
                 * https://express-validator.github.io/docs/validation-result-api.html
                 */
                if ('nestedErrors' in error) {
                    return error.nestedErrors.some((nestedError) => nestedError.msg === message);
                }

                return error.msg === message;
            })
        )
    );
}

export function checkCookies(res): void {
    expect(Object.keys(res.headers)).contains('set-cookie');
    expect(Object.keys(res.headers)).contains('x-joolia-auth-expires');
}

/**
 * Helper for extracting Auth Cookie from Response
 */
export function extractAuthCookie(res: Response): Record<string, string> {
    const obj: Record<string, string> = {};
    const setOpts = res.headers['set-cookie'][0];
    const options = setOpts.split(';');

    for (const o of options) {
        const [k, v] = o.split('=');
        obj[k.trim().toLowerCase()] = v || true;
    }

    const authConf = getConf().authConf;

    if (authConf.cookieTokenName in obj) {
        obj.token = decodeURIComponent(obj[authConf.cookieTokenName]);
    }

    return obj;
}

/**
 * This is a continuous work in progress.
 * All seeds/fixtures are loaded here hence avoid reloading for each new test suite.
 * Please, Adjust as necessary.
 */
export const seeds: {
    [k: string]: any;
} = {
    users: {},
    libraries: {},
    formats: {},
    phases: {},
    activities: {},
    steps: {},
    teams: {},
    templates: {},
    files: {},
    workspaces: {},
    userSubmissions: {},
    teamSubmissions: {},
    userComments: {},
    configurations: {},
    userSkills: {},
    skills: {},
    activityCanvas: {},
    canvasSlots: {},
    userCanvasSubmissions: {},
    teamCanvasSubmissions: {}
};

seeds.users = YAML.parse(fs.readFileSync(`./test/fixture/user.yml`, 'utf-8')).items;
seeds.libraries = YAML.parse(fs.readFileSync(`./test/fixture/library.yml`, 'utf-8')).items;
seeds.formats = YAML.parse(fs.readFileSync(`./test/fixture/format.yml`, 'utf-8')).items;
seeds.activities = YAML.parse(fs.readFileSync(`./test/fixture/activity.yml`, 'utf-8')).items;
seeds.phases = YAML.parse(fs.readFileSync(`./test/fixture/phase.yml`, 'utf-8')).items;
seeds.steps = YAML.parse(fs.readFileSync(`./test/fixture/step.yml`, 'utf-8')).items;
seeds.teams = YAML.parse(fs.readFileSync(`./test/fixture/team.yml`, 'utf-8')).items;
seeds.workspaces = YAML.parse(fs.readFileSync('./test/fixture/workspace.yml', 'utf-8')).items;
seeds.configurations = YAML.parse(fs.readFileSync('./test/fixture/activity-configuration.yml', 'utf-8')).items;
seeds.activityCanvas = YAML.parse(fs.readFileSync('./test/fixture/activity-canvas.yml', 'utf-8')).items;
seeds.canvasSlots = YAML.parse(fs.readFileSync('./test/fixture/canvas-slot.yml', 'utf-8')).items;

seeds.templates.formats = YAML.parse(fs.readFileSync('./test/fixture/format-template.yml', 'utf-8')).items;
seeds.templates.phases = YAML.parse(fs.readFileSync('./test/fixture/phase-template.yml', 'utf-8')).items;
seeds.templates.activities = YAML.parse(fs.readFileSync('./test/fixture/activity-template.yml', 'utf-8')).items;
seeds.templates.steps = YAML.parse(fs.readFileSync('./test/fixture/stepTemplate.yml', 'utf-8')).items;

seeds.files.activities = YAML.parse(fs.readFileSync('./test/fixture/activity-file-entry.yml', 'utf-8')).items;
seeds.files.activityTemplates = YAML.parse(fs.readFileSync('./test/fixture/activityTemplate-file-entry.yml', 'utf-8')).items;
seeds.files.keyVisuals = YAML.parse(fs.readFileSync('./test/fixture/key-visual-file-entry.yml', 'utf-8')).items;
seeds.files.teamAvatars = YAML.parse(fs.readFileSync(`./test/fixture/team-avatar-file-entry.yml`, 'utf-8')).items;
seeds.files.formatFileEntries = YAML.parse(fs.readFileSync(`./test/fixture/format-file-entry.yml`, 'utf-8')).items;
seeds.files.formatTemplateEntries = YAML.parse(fs.readFileSync('./test/fixture/formatTemplate-file-entry.yml', 'utf-8')).items;
seeds.files.teamFileEntries = YAML.parse(fs.readFileSync('./test/fixture/team-file-entry.yml', 'utf-8')).items;

seeds.userSubmissions = YAML.parse(fs.readFileSync('./test/fixture/user-submission.yml', 'utf-8')).items;
seeds.teamSubmissions = YAML.parse(fs.readFileSync('./test/fixture/team-submission.yml', 'utf-8')).items;
seeds.userComments = YAML.parse(fs.readFileSync('./test/fixture/user-comment.yml', 'utf-8')).items;
seeds.userRatings = YAML.parse(fs.readFileSync('./test/fixture/user-rating.yml', 'utf-8')).items;
seeds.userSkills = YAML.parse(fs.readFileSync('./test/fixture/user-skill.yml', 'utf-8')).items;
seeds.skills = YAML.parse(fs.readFileSync('./test/fixture/skill.yml', 'utf-8')).items;

seeds.userCanvasSubmissions = YAML.parse(fs.readFileSync('./test/fixture/user-canvas-submission.yml', 'utf-8')).items;
seeds.teamCanvasSubmissions = YAML.parse(fs.readFileSync('./test/fixture/team-canvas-submission.yml', 'utf-8')).items;
