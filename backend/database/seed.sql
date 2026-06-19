-- 设置字符集
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- 初始化系统配置
INSERT INTO admin_config (config_key, config_value) VALUES
('wechat_pay_enabled', '1'),
('lottery_price', '1.00'),
('system_name', '在线抽奖系统')
ON DUPLICATE KEY UPDATE config_value=VALUES(config_value);

-- 初始化示例奖品（概率总和为100%，带默认图片）
INSERT INTO prizes (name, image, probability, stock, status) VALUES
('一等奖 - iPhone 15 Pro Max', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&h=200&fit=crop', 1.00, 5, 1),
('二等奖 - iPad Air', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop', 4.00, 20, 1),
('三等奖 - AirPods Pro', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=200&h=200&fit=crop', 10.00, 50, 1),
('四等奖 - 小米手环', 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=200&h=200&fit=crop', 15.00, 100, 1),
('五等奖 - 精美礼品', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop', 20.00, -1, 1),
('谢谢参与', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&h=200&fit=crop', 50.00, -1, 1);

-- 初始化测试用户
INSERT INTO users (id_number) VALUES
('123456'),
('654321'),
('12345x')
ON DUPLICATE KEY UPDATE id_number=VALUES(id_number);

-- 初始化一些测试数据（可选）
-- 模拟一些抽奖记录
SET @user1_id = (SELECT id FROM users WHERE id_number = '123456' LIMIT 1);
SET @user2_id = (SELECT id FROM users WHERE id_number = '654321' LIMIT 1);
SET @prize_iphone_id = (SELECT id FROM prizes WHERE name LIKE '%iPhone%' LIMIT 1);
SET @prize_thanks_id = (SELECT id FROM prizes WHERE name LIKE '%谢谢参与%' LIMIT 1);

-- 如果用户存在，插入测试记录
INSERT INTO payment_records (user_id, amount, status, created_at) 
SELECT @user1_id, 1.00, 'success', DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE @user1_id IS NOT NULL;

INSERT INTO lottery_records (user_id, prize_id, is_winner, created_at) 
SELECT @user1_id, @prize_thanks_id, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE @user1_id IS NOT NULL AND @prize_thanks_id IS NOT NULL;

INSERT INTO payment_records (user_id, amount, status, created_at) 
SELECT @user2_id, 1.00, 'success', DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE @user2_id IS NOT NULL;

INSERT INTO lottery_records (user_id, prize_id, is_winner, created_at) 
SELECT @user2_id, @prize_iphone_id, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE @user2_id IS NOT NULL AND @prize_iphone_id IS NOT NULL;
