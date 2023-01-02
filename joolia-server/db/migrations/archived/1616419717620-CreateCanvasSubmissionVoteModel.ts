import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCanvasSubmissionVoteModel1616419717620 implements MigrationInterface {
    name = 'CreateCanvasSubmissionVoteModel1616419717620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `canvas_submission_vote` (`id` varchar(36) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `canvasSubmissionId` varchar(36) NOT NULL, `createdById` varchar(36) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `canvas_submission_vote` ADD CONSTRAINT `FK_491cfd45e343efed4f6daedce6f` FOREIGN KEY (`canvasSubmissionId`) REFERENCES `canvas_submission`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `canvas_submission_vote` ADD CONSTRAINT `FK_1b1568219be53c5950e55bdf18a` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
