DROP TRIGGER IF EXISTS `jooliadb`.`phase_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`phase_bd_tg` BEFORE DELETE
    ON `jooliadb`.`phase`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`activity` WHERE phaseId=OLD.id;

    INSERT into `archive_jooliadb`.`phase` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`phase` WHERE id=OLD.id;
END$$
