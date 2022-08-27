CREATE TABLE `barcode` (
    `barcode` INT(15) NOT NULL,
    `entity` VARCHAR(250) NOT NULL,
    PRIMARY KEY (`barcode`),
    UNIQUE KEY (`barcode`)
) ENGINE = InnoDB;
