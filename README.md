# 在线抽奖系统

一个基于 Docker 容器化部署的全栈在线抽奖系统，支持奖品管理、概率配置、用户抽奖、支付模拟和数据统计功能。

## 🛠 技术栈

- **前端**: React 18 + Vite + Tailwind CSS + Shadcn UI + React Router
- **后端**: PHP 8.2 + Slim Framework 4 + Eloquent ORM
- **数据库**: MySQL 8.0 (utf8mb4_0900_ai_ci字符集，支持中文和emoji)
- **容器化**: Docker + Docker Compose
- **日志**: Monolog (输出到stdout)

## ✨ 功能特性

### 前台功能
- 🎰 **转盘抽奖**: 精美的转盘动画效果，支持自定义奖品
- 🎫 **证件号登记**: 输入证件号后六位（支持数字和字母x）
- 💰 **模拟支付**: 点击即完成支付，每次1元获取抽奖机会
- 📜 **抽奖历史**: 根据证件号查询个人抽奖记录
- 🎁 **实时反馈**: Toast提示，显示中奖结果

### 后台功能
- 📦 **奖品管理**: 增删改查奖品，支持图片上传
- 🎲 **概率设置**: 灵活配置每个奖品的中奖概率（0-100%）
- 📊 **数据统计**: 查看参与人数、抽奖次数、中奖率、总收入
- 📈 **趋势分析**: 最近7天的抽奖和中奖趋势
- 🎯 **奖品统计**: 各奖品的中奖次数和库存情况

### 技术亮点
- ✅ 100% Docker容器化，一键启动
- ✅ 前后端分离架构
- ✅ 使用Eloquent ORM，拒绝SQL注入
- ✅ 标准日志输出，可通过docker logs查看
- ✅ Error Boundary错误边界，防止白屏
- ✅ 加权随机抽奖算法，保证概率准确性
- ✅ 响应式设计，支持PC和移动端
- ✅ 现代化UI设计，渐变背景+卡片布局

## 🚀 启动指南

### 前置要求
- Docker Desktop 已安装并运行
- 无需本地安装 Node.js、PHP、MySQL 等环境

### 快速启动

1. **克隆项目**（如果从代码仓库获取）
```bash
cd /path/to/project
```

2. **一键启动所有服务**
```bash
docker compose up --build
```

3. **等待启动完成**
   - 首次启动需要下载镜像和安装依赖，约需2-5分钟
   - 看到以下日志表示启动成功：
     ```
     frontend-1  | ➜  Local:   http://localhost:3893/
     backend-1   | [INFO] Application started
     db-1        | ready for connections
     ```

4. **访问系统**
   - 前台抽奖页面: http://localhost:3893
   - 后台管理页面: http://localhost:3893/admin
   - 抽奖记录查询: http://localhost:3893/history

### 停止服务
```bash
docker compose down
```

### 重新构建
```bash
docker compose up --build --force-recreate
```

## 🔗 服务地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3893 | React前端页面 |
| 后端API | http://localhost:8893/api | RESTful API接口 |
| 数据库 | localhost:3393 | MySQL数据库 (用户: root, 密码: root) |

## 🎮 使用指南

### 前台抽奖流程

1. 访问 http://localhost:3893
2. 点击"开始抽奖"按钮
3. 输入证件号后六位（例如：123456、12345x）
4. 系统提示"证件号错误将无法兑奖"
5. 点击"下一步"进入支付页面
6. 确认支付1元（模拟支付，点击即成功）
7. 观看转盘动画（约4秒）
8. 显示中奖结果
9. 可以查看个人抽奖历史

### 后台管理操作

#### 奖品管理
1. 访问 http://localhost:3893/admin
2. 点击"奖品管理"
3. 添加新奖品：
   - 填写奖品名称（必填）
   - 设置中奖概率（0-100%）
   - 设置库存数量（-1表示无限）
   - 上传奖品图片（可选）
   - 选择启用/禁用状态
4. 编辑/删除现有奖品
5. 注意：所有启用奖品的概率总和建议≤100%

#### 数据统计
1. 访问 http://localhost:3893/admin
2. 点击"数据统计"
3. 查看关键指标：
   - 总参与人数
   - 总抽奖次数
   - 总中奖次数
   - 中奖率
   - 总收入
4. 查看各奖品中奖统计
5. 查看最近7天抽奖趋势

## 🧪 测试说明

### 测试数据
系统已预置测试数据：

**测试用户**
- 证件号：123456（已有历史记录）
- 证件号：654321（已中过一等奖）
- 证件号：12345x（含字母x的示例）

**预置奖品**
- 一等奖 - iPhone 15 Pro Max (概率: 1%)
- 二等奖 - iPad Air (概率: 4%)
- 三等奖 - AirPods Pro (概率: 10%)
- 四等奖 - 小米手环 (概率: 15%)
- 五等奖 - 精美礼品 (概率: 20%)
- 谢谢参与 (概率: 50%)

### 测试场景

1. **完整抽奖流程**
   ```
   输入证件号 → 支付1元 → 抽奖 → 查看结果 → 查询历史
   ```

2. **后台管理测试**
   ```
   添加奖品 → 设置概率 → 上传图片 → 查看统计 → 修改奖品 → 删除奖品
   ```

