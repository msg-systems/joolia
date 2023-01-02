import {MigrationInterface, QueryRunner} from "typeorm";

export class SubmissionRating1594187400192 implements MigrationInterface {
    name = 'SubmissionRating1594187400192';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE feedback DROP FOREIGN KEY FK_ae2f58b7d0fa9be21519af3d457;');
        await queryRunner.query('ALTER TABLE feedback DROP FOREIGN KEY FK_9243a8e1826e8259480000a8c22;');
        await queryRunner.query("RENAME TABLE `feedback` TO `user_comment`", undefined);
        await queryRunner.query("ALTER TABLE `user_comment` RENAME INDEX `FK_ae2f58b7d0fa9be21519af3d457` TO `FK_65c3acbca493830ded5f05b91be`", undefined);
        await queryRunner.query("ALTER TABLE `user_comment` RENAME INDEX `FK_9243a8e1826e8259480000a8c22` TO `FK_a1e7c2470588154415ce0b1d9fe`", undefined);
        await queryRunner.query("ALTER TABLE `user_comment` DROP COLUMN `rating`", undefined);
        await queryRunner.query(
            'ALTER TABLE `user_comment` ADD CONSTRAINT FK_65c3acbca493830ded5f05b91be FOREIGN KEY (`submissionId`) REFERENCES submission(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        await queryRunner.query(
            'ALTER TABLE `user_comment` ADD CONSTRAINT FK_a1e7c2470588154415ce0b1d9fe FOREIGN KEY (`createdById`) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        await queryRunner.query("CREATE TABLE `user_rating` (`id` varchar(36) NOT NULL, `rating` float(12) NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `submissionId` varchar(36) NOT NULL, `createdById` varchar(36) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `user_rating` ADD CONSTRAINT `FK_18b9da3161effb8e86f8180b60d` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `user_rating` ADD CONSTRAINT `FK_d03033aa801991e9cd2f43eb996` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
