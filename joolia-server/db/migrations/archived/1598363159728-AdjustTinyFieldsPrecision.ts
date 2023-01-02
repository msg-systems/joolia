import {MigrationInterface, QueryRunner} from "typeorm";

export class AdjustTinyFieldsPrecision1598363159728 implements MigrationInterface {
    name = 'AdjustTinyFieldsPrecision1598363159728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `admin` `admin` tinyint(1) NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `user` CHANGE `pending` `pending` tinyint(1) NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
