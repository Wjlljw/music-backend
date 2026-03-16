/**
 * 管理后台路由
 * 处理歌曲上传、删除、编辑等路由
 */

// ========== 导入依赖模块 ==========
import express from 'express';
// 导入歌曲管理控制器
import {
  uploadSong,
  deleteSong,
  getAllSongs,
  updateSong
} from '../controllers/songAdminController.js';
// 导入歌单管理控制器
import {
  getAllPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getPlaylistDetail,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getAllSongsForPlaylist
} from '../controllers/playlistAdminController.js';
// 导入文件上传配置
import { upload } from '../config/upload.js';

// ========== 创建路由器 ==========
const router = express.Router();

// ========== 定义路由 ==========
// 注意: 这些路由会被挂载到 '/api/admin' 前缀下 (在 app.js 中定义)

// GET /api/admin/songs - 获取所有歌曲
router.get('/songs', getAllSongs);

// POST /api/admin/songs - 上传歌曲
// upload.fields([...]) 使用配置好的文件上传中间件
// 允许上传: 1个音频文件(audio字段) + 1个封面图片(cover字段)
router.post('/songs', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), uploadSong);

// PUT /api/admin/songs/:id - 更新歌曲
router.put('/songs/:id', updateSong);

// DELETE /api/admin/songs/:id - 删除歌曲
router.delete('/songs/:id', deleteSong);

// ========== 歌单管理路由 ==========

// GET /api/admin/playlists - 获取所有歌单
router.get('/playlists', getAllPlaylists);

// POST /api/admin/playlists - 创建歌单
router.post('/playlists', createPlaylist);

// PUT /api/admin/playlists/:id - 更新歌单
router.put('/playlists/:id', updatePlaylist);

// DELETE /api/admin/playlists/:id - 删除歌单
router.delete('/playlists/:id', deletePlaylist);

// GET /api/admin/playlists/:id - 获取歌单详情（包含歌曲列表）
router.get('/playlists/:id', getPlaylistDetail);

// GET /api/admin/playlists/:id/songs - 获取所有歌曲（用于添加到歌单）
router.get('/playlists/:id/songs', getAllSongsForPlaylist);

// POST /api/admin/playlists/:id/songs - 添加歌曲到歌单
router.post('/playlists/:id/songs', addSongToPlaylist);

// DELETE /api/admin/playlists/:id/songs/:songId - 从歌单移除歌曲
router.delete('/playlists/:id/songs/:songId', removeSongFromPlaylist);

export default router;
