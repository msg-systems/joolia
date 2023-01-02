/* eslint-disable */
import {MigrationInterface, QueryRunner} from "typeorm";

export class PhaseTemplateSave1575528621353 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {

        /**
         * 1. Change formatTemplateId to NOT NULL and adjusting type to varchar(36).
         */

        await queryRunner.query("ALTER TABLE `phase_template` DROP FOREIGN KEY `FK_8cdec27ea8473d8af3c8c88e0dd`;");

        await queryRunner.query(
            "ALTER TABLE `phase_template` " +
            "MODIFY `formatTemplateId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL;"
        );

        await queryRunner.query("ALTER TABLE `phase_template` " +
            "ADD CONSTRAINT `FK_8cdec27ea8473d8af3c8c88e0dd` FOREIGN KEY (`formatTemplateId`) " +
            "REFERENCES `format_template`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;");

        /**
         * 2.
         *
         * New relation column with Library with foreign key.
         * New relation column with User with foreign key.
         * New column, duration.
         * FKs added.
         */

        await queryRunner.query(
            "ALTER TABLE `phase_template` " +
            "ADD `libraryId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL, " +
            "ADD `createdById` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL, " +
            "ADD `duration` int(11) NOT NULL DEFAULT '0', " +
            "ADD KEY `FK_b370cb65efedc8fb034ce4bb73d` (`libraryId`), " +
            "ADD KEY `FK_5aa0554d98a13063427f5916675` (`createdById`);"
        );

        /**
         * 3. Populate newly created fields
         */

        await queryRunner.query(
            "UPDATE phase_template pt " +
            "       INNER JOIN format_template ft " +
            "               ON pt.formatTemplateId = ft.id " +
            "SET    pt.createdById = ft.createdById, " +
            "       pt.libraryId = ft.libraryId; ");

        /**
         * 4. Add the FK constraints.
         */

        await queryRunner.query(
            "ALTER TABLE `phase_template` " +
            "ADD CONSTRAINT `FK_5aa0554d98a13063427f5916675` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;" 
        );

        await queryRunner.query(
            "ALTER TABLE `phase_template` " +
            "ADD CONSTRAINT `FK_b370cb65efedc8fb034ce4bb73d` FOREIGN KEY (`libraryId`) REFERENCES `library` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;" 
        );

    }

    public async down(queryRunner: QueryRunner): Promise<any> {

        /**
         *  Reverts 1.
         */

        await queryRunner.query("ALTER TABLE `phase_template` DROP FOREIGN KEY `FK_8cdec27ea8473d8af3c8c88e0dd`;");

        await queryRunner.query(
            "ALTER TABLE `phase_template` " +
            "MODIFY `formatTemplateId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL;"
        );

        await queryRunner.query("ALTER TABLE `phase_template` " +
            "ADD CONSTRAINT `FK_8cdec27ea8473d8af3c8c88e0dd` FOREIGN KEY (`formatTemplateId`) " +
            "REFERENCES `format_template`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;");

        /**
         * Reverts 2. 3. 4.
         */

        await queryRunner.query("ALTER TABLE phase_template " +
            "DROP COLUMN libraryId, " +
            "DROP COLUMN createdById, " +
            "DROP COLUMN duration, " +
            "DROP FOREIGN KEY `FK_b370cb65efedc8fb034ce4bb73d`, " +
            "DROP FOREIGN KEY `FK_5aa0554d98a13063427f5916675`;");
    }

}
