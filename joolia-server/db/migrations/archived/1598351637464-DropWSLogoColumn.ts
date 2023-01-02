import {MigrationInterface, QueryRunner} from "typeorm";

export class DropWSLogoColumn1598351637464 implements MigrationInterface {
    name = 'DropWSLogoColumn1598351637464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `workspace` DROP COLUMN `logo`", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       // Not needed
    }

}
