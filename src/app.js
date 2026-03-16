/**
 * Express 应用入口文件
 * 整个后端服务的启动入口，负责：
 * 1. 初始化Express应用
 * 2. 配置中间件（CORS、解析请求体等）
 * 3. 注册API路由
 * 4. 启动HTTP服务器
 */

import express from 'express';  // Express框架 - Web服务器核心
import cors from 'cors';      // CORS中间件 - 处理跨域请求
import dotenv from 'dotenv';   // 环境变量管理 - 读取.env配置文件
import { testConnection } from './config/database.js';           // 数据库连接测试
import { errorHandler, notFound } from './middleware/errorHandler.js';  // 错误处理中间件
import songRoutes from './routes/songRoutes.js';                // 歌曲相关API路由
import playlistRoutes from './routes/playlistRoutes.js';         // 歌单相关API路由
import adminRoutes from './routes/adminRoutes.js';              // 管理后台API路由
import authRoutes from './routes/authRoutes.js';                // 认证相关API路由
import { requireAdmin } from './controllers/authController.js'; // 管理员认证中间件
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== 第1部分：环境变量加载 ==========
dotenv.config();
// 作用：读取根目录下的.env文件，将配置项加载到process.env对象中
// 例如：DB_HOST、DB_PASSWORD、PORT等配置

// ========== 第2部分：创建Express应用 ==========
const app = express();
// 作用：创建一个Express应用实例，后续所有配置都基于这个app对象

// ========== 第3部分：中间件配置 ==========
// 中间件按顺序执行，处理进入的每个请求

// 3.1 CORS配置 - 允许跨域请求
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',  // 允许的前端域名
  credentials: true  // 允许携带Cookie和认证信息
}));
// 作用：解决前端（端口5173）访问后端（端口3001）的跨域问题

// 3.2 请求体解析 - 解析JSON格式的请求体
app.use(express.json());
// 作用：将请求体中的JSON数据自动解析为JavaScript对象，通过req.body访问

// 3.3 URL编码解析 - 解析表单数据
app.use(express.urlencoded({ extended: true }));
// 作用：解析application/x-www-form-urlencoded格式的表单数据

// 3.4 静态文件服务 - 提供上传的文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, 'public')));
// 作用：提供静态文件访问，包括上传的歌曲、封面和管理后台页面

// 3.5 请求日志中间件 - 打印每个请求的信息
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();  // 继续执行下一个中间件
});
// 作用：在控制台输出"GET /api/songs"这样的日志，便于调试

// ========== 第4部分：路由注册 ==========
// 将不同功能的路由挂载到对应的路径前缀

app.use('/api/songs', songRoutes);
// 作用：所有/api/songs开头的请求交给songRoutes处理
// 例如：GET /api/songs、GET /api/songs/s1

app.use('/api/playlists', playlistRoutes);
// 作用：所有/api/playlists开头的请求交给playlistRoutes处理
// 例如：GET /api/playlists、POST /api/playlists

app.use('/api/auth', authRoutes);
// 作用：所有/api/auth开头的请求交给authRoutes处理
// 例如：POST /api/auth/admin/login

app.use('/api/admin', requireAdmin, adminRoutes);
// 作用：所有/api/admin开头的请求需要管理员认证，然后交给adminRoutes处理
// 例如：GET /api/admin/songs、POST /api/admin/songs

// ========== 第5部分：特殊端点 ==========

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});
// 作用：提供一个简单的接口，用于检测服务器是否正常运行
// 可用于：监控工具、容器健康检查、服务发现

// ========== 第6部分：错误处理 ==========
// 注意：错误处理中间件必须放在最后

// 处理404 - 请求的资源不存在
app.use(notFound);
// 作用：当没有匹配的路由时返回404错误

// 统一错误处理
app.use(errorHandler);
// 作用：捕获所有中间件和路由中的错误，返回统一的错误格式

// ========== 第7部分：服务器启动 ==========

const PORT = process.env.PORT || 3000;
// 作用：从环境变量读取端口号，默认3000

const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    // 作用：启动前确保数据库可连接，避免服务启动后才发现数据库问题

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║  🎵 音乐播放器后端服务已启动                     ║
║                                              ║
║  📍 地址: http://localhost:${PORT}            ║
║  🏥 健康检查: http://localhost:${PORT}/health  ║
║  📚 API 文档: http://localhost:${PORT}/api    ║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
    });
    // 作用：在指定端口监听HTTP请求
    // 服务器启动后，可以接收来自前端的API请求
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
    // 作用：如果启动失败，打印错误并退出程序（退出码1表示异常退出）
  }
};

// 执行启动函数
startServer();

// 导出app对象（用于测试）
export default app;
