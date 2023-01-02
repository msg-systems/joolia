import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBBBToEnum1612250999386 implements MigrationInterface {
    name = 'AddBBBToEnum1612250999386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `link_entry` CHANGE `type` `type` enum ('Zoom', 'Skype', 'MSTeams', 'BBB', 'Collaboration', 'KeyVisual') NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
