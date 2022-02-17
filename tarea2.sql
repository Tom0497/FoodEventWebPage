-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema tarea2
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema tarea2
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `tarea2` DEFAULT CHARACTER SET utf8 ;
USE `tarea2` ;

-- -----------------------------------------------------
-- Table `tarea2`.`region`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tarea2`.`region` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tarea2`.`comuna`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tarea2`.`comuna` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `region_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_comuna_region1_idx` (`region_id` ASC),
  CONSTRAINT `fk_comuna_region1`
    FOREIGN KEY (`region_id`)
    REFERENCES `tarea2`.`region` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tarea2`.`evento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tarea2`.`evento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `comuna_id` INT NOT NULL,
  `sector` VARCHAR(100) NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `celular` VARCHAR(15) NULL,
  `dia_hora_inicio` DATETIME NOT NULL,
  `dia_hora_termino` DATETIME NOT NULL,
  `descripcion` VARCHAR(500) NULL,
  `tipo` ENUM('Al Paso', 'Alemana', 'Árabe', 'Argentina', 'Asiática', 'Australiana', 'Brasileña', 'Café y Snacks', 'Carnes', 'Casera', 'Chilena', 'China', 'Cocina de Autor', 'Comida Rápida', 'Completos', 'Coreana', 'Cubana', 'Española', 'Exótica', 'Francesa', 'Gringa', 'Hamburguesa', 'Helados', 'India', 'Internacional', 'Italiana', 'Latinoamericana', 'Mediterránea', 'Mexicana', 'Nikkei', 'Parrillada', 'Peruana', 'Pescados y mariscos', 'Picoteos', 'Pizzas', 'Pollos y Pavos', 'Saludable', 'Sándwiches', 'Suiza', 'Japonesa', 'Sushi', 'Tapas', 'Thai', 'Vegana', 'Vegetariana') NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_evento_comuna1_idx` (`comuna_id` ASC),
  CONSTRAINT `fk_evento_comuna1`
    FOREIGN KEY (`comuna_id`)
    REFERENCES `tarea2`.`comuna` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tarea2`.`foto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tarea2`.`foto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ruta_archivo` VARCHAR(300) NOT NULL,
  `nombre_archivo` VARCHAR(300) NOT NULL,
  `evento_id` INT NOT NULL,
  PRIMARY KEY (`id`, `evento_id`),
  INDEX `fk_foto_evento1_idx` (`evento_id` ASC),
  CONSTRAINT `fk_foto_evento1`
    FOREIGN KEY (`evento_id`)
    REFERENCES `tarea2`.`evento` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tarea2`.`red_social`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tarea2`.`red_social` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` ENUM('twitter', 'facebook', 'instagram', 'tiktok', 'otra') NOT NULL,
  `identificador` VARCHAR(150) NOT NULL,
  `evento_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_red_social_evento1_idx` (`evento_id` ASC),
  CONSTRAINT `fk_red_social_evento1`
    FOREIGN KEY (`evento_id`)
    REFERENCES `tarea2`.`evento` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
