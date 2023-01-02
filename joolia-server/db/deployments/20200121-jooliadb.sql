/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  `shortDescription` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `phaseId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keyVisualId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `configurationId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_356066c9372dcaca0641a994d8` (`keyVisualId`),
  UNIQUE KEY `REL_844176150b3c0bd59e839318b8` (`configurationId`),
  KEY `FK_0dabec57ca0bb0eb76795ac5c65` (`phaseId`),
  CONSTRAINT `FK_0dabec57ca0bb0eb76795ac5c65` FOREIGN KEY (`phaseId`) REFERENCES `phase` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_356066c9372dcaca0641a994d8b` FOREIGN KEY (`keyVisualId`) REFERENCES `key_visual_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_844176150b3c0bd59e839318b8b` FOREIGN KEY (`configurationId`) REFERENCES `activity_configuration` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_configuration` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submissionModifySetting` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `submissionViewSetting` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitter',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_template` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phaseTemplateId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int(11) NOT NULL,
  `shortDescription` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `position` int(11) DEFAULT NULL,
  `libraryId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `configurationId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keyVisualId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_200804ae06ba8a20bb7150b595` (`configurationId`),
  UNIQUE KEY `REL_73a632cf577758881b14174050` (`keyVisualId`),
  KEY `FK_f6331a627be054769c5f64d35ad` (`createdById`),
  KEY `FK_ad613fe4c5226febbe695256949` (`phaseTemplateId`),
  KEY `FK_42c4a68ec6c9fb1448ef83e5302` (`libraryId`),
  CONSTRAINT `FK_200804ae06ba8a20bb7150b5958` FOREIGN KEY (`configurationId`) REFERENCES `activity_configuration` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_42c4a68ec6c9fb1448ef83e5302` FOREIGN KEY (`libraryId`) REFERENCES `library` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_73a632cf577758881b141740506` FOREIGN KEY (`keyVisualId`) REFERENCES `key_visual_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ad613fe4c5226febbe695256949` FOREIGN KEY (`phaseTemplateId`) REFERENCES `phase_template` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f6331a627be054769c5f64d35ad` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedback` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` float NOT NULL DEFAULT '0',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `submissionId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ae2f58b7d0fa9be21519af3d457` (`submissionId`),
  KEY `FK_9243a8e1826e8259480000a8c22` (`createdById`),
  CONSTRAINT `FK_9243a8e1826e8259480000a8c22` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ae2f58b7d0fa9be21519af3d457` FOREIGN KEY (`submissionId`) REFERENCES `submission` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file_entry` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contentType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int(11) DEFAULT '0',
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `versionId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formatId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formatTemplateId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activityId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activityTemplateId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submissionId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_df7eaacbf7a07b4dc353762e16` (`ownerType`),
  KEY `FK_ac16fa13100db23032124defbd9` (`createdById`),
  KEY `FK_178926c82dc5fadff358f7fc4bf` (`formatId`),
  KEY `FK_063811879a79ea813e5aac6b482` (`formatTemplateId`),
  KEY `FK_5553fe08ceb90a36ee3d0c213c2` (`activityId`),
  KEY `FK_12d3d6b669ad1fe9776346eeb3b` (`activityTemplateId`),
  KEY `FK_0cab48793490256ecc9bee2d828` (`submissionId`),
  CONSTRAINT `FK_063811879a79ea813e5aac6b482` FOREIGN KEY (`formatTemplateId`) REFERENCES `format_template` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_0cab48793490256ecc9bee2d828` FOREIGN KEY (`submissionId`) REFERENCES `submission` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_12d3d6b669ad1fe9776346eeb3b` FOREIGN KEY (`activityTemplateId`) REFERENCES `activity_template` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_178926c82dc5fadff358f7fc4bf` FOREIGN KEY (`formatId`) REFERENCES `format` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_5553fe08ceb90a36ee3d0c213c2` FOREIGN KEY (`activityId`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ac16fa13100db23032124defbd9` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `format` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `shortDescription` text COLLATE utf8mb4_unicode_ci,
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `workspaceId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keyVisualId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_bb29b7012d4595e79c1fcf338f` (`keyVisualId`),
  KEY `FK_2939fe51b1f4236f5e2bf2202ab` (`createdById`),
  KEY `FK_d1780c17b9d8b2f8ee30b24b26d` (`workspaceId`),
  KEY `FK_b6a7246f38cbfd6ad86bc5d2134` (`updatedById`),
  CONSTRAINT `FK_2939fe51b1f4236f5e2bf2202ab` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b6a7246f38cbfd6ad86bc5d2134` FOREIGN KEY (`updatedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bb29b7012d4595e79c1fcf338f3` FOREIGN KEY (`keyVisualId`) REFERENCES `key_visual_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d1780c17b9d8b2f8ee30b24b26d` FOREIGN KEY (`workspaceId`) REFERENCES `workspace` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `format_member` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('organizer','participant') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'participant',
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formatId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_0eb07f7750a05c6baab577030f0` (`userId`),
  KEY `FK_6d9ea664eed9b4e67b593f7b381` (`formatId`),
  CONSTRAINT `FK_0eb07f7750a05c6baab577030f0` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_6d9ea664eed9b4e67b593f7b381` FOREIGN KEY (`formatId`) REFERENCES `format` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `format_template` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shortDescription` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `libraryId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keyVisualId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_e266724bcc85d652618912b1e2` (`keyVisualId`),
  KEY `FK_b7d948103404a6489e96c7a8112` (`createdById`),
  KEY `FK_d6132dc8026b6fc67161ba9d0f6` (`libraryId`),
  CONSTRAINT `FK_b7d948103404a6489e96c7a8112` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d6132dc8026b6fc67161ba9d0f6` FOREIGN KEY (`libraryId`) REFERENCES `library` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e266724bcc85d652618912b1e28` FOREIGN KEY (`keyVisualId`) REFERENCES `key_visual_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `key_visual_entry` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keyVisualFileId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keyVisualLinkId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_4ba7c33661ec1c81ca20700e7c` (`keyVisualFileId`),
  UNIQUE KEY `REL_7fe56176052285ae1b92ca2158` (`keyVisualLinkId`),
  KEY `IDX_e875050b09de0f4e0b538221cc` (`relationType`),
  CONSTRAINT `FK_4ba7c33661ec1c81ca20700e7cc` FOREIGN KEY (`keyVisualFileId`) REFERENCES `file_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_7fe56176052285ae1b92ca21588` FOREIGN KEY (`keyVisualLinkId`) REFERENCES `link_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_9a5bb151fa6d05000c752bf4531` (`createdById`),
  CONSTRAINT `FK_9a5bb151fa6d05000c752bf4531` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `link_entry` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `linkUrl` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9bad3d85e6c67c4a95b023a89c1` (`createdById`),
  CONSTRAINT `FK_9bad3d85e6c67c4a95b023a89c1` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phase` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `durationUnit` enum('minutes','days') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'minutes',
  `startDate` datetime DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formatId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visible` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_67a5aa9ed1ead56a6c7f7578e31` (`formatId`),
  CONSTRAINT `FK_67a5aa9ed1ead56a6c7f7578e31` FOREIGN KEY (`formatId`) REFERENCES `format` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phase_template` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formatTemplateId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `durationUnit` enum('minutes','days') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'minutes',
  `libraryId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_8cdec27ea8473d8af3c8c88e0dd` (`formatTemplateId`),
  KEY `FK_b370cb65efedc8fb034ce4bb73d` (`libraryId`),
  KEY `FK_5aa0554d98a13063427f5916675` (`createdById`),
  CONSTRAINT `FK_5aa0554d98a13063427f5916675` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8cdec27ea8473d8af3c8c88e0dd` FOREIGN KEY (`formatTemplateId`) REFERENCES `format_template` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b370cb65efedc8fb034ce4bb73d` FOREIGN KEY (`libraryId`) REFERENCES `library` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `step` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `position` int(11) NOT NULL,
  `activityId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_671d84b14ab2849981245f8ee98` (`activityId`),
  CONSTRAINT `FK_671d84b14ab2849981245f8ee98` FOREIGN KEY (`activityId`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `step_check` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teamId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `memberId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stepId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_dc1cfa5b3611d135150ea0265b` (`relationType`),
  KEY `FK_6f80c18054d24123637ed6782a6` (`stepId`),
  KEY `FK_6e08f918357bdc4cf3e915f28d9` (`teamId`),
  KEY `FK_42b9970a42973a4bd1449e26d05` (`memberId`),
  CONSTRAINT `FK_42b9970a42973a4bd1449e26d05` FOREIGN KEY (`memberId`) REFERENCES `format_member` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_6e08f918357bdc4cf3e915f28d9` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_6f80c18054d24123637ed6782a6` FOREIGN KEY (`stepId`) REFERENCES `step` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `step_template` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `position` int(11) NOT NULL,
  `activityTemplateId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2115e33280cccb6fdb3cdf666c5` (`activityTemplateId`),
  CONSTRAINT `FK_2115e33280cccb6fdb3cdf666c5` FOREIGN KEY (`activityTemplateId`) REFERENCES `activity_template` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `submission` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(55) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `activityId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teamId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_fb91fb129b8bcf47981beb0dfa` (`ownerType`),
  KEY `FK_ac0f363ae3899b18a19c7a3b998` (`activityId`),
  KEY `FK_bee022f639ff5b298975dfaa37b` (`createdById`),
  KEY `FK_7ad334aa998a6a653c31cab4a32` (`teamId`),
  KEY `FK_7bd626272858ef6464aa2579094` (`userId`),
  CONSTRAINT `FK_7ad334aa998a6a653c31cab4a32` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_7bd626272858ef6464aa2579094` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ac0f363ae3899b18a19c7a3b998` FOREIGN KEY (`activityId`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bee022f639ff5b298975dfaa37b` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formatId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_17034160e72b6913d9ede3cd002` (`formatId`),
  CONSTRAINT `FK_17034160e72b6913d9ede3cd002` FOREIGN KEY (`formatId`) REFERENCES `format` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team_members_format_member` (
  `teamId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formatMemberId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`teamId`,`formatMemberId`),
  KEY `IDX_2a54e1e6eaf59905b99d0139e8` (`teamId`),
  KEY `IDX_06c3d6a49a30e18b895b3a816b` (`formatMemberId`),
  CONSTRAINT `FK_06c3d6a49a30e18b895b3a816b4` FOREIGN KEY (`formatMemberId`) REFERENCES `format_member` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_2a54e1e6eaf59905b99d0139e82` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failedLoginAttempts` int(11) NOT NULL DEFAULT '0',
  `failedLoginTimeout` datetime DEFAULT NULL,
  `admin` tinyint(4) NOT NULL DEFAULT '0',
  `pending` tinyint(4) NOT NULL DEFAULT '0',
  `avatarId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  UNIQUE KEY `REL_58f5c71eaab331645112cf8cfa` (`avatarId`),
  CONSTRAINT `FK_58f5c71eaab331645112cf8cfa5` FOREIGN KEY (`avatarId`) REFERENCES `file_entry` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_libraries_library` (
  `userId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libraryId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`,`libraryId`),
  KEY `IDX_dd0d1abfaeea1b421c77024860` (`userId`),
  KEY `IDX_1390cf4a4d19a56eb5c1109ad4` (`libraryId`),
  CONSTRAINT `FK_1390cf4a4d19a56eb5c1109ad4b` FOREIGN KEY (`libraryId`) REFERENCES `library` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_dd0d1abfaeea1b421c770248604` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workspace` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `licensesCount` int(11) DEFAULT NULL,
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7a88c01f91d572187ff58ee4bcd` (`updatedById`),
  CONSTRAINT `FK_7a88c01f91d572187ff58ee4bcd` FOREIGN KEY (`updatedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workspace_members_user` (
  `workspaceId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`workspaceId`,`userId`),
  KEY `IDX_e2f1c37290df3031f715f1e7b8` (`workspaceId`),
  KEY `IDX_ca7791a2d586bc444a938a24b0` (`userId`),
  CONSTRAINT `FK_ca7791a2d586bc444a938a24b0b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e2f1c37290df3031f715f1e7b8f` FOREIGN KEY (`workspaceId`) REFERENCES `workspace` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
