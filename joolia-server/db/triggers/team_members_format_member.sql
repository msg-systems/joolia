DROP TRIGGER IF EXISTS `jooliadb`.`team_members_format_member_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`team_members_format_member_bd_tg` BEFORE DELETE
    ON `jooliadb`.`team_members_format_member`
    FOR EACH ROW
BEGIN
    -- Team Membership archiving is not carried on. See JOOLIA-2382 for context.
END$$
