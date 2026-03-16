# 音乐播放器后端服务

🎵 基于 Express + MySQL + JWT 的音乐播放器后端 API

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | ^4.18.2 | Web 框架 |
| MySQL2 | ^3.6.5 | 数据库驱动 |
| JWT | latest | 认证机制 |
| CORS | ^2.8.5 | 跨域处理 |
| Multer | latest | 文件上传 |

## 项目结构

```
backend/
├── src/
│   ├── app.js                 # 应用入口
│   ├── config/
│   │   ├── database.js        # 数据库配置
│   │   ├── initDatabase.js    # 数据库初始化
│   │   └── upload.js          # 文件上传配置
│   ├── controllers/
│   │   ├── authController.js      # 认证控制器 (JWT)
│   │   ├── songAdminController.js # 歌曲管理
│   │   ├── playlistAdminController.js # 歌单管理
│   │   ├── songController.js      # 歌曲查询
│   │   └── playlistController.js  # 歌单查询
│   ├── middleware/
│   │   └── errorHandler.js    # 错误处理
│   ├── routes/
│   │   ├── adminRoutes.js     # 管理后台路由
│   │   ├── authRoutes.js      # 认证路由
│   │   ├── songRoutes.js      # 歌曲路由
│   │   └── playlistRoutes.js  # 歌单路由
│   └── utils/
│       └── fileUtils.js       # 文件工具
├── uploads/                   # 上传文件目录
├── .env                       # 环境变量
├── .gitignore                 # Git 忽略配置
└── package.json               # 项目配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_player

# JWT 配置
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRES_IN=24h

# CORS 配置
CORS_ORIGIN=http://localhost:5173

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. 初始化数据库

```bash
npm run init-db
```

### 4. 启动服务

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

服务启动后访问：http://localhost:3000

## API 文档

### 认证相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/admin/login` | 管理员登录 | 否 |
| GET | `/api/auth/admin/me` | 获取当前管理员 | 是 |
| POST | `/api/auth/admin/logout` | 登出 | 是 |

**登录请求示例：**
```json
POST /api/auth/admin/login
{
  "username": "admin",
  "password": "admin123"
}
```

**登录响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "username": "admin",
    "role": "admin"
  }
}
```

### 歌曲管理（需要认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/songs` | 获取所有歌曲 |
| POST | `/api/admin/songs` | 上传歌曲 |
| PUT | `/api/admin/songs/:id` | 更新歌曲 |
| DELETE | `/api/admin/songs/:id` | 删除歌曲 |

**上传歌曲请求：**
```bash
curl -X POST http://localhost:3000/api/admin/songs \
  -H "Authorization: Bearer <token>" \
  -F "title=歌曲名称" \
  -F "artist=艺术家" \
  -F "audio=@song.mp3" \
  -F "cover=@cover.jpg"
```

### 歌单管理（需要认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/playlists` | 获取所有歌单 |
| POST | `/api/admin/playlists` | 创建歌单 |
| PUT | `/api/admin/playlists/:id` | 更新歌单 |
| DELETE | `/api/admin/playlists/:id` | 删除歌单 |
| GET | `/api/admin/playlists/:id` | 获取歌单详情 |
| GET | `/api/admin/playlists/:id/songs` | 获取可添加的歌曲 |
| POST | `/api/admin/playlists/:id/songs` | 添加歌曲到歌单 |
| DELETE | `/api/admin/playlists/:id/songs/:songId` | 从歌单移除歌曲 |

### 公开接口（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/songs` | 获取歌曲列表 |
| GET | `/api/songs/:id` | 获取歌曲详情 |
| GET | `/api/playlists` | 获取歌单列表 |
| GET | `/api/playlists/:id` | 获取歌单详情 |
| GET | `/health` | 健康检查 |

## 认证说明

本项目使用 **JWT Token** 进行认证：

1. 登录成功后获取 `token`
2. 后续请求在 Header 中携带：
   ```
   Authorization: Bearer <token>
   ```
3. Token 默认 24 小时过期

## 数据库表结构

### songs（歌曲表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR | 主键 |
| title | VARCHAR | 歌曲标题 |
| artist | VARCHAR | 艺术家 |
| album | VARCHAR | 专辑 |
| duration | INT | 时长（秒）|
| audioUrl | VARCHAR | 音频文件路径 |
| coverUrl | VARCHAR | 封面图片路径 |
| createdAt | DATETIME | 创建时间 |

### playlists（歌单表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR | 主键 |
| name | VARCHAR | 歌单名称 |
| description | TEXT | 描述 |
| coverUrl | VARCHAR | 封面路径 |
| createdAt | DATETIME | 创建时间 |

### playlist_songs（歌单歌曲关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| playlistId | VARCHAR | 歌单ID |
| songId | VARCHAR | 歌曲ID |
| addedAt | DATETIME | 添加时间 |

## 脚本命令

```bash
npm start          # 启动服务
npm run dev        # 开发模式（热重载）
npm run init-db    # 初始化数据库
npm test           # 运行测试
npm run test:watch # 监听测试
npm run test:coverage # 测试覆盖率
```

## 注意事项

1. **生产环境**：务必修改 `JWT_SECRET` 和默认管理员密码
2. **文件上传**：上传的文件存储在 `uploads/` 目录
3. **数据库**：确保 MySQL 服务已启动且配置正确
4. **CORS**：如需跨域，修改 `CORS_ORIGIN` 配置

## License

MIT
