DROP TRIGGER IF EXISTS `jooliadb`.`activity_template_bd_tg`;
DROP TRIGGER IF EXISTS `jooliadb`.`activity_template_ad_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`activity_template_bd_tg` BEFORE DELETE
    ON `jooliadb`.`activity_template`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`file_entry` WHERE activityTemplateId=OLD.id;
    DELETE FROM `jooliadb`.`step_template` WHERE activityTemplateId=OLD.id;
    DELETE FROM `jooliadb`.`canvas` WHERE activityTemplateId=OLD.id;

    INSERT into `archive_jooliadb`.`activity_template`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`activity_template` WHERE id=OLD.id;
END$$

CREATE TRIGGER `jooliadb`.`activity_template_ad_tg` AFTER DELETE
    ON `jooliadb`.`activity_template`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`activity_configuration` WHERE id=OLD.configurationId;
    DELETE FROM `jooliadb`.`key_visual_entry` WHERE id=OLD.keyVisualId;
END$$
