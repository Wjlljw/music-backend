/**
 * 文件上传配置
 * 统一管理multer的配置,包括存储策略、文件过滤、大小限制等
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== 存储策略配置 ==========
// 决定文件保存到哪个目录和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, path.join(__dirname, '../../uploads/songs'));
    } else if (file.fieldname === 'cover') {
      cb(null, path.join(__dirname, '../../uploads/covers'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// ========== 文件过滤配置 ==========
// 上传前检查文件类型
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    const allowedTypes = ['.mp3', '.wav', '.ogg', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持音频格式: mp3, wav, ogg, m4a'));
    }
  } else if (file.fieldname === 'cover') {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片格式: jpg, jpeg, png, gif, webp'));
    }
  } else {
    cb(new Error('未知的文件字段'));
  }
};

// ========== 文件大小限制 ==========
const limits = {
  fileSize: 50 * 1024 * 1024 // 50MB
};

// ========== 导出配置 ==========
// 导出multer实例供路由使用
export const upload = multer({
  storage,
  fileFilter,
  limits
});

// 也可以单独导出各个配置,方便复用
export const uploadConfig = {
  storage,
  fileFilter,
  limits
};
