import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCanvasModels1595325173741 implements MigrationInterface {
    name = 'CreateCanvasModels1595325173741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `canvas` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `columns` int NOT NULL, `rows` int NOT NULL, `ownerType` varchar(255) NOT NULL, `activityId` varchar(36) NULL, `activityTemplateId` varchar(36) NULL, INDEX `IDX_136e338da6a82908a60ed9f009` (`ownerType`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `canvas_submission` (`id` varchar(36) NOT NULL, `ownerType` varchar(255) NOT NULL, `content` text NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `slotId` varchar(36) NULL, `createdById` varchar(36) NULL, `teamId` varchar(36) NULL, `userId` varchar(36) NULL, INDEX `IDX_d1c494d76888e0f02aa4d9c4b4` (`ownerType`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `canvas_slot` (`id` varchar(36) NOT NULL, `canvasId` varchar(36) NOT NULL, `title` varchar(255) NOT NULL, `row` int NOT NULL, `column` int NOT NULL, `rowSpan` int NOT NULL, `columnSpan` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `canvas` ADD CONSTRAINT `FK_999ae872880e4c56653f7ce0aad` FOREIGN KEY (`activityId`) REFERENCES `activity`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `canvas` ADD CONSTRAINT `FK_56eb2027cfb50f1b339c669be25` FOREIGN KEY (`activityTemplateId`) REFERENCES `activity_template`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `canvas_submission` ADD CONSTRAINT `FK_7054132150119d7df0414a75e32` FOREIGN KEY (`slotId`) REFERENCES `canvas_slot`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `canvas_submission` ADD CONSTRAINT `FK_75d89114923ef3958073a795578` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `canvas_submission` ADD CONSTRAINT `FK_d22dd191a322668ffd1b9a49c01` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `canvas_submission` ADD CONSTRAINT `FK_53c37c4bffe05790b21d620b2b0` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `canvas_slot` ADD CONSTRAINT `FK_5ff52738fb1d9655539109d4b2c` FOREIGN KEY (`canvasId`) REFERENCES `canvas`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
