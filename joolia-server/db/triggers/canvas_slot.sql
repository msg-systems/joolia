DROP TRIGGER IF EXISTS `jooliadb`.`canvas_slot_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`canvas_slot_bd_tg` BEFORE DELETE
    ON `jooliadb`.`canvas_slot`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`canvas_submission` WHERE slotId=OLD.id;
    INSERT INTO `archive_jooliadb`.`canvas_slot` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`canvas_slot` WHERE id=OLD.id;
END$$
