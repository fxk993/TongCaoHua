-- 创建数据库
CREATE DATABASE IF NOT EXISTS tongcaohua_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tongcaohua_db;

-- 创建作品表
CREATE TABLE IF NOT EXISTS artworks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    image_url VARCHAR(255),
    artist_id INT,
    create_time DATETIME,
    update_time DATETIME,
    status TINYINT DEFAULT 1
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建艺术家表
CREATE TABLE IF NOT EXISTS artists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    title VARCHAR(100),
    description TEXT,
    avatar_url VARCHAR(255),
    level VARCHAR(50),
    create_time DATETIME,
    update_time DATETIME
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建留言表
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    content TEXT,
    create_time DATETIME,
    status TINYINT DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    create_time DATETIME,
    update_time DATETIME
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 