DROP TRIGGER IF EXISTS `jooliadb`.`activity_bd_tg`;
DROP TRIGGER IF EXISTS `jooliadb`.`activity_ad_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`activity_bd_tg` BEFORE DELETE
    ON `jooliadb`.`activity`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`step` WHERE activityId=OLD.id;
    DELETE FROM `jooliadb`.`file_entry` WHERE activityId=OLD.id;
    DELETE FROM `jooliadb`.`submission` WHERE activityId=OLD.id;
    DELETE FROM `jooliadb`.`link_entry` WHERE activityId=OLD.id;
    DELETE FROM `jooliadb`.`canvas` WHERE activityId=OLD.id;

    INSERT into `archive_jooliadb`.`activity` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`activity` WHERE id=OLD.id;
END$$

CREATE TRIGGER `jooliadb`.`activity_ad_tg` AFTER DELETE
    ON `jooliadb`.`activity`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`activity_configuration` WHERE id=OLD.configurationId;
    DELETE FROM `jooliadb`.`key_visual_entry` WHERE id=OLD.keyVisualId;
END$$
