USE jooliadb;

DROP VIEW IF EXISTS `jooliadb`.`format_view`;

CREATE VIEW `jooliadb`.`format_view` AS
    SELECT
        `t`.`id` AS `id`,
        `t`.`name` AS `name`,
        `t`.`description` AS `description`,
        `t`.`shortDescription` AS `shortDescription`,
        `t`.`updatedAt` AS `updatedAt`,
        `t`.`containsTechnicalUser` AS `containsTechnicalUser`,
        `t`.`memberCount` AS `memberCount`,
        `t`.`organizerCount` AS `organizerCount`,
        `t`.`teamCount` AS `teamCount`,
        `t`.`submissionCount` AS `submissionCount`,
        `t`.`phaseCount` AS `phaseCount`,
        `t`.`activityCount` AS `activityCount`,
        `t`.`commentCount` AS `commentCount`,
        MIN(`t`.`phaseStartDate`) AS `startDate`,
        MAX(`t`.`phaseEndDate`) AS `endDate`
    FROM
        (SELECT
            `f`.`id` AS `id`,
            `f`.`name` AS `name`,
            `f`.`description` AS `description`,
            `f`.`shortDescription` AS `shortDescription`,
            `f`.`updatedAt` AS `updatedAt`,
            `f`.`containsTechnicalUser` AS `containsTechnicalUser`,
                `p`.`startDate` AS `phaseStartDate`,
                (SELECT
                        COUNT(1)
                    FROM
                        `jooliadb`.`format_member`
                    WHERE
                        (`jooliadb`.`format_member`.`formatId` = `f`.`id`) AND (`jooliadb`.`format_member`.`role` != 'technical')) AS `memberCount`,
                (SELECT
                        COUNT(1)
                    FROM
                        `jooliadb`.`format_member`
                    WHERE
                        (`jooliadb`.`format_member`.`formatId` = `f`.`id`) AND (`jooliadb`.`format_member`.`role` = 'organizer')) AS `organizerCount`,
                (SELECT
                        COUNT(1)
                    FROM
                        `jooliadb`.`team`
                    WHERE
                        (`jooliadb`.`team`.`formatId` = `f`.`id`)) AS `teamCount`,
                (SELECT
                        COUNT(1)
                    FROM
                        (`jooliadb`.`submission` `s`
                                JOIN `jooliadb`.`activity` `a` ON ((`s`.`activityId` = `a`.`id`))
                                JOIN `jooliadb`.`phase` `p` ON ((`a`.`phaseId` = `p`.`id`)))
                    WHERE
                        (`p`.`formatId` = `f`.`id`)) AS `submissionCount`,
                (SELECT
                        COUNT(1)
                    FROM
                        `jooliadb`.`phase`
                    WHERE
                        (`jooliadb`.`phase`.`formatId` = `f`.`id`)) AS `phaseCount`,
                (SELECT
                        COUNT(1)
                    FROM
                        (`jooliadb`.`activity` `a`
                                JOIN `jooliadb`.`phase` `p` ON ((`a`.`phaseId` = `p`.`id`)))
                    WHERE
                        (`p`.`formatId` = `f`.`id`)) AS `activityCount`,
                (SELECT
                        COUNT(1)
                    FROM
                        (`jooliadb`.`user_comment` `uc`
                                JOIN `jooliadb`.`submission` `s` ON ((`uc`.`submissionId` = `s`.`id`))
                                JOIN `jooliadb`.`activity` `a` ON ((`s`.`activityId` = `a`.`id`))
                                JOIN `jooliadb`.`phase` `p` ON ((`a`.`phaseId` = `p`.`id`)))
                    WHERE
                        (`p`.`formatId` = `f`.`id`)) AS `commentCount`,
                SUM(`a`.`duration`) AS `phaseDuration`,
                (`p`.`startDate` + INTERVAL SUM(`a`.`duration`) MINUTE) AS `phaseEndDate`
        FROM
            ((`jooliadb`.`format` `f`
        LEFT JOIN `jooliadb`.`phase` `p` ON ((`p`.`formatId` = `f`.`id`)))
        LEFT JOIN `jooliadb`.`activity` `a` ON ((`a`.`phaseId` = `p`.`id`)))
        GROUP BY `f`.`id` , `f`.`name` , `p`.`startDate`) `t`
    GROUP BY `t`.`id`;


