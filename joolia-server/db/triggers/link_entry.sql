DROP TRIGGER IF EXISTS `jooliadb`.`link_entry_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`link_entry_bd_tg` BEFORE DELETE
    ON `jooliadb`.`link_entry`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`link_entry` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`link_entry` WHERE id=OLD.id;
END$$
