import {MigrationInterface, QueryRunner} from "typeorm";

export class WorkspaceMember1596791828721 implements MigrationInterface {
    name = 'WorkspaceMember1596791828721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `workspace_member` (`admin` tinyint NOT NULL DEFAULT 0, `userId` varchar(36) NOT NULL, `workspaceId` varchar(36) NOT NULL, PRIMARY KEY (`userId`, `workspaceId`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `workspace_member` ADD CONSTRAINT `FK_03ce416ae83c188274dec61205c` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `workspace_member` ADD CONSTRAINT `FK_15b622cbfffabc30d7dbc52fede` FOREIGN KEY (`workspaceId`) REFERENCES `workspace`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);

        await queryRunner.query("INSERT INTO `workspace_member` (`admin`, `userId`, `workspaceId`) SELECT 0, `userId`, `workspaceId` FROM workspace_members_user", undefined);
        await queryRunner.query("UPDATE `workspace_member` wm, (SELECT workspaceId, count(userId) AS cnt FROM `workspace_members_user` GROUP BY workspaceId) AS wmuCount SET wm.admin = 1 WHERE wm.workspaceId = wmuCount.workspaceId AND wmuCount.cnt = 1", undefined);

        await queryRunner.query("DROP TABLE `workspace_members_user`", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
