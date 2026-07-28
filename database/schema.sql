-- Codveda Internship schema
-- Table names use *_codveda suffix so they can share a DB with other projects

CREATE DATABASE IF NOT EXISTS coveda_internship
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE coveda_internship;

CREATE TABLE IF NOT EXISTS users_codveda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_codveda_email (email),
  INDEX idx_users_codveda_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products_codveda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_codveda_name (name),
  INDEX idx_products_codveda_user (user_id),
  CONSTRAINT fk_products_codveda_user
    FOREIGN KEY (user_id) REFERENCES users_codveda(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;
