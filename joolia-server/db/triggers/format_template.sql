DROP TRIGGER IF EXISTS `jooliadb`.`format_template_bd_tg`;
DROP TRIGGER IF EXISTS `jooliadb`.`format_template_ad_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`format_template_bd_tg` BEFORE DELETE
    ON `jooliadb`.`format_template`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`file_entry` WHERE formatTemplateId=OLD.id;
    DELETE FROM `jooliadb`.`phase_template` WHERE formatTemplateId=OLD.id;

    INSERT into `archive_jooliadb`.`format_template` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`format_template` WHERE id=OLD.id;
END$$

CREATE TRIGGER `jooliadb`.`format_template_ad_tg` AFTER DELETE
    ON `jooliadb`.`format_template`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`key_visual_entry` WHERE id=OLD.keyVisualId;
END$$
