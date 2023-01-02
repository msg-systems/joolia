/* eslint-disable */
import {MigrationInterface, QueryRunner} from "typeorm";

export class TemplateCategory1581443113897 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `activity_template` ADD `category` enum ('explore', 'ideate', 'test', 'prototype', 'implement') NOT NULL DEFAULT 'explore' AFTER `position`", undefined);
        await queryRunner.query("ALTER TABLE `format_template` ADD `category` enum ('explore', 'ideate', 'test', 'prototype', 'implement') NOT NULL DEFAULT 'explore' AFTER `description`", undefined);
        await queryRunner.query("ALTER TABLE `phase_template` ADD `category` enum ('explore', 'ideate', 'test', 'prototype', 'implement') NOT NULL DEFAULT 'explore' AFTER `durationUnit`", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        // Currently, we will never rollback a model change, instead the db is restored if something goes wrong and the
        // deployment is rolled back to the previous working version.
    }

}
