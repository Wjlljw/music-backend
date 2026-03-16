# 音乐播放器数据库设计文档

## 数据库概览

- **数据库名称**: `music_player`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **表数量**: 3 张

---

## 表结构

### 1. songs（歌曲表）

存储所有歌曲的基本信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 歌曲唯一标识 |
| title | VARCHAR(255) | NOT NULL | 歌曲标题 |
| artist | VARCHAR(255) | NOT NULL | 歌手/艺术家 |
| album | VARCHAR(255) | - | 专辑名称 |
| duration | INT | NOT NULL | 歌曲时长（秒） |
| cover_url | VARCHAR(500) | - | 封面图片URL |
| audio_url | VARCHAR(500) | NOT NULL | 音频文件URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 2. playlists（歌单表）

存储用户创建的歌单信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 歌单唯一标识 |
| name | VARCHAR(255) | NOT NULL | 歌单名称 |
| description | TEXT | - | 歌单描述 |
| cover_url | VARCHAR(500) | - | 歌单封面URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

---

### 3. playlist_songs（歌单歌曲关联表）

实现歌单与歌曲的多对多关系（一个歌单包含多首歌曲，一首歌曲可在多个歌单中）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | AUTO_INCREMENT PRIMARY KEY | 自增主键 |
| playlist_id | VARCHAR(50) | NOT NULL, FOREIGN KEY | 关联的歌单ID |
| song_id | VARCHAR(50) | NOT NULL, FOREIGN KEY | 关联的歌曲ID |
| position | INT | DEFAULT 0 | 歌曲在歌单中的位置 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**外键约束**:
- `playlist_id` → `playlists(id)` ON DELETE CASCADE
- `song_id` → `songs(id)` ON DELETE CASCADE

**唯一索引**: `(playlist_id, song_id)` - 防止同一首歌在同一歌单中重复添加

---

## ER 图

```
┌─────────────────┐         ┌─────────────────────────┐         ┌─────────────────┐
│    playlists    │         │    playlist_songs       │         │      songs      │
├─────────────────┤         ├─────────────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ playlist_id (FK)        │────────►│ id (PK)         │
│ name            │         │ song_id (FK)            │         │ title           │
│ description     │         │ position                │         │ artist          │
│ cover_url       │         │ created_at              │         │ album           │
│ created_at      │         │                         │         │ duration        │
│ updated_at      │         │                         │         │ cover_url       │
└─────────────────┘         └─────────────────────────┘         │ audio_url       │
                                                              │ created_at     │
                                                              └─────────────────┘
```

---

## 初始数据

数据库初始化时会插入以下示例数据：

### 歌曲示例（10首）
- 夜曲 - 周杰伦
- 稻香 - 周杰伦
- 青花瓷 - 周杰伦
- 七里香 - 周杰伦
- 晴天 - 周杰伦
- 告白气球 - 周杰伦
- 慢慢喜欢你 - 莫文蔚
- 光年之外 - 邓紫棋
- 演员 - 薛之谦
- 起风了 - 买辣椒也用券

### 歌单示例（3个）
- 周杰伦精选（包含5首周杰伦歌曲）
- 流行热歌（包含4首热门歌曲）
- 深夜emo（包含4首伤感歌曲）

---

## 初始化命令

在 `backend` 目录下运行以下命令初始化数据库：

```bash
node src/config/initDatabase.js
```

该脚本会自动：
1. 创建 `music_player` 数据库
2. 创建3张表
3. 插入示例数据

---

## 数据库连接配置

在 `.env` 文件中配置数据库连接：

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_player
```
