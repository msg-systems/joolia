-- procedures

DROP PROCEDURE IF EXISTS `archive_jooliadb`.`drop_fk_constraints`;
DELIMITER $$

CREATE PROCEDURE `archive_jooliadb`.`drop_fk_constraints`()
BEGIN
    DECLARE counter INT DEFAULT 0;
    DECLARE vTableName VARCHAR(32);
    DECLARE vConstraintName VARCHAR(32);
    DECLARE done BOOLEAN DEFAULT FALSE;

    DECLARE curs CURSOR FOR
        SELECT DISTINCT TABLE_NAME, CONSTRAINT_NAME
        FROM information_schema.key_column_usage
        WHERE constraint_schema like '%jooliadb'
        AND table_schema = 'archive_jooliadb'
        AND referenced_table_name IS NOT NULL;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN curs;

    REPEAT
        FETCH curs INTO vTableName, vConstraintName;
        IF NOT done THEN
            SET counter = counter + 1;
            SET @qStr := CONCAT('ALTER TABLE archive_jooliadb.', vTableName, ' DROP FOREIGN KEY ', vConstraintName, ';');
            PREPARE stmt FROM @qStr;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;
    UNTIL done END REPEAT;

    CLOSE curs;

    SELECT CONCAT('Dropped ', counter, ' FKs from archive db.') as debug;
END$$

DELIMITER ;

DROP PROCEDURE IF EXISTS `archive_jooliadb`.`drop_key_constraints`;
DELIMITER $$

CREATE PROCEDURE `archive_jooliadb`.`drop_key_constraints`()
BEGIN
    DECLARE counter INT DEFAULT 0;
    DECLARE vTableName VARCHAR(32);
    DECLARE vConstraintName VARCHAR(32);
    DECLARE done BOOLEAN DEFAULT FALSE;

    DECLARE curs CURSOR FOR
        SELECT DISTINCT TABLE_NAME, CONSTRAINT_NAME
        FROM information_schema.key_column_usage
        WHERE constraint_schema like '%jooliadb'
        AND table_schema = 'archive_jooliadb';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN curs;

    REPEAT
        FETCH curs INTO vTableName, vConstraintName;
        IF NOT done THEN
            SET counter = counter + 1;

            IF vConstraintName = 'PRIMARY' THEN
                SET @qStr := CONCAT('ALTER TABLE archive_jooliadb.', vTableName, ' DROP PRIMARY KEY;');
            ELSE
                SET @qStr := CONCAT('ALTER TABLE archive_jooliadb.', vTableName, ' DROP KEY ', vConstraintName, ';');
            END IF;

            PREPARE stmt FROM @qStr;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;
    UNTIL done END REPEAT;

    CLOSE curs;

    SELECT CONCAT('Dropped ', counter, ' constraints from archive db.') as debug;
END$$

DELIMITER ;

DROP PROCEDURE IF EXISTS `archive_jooliadb`.`drop_indexes`;
DELIMITER $$

CREATE PROCEDURE `archive_jooliadb`.`drop_indexes`()
BEGIN
    DECLARE counter INT DEFAULT 0;
    DECLARE vTableName VARCHAR(32);
    DECLARE vIndexName VARCHAR(32);
    DECLARE done BOOLEAN DEFAULT FALSE;

    DECLARE curs CURSOR FOR
        SELECT DISTINCT TABLE_NAME, INDEX_NAME
        FROM information_schema.statistics
        WHERE table_schema = 'archive_jooliadb';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN curs;

    REPEAT
        FETCH curs INTO vTableName, vIndexName;
        IF NOT done THEN
            SET counter = counter + 1;
            SET @qStr := CONCAT('ALTER TABLE archive_jooliadb.', vTableName, ' DROP INDEX ', vIndexName, ';');
            PREPARE stmt FROM @qStr;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;
    UNTIL done END REPEAT;

    CLOSE curs;

    SELECT CONCAT('Dropped ', counter, ' indexes from archive db.') as debug;
END$$

DELIMITER ;


DROP PROCEDURE IF EXISTS `archive_jooliadb`.`drop_all_constraints`;
DELIMITER $$

CREATE PROCEDURE `archive_jooliadb`.`drop_all_constraints`()
BEGIN
    CALL drop_fk_constraints;
    CALL drop_key_constraints;
    CALL drop_indexes;
END$$

DELIMITER ;


DROP PROCEDURE IF EXISTS `archive_jooliadb`.`update_tables`;
DELIMITER $$

CREATE PROCEDURE `archive_jooliadb`.`update_tables`()
BEGIN
    DECLARE counter INT DEFAULT 0;
    DECLARE vTableSchema VARCHAR(32);
    DECLARE vTableName VARCHAR(32);
    DECLARE done BOOLEAN DEFAULT FALSE;

    DECLARE curs CURSOR FOR
        SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'archive_jooliadb';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN curs;

    REPEAT
        FETCH curs INTO vTableSchema, vTableName;
        IF NOT done THEN
            SET counter = counter + 1;
            SET @qStr := CONCAT('ALTER TABLE ', vTableSchema, '.', vTableName, ' ADD COLUMN deletedAt TIMESTAMP DEFAULT now(), ADD COLUMN deletedById VARCHAR(36) NOT NULL, ADD COLUMN requestId VARCHAR(24) NOT NULL;');
            PREPARE stmt FROM @qStr;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;
    UNTIL done END REPEAT;

    CLOSE curs;

    SELECT CONCAT('Updated ', counter, ' tables in archive db.') as debug;
END$$

DELIMITER ;
