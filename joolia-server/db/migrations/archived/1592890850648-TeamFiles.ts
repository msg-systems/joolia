import {MigrationInterface, QueryRunner} from "typeorm";

export class TeamFiles1592890850648 implements MigrationInterface {
    name = 'TeamFiles1592890850648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `file_entry` ADD `teamId` varchar(36) NULL", undefined);
        await queryRunner.query("ALTER TABLE `file_entry` ADD CONSTRAINT `FK_d49913f0c49fd19c3ba3bbed0d4` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
