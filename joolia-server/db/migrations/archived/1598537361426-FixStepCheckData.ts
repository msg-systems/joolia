import {MigrationInterface, QueryRunner} from "typeorm";

export class FixStepCheckData1598537361426 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        /**
         * Getting rid of the bogus relationType 'StepCheck'
         */
        await queryRunner.manager.query(`update step_check s set s.relationType='team' where s.relationType = 'StepCheck' and teamId is not null and memberId is null;`);
        await queryRunner.manager.query(`update step_check s set s.relationType='member' where s.relationType = 'StepCheck' and memberId is not null and teamId is null;`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        //
    }

}
