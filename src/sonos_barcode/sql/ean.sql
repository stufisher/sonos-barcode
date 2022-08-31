CREATE TABLE `barcode` (
    `barcode` VARCHAR(50) NOT NULL,
    `entity` VARCHAR(250) NOT NULL,
    PRIMARY KEY (`barcode`),
    UNIQUE KEY (`barcode`)
) ENGINE = InnoDB;
