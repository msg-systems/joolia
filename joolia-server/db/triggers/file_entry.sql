DROP TRIGGER IF EXISTS `jooliadb`.`file_entry_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`file_entry_bd_tg` BEFORE DELETE
    ON `jooliadb`.`file_entry`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`key_visual_entry` WHERE keyVisualFileId=OLD.id;

    INSERT into `archive_jooliadb`.`file_entry` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`file_entry` WHERE id=OLD.id;
END$$