DROP VIEW IF EXISTS `jooliadb`.`library_view`;

CREATE VIEW  `jooliadb`.`library_view` AS
    SELECT
        `l`.`id` AS `id`,
        `l`.`name` AS `name`,
        `l`.`updatedAt` AS `updatedAt`,
        (SELECT
                COUNT(1)
            FROM
                `user_libraries_library`
            WHERE
                (`user_libraries_library`.`libraryId` = `l`.`id`)) AS `_memberCount`,
        (SELECT
                COUNT(1)
            FROM
                `format_template`
            WHERE
                (`format_template`.`libraryId` = `l`.`id`)) AS `_formatTemplateCount`,
        (SELECT
                COUNT(1)
            FROM
                `activity_template`
            WHERE
                (`activity_template`.`libraryId` = `l`.`id` AND `activity_template`.`phaseTemplateId` is NULL)) AS `_activityTemplateCount`,
        (SELECT
                COUNT(1)
            FROM
                `phase_template`
            WHERE
                (`phase_template`.`libraryId` = `l`.`id` AND `phase_template`.`formatTemplateId` is NULL)) AS `_phaseTemplateCount`
    FROM
        `library` `l`;


DROP VIEW IF EXISTS `jooliadb`.`workspace_view`;

-- CREATE VIEW `jooliadb`.`submission_view` AS
--     SELECT
--         `s`.`id` AS `id`,
--         (SELECT COUNT(1) from `user_comment` `uc`
--                 WHERE `s`.`id` = `uc`.`submissionId`) as `_commentCount`,
--         (SELECT AVG(`ur`.`rating`) from `user_rating` `ur`
--                 WHERE `s`.`id` = `ur`.`submissionId`) as `_averageRating`
--     FROM `submission` `s`
--     GROUP BY `s`.`id`;


CREATE VIEW `jooliadb`.`workspace_view` AS
    SELECT
        w.id,
        w.name,
        w.description,
        w.licensesCount,
        w.tenant,
        w.domain,
        w.consentDate,
        w.updatedAt,
        (SELECT
                COUNT(f.id)
            FROM
                format f
            WHERE
                f.workspaceId = w.id) AS formatCount,
        (SELECT
                COUNT(1)
            FROM
                workspace_member m
            WHERE
                m.workspaceId = w.id) AS memberCount,
        (SELECT
                COUNT(1)
            FROM
                workspace_member m
            WHERE
                (m.workspaceId = w.id) AND (m.admin = true)) AS adminCount
    FROM
        workspace w;

DROP VIEW IF EXISTS `jooliadb`.`workspace_member_view`;

CREATE VIEW `jooliadb`.`workspace_member_view` AS
    SELECT
        `wm`.`userId` AS `userId`,
        `wm`.`workspaceId` AS `workspaceId`,
        `wm`.`admin` AS `admin`,
        `u`.`name` AS `name`,
        `u`.`avatarId` AS `avatarId`,
        `u`.`company` AS `company`,
        `u`.`pending` AS `pending`,
        `u`.`email` AS `email`,
        `u`.`lastLogin` AS `lastLogin`,
            (SELECT
                    COUNT(1)
                FROM
                    `jooliadb`.`format` `f`
                WHERE
                    (`wm`.`workspaceId` = `f`.`workspaceId`)
                AND EXISTS (
                    SELECT
                        1
                    FROM
                        `jooliadb`.`format_member` `fm`
                    WHERE
                        (`fm`.`userId` = `u`.`id`)
                    AND (`fm`.`formatId` = `f`.`id`))) AS `formatCount`
    FROM
        `jooliadb`.`workspace_member` `wm`
    INNER JOIN `jooliadb`.`user` `u` ON ((`u`.`id` = `wm`.`userId`))
