import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLastAccessedAtFieldToLinkModel1613560111234 implements MigrationInterface {
    name = 'AddLastAccessedAtFieldToLinkModel1613560111234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `link_entry` ADD `lastAccessedAt` datetime NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
