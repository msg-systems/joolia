import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserSkills1597128416578 implements MigrationInterface {
    name = 'AddUserSkills1597128416578';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE `user_skill` (`skillId` varchar(36) NOT NULL, `userId` varchar(36) NOT NULL, PRIMARY KEY (`skillId`, `userId`)) ENGINE=InnoDB', undefined);
        await queryRunner.query('CREATE TABLE `skill` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB', undefined);
        await queryRunner.query("ALTER TABLE `skill` ADD UNIQUE INDEX `IDX_0f49a593960360f6f85b692aca` (`name`)", undefined);
        await queryRunner.query('ALTER TABLE `user_skill` ADD CONSTRAINT `FK_49db81d31fc330a905af3c01205` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION', undefined);
        await queryRunner.query('ALTER TABLE `user_skill` ADD CONSTRAINT `FK_03260daf2df95f4492cc8eb00e6` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
