-- 设置字符集
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS lottery CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE lottery;

-- 奖品表
CREATE TABLE IF NOT EXISTS prizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '奖品名称',
  image VARCHAR(255) DEFAULT NULL COMMENT '奖品图片路径',
  probability DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '中奖概率(%)',
  stock INT DEFAULT -1 COMMENT '库存数量(-1=无限)',
  status TINYINT DEFAULT 1 COMMENT '状态(1=启用,0=禁用)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_probability (probability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='奖品表';

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_number VARCHAR(10) NOT NULL UNIQUE COMMENT '证件号后六位',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_id_number (id_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- 抽奖记录表
CREATE TABLE IF NOT EXISTS lottery_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prize_id INT NULL COMMENT '中奖奖品ID(NULL=未中奖)',
  is_winner TINYINT DEFAULT 0 COMMENT '是否中奖(1=是,0=否)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_winner (is_winner),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='抽奖记录表';

-- 支付记录表
CREATE TABLE IF NOT EXISTS payment_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 1.00 COMMENT '支付金额',
  status VARCHAR(20) DEFAULT 'success' COMMENT '支付状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='支付记录表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS admin_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(50) NOT NULL UNIQUE,
  config_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统配置表';
