DROP TRIGGER IF EXISTS `jooliadb`.`activity_configuration_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`activity_configuration_bd_tg` BEFORE DELETE
    ON `jooliadb`.`activity_configuration`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`activity_configuration` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`activity_configuration` WHERE id=OLD.id;
END$$
