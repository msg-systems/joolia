DROP TRIGGER IF EXISTS `jooliadb`.`canvas_submission_bd_tg`;

DELIMITER $$

CREATE TRIGGER `jooliadb`.`canvas_submission_bd_tg` BEFORE DELETE
    ON `jooliadb`.`canvas_submission`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`canvas_submission_vote` WHERE canvasSubmissionId=OLD.id;

    INSERT INTO `archive_jooliadb`.`canvas_submission` SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`canvas_submission` WHERE id=OLD.id;
END$$
