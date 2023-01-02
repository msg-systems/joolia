import {MigrationInterface, QueryRunner} from "typeorm";

export class CustomCanvas1601902058115 implements MigrationInterface {
    name = 'CustomCanvas1601902058115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `canvas` ADD `status` varchar(16) NOT NULL DEFAULT 'draft'", undefined);
        await queryRunner.query("ALTER TABLE `canvas` CHANGE `canvasType` `canvasType` enum ('process', 'questionnaire', 'business_canvas', 'custom_canvas') NOT NULL DEFAULT 'business_canvas'", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
