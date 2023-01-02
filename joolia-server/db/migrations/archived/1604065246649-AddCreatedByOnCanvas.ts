import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedByOnCanvas1604065246649 implements MigrationInterface {
    name = 'AddCreatedByOnCanvas1604065246649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `canvas` ADD `createdById` varchar(36) NOT NULL");

        await queryRunner.query(`
            UPDATE canvas c
                INNER JOIN activity a ON a.id = c.activityId
            SET c.createdById = a.createdById
            WHERE a.createdById IS NOT NULL`
        );

        await queryRunner.query(`
            UPDATE canvas c
                INNER JOIN activity_template a ON a.id = c.activityTemplateId
            SET c.createdById = a.createdById
            WHERE a.createdById IS NOT NULL;
        `);

        await queryRunner.query("ALTER TABLE `canvas` ADD CONSTRAINT `FK_d7345c1d54493a2f9c46d6a9f70` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
