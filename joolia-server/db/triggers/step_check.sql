DROP TRIGGER IF EXISTS `jooliadb`.`step_check_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`step_check_bd_tg` BEFORE DELETE
    ON `jooliadb`.`step_check`
    FOR EACH ROW
BEGIN
     -- Only Team's checks are archived. See JOOLIA-2382 for context.
    INSERT into `archive_jooliadb`.`step_check`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`step_check` WHERE id=OLD.id AND teamId IS NOT NULL;
END$$
