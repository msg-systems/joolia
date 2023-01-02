DROP TRIGGER IF EXISTS `jooliadb`.`user_libraries_library_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`user_libraries_library_bd_tg` BEFORE DELETE
    ON `jooliadb`.`user_libraries_library`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`user_libraries_library`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`user_libraries_library` WHERE userId=OLD.userId and libraryId=OLD.libraryId;
END$$
