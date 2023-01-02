import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedByOnActivity1603982055654 implements MigrationInterface {
    name = 'AddCreatedByOnActivity1603982055654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        /**
         * CreatedBy in Activity is mandatory.
         */
        await queryRunner.query("ALTER TABLE `activity` ADD `createdById` varchar(36) NOT NULL", undefined);

        /**
         * Setting created by from parent Format in Activity that does not have it yet!
         */
        await queryRunner.query(`
            UPDATE activity a 
                INNER JOIN phase p ON p.id = a.phaseId 
                INNER JOIN format f ON f.id = p.formatId 
            SET a.createdById = f.createdById 
            WHERE f.createdById IS NOT NULL`
        );

        /**
         * The rest of this migration is to remove phases that have being created without formatId due to a bug: JOOLIA-2406.
         *
         * These are the phases that will be deleted from the db in prod when this migration runs.
         *
         * Sprint COVID-19: Day 2 : 8028249d-b46f-4a49-be35-5b6d6a2c0da7 (has duplicated)
         * Japas contra COvid : 293631af-34b0-40a9-9b8a-d4c3e851f7e5 (delete it for sure, Leos Test)
         * Dealscore Card : 96732386-eb73-4cde-9267-b7cae87cf5ab (delete?)
         * 1. Get to know your challenge : 4066ca4d-4925-4e92-854d-2e44e68a8261
         * 1. Get to know your challenge : 67b76639-0dba-4461-921e-b5fa9c98f64f
         * 1. Get to know your challenge : 9523f9d5-7e8c-49c3-b8a2-96d0fff28cfc
         * 2. User-centric creative session : a3b6f348-a7aa-4e0b-9f58-7b2e62edf3e7
         * 3. Prototyping : b90a7dc8-943b-4fc4-9af2-b8e19cc1b2de
         * Sprint Young Talent: Day 2 : 67151b71-092d-4314-8116-4c7bfac7dd1e
         * Sprint Young Talent: Day 2 : fc8849e8-b345-49ee-a4a0-988621bed8a5
         */

        /**
         * Triggers will be recreated anyway afterwards.
         * If they are not removed the delete stmts below will fail.
         */
        await queryRunner.query("DROP TRIGGER IF EXISTS activity_ad_tg;");
        await queryRunner.query("DROP TRIGGER IF EXISTS activity_bd_tg;");
        await queryRunner.query("DROP TRIGGER IF EXISTS step_bd_tg;");
        await queryRunner.query("DROP TRIGGER IF EXISTS file_entry_bd_tg;");
        await queryRunner.query("DROP TRIGGER IF EXISTS phase_bd_tg;");

        /**
         * Deleting all resources related to Phases without a parent Format.
         * This situation happened due to a bug. See JOOLIA-2406 to fix it and prevent for happening again.
         */
        await queryRunner.query(`
            DELETE s
            FROM activity a INNER JOIN step s ON s.activityId = a.id
            WHERE a.phaseId IN (SELECT id FROM phase WHERE formatId IS NULL)`);

        await queryRunner.query(`
            DELETE fe
            FROM activity a INNER JOIN file_entry fe on a.id = fe.activityId
            WHERE a.phaseId IN (SELECT id FROM phase WHERE formatId IS NULL)`);

        await queryRunner.query(`
            DELETE a
            FROM activity a
            WHERE a.phaseId IN (SELECT id FROM phase WHERE formatId IS NULL)`);
    
        await queryRunner.query(`DELETE FROM phase WHERE formatId IS NULL`);

        await queryRunner.query("ALTER TABLE `activity` ADD CONSTRAINT `FK_72d2e57f824d488c48281819cd6` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
