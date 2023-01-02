DROP TRIGGER IF EXISTS `jooliadb`.`user_comment_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`user_comment_bd_tg` BEFORE DELETE
    ON `jooliadb`.`user_comment`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`user_comment` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`user_comment` WHERE id=OLD.id;
END$$
