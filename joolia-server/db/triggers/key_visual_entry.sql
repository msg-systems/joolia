DROP TRIGGER IF EXISTS `jooliadb`.`key_visual_entry_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`key_visual_entry_bd_tg` BEFORE DELETE
    ON `jooliadb`.`key_visual_entry`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`key_visual_entry`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`key_visual_entry` WHERE id=OLD.id;
END$$
