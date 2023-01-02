DROP TRIGGER IF EXISTS `jooliadb`.`format_bd_tg`;
DROP TRIGGER IF EXISTS `jooliadb`.`format_ad_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`format_bd_tg` BEFORE DELETE
    ON `jooliadb`.`format`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`team` WHERE formatId=OLD.id;
    DELETE FROM `jooliadb`.`file_entry` WHERE formatId=OLD.id;
    DELETE FROM `jooliadb`.`phase` WHERE formatId=OLD.id;
    DELETE FROM `jooliadb`.`format_member` WHERE formatId=OLD.id;

    INSERT into `archive_jooliadb`.`format` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`format` WHERE id=OLD.id;
END$$

CREATE TRIGGER `jooliadb`.`format_ad_tg` AFTER DELETE
    ON `jooliadb`.`format`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`key_visual_entry` WHERE id=OLD.keyVisualId;
    DELETE FROM `jooliadb`.`link_entry` WHERE id=OLD.meetingLinkId;
END$$
