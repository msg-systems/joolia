DROP TRIGGER IF EXISTS `jooliadb`.`workspace_member_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`workspace_member_bd_tg` BEFORE DELETE
    ON `jooliadb`.`workspace_member`
    FOR EACH ROW
BEGIN
    -- Workspace Membership archiving is not carried on. See JOOLIA-2382 for context.
END$$
