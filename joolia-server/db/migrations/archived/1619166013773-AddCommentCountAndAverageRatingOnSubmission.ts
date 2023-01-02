import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCommentCountAndAverageRatingOnSubmission1619166013773 implements MigrationInterface {
    name = 'AddCommentCountAndAverageRatingOnSubmission1619166013773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` ADD `commentCount` int NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `submission` ADD `averageRating` float(12) NOT NULL DEFAULT 0");

        await queryRunner.query(`
            UPDATE submission a
                INNER JOIN (SELECT  b.id,
                                    Count(c.submissionid) AS count
                            FROM    submission b
                                    LEFT JOIN user_comment c
                                           ON b.id = c.submissionid
                            GROUP   BY b.id) d
                        ON a.id = d.id
            SET a.commentcount = d.count
        `);

        await queryRunner.query(`
            UPDATE submission a
                INNER JOIN (SELECT  b.id,
                                    Avg(COALESCE(c.rating, 0)) AS avg
                            FROM    submission b
                                    LEFT JOIN user_rating c
                                           ON b.id = c.submissionid
                            GROUP   BY b.id) d
                        ON  a.id = d.id
            SET a.averagerating = d.avg 
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
