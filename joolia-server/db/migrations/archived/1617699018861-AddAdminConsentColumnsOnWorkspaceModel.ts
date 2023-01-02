import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAdminConsentColumnsOnWorkspaceModel1617699018861 implements MigrationInterface {
    name = 'AddAdminConsentColumnsOnWorkspaceModel1617699018861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `workspace` ADD `tenant` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `workspace` ADD `domain` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `workspace` ADD `consentDate` datetime NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
