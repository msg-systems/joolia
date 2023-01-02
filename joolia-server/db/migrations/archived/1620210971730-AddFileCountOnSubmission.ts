import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFileCountOnSubmission1620210971730 implements MigrationInterface {
    name = 'AddFileCountOnSubmission1620210971730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` ADD `fileCount` int NOT NULL DEFAULT 0");

        await queryRunner.query(`
            UPDATE submission a
                INNER JOIN (SELECT  b.id,
                                    Count(c.submissionid) AS count
                            FROM    submission b
                                    LEFT JOIN file_entry c
                                           ON b.id = c.submissionid
                            GROUP   BY b.id) d
                        ON a.id = d.id
            SET a.fileCount = d.count
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
