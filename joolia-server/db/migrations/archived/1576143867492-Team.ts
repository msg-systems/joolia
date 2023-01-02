/* eslint-disable */
import {MigrationInterface, QueryRunner} from "typeorm";

export class Team1576143867492 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `team` DROP FOREIGN KEY `FK_17034160e72b6913d9ede3cd002`;");
        await queryRunner.query("ALTER TABLE `team` DROP INDEX `FK_17034160e72b6913d9ede3cd002`;");

        await queryRunner.query("ALTER TABLE `team` " +
            "MODIFY `formatId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL, " +
            "ADD `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER name, " +
            "ADD `createdById` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL AFTER createdAt, " +
            "ADD `avatarId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER formatId, " +
            "ADD UNIQUE KEY `IDX_16e72ffd36fc94b45591bbcb4f` (`name`, `createdById`, `formatId`), " +
            "ADD UNIQUE KEY `REL_e9780bcaf4dc375f939fe904f6` (`avatarId`); ");

        /**
         * Populate creator (createdById) with the Organizer from the Format of the Team.
         * There are many formats with more than one organizer and as we do not have any preference over one or another
         * the pick will be left to the db engine, unpredictable.
         */
        await queryRunner.query("UPDATE `team` t " +
            "INNER JOIN `format_member` fm ON t.formatId = fm.formatId " +
            "SET t.createdById = fm.userId " +
            "WHERE fm.role = 'organizer';");

        await queryRunner.query("ALTER TABLE `team` ADD CONSTRAINT `FK_17034160e72b6913d9ede3cd002` FOREIGN KEY (`formatId`) REFERENCES `format`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;");
        await queryRunner.query("ALTER TABLE `team` ADD CONSTRAINT `FK_e9780bcaf4dc375f939fe904f6d` FOREIGN KEY (`avatarId`) REFERENCES `file_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;");
        await queryRunner.query("ALTER TABLE `team` ADD CONSTRAINT `FK_3a93fbdeba4e1e9e47fec6bada9` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;");
    }

    /* eslint-disable */
    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
