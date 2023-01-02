import {MigrationInterface, QueryRunner} from "typeorm";

export class CanvasSlotChanges1597985735567 implements MigrationInterface {
    name = 'CanvasSlotChanges1597985735567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `canvas_slot` ADD `sortOrder` int NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `canvas_slot` ADD `slotType` enum ('title_only', 'title_and_submissions', 'submissions_only') NOT NULL DEFAULT 'title_and_submissions'", undefined);
        await queryRunner.query("ALTER TABLE `canvas_slot` CHANGE `title` `title` varchar(255) NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
