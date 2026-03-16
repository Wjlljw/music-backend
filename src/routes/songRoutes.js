/**
 * Song Routes - 歌曲路由
 */

import express from 'express';
import { songController } from '../controllers/songController.js';

const router = express.Router();

// 获取所有歌曲
router.get('/', songController.getAllSongs);

// 搜索歌曲
router.get('/search', songController.searchSongs);

// 获取单首歌曲
router.get('/:id', songController.getSongById);

// 创建歌曲
router.post('/', songController.createSong);

// 更新歌曲
router.put('/:id', songController.updateSong);

// 删除歌曲
router.delete('/:id', songController.deleteSong);

export default router;
