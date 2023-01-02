import {MigrationInterface, QueryRunner} from "typeorm";

export class FixTableInharitances1598880487703 implements MigrationInterface {
    name = 'FixTableInharitances1598880487703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` MODIFY `ownerType` enum ('Team', 'User') NOT NULL;", undefined);
        await queryRunner.query("ALTER TABLE `key_visual_entry` MODIFY `relationType` enum ('keyVisualFile', 'keyVisualLink') NOT NULL;", undefined);
        await queryRunner.query("ALTER TABLE `file_entry` MODIFY `ownerType` enum ('FormatEntry', 'ActivityEntry', 'SubmissionEntry', 'KeyVisual', 'FormatTemplateEntry', 'ActivityTemplateEntry', 'AvatarEntry', 'TeamAvatarEntry', 'TeamEntry') NOT NULL;", undefined);
        await queryRunner.query("ALTER TABLE `canvas` MODIFY `ownerType` enum ('ActivityCanvas', 'ActivityTemplateCanvas') NOT NULL;", undefined);
        await queryRunner.query("ALTER TABLE `canvas_submission` MODIFY `ownerType` enum ('Team', 'User') NOT NULL;", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }

}
