DROP TRIGGER IF EXISTS `jooliadb`.`phase_template_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`phase_template_bd_tg` BEFORE DELETE
    ON `jooliadb`.`phase_template`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`activity_template` WHERE phaseTemplateId=OLD.id;

    INSERT into `archive_jooliadb`.`phase_template` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`phase_template` WHERE id=OLD.id;
END$$
