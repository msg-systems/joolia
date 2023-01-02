import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedByOnStep1604046538421 implements MigrationInterface {
    name = 'AddCreatedByOnStep1604046538421'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `step` ADD `createdById` varchar(36) NOT NULL", undefined);

        await queryRunner.query(`
            UPDATE step s
                INNER JOIN activity a ON a.id = s.activityId
            SET s.createdById = a.createdById
            WHERE a.createdById IS NOT NULL;
        `);

        await queryRunner.query("ALTER TABLE `step` ADD CONSTRAINT `FK_e1808be8826dd1ee36662e77953` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
