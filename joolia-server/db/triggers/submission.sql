DROP TRIGGER IF EXISTS `jooliadb`.`submission_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`submission_bd_tg` BEFORE DELETE
    ON `jooliadb`.`submission`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`file_entry` WHERE submissionId=OLD.id;
    DELETE FROM `jooliadb`.`user_comment` WHERE submissionId=OLD.id;
    DELETE FROM `jooliadb`.`user_rating` WHERE submissionId=OLD.id;

    INSERT into `archive_jooliadb`.`submission`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`submission` WHERE id=OLD.id;
END$$
