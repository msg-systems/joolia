import {MigrationInterface, QueryRunner} from "typeorm";

export class CollaborationLink1589184974022 implements MigrationInterface {
    name = 'CollaborationLink1589184974022';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `link_entry` ADD `activityId` varchar(36) NULL", undefined);
        await queryRunner.query("ALTER TABLE `link_entry` ADD CONSTRAINT `FK_6a575e9ca59cca86fa3dc438f68` FOREIGN KEY (`activityId`) REFERENCES `activity`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Currently, we will never rollback a model change, instead the db is restored if something goes wrong and the
        // deployment is rolled back to the previous working version.
    }

}
