DROP TRIGGER IF EXISTS `jooliadb`.`library_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`library_bd_tg` BEFORE DELETE
    ON `jooliadb`.`library`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`user_libraries_library` where libraryId=OLD.id;
    DELETE FROM `jooliadb`.`activity_template` where libraryId=OLD.id;
    DELETE FROM `jooliadb`.`phase_template` where libraryId=OLD.id;
    DELETE FROM `jooliadb`.`format_template` where libraryId=OLD.id;

    INSERT into `archive_jooliadb`.`library`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`library` WHERE id=OLD.id;
END$$
