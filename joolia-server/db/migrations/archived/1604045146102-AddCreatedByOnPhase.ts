import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedByOnPhase1604045146102 implements MigrationInterface {
    name = 'AddCreatedByOnPhase1604045146102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `phase` ADD `createdById` varchar(36) NOT NULL", undefined);

        await queryRunner.query(`
            UPDATE phase p
                INNER JOIN format f ON f.id = p.formatId
            SET p.createdById = f.createdById
            WHERE f.createdById IS NOT NULL
        `);

        await queryRunner.query("ALTER TABLE `phase` ADD CONSTRAINT `FK_5f8fe8b1d90254079d2d44dc265` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
