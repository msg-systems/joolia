DROP TRIGGER IF EXISTS `jooliadb`.`workspace_bd_tg`;
DROP TRIGGER IF EXISTS `jooliadb`.`workspace_ad_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`workspace_bd_tg` BEFORE DELETE
    ON `jooliadb`.`workspace`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`format` WHERE workspaceId=OLD.id;
    DELETE FROM `jooliadb`.`workspace_member` WHERE workspaceId=OLD.id;

    INSERT into `archive_jooliadb`.`workspace`
        SELECT *, NOW(), @joolia_user_id, @joolia_request_id FROM `jooliadb`.`workspace` WHERE id=OLD.id;
END$$

CREATE TRIGGER `jooliadb`.`workspace_ad_tg` AFTER DELETE
    ON `jooliadb`.`workspace`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`file_entry` WHERE id=OLD.logoId;
END$$
