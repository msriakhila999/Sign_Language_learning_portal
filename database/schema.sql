-- SignBridge Database Schema

CREATE DATABASE IF NOT EXISTS signbridge_db;
USE signbridge_db;

-- Drop existing tables in reverse dependency order if resetting
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS practice_results;
DROP TABLE IF EXISTS translation_history;
DROP TABLE IF EXISTS signs;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
);

-- 2. Categories Table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Signs Table
CREATE TABLE signs (
    sign_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    sign_name VARCHAR(100) NOT NULL,
    meaning VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    INDEX idx_sign_category (category_id),
    INDEX idx_sign_name (sign_name)
);

-- 4. Translation History Table
CREATE TABLE translation_history (
    translation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sign_id INT NULL,
    detected_sign VARCHAR(100) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    translated_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sign_id) REFERENCES signs(sign_id) ON DELETE SET NULL,
    INDEX idx_trans_user (user_id),
    INDEX idx_trans_created (created_at DESC)
);

-- 5. Practice Results Table
CREATE TABLE practice_results (
    practice_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sign_id INT NOT NULL,
    detected_sign VARCHAR(100) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    is_correct TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sign_id) REFERENCES signs(sign_id) ON DELETE CASCADE,
    INDEX idx_practice_user (user_id)
);

-- 6. User Progress Table
CREATE TABLE user_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sign_id INT NOT NULL,
    completed TINYINT(1) DEFAULT 0,
    accuracy DECIMAL(5, 2) DEFAULT 0.00,
    last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sign_id) REFERENCES signs(sign_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_sign (user_id, sign_id),
    INDEX idx_prog_user (user_id)
);
