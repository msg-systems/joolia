DROP TRIGGER IF EXISTS `jooliadb`.`team_bd_tg`;
DROP TRIGGER IF EXISTS `jooliadb`.`team_ad_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`team_bd_tg` BEFORE DELETE
    ON `jooliadb`.`team`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`step_check` WHERE teamId=OLD.id;
    DELETE FROM `jooliadb`.`team_members_format_member` WHERE teamId=OLD.id;
    DELETE FROM `jooliadb`.`submission` WHERE teamId=OLD.id;
    DELETE FROM `jooliadb`.`canvas_submission` WHERE teamId=OLD.id;
    DELETE FROM `jooliadb`.`file_entry` WHERE teamId=OLD.id;

    INSERT into `archive_jooliadb`.`team` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`team` WHERE id=OLD.id;
END$$

CREATE TRIGGER `jooliadb`.`team_ad_tg` AFTER DELETE
    ON `jooliadb`.`team`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`file_entry` WHERE id=OLD.avatarId;
END$$
