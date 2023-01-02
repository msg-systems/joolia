import {MigrationInterface, QueryRunner} from "typeorm";

export class MeetingLink1588843260257 implements MigrationInterface {
    name = 'MeetingLink1588843260257';

    public async up(queryRunner: QueryRunner): Promise<void> {

        /**
         * New columns added
         */
        await queryRunner.query("ALTER TABLE `link_entry` ADD `type` enum ('Zoom', 'Skype', 'MSTeams', 'Collaboration', 'KeyVisual') NULL", undefined);
        await queryRunner.query("ALTER TABLE `link_entry` ADD `description` text NULL", undefined);

        // Migrate current data

        await queryRunner.query("UPDATE `link_entry` le " +
          "INNER JOIN `key_visual_entry` kve " +
          "SET le.type = 'KeyVisual' " +
          "WHERE le.id = kve.keyVisualLinkId");

        // Put back not null restriction
        await queryRunner.query("ALTER TABLE `link_entry` CHANGE `type` `type` enum ('Zoom', 'Skype', 'MSTeams', 'Collaboration', 'KeyVisual') NOT NULL", undefined);

        /**
         * Add Format-Link relation
         */
        await queryRunner.query("ALTER TABLE `format` ADD `meetingLinkId` varchar(36) NULL", undefined);
        // Why only appears when TyeORM generates the migration? Bug? It is already covered in REL_9537a50bb4fef08fc83c69d903 down below.
        //await queryRunner.query("ALTER TABLE `format` ADD UNIQUE INDEX `IDX_9537a50bb4fef08fc83c69d903` (`meetingLinkId`)", undefined);
        await queryRunner.query("CREATE UNIQUE INDEX `REL_9537a50bb4fef08fc83c69d903` ON `format` (`meetingLinkId`)", undefined);
        await queryRunner.query("ALTER TABLE `format` ADD CONSTRAINT `FK_9537a50bb4fef08fc83c69d9039` FOREIGN KEY (`meetingLinkId`) REFERENCES `link_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        /**
         * We do not revert code along with the model changes hence this is not needed.
         * The recommended procedure is to revert to the backup fix the migration problem and try again.
         */
    }

}
