/* eslint-disable */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Feedback1573203678800 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            ' CREATE TABLE `feedback` (' +
                '   `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,' +
                "   `rating` float NOT NULL DEFAULT '0'," +
                '   `comment` text COLLATE utf8mb4_unicode_ci,' +
                '   `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),' +
                '   `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),' +
                '   `submissionId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,' +
                '   `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,' +
                '   PRIMARY KEY (`id`),' +
                '   KEY `FK_ae2f58b7d0fa9be21519af3d457` (`submissionId`),' +
                '   KEY `FK_9243a8e1826e8259480000a8c22` (`createdById`),' +
                '   CONSTRAINT `FK_9243a8e1826e8259480000a8c22` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,' +
                '   CONSTRAINT `FK_ae2f58b7d0fa9be21519af3d457` FOREIGN KEY (`submissionId`) REFERENCES `submission` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION' +
                ' )'
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('DROP TABLE feedback;');
    }
}
