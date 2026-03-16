/**
 * 认证路由
 * 处理管理员登录、登出等
 */

import express from 'express';
import {
  adminLogin,
  getCurrentAdmin,
  adminLogout,
  requireAdmin
} from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/admin/login - 管理员登录
router.post('/admin/login', adminLogin);

// GET /api/auth/admin/me - 获取当前管理员信息（需要登录）
router.get('/admin/me', requireAdmin, getCurrentAdmin);

// POST /api/auth/admin/logout - 管理员登出（需要登录）
router.post('/admin/logout', requireAdmin, adminLogout);

export default router;
