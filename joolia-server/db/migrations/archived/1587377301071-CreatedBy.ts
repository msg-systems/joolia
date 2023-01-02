import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatedBy1587377301071 implements MigrationInterface {
    name = 'CreatedBy1587377301071';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `format` DROP FOREIGN KEY `FK_2939fe51b1f4236f5e2bf2202ab`", undefined);
        await queryRunner.query("ALTER TABLE `format` CHANGE `createdById` `createdById` varchar(36) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `format` ADD CONSTRAINT `FK_2939fe51b1f4236f5e2bf2202ab` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Currently, we will never rollback a model change, instead the db is restored if something goes wrong and the
        // deployment is rolled back to the previous working version.
    }

}
