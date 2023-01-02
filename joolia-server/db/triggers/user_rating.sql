DROP TRIGGER IF EXISTS `jooliadb`.`user_rating_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`user_rating_bd_tg` BEFORE DELETE
    ON `jooliadb`.`user_rating`
    FOR EACH ROW
BEGIN
    INSERT into `archive_jooliadb`.`user_rating` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`user_rating` WHERE id=OLD.id;
END$$
