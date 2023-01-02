import {MigrationInterface, QueryRunner} from "typeorm";

/**
 * Dear colleague from future, in case you are looking here how migrations were performed in the past please
 * read this before: https://github.com/typeorm/typeorm/issues/3357
 *
 * I left the commented DROP statements on purpose, perhaps I grab your attention ;)
 *
 * Yes a lot of changes. All these changes were part of JOOLIA-1642.
 *
 */
export class Refactoring1586622083225 implements MigrationInterface {
    name = 'Refactoring1586622083225';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `phase_template` DROP COLUMN `duration`", undefined);

        await queryRunner.query("ALTER TABLE `activity` DROP FOREIGN KEY `FK_0dabec57ca0bb0eb76795ac5c65`", undefined);

        //await queryRunner.query("ALTER TABLE `activity` DROP COLUMN `phaseId`", undefined);
        await queryRunner.query("ALTER TABLE `activity` MODIFY `phaseId` varchar(36) NULL", undefined);

        await queryRunner.query("ALTER TABLE `activity_template` DROP FOREIGN KEY `FK_ad613fe4c5226febbe695256949`", undefined);
        await queryRunner.query("ALTER TABLE `activity_template` DROP FOREIGN KEY `FK_42c4a68ec6c9fb1448ef83e5302`", undefined);

        //await queryRunner.query("ALTER TABLE `activity_template` DROP COLUMN `phaseTemplateId`", undefined);
        await queryRunner.query("ALTER TABLE `activity_template` MODIFY `phaseTemplateId` varchar(36) NULL AFTER `createdById`", undefined);

        //await queryRunner.query("ALTER TABLE `activity_template` DROP COLUMN `libraryId`", undefined);
        await queryRunner.query("ALTER TABLE `activity_template` MODIFY `libraryId` varchar(36) NULL AFTER `phaseTemplateId`", undefined);

        await queryRunner.query("ALTER TABLE `phase` DROP FOREIGN KEY `FK_67a5aa9ed1ead56a6c7f7578e31`", undefined);

        //await queryRunner.query("ALTER TABLE `phase` DROP COLUMN `formatId`", undefined);
        await queryRunner.query("ALTER TABLE `phase` MODIFY `formatId` varchar(36) NULL AFTER `visible`", undefined);

        await queryRunner.query("ALTER TABLE `step` DROP FOREIGN KEY `FK_671d84b14ab2849981245f8ee98`", undefined);

        //await queryRunner.query("ALTER TABLE `step` DROP COLUMN `activityId`", undefined);
        await queryRunner.query("ALTER TABLE `step` MODIFY `activityId` varchar(36) NOT NULL", undefined);

        await queryRunner.query("ALTER TABLE `feedback` DROP FOREIGN KEY `FK_ae2f58b7d0fa9be21519af3d457`", undefined);
        await queryRunner.query("ALTER TABLE `feedback` DROP FOREIGN KEY `FK_9243a8e1826e8259480000a8c22`", undefined);

        await queryRunner.query("ALTER TABLE `feedback` MODIFY `submissionId` varchar(36) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `feedback` MODIFY `createdById` varchar(36) NOT NULL", undefined);

        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_bee022f639ff5b298975dfaa37b`", undefined);
        await queryRunner.query("ALTER TABLE `submission` MODIFY `createdById` varchar(36) NOT NULL", undefined);

        await queryRunner.query("ALTER TABLE `step_check` DROP FOREIGN KEY `FK_6f80c18054d24123637ed6782a6`", undefined);
        await queryRunner.query("ALTER TABLE `step_check` DROP FOREIGN KEY `FK_6e08f918357bdc4cf3e915f28d9`", undefined);
        await queryRunner.query("ALTER TABLE `step_check` DROP FOREIGN KEY `FK_42b9970a42973a4bd1449e26d05`", undefined);

        await queryRunner.query("ALTER TABLE `step_check` MODIFY `stepId` varchar(36) NOT NULL AFTER `relationType`", undefined);
        //await queryRunner.query("ALTER TABLE `step_check` DROP COLUMN `teamId`", undefined);
        await queryRunner.query("ALTER TABLE `step_check` MODIFY `teamId` varchar(36) NULL", undefined);
        //await queryRunner.query("ALTER TABLE `step_check` DROP COLUMN `memberId`", undefined);
        await queryRunner.query("ALTER TABLE `step_check` MODIFY `memberId` varchar(36) NULL", undefined);

        await queryRunner.query("ALTER TABLE `step_template` DROP FOREIGN KEY `FK_2115e33280cccb6fdb3cdf666c5`", undefined);

        //await queryRunner.query("ALTER TABLE `step_template` DROP COLUMN `activityTemplateId`", undefined);
        //await queryRunner.query("ALTER TABLE `step_template` ADD `activityTemplateId` varchar(36) NULL", undefined);
        await queryRunner.query("ALTER TABLE `step_template` MODIFY `activityTemplateId` varchar(36) NULL", undefined);

        await queryRunner.query("ALTER TABLE `activity` ADD CONSTRAINT `FK_0dabec57ca0bb0eb76795ac5c65` FOREIGN KEY (`phaseId`) REFERENCES `phase`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `activity_template` ADD CONSTRAINT `FK_ad613fe4c5226febbe695256949` FOREIGN KEY (`phaseTemplateId`) REFERENCES `phase_template`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `activity_template` ADD CONSTRAINT `FK_42c4a68ec6c9fb1448ef83e5302` FOREIGN KEY (`libraryId`) REFERENCES `library`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `phase` ADD CONSTRAINT `FK_67a5aa9ed1ead56a6c7f7578e31` FOREIGN KEY (`formatId`) REFERENCES `format`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `step` ADD CONSTRAINT `FK_671d84b14ab2849981245f8ee98` FOREIGN KEY (`activityId`) REFERENCES `activity`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `feedback` ADD CONSTRAINT `FK_ae2f58b7d0fa9be21519af3d457` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `feedback` ADD CONSTRAINT `FK_9243a8e1826e8259480000a8c22` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_bee022f639ff5b298975dfaa37b` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `step_check` ADD CONSTRAINT `FK_6f80c18054d24123637ed6782a6` FOREIGN KEY (`stepId`) REFERENCES `step`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `step_check` ADD CONSTRAINT `FK_6e08f918357bdc4cf3e915f28d9` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `step_check` ADD CONSTRAINT `FK_42b9970a42973a4bd1449e26d05` FOREIGN KEY (`memberId`) REFERENCES `format_member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `step_template` ADD CONSTRAINT `FK_2115e33280cccb6fdb3cdf666c5` FOREIGN KEY (`activityTemplateId`) REFERENCES `activity_template`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Currently, we will never rollback a model change, instead the db is restored if something goes wrong and the
        // deployment is rolled back to the previous working version.
    }

}
