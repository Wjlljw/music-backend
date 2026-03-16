/**
 * 管理员认证控制器
 * 处理管理员登录验证 - 使用 JWT Token
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT 密钥（生产环境应从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * 生成 JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT Token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 管理员登录
 */
export async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码是必填项'
      });
    }

    // 默认管理员账号: admin / admin123
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT Token
    const token = generateToken({
      username: username,
      role: 'admin'
    });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,        // 改为返回 token 而不是 sessionId
        username,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
}

/**
 * 检查管理员权限中间件
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未登录，请先登录'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: '登录已过期或无效，请重新登录'
    });
  }

  req.adminUser = decoded;
  next();
}

/**
 * 获取当前登录管理员信息
 */
export function getCurrentAdmin(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '未登录或登录已过期'
      });
    }

    res.json({
      success: true,
      data: {
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取管理员信息失败',
      error: error.message
    });
  }
}

/**
 * 管理员登出
 * JWT 是无状态的，客户端删除 token 即可
 * 这里可以选择性地将 token 加入黑名单（如果需要立即失效）
 */
export function adminLogout(req, res) {
  try {
    // JWT 是无状态的，登出只需客户端删除 token
    // 如果需要实现 token 黑名单，可以将 token 存入 Redis/数据库

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({
      success: false,
      message: '登出失败',
      error: error.message
    });
  }
}
