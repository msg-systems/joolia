DROP TRIGGER IF EXISTS `jooliadb`.`user_bd_tg`;
DROP TRIGGER IF EXISTS `jooliadb`.`user_ad_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`user_bd_tg` BEFORE DELETE
    ON `jooliadb`.`user`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`user_skill` where userId=OLD.id;
    DELETE FROM `jooliadb`.`user_libraries_library` where userId=OLD.id;
    DELETE FROM `jooliadb`.`workspace_member` where userId=OLD.id;
    DELETE FROM `jooliadb`.`format_member` where userId=OLD.id;
    DELETE FROM `jooliadb`.`format` where createdById=OLD.id;
    DELETE FROM `jooliadb`.`team` where createdById=OLD.id;
    DELETE FROM `jooliadb`.`canvas_submission` where createdById=OLD.id OR userId=OLD.id;
    DELETE FROM `jooliadb`.`phase_template` where createdById=OLD.id;
    DELETE FROM `jooliadb`.`activity_template` where createdById=OLD.id;
    DELETE FROM `jooliadb`.`format_template` where createdById=OLD.id;
    DELETE FROM `jooliadb`.`workspace` where createdById=OLD.id;
    DELETE FROM `jooliadb`.`library` where createdById=OLD.id;
    DELETE FROM `jooliadb`.`file_entry` where createdById=OLD.id;

    INSERT into `archive_jooliadb`.`user`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`user` WHERE id=OLD.id;
END$$

CREATE TRIGGER `jooliadb`.`user_ad_tg` AFTER DELETE
    ON `jooliadb`.`user`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`file_entry` WHERE id=OLD.avatarId;
END$$
