/**
 * Playlist Routes - 歌单路由
 */

import express from 'express';
import { playlistController } from '../controllers/playlistController.js';

const router = express.Router();

// 获取所有歌单
router.get('/', playlistController.getAllPlaylists);

// 获取歌单详情
router.get('/:id', playlistController.getPlaylistById);

// 创建歌单
router.post('/', playlistController.createPlaylist);

// 更新歌单
router.put('/:id', playlistController.updatePlaylist);

// 删除歌单
router.delete('/:id', playlistController.deletePlaylist);

// 添加歌曲到歌单
router.post('/:id/songs', playlistController.addSongToPlaylist);

// 从歌单移除歌曲
router.delete('/:id/songs/:songId', playlistController.removeSongFromPlaylist);

export default router;
