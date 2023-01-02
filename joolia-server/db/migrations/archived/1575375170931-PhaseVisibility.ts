/* eslint-disable */
import {MigrationInterface, QueryRunner} from "typeorm";

export class PhaseVisibility1575375170931 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            "ALTER TABLE `phase`" +
            "ADD `visible` tinyint(4) NOT NULL DEFAULT '1'");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            "ALTER TABLE `phase`" +
            "DROP COLUMN `visible`");
    }

}
