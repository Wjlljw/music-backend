# 音乐播放器后端 API

基于 Node.js + Express + MySQL 构建的音乐播放器后端服务。

## 技术栈

- Node.js
- Express.js
- MySQL
- CORS

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js     # 数据库连接
│   │   └── initDatabase.js # 数据库初始化
│   ├── controllers/      # 控制器层
│   │   ├── songController.js
│   │   └── playlistController.js
│   ├── models/          # 数据模型层
│   │   ├── Song.js
│   │   └── Playlist.js
│   ├── routes/          # 路由层
│   │   ├── songRoutes.js
│   │   └── playlistRoutes.js
│   ├── middleware/      # 中间件
│   │   └── errorHandler.js
│   └── app.js          # 应用入口
├── .env               # 环境变量
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

编辑 `.env` 文件，配置数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_player
```

### 3. 初始化数据库

```bash
npm run init-db
```

### 4. 启动服务

```bash
npm run dev
```

开发模式使用 nodemon 自动重启，生产模式使用：

```bash
npm start
```

## API 接口

### 歌曲接口

| 方法 | 路径 | 说明 |
|------|--------|------|
| GET | `/api/songs` | 获取所有歌曲 |
| GET | `/api/songs/:id` | 获取单首歌曲 |
| GET | `/api/songs/search?query=xxx` | 搜索歌曲 |
| POST | `/api/songs` | 创建歌曲 |
| PUT | `/api/songs/:id` | 更新歌曲 |
| DELETE | `/api/songs/:id` | 删除歌曲 |

### 歌单接口

| 方法 | 路径 | 说明 |
|------|--------|------|
| GET | `/api/playlists` | 获取所有歌单 |
| GET | `/api/playlists/:id` | 获取歌单详情 |
| POST | `/api/playlists` | 创建歌单 |
| PUT | `/api/playlists/:id` | 更新歌单 |
| DELETE | `/api/playlists/:id` | 删除歌单 |
| POST | `/api/playlists/:id/songs` | 添加歌曲到歌单 |
| DELETE | `/api/playlists/:id/songs/:songId` | 从歌单移除歌曲 |

### 健康检查

| 方法 | 路径 | 说明 |
|------|--------|------|
| GET | `/health` | 服务器健康检查 |

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误"
}
```

## 数据库表结构

### songs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 主键 |
| title | VARCHAR(255) | 歌曲标题 |
| artist | VARCHAR(255) | 艺术家 |
| album | VARCHAR(255) | 专辑 |
| duration | INT | 时长（秒） |
| cover_url | VARCHAR(500) | 封面 URL |
| audio_url | VARCHAR(500) | 音频 URL |

### playlists 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 主键 |
| name | VARCHAR(255) | 歌单名称 |
| description | TEXT | 描述 |
| cover_url | VARCHAR(500) | 封面 URL |

### playlist_songs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| playlist_id | VARCHAR(50) | 歌单 ID（外键） |
| song_id | VARCHAR(50) | 歌曲 ID（外键） |
| position | INT | 排序位置 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|---------|------|
| PORT | 3000 | 服务器端口 |
| NODE_ENV | development | 运行环境 |
| DB_HOST | localhost | 数据库主机 |
| DB_PORT | 3306 | 数据库端口 |
| DB_USER | root | 数据库用户名 |
| DB_PASSWORD | - | 数据库密码 |
| DB_NAME | music_player | 数据库名称 |
| CORS_ORIGIN | http://localhost:5173 | CORS 允许的源 |

## 开发

```bash
# 安装依赖
npm install

# 初始化数据库
npm run init-db

# 启动开发服务器
npm run dev
```

## 生产部署

```bash
# 安装依赖
npm install --production

# 设置生产环境变量
export NODE_ENV=production

# 启动服务器
npm start
```

## 注意事项

1. 确保 MySQL 服务已启动
2. 确保 `.env` 文件中的数据库配置正确
3. 前端需要配置正确的 `VITE_API_BASE_URL`
