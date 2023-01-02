/* eslint-disable */
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ActivityFieldsAdjustments1570177527255 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        // activity.keyVisualId type change
        await queryRunner.query('ALTER TABLE activity DROP FOREIGN KEY FK_356066c9372dcaca0641a994d8b;');
        await queryRunner.query('ALTER TABLE activity MODIFY keyVisualId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE activity ADD CONSTRAINT FK_356066c9372dcaca0641a994d8b FOREIGN KEY (keyVisualId) REFERENCES key_visual_entry(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        // activity.configurationId type change
        await queryRunner.query('ALTER TABLE activity DROP FOREIGN KEY FK_844176150b3c0bd59e839318b8b;');
        await queryRunner.query('ALTER TABLE activity MODIFY configurationId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE activity ADD CONSTRAINT FK_844176150b3c0bd59e839318b8b FOREIGN KEY (configurationId) REFERENCES activity_configuration(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        // activity.phaseId constraint adjustment
        await queryRunner.query('ALTER TABLE activity DROP FOREIGN KEY FK_0dabec57ca0bb0eb76795ac5c65;');
        await queryRunner.query(
            'ALTER TABLE activity ADD CONSTRAINT FK_0dabec57ca0bb0eb76795ac5c65 FOREIGN KEY (phaseId) REFERENCES phase(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // activity_template.keyVisualId type change
        await queryRunner.query('ALTER TABLE activity_template DROP FOREIGN KEY FK_73a632cf577758881b141740506;');
        await queryRunner.query('ALTER TABLE activity_template MODIFY keyVisualId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE activity_template ADD CONSTRAINT FK_73a632cf577758881b141740506 FOREIGN KEY (keyVisualId) REFERENCES key_visual_entry(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        // activity_template.configurationId type change
        await queryRunner.query('ALTER TABLE activity_template DROP FOREIGN KEY FK_200804ae06ba8a20bb7150b5958;');
        await queryRunner.query('ALTER TABLE activity_template MODIFY configurationId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE activity_template ADD CONSTRAINT FK_200804ae06ba8a20bb7150b5958 FOREIGN KEY (configurationId) REFERENCES activity_configuration(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        // activity_template.createById type change
        await queryRunner.query('ALTER TABLE activity_template DROP FOREIGN KEY FK_f6331a627be054769c5f64d35ad;');
        await queryRunner.query('ALTER TABLE activity_template MODIFY createdById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE activity_template ADD CONSTRAINT FK_f6331a627be054769c5f64d35ad FOREIGN KEY (createdById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        // update constraints
        await queryRunner.query('ALTER TABLE activity_template DROP FOREIGN KEY FK_42c4a68ec6c9fb1448ef83e5302;');
        await queryRunner.query(
            'ALTER TABLE activity_template ADD CONSTRAINT FK_42c4a68ec6c9fb1448ef83e5302 FOREIGN KEY (libraryId) REFERENCES library(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        await queryRunner.query('ALTER TABLE activity_template DROP FOREIGN KEY FK_ad613fe4c5226febbe695256949;');
        await queryRunner.query(
            'ALTER TABLE activity_template ADD CONSTRAINT FK_ad613fe4c5226febbe695256949 FOREIGN KEY (phaseTemplateId) REFERENCES phase_template(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // file_entry.createdById type change
        await queryRunner.query('ALTER TABLE file_entry DROP FOREIGN KEY FK_ac16fa13100db23032124defbd9;');
        await queryRunner.query('ALTER TABLE file_entry MODIFY createdById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE file_entry ADD CONSTRAINT FK_ac16fa13100db23032124defbd9 FOREIGN KEY (createdById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // file_entry.formatId type change
        await queryRunner.query('ALTER TABLE file_entry DROP FOREIGN KEY FK_178926c82dc5fadff358f7fc4bf;');
        await queryRunner.query('ALTER TABLE file_entry MODIFY formatId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE file_entry ADD CONSTRAINT FK_178926c82dc5fadff358f7fc4bf FOREIGN KEY (formatId) REFERENCES format(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // file_entry.formatTemplateId type change
        await queryRunner.query('ALTER TABLE file_entry DROP FOREIGN KEY FK_063811879a79ea813e5aac6b482;');
        await queryRunner.query('ALTER TABLE file_entry MODIFY formatTemplateId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE file_entry ADD CONSTRAINT FK_063811879a79ea813e5aac6b482 FOREIGN KEY (formatTemplateId) REFERENCES format_template(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // file_entry.submissionId type change
        await queryRunner.query('ALTER TABLE file_entry DROP FOREIGN KEY FK_0cab48793490256ecc9bee2d828;');
        await queryRunner.query('ALTER TABLE file_entry MODIFY submissionId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE file_entry ADD CONSTRAINT FK_0cab48793490256ecc9bee2d828 FOREIGN KEY (submissionId) REFERENCES submission(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // file_entry.activityTemplateId type change
        await queryRunner.query('ALTER TABLE file_entry DROP FOREIGN KEY FK_12d3d6b669ad1fe9776346eeb3b;');
        await queryRunner.query('ALTER TABLE file_entry MODIFY activityTemplateId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE file_entry ADD CONSTRAINT FK_12d3d6b669ad1fe9776346eeb3b FOREIGN KEY (activityTemplateId) REFERENCES activity_template(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // file_entry.activityId type change
        await queryRunner.query('ALTER TABLE file_entry DROP FOREIGN KEY FK_5553fe08ceb90a36ee3d0c213c2;');
        await queryRunner.query('ALTER TABLE file_entry MODIFY activityId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE file_entry ADD CONSTRAINT FK_5553fe08ceb90a36ee3d0c213c2 FOREIGN KEY (activityId) REFERENCES activity(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format.createdById type change
        await queryRunner.query('ALTER TABLE format DROP FOREIGN KEY FK_2939fe51b1f4236f5e2bf2202ab;');
        await queryRunner.query('ALTER TABLE format MODIFY createdById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE format ADD CONSTRAINT FK_2939fe51b1f4236f5e2bf2202ab FOREIGN KEY (createdById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format.updatedById type change
        await queryRunner.query('ALTER TABLE format DROP FOREIGN KEY FK_b6a7246f38cbfd6ad86bc5d2134;');
        await queryRunner.query('ALTER TABLE format MODIFY updatedById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE format ADD CONSTRAINT FK_b6a7246f38cbfd6ad86bc5d2134 FOREIGN KEY (updatedById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format.keyVisualId type change
        await queryRunner.query('ALTER TABLE format DROP FOREIGN KEY FK_bb29b7012d4595e79c1fcf338f3;');
        await queryRunner.query('ALTER TABLE format MODIFY keyVisualId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE format ADD CONSTRAINT FK_bb29b7012d4595e79c1fcf338f3 FOREIGN KEY (keyVisualId) REFERENCES key_visual_entry(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format.workspaceId type change
        await queryRunner.query('ALTER TABLE format DROP FOREIGN KEY FK_d1780c17b9d8b2f8ee30b24b26d;');
        await queryRunner.query('ALTER TABLE format MODIFY workspaceId VARCHAR(36) NOT NULL;');
        await queryRunner.query(
            'ALTER TABLE format ADD CONSTRAINT FK_d1780c17b9d8b2f8ee30b24b26d FOREIGN KEY (workspaceId) REFERENCES workspace(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format_member update constraints
        await queryRunner.query('ALTER TABLE format_member DROP FOREIGN KEY FK_0eb07f7750a05c6baab577030f0;');
        await queryRunner.query(
            'ALTER TABLE format_member ADD CONSTRAINT FK_0eb07f7750a05c6baab577030f0 FOREIGN KEY (userId) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        await queryRunner.query('ALTER TABLE format_member DROP FOREIGN KEY FK_6d9ea664eed9b4e67b593f7b381;');
        await queryRunner.query(
            'ALTER TABLE format_member ADD CONSTRAINT FK_6d9ea664eed9b4e67b593f7b381 FOREIGN KEY (formatId) REFERENCES format(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format_template.createdById
        await queryRunner.query('ALTER TABLE format_template DROP FOREIGN KEY FK_b7d948103404a6489e96c7a8112;');
        await queryRunner.query('ALTER TABLE format_template MODIFY createdById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE format_template ADD CONSTRAINT FK_b7d948103404a6489e96c7a8112 FOREIGN KEY (createdById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format_template.keyVisualId type change
        await queryRunner.query('ALTER TABLE format_template DROP FOREIGN KEY FK_e266724bcc85d652618912b1e28;');
        await queryRunner.query('ALTER TABLE format_template MODIFY keyVisualId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE format_template ADD CONSTRAINT FK_e266724bcc85d652618912b1e28 FOREIGN KEY (keyVisualId) REFERENCES key_visual_entry(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // format_template update constraints
        await queryRunner.query('ALTER TABLE format_template DROP FOREIGN KEY FK_d6132dc8026b6fc67161ba9d0f6;');
        await queryRunner.query(
            'ALTER TABLE format_template ADD CONSTRAINT FK_d6132dc8026b6fc67161ba9d0f6 FOREIGN KEY (libraryId) REFERENCES library(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // key_visual_entry.keyVisualFileId type change
        await queryRunner.query('ALTER TABLE key_visual_entry DROP FOREIGN KEY FK_4ba7c33661ec1c81ca20700e7cc;');
        await queryRunner.query('ALTER TABLE key_visual_entry MODIFY keyVisualFileId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE key_visual_entry ADD CONSTRAINT FK_4ba7c33661ec1c81ca20700e7cc FOREIGN KEY (keyVisualFileId) REFERENCES file_entry(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // key_visual_entry.keyVisualLinkId type change
        await queryRunner.query('ALTER TABLE key_visual_entry DROP FOREIGN KEY FK_7fe56176052285ae1b92ca21588;');
        await queryRunner.query('ALTER TABLE key_visual_entry MODIFY keyVisualLinkId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE key_visual_entry ADD CONSTRAINT FK_7fe56176052285ae1b92ca21588 FOREIGN KEY (keyVisualLinkId) REFERENCES link_entry(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // library.createdById
        await queryRunner.query('ALTER TABLE library DROP FOREIGN KEY FK_9a5bb151fa6d05000c752bf4531;');
        await queryRunner.query('ALTER TABLE library MODIFY createdById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE library ADD CONSTRAINT FK_9a5bb151fa6d05000c752bf4531 FOREIGN KEY (createdById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // link_entry.createdById
        await queryRunner.query('ALTER TABLE link_entry DROP FOREIGN KEY FK_9bad3d85e6c67c4a95b023a89c1;');
        await queryRunner.query('ALTER TABLE link_entry MODIFY createdById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE link_entry ADD CONSTRAINT FK_9bad3d85e6c67c4a95b023a89c1 FOREIGN KEY (createdById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // phase update constraints
        await queryRunner.query('ALTER TABLE phase DROP FOREIGN KEY FK_67a5aa9ed1ead56a6c7f7578e31;');
        await queryRunner.query(
            'ALTER TABLE phase ADD CONSTRAINT FK_67a5aa9ed1ead56a6c7f7578e31 FOREIGN KEY (formatId) REFERENCES format(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // phase_template update constraints
        await queryRunner.query('ALTER TABLE phase_template DROP FOREIGN KEY FK_8cdec27ea8473d8af3c8c88e0dd;');
        await queryRunner.query(
            'ALTER TABLE phase_template ADD CONSTRAINT FK_8cdec27ea8473d8af3c8c88e0dd FOREIGN KEY (formatTemplateId) REFERENCES format_template(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // step update constraints
        await queryRunner.query('ALTER TABLE step DROP FOREIGN KEY FK_671d84b14ab2849981245f8ee98;');
        await queryRunner.query(
            'ALTER TABLE step ADD CONSTRAINT FK_671d84b14ab2849981245f8ee98 FOREIGN KEY (activityId) REFERENCES activity(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // step_check.stepId
        await queryRunner.query('ALTER TABLE step_check DROP FOREIGN KEY FK_6f80c18054d24123637ed6782a6;');
        await queryRunner.query('ALTER TABLE step_check MODIFY stepId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE step_check ADD CONSTRAINT FK_6f80c18054d24123637ed6782a6 FOREIGN KEY (stepId) REFERENCES step(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // step_check update constraints
        await queryRunner.query('ALTER TABLE step_check DROP FOREIGN KEY FK_42b9970a42973a4bd1449e26d05;');
        await queryRunner.query(
            'ALTER TABLE step_check ADD CONSTRAINT FK_42b9970a42973a4bd1449e26d05 FOREIGN KEY (memberId) REFERENCES format_member(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );
        await queryRunner.query('ALTER TABLE step_check DROP FOREIGN KEY FK_6e08f918357bdc4cf3e915f28d9;');
        await queryRunner.query(
            'ALTER TABLE step_check ADD CONSTRAINT FK_6e08f918357bdc4cf3e915f28d9 FOREIGN KEY (teamId) REFERENCES team(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // step_template update constraints
        await queryRunner.query('ALTER TABLE step_template DROP FOREIGN KEY FK_2115e33280cccb6fdb3cdf666c5;');
        await queryRunner.query(
            'ALTER TABLE step_template ADD CONSTRAINT FK_2115e33280cccb6fdb3cdf666c5 FOREIGN KEY (activityTemplateId) REFERENCES activity_template(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // submission.createdById
        await queryRunner.query('ALTER TABLE submission DROP FOREIGN KEY FK_bee022f639ff5b298975dfaa37b;');
        await queryRunner.query('ALTER TABLE submission MODIFY createdById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE submission ADD CONSTRAINT FK_bee022f639ff5b298975dfaa37b FOREIGN KEY (createdById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // submission.activityId
        await queryRunner.query('ALTER TABLE submission DROP FOREIGN KEY FK_ac0f363ae3899b18a19c7a3b998;');
        await queryRunner.query('ALTER TABLE submission MODIFY activityId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE submission ADD CONSTRAINT FK_ac0f363ae3899b18a19c7a3b998 FOREIGN KEY (activityId) REFERENCES activity(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // submission.teamId
        await queryRunner.query('ALTER TABLE submission DROP FOREIGN KEY FK_7ad334aa998a6a653c31cab4a32;');
        await queryRunner.query('ALTER TABLE submission MODIFY teamId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE submission ADD CONSTRAINT FK_7ad334aa998a6a653c31cab4a32 FOREIGN KEY (teamId) REFERENCES team(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // submission.userId
        await queryRunner.query('ALTER TABLE submission DROP FOREIGN KEY FK_7bd626272858ef6464aa2579094;');
        await queryRunner.query('ALTER TABLE submission MODIFY userId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE submission ADD CONSTRAINT FK_7bd626272858ef6464aa2579094 FOREIGN KEY (userId) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // team update constraints
        await queryRunner.query('ALTER TABLE team DROP FOREIGN KEY FK_17034160e72b6913d9ede3cd002;');
        await queryRunner.query(
            'ALTER TABLE team ADD CONSTRAINT FK_17034160e72b6913d9ede3cd002 FOREIGN KEY (formatId) REFERENCES format(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // team_members_format_member.teamId
        await queryRunner.query('ALTER TABLE team_members_format_member DROP FOREIGN KEY FK_2a54e1e6eaf59905b99d0139e82;');
        await queryRunner.query('ALTER TABLE team_members_format_member MODIFY teamId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE team_members_format_member ADD CONSTRAINT FK_2a54e1e6eaf59905b99d0139e82 FOREIGN KEY (teamId) REFERENCES team(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // team_members_format_member.formatMemberId
        await queryRunner.query('ALTER TABLE team_members_format_member DROP FOREIGN KEY FK_06c3d6a49a30e18b895b3a816b4;');
        await queryRunner.query('ALTER TABLE team_members_format_member MODIFY formatMemberId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE team_members_format_member ADD CONSTRAINT FK_06c3d6a49a30e18b895b3a816b4 FOREIGN KEY (formatMemberId) REFERENCES format_member(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // updating keys
        await queryRunner.query('ALTER TABLE team_members_format_member ADD KEY IDX_2a54e1e6eaf59905b99d0139e8 (teamId);');
        await queryRunner.query('ALTER TABLE team_members_format_member ADD KEY IDX_06c3d6a49a30e18b895b3a816b (formatMemberId);');
        await queryRunner.query('ALTER TABLE team_members_format_member DROP KEY FK_06c3d6a49a30e18b895b3a816b4;');

        // user.avatarId
        await queryRunner.query('ALTER TABLE user DROP FOREIGN KEY FK_58f5c71eaab331645112cf8cfa5;');
        await queryRunner.query('ALTER TABLE user MODIFY avatarId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE user ADD CONSTRAINT FK_58f5c71eaab331645112cf8cfa5 FOREIGN KEY (avatarId) REFERENCES file_entry(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // user_libraries_library.userId
        await queryRunner.query('ALTER TABLE user_libraries_library DROP FOREIGN KEY FK_dd0d1abfaeea1b421c770248604;');
        await queryRunner.query('ALTER TABLE user_libraries_library MODIFY userId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE user_libraries_library ADD CONSTRAINT FK_dd0d1abfaeea1b421c770248604 FOREIGN KEY (userId) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // user_libraries_library.libraryId
        await queryRunner.query('ALTER TABLE user_libraries_library DROP FOREIGN KEY FK_1390cf4a4d19a56eb5c1109ad4b;');
        await queryRunner.query('ALTER TABLE user_libraries_library MODIFY libraryId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE user_libraries_library ADD CONSTRAINT FK_1390cf4a4d19a56eb5c1109ad4b FOREIGN KEY (libraryId) REFERENCES library(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // updating keys
        await queryRunner.query('ALTER TABLE user_libraries_library ADD KEY IDX_dd0d1abfaeea1b421c77024860 (userId);');
        await queryRunner.query('ALTER TABLE user_libraries_library ADD KEY IDX_1390cf4a4d19a56eb5c1109ad4 (libraryId);');
        await queryRunner.query('ALTER TABLE user_libraries_library DROP KEY FK_1390cf4a4d19a56eb5c1109ad4b;');

        // workspace.updatedById type change
        await queryRunner.query('ALTER TABLE workspace DROP FOREIGN KEY FK_7a88c01f91d572187ff58ee4bcd;');
        await queryRunner.query('ALTER TABLE workspace MODIFY updatedById VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE workspace ADD CONSTRAINT FK_7a88c01f91d572187ff58ee4bcd FOREIGN KEY (updatedById) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // workspace_members_user.userId
        await queryRunner.query('ALTER TABLE workspace_members_user DROP FOREIGN KEY FK_ca7791a2d586bc444a938a24b0b;');
        await queryRunner.query('ALTER TABLE workspace_members_user MODIFY userId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE workspace_members_user ADD CONSTRAINT FK_ca7791a2d586bc444a938a24b0b FOREIGN KEY (userId) REFERENCES user(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // workspace_members_user.workspaceId
        await queryRunner.query('ALTER TABLE workspace_members_user DROP FOREIGN KEY FK_e2f1c37290df3031f715f1e7b8f;');
        await queryRunner.query('ALTER TABLE workspace_members_user MODIFY workspaceId VARCHAR(36);');
        await queryRunner.query(
            'ALTER TABLE workspace_members_user ADD CONSTRAINT FK_e2f1c37290df3031f715f1e7b8f FOREIGN KEY (workspaceId) REFERENCES workspace(id) ON DELETE NO ACTION ON UPDATE NO ACTION;'
        );

        // updating keys
        await queryRunner.query('ALTER TABLE workspace_members_user ADD KEY IDX_e2f1c37290df3031f715f1e7b8 (workspaceId);');
        await queryRunner.query('ALTER TABLE workspace_members_user ADD KEY IDX_ca7791a2d586bc444a938a24b0 (userId);');
        await queryRunner.query('ALTER TABLE workspace_members_user DROP KEY FK_ca7791a2d586bc444a938a24b0b;');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        //
    }
}
