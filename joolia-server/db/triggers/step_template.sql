DROP TRIGGER IF EXISTS `jooliadb`.`step_template_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`step_template_bd_tg` BEFORE DELETE
    ON `jooliadb`.`step_template`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`step_template` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`step_template` WHERE id=OLD.id;
END$$
