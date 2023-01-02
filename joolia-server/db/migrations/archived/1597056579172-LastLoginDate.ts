import {MigrationInterface, QueryRunner} from "typeorm";

export class LastLoginDate1597056579172 implements MigrationInterface {
    name = 'LastLoginDate1597056579172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `lastLogin` datetime NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
