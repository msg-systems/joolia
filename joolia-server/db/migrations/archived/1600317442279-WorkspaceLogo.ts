import {MigrationInterface, QueryRunner} from "typeorm";

export class WorkspaceLogo1600317442279 implements MigrationInterface {
    name = 'WorkspaceLogo1600317442279';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `workspace` ADD `logoId` varchar(36) NULL", undefined);
        //await queryRunner.query("ALTER TABLE `workspace` ADD UNIQUE INDEX `IDX_4d870f349c930d1125efb1a1f5` (`logoId`)", undefined);
        //await queryRunner.query("ALTER TABLE `user` CHANGE `admin` `admin` tinyint(1) NOT NULL DEFAULT 0", undefined);
        //await queryRunner.query("ALTER TABLE `user` CHANGE `pending` `pending` tinyint(1) NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `file_entry` CHANGE `ownerType` `ownerType` enum ('FormatEntry', 'ActivityEntry', 'SubmissionEntry', 'KeyVisual', 'FormatTemplateEntry', 'ActivityTemplateEntry', 'AvatarEntry', 'TeamAvatarEntry', 'TeamEntry', 'WorkspaceLogo') NOT NULL", undefined);
        await queryRunner.query("CREATE UNIQUE INDEX `REL_4d870f349c930d1125efb1a1f5` ON `workspace` (`logoId`)", undefined);
        await queryRunner.query("ALTER TABLE `workspace` ADD CONSTRAINT `FK_4d870f349c930d1125efb1a1f55` FOREIGN KEY (`logoId`) REFERENCES `file_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
