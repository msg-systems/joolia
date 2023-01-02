import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColorFieldToCanvasSubmissionModel1614949276468 implements MigrationInterface {
    name = 'AddColorFieldToCanvasSubmissionModel1614949276468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `canvas_submission` ADD `color` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
