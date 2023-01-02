import {MigrationInterface, QueryRunner} from "typeorm";

export class CanvasChanges1598508950887 implements MigrationInterface {
    name = 'CanvasChanges1598508950887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `canvas` ADD `canvasType` enum ('process', 'questionnaire', 'business_canvas') NOT NULL DEFAULT 'business_canvas'", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
