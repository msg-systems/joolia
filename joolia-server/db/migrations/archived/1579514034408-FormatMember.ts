/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class FormatMember1579514034408 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `format_member` DROP FOREIGN KEY `FK_0eb07f7750a05c6baab577030f0`;");
        await queryRunner.query("ALTER TABLE `format_member` DROP INDEX `FK_0eb07f7750a05c6baab577030f0`;");
        await queryRunner.query("ALTER TABLE `format_member` DROP FOREIGN KEY `FK_6d9ea664eed9b4e67b593f7b381`;");
        await queryRunner.query("ALTER TABLE `format_member` DROP INDEX `FK_6d9ea664eed9b4e67b593f7b381`;");

        await queryRunner.query(
            "ALTER TABLE `format_member` " +
            "MODIFY `userId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL, " +
            "MODIFY `formatId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL, " +
            "ADD CONSTRAINT `IDX_ac0e5a6a156eda6c05795e0f4c` UNIQUE (`userId`, `formatId`), " +
            "ADD CONSTRAINT `FK_6d9ea664eed9b4e67b593f7b381` FOREIGN KEY (`formatId`) REFERENCES `format`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION, " +
            "ADD CONSTRAINT `FK_0eb07f7750a05c6baab577030f0` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;"
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        /**
         * We do not revert code along with the model changes hence this is not needed.
         * The recommended procedure is to revert to the backup fix the migration problem and try again.
         */
    }

}
