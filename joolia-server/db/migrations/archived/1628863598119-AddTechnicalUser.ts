import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTechnicalUser1628863598119 implements MigrationInterface {
    name = 'AddTechnicalUser1628863598119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `format` ADD `containsTechnicalUser` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `format_member` CHANGE `role` `role` enum ('organizer', 'participant', 'technical') NOT NULL DEFAULT 'participant'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
