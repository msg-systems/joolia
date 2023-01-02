DROP TRIGGER IF EXISTS `jooliadb`.`canvas_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`canvas_bd_tg` BEFORE DELETE
    ON `jooliadb`.`canvas`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`canvas_slot` WHERE canvasId=OLD.id;
    INSERT INTO `archive_jooliadb`.`canvas` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`canvas` WHERE id=OLD.id;
END$$
