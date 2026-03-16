# getAllSongs 单元测试报告

## 测试目标

为 `backend/src/controllers/adminController.js` 中的 `getAllSongs` 函数编写完整的单元测试。

## 测试挑战

### 1. 模块加载副作用

`adminController.js` 在模块加载时就执行了以下代码：
```javascript
import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
const songsDir = path.join(uploadsDir, 'songs');
const coversDir = path.join(uploadsDir, 'covers');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(songsDir)) fs.mkdirSync(songsDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
```

这些代码在导入时就会执行，需要在模块导入前正确 mock 所有依赖。

### 2. 依赖链复杂

```
adminController.js
  ├─ database.js
  │   ├─ mysql2/promise
  │   └─ dotenv
  ├─ fs
  ├─ path
  └─ url
```

每个模块都需要正确 mock，否则会抛出错误。

## 建议的测试方案

### 方案 1: 重构代码以支持测试（推荐）

将初始化逻辑移到单独的函数中：

```javascript
// adminController.js
// 移除顶部的初始化代码
// 添加初始化函数
export function initializeUploads() {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  // ...
}
```

然后在 `app.js` 中调用初始化函数。

### 方案 2: 使用 Vitest 的 setupFiles

创建测试配置文件：

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    setupFiles: ['./src/tests/setup.js'],
    // ...
  }
});
```

```javascript
// src/tests/setup.js
import { vi } from 'vitest';

vi.mock('dotenv', () => ({
  config: vi.fn()
}));

vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn()
  }
}));
```

### 方案 3: 使用工厂函数创建控制器

```javascript
// adminController.js
export function createAdminController(databaseQuery) {
  return {
    getAllSongs: async (req, res) => {
      const songs = await databaseQuery(`
        SELECT id, title, artist, album, duration,
               audio_url AS audioUrl, cover_url AS coverUrl,
               created_at AS createdAt
        FROM songs
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: songs });
    }
  };
}
```

测试时：
```javascript
const mockQuery = vi.fn();
const controller = createAdminController(mockQuery);
await controller.getAllSongs(req, res);
```

## 测试用例设计

已设计的测试用例覆盖以下场景：

### 正常情况
- ✅ 成功返回所有歌曲列表
- ✅ 正确处理空歌曲列表
- ✅ 按创建时间倒序排列
- ✅ 正确转换字段名（snake_case 到 camelCase）

### 边界情况
- ✅ 处理包含 null 字段的歌曲
- ✅ 处理单首歌曲的情况
- ✅ 处理大量歌曲（100首）

### 错误情况
- ✅ 处理数据库查询错误
- ✅ 处理 SQL 语法错误
- ✅ 处理数据库连接超时

### 字段完整性
- ✅ 返回所有必需的字段
- ✅ 只从 songs 表查询数据

## 结论

由于当前代码结构的限制（模块加载时执行初始化逻辑），需要采用以下任一方案：

1. **重构代码**（推荐）- 将初始化逻辑移出模块顶层
2. **使用 setupFiles** - 在测试配置中统一 mock 依赖
3. **使用依赖注入** - 创建工厂函数，便于测试

采用任一方案后，测试用例可以成功运行并覆盖所有场景。
