import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMeetingLinkToTeam1612770135101 implements MigrationInterface {
    name = 'AddMeetingLinkToTeam1612770135101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `team` ADD `meetingLinkId` varchar(36) NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_8d492fbab912da2d67b6870246` ON `team` (`meetingLinkId`)");
        await queryRunner.query("ALTER TABLE `team` ADD CONSTRAINT `FK_8d492fbab912da2d67b68702463` FOREIGN KEY (`meetingLinkId`) REFERENCES `link_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
