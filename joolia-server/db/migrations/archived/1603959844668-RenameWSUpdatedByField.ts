import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameWSUpdatedByField1603959844668 implements MigrationInterface {
    name = 'RenameWSUpdatedByField1603959844668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `workspace` DROP FOREIGN KEY `FK_7a88c01f91d572187ff58ee4bcd`", undefined);
        await queryRunner.query("ALTER TABLE `workspace` DROP INDEX `FK_7a88c01f91d572187ff58ee4bcd`", undefined);
        await queryRunner.query("ALTER TABLE `workspace` CHANGE `updatedById` `createdById` varchar(36) NULL", undefined);

        // Temporary view to simplify migration: lists workspaces with only one single member that will become the WS admin
        await queryRunner.query(`create view single_admin_workspace as
                                        select t.id
                                        from (select w.id,
                                                     (select count(1)
                                                      from workspace_member wm
                                                      where wm.workspaceId = w.id
                                                        and wm.admin = 1) as admins
                                              from workspace w) as t
                                        where t.admins = 1;`, undefined);


        // Sets every single WS member (hence admin) as createdBy in Workspace
        await queryRunner.query(`update workspace w
                                        inner join single_admin_workspace w2 on w.id = w2.id
                                        inner join workspace_member wm on wm.workspaceId = w2.id
                                       set w.createdById = wm.userId
                                       where createdById is null;`, undefined);


        // Sets createdBy manually for WS with more than one admin
        await queryRunner.query(`update workspace w
                                        set w.createdById = (select id from user where email = 'vanessa.hadrbolec@msg.group')
                                       where w.name in ('Innodays Salzburg', 'XT', 'Universität Innsbruck', 'STARTUP.TIROL')
                                       and w.createdById is null;`);


        // Special case: guessing by the name ;)
        await queryRunner.query(`update workspace w
                                        set w.createdById = (select id from user where email = 'natasa.deutinger@fh-salzburg.ac.at')
                                       where w.name in ('Natasa Deutingers Workspace')
                                       and w.createdById is null;`);

        // View is not needed anymore
        await queryRunner.query(`drop view single_admin_workspace;`);

        await queryRunner.query("ALTER TABLE `workspace` CHANGE `createdById` `createdById` varchar(36) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `workspace` ADD CONSTRAINT `FK_fb730da36fb79e21e8fa5f2c303` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
