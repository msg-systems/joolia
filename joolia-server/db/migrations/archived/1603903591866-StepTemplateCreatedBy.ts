import {MigrationInterface, QueryRunner} from "typeorm";

export class StepTemplateCreatedBy1603903591866 implements MigrationInterface {
    name = 'StepTemplateCreatedBy1603903591866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `step_template` ADD `createdById` varchar(36) NOT NULL", undefined);

        /**
         * Setting createdBy as the same as parent activity.
         */
        await queryRunner.query("UPDATE step_template s INNER JOIN activity_template a ON a.id = s.activityTemplateId SET s.createdById = a.createdById WHERE a.createdById IS NOT NULL");

        await queryRunner.query("ALTER TABLE `step_template` ADD CONSTRAINT `FK_922fcbff45ffa5c0e08e3bf5ae4` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