3. **边界情况测试**
   - 输入非6位证件号
   - 输入特殊字符
   - 概率总和超过100%
   - 库存为0的奖品

## 📊 数据库说明

### 字符集
- 数据库：`utf8mb4`
- 排序规则：`utf8mb4_0900_ai_ci`
- 支持存储中文、emoji等多字节字符

### 数据表
- `prizes` - 奖品表
- `users` - 用户表
- `lottery_records` - 抽奖记录表
- `payment_records` - 支付记录表
- `admin_config` - 系统配置表

### 数据持久化
- 使用Docker Volume存储，容器重启数据不丢失
- Volume名称：`893_db_data`

### 连接数据库
```bash
# 方式1：使用docker exec
docker compose exec db mysql -uroot -proot lottery

# 方式2：使用本地MySQL客户端
mysql -h 127.0.0.1 -P 3393 -uroot -proot lottery
```

## 🐛 故障排查

### 端口冲突
如果端口3893、8893或3393被占用：
```bash
# 查看端口占用
lsof -i :3893
lsof -i :8893
lsof -i :3393

# 修改docker-compose.yml中的端口映射
```

### 容器启动失败
```bash
# 查看日志
docker compose logs frontend
docker compose logs backend
docker compose logs db

# 重新构建
docker compose down -v
docker compose up --build
```

### 前端无法访问后端
- 检查nginx.conf中的代理配置
- 确认backend容器正在运行：`docker compose ps`
- 检查浏览器控制台是否有CORS错误

### 数据库连接失败
- 等待数据库完全启动（约10-20秒）
- 检查docker-compose.yml中的环境变量
- 查看数据库日志：`docker compose logs db`

## 📁 项目结构

```
.
├── docker-compose.yml          # Docker编排配置
├── README.md                   # 项目文档
├── .gitignore                  # Git忽略配置
├── backend/                    # 后端代码
│   ├── Dockerfile             # 后端镜像
│   ├── composer.json          # PHP依赖
│   ├── apache-config.conf     # Apache配置
│   ├── public/
│   │   └── index.php         # 入口文件+路由
│   ├── src/
│   │   ├── Models/           # Eloquent模型
│   │   ├── Controllers/      # 控制器
│   │   ├── Services/         # 业务逻辑
│   │   └── Middleware/       # 中间件
│   ├── database/
│   │   ├── schema.sql        # 数据库结构
│   │   └── seed.sql          # 初始化数据
│   └── uploads/              # 上传文件目录
└── frontend/                  # 前端代码
    ├── Dockerfile            # 前端镜像
    ├── package.json          # 前端依赖
    ├── vite.config.js        # Vite配置
    ├── tailwind.config.js    # Tailwind配置
    ├── nginx.conf            # Nginx配置
    ├── index.html            # HTML模板
    └── src/
        ├── main.jsx          # 应用入口
        ├── App.jsx           # 根组件+路由
        ├── components/       # 通用组件
        │   ├── ui/          # UI组件库
        │   ├── LotteryWheel.jsx    # 转盘组件
        │   ├── PaymentModal.jsx    # 支付弹窗
        │   └── ErrorBoundary.jsx   # 错误边界
        ├── pages/            # 页面组件
        │   ├── Lottery.jsx   # 抽奖页面
        │   ├── History.jsx   # 历史记录
        │   ├── Admin.jsx     # 后台首页
        │   ├── PrizeManage.jsx     # 奖品管理
        │   └── Statistics.jsx      # 数据统计
        ├── services/
        │   └── api.js        # API封装
        └── lib/
            └── utils.js      # 工具函数
```

## 🔒 安全说明

- 本项目为演示项目，仅用于学习和测试
- 支付功能为模拟实现，未接入真实支付接口
- 后台管理未设置登录认证，生产环境需要添加
- 数据库密码为简单密码，生产环境需使用强密码

## 📝 开发说明

### 本地开发模式

如需修改代码并实时预览：

**前端开发**
```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

**后端开发**
```bash
cd backend
composer install
# 使用PHP内置服务器或配置Apache/Nginx
```

### 日志查看
```bash
# 实时查看所有日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## 📄 License

MIT License

## 🙋 常见问题

**Q: 为什么首次启动这么慢？**  
A: 需要下载Docker镜像（MySQL、PHP、Node等）和安装依赖，后续启动会很快。

**Q: 可以修改端口吗？**  
A: 可以，修改docker-compose.yml中的ports配置即可。

**Q: 数据会丢失吗？**  
A: 使用Docker Volume持久化存储，除非执行`docker compose down -v`删除volume，否则数据不会丢失。

**Q: 如何重置数据库？**  
A: 执行`docker compose down -v && docker compose up --build`，会重新初始化数据库。

**Q: 支持真实支付吗？**  
A: 当前为模拟支付，可以参考代码集成微信支付、支付宝等真实支付接口。

**Q: 中奖概率准确吗？**  
A: 使用加权随机算法，理论上是准确的。可以通过大量测试验证概率分布。

---

**开发时间**: 2026年1月  
**项目类型**: 全栈演示项目  
**适用场景**: 企业年会、商场促销、线上活动等抽奖场景
