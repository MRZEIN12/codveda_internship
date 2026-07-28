-- Codveda Internship - MySQL Schema
-- Level 1+ shared database for REST API / full-stack tasks

CREATE DATABASE IF NOT EXISTS coveda_internship
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE coveda_internship;

-- Users (auth ready for Level 2)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NULL COMMENT 'hashed password for Level 2 auth',
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- Products (main CRUD resource for Level 1 REST API)
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  user_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_name (name),
  INDEX idx_products_user (user_id),
  CONSTRAINT fk_products_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- Sample data for testing API endpoints
INSERT INTO products (name, description, price, stock) VALUES
  ('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 19.99, 50),
  ('Mechanical Keyboard', 'RGB backlit mechanical keyboard', 79.99, 25),
  ('USB-C Hub', '7-in-1 USB-C multiport adapter', 34.50, 40)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@coveda.test', NULL, 'admin'),
  ('Demo User', 'demo@coveda.test', NULL, 'user')
ON DUPLICATE KEY UPDATE name = VALUES(name);
