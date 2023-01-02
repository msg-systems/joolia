import {MigrationInterface, QueryRunner} from "typeorm";

export class DropFormatUpdatedByField1603957676224 implements MigrationInterface {
    name = 'DropFormatUpdatedByField1603957676224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `format` DROP FOREIGN KEY `FK_b6a7246f38cbfd6ad86bc5d2134`", undefined);
        await queryRunner.query("ALTER TABLE `format` DROP COLUMN `updatedById`", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
