DROP TRIGGER IF EXISTS `jooliadb`.`step_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`step_bd_tg` BEFORE DELETE
    ON `jooliadb`.`step`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`step_check` WHERE stepId=OLD.id;

    INSERT into `archive_jooliadb`.`step` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`step` WHERE id=OLD.id;
END$$
