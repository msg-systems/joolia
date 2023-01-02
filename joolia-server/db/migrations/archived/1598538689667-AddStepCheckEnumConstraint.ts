import {MigrationInterface, QueryRunner} from "typeorm";

export class AddStepCheckEnumConstraint1598538689667 implements MigrationInterface {
    name = 'AddStepCheckEnumConstraint1598538689667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        /**
         * Adding enum constraint
         */
        await queryRunner.query("ALTER TABLE `step_check` MODIFY `relationType` enum ('member', 'team') NOT NULL;", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
