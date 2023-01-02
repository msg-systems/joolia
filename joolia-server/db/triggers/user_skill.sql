DROP TRIGGER IF EXISTS `jooliadb`.`user_skill_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`user_skill_bd_tg` BEFORE DELETE
    ON `jooliadb`.`user_skill`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`user_skill`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`user_skill` WHERE userId=OLD.userId AND skillId=OLD.skillId;
END$$
