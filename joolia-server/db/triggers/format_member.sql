DROP TRIGGER IF EXISTS `jooliadb`.`format_member_bd_tg`;
DELIMITER $$

CREATE TRIGGER `jooliadb`.`format_member_bd_tg` BEFORE DELETE
    ON `jooliadb`.`format_member`
    FOR EACH ROW
BEGIN
    DELETE FROM `jooliadb`.`step_check` WHERE memberId=OLD.id;
    DELETE FROM `jooliadb`.`team_members_format_member` WHERE formatMemberId=OLD.id;

    -- Format Membership archiving is not carried on. See JOOLIA-2382 for context.
END$$
