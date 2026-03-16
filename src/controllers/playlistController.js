/**
 * Playlist Controller - 歌单接口控制器
 */

import { Playlist } from '../models/Playlist.js';

export const playlistController = {
  /**
   * 获取所有歌单
   * GET /api/playlists
   */
  async getAllPlaylists(req, res) {
    try {
      const playlists = await Playlist.findAll();
      res.json({
        success: true,
        data: playlists
      });
    } catch (error) {
      console.error('获取歌单列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取歌单列表失败',
        error: error.message
      });
    }
  },

  /**
   * 获取歌单详情
   * GET /api/playlists/:id
   */
  async getPlaylistById(req, res) {
    try {
      const { id } = req.params;
      const playlist = await Playlist.findById(id);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: '歌单不存在'
        });
      }

      res.json({
        success: true,
        data: playlist
      });
    } catch (error) {
      console.error('获取歌单详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取歌单详情失败',
        error: error.message
      });
    }
  },

  /**
   * 创建歌单
   * POST /api/playlists
   */
  async createPlaylist(req, res) {
    try {
      const { name, description, coverUrl } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: '歌单名称不能为空'
        });
      }

      const playlistData = {
        id: `p${Date.now()}`,
        name,
        description: description || '',
        coverUrl: coverUrl || 'https://picsum.photos/seed/default/400/400'
      };

      const playlist = await Playlist.create(playlistData);

      res.status(201).json({
        success: true,
        data: playlist,
        message: '歌单创建成功'
      });
    } catch (error) {
      console.error('创建歌单失败:', error);
      res.status(500).json({
        success: false,
        message: '创建歌单失败',
        error: error.message
      });
    }
  },

  /**
   * 更新歌单
   * PUT /api/playlists/:id
   */
  async updatePlaylist(req, res) {
    try {
      const { id } = req.params;
      const playlistData = req.body;

      const playlist = await Playlist.update(id, playlistData);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: '歌单不存在'
        });
      }

      res.json({
        success: true,
        data: playlist,
        message: '歌单更新成功'
      });
    } catch (error) {
      console.error('更新歌单失败:', error);
      res.status(500).json({
        success: false,
        message: '更新歌单失败',
        error: error.message
      });
    }
  },

  /**
   * 删除歌单
   * DELETE /api/playlists/:id
   */
  async deletePlaylist(req, res) {
    try {
      const { id } = req.params;
      await Playlist.delete(id);

      res.json({
        success: true,
        message: '歌单删除成功'
      });
    } catch (error) {
      console.error('删除歌单失败:', error);
      res.status(500).json({
        success: false,
        message: '删除歌单失败',
        error: error.message
      });
    }
  },

  /**
   * 添加歌曲到歌单
   * POST /api/playlists/:id/songs
   */
  async addSongToPlaylist(req, res) {
    try {
      const { id } = req.params;
      const { songId } = req.body;

      if (!songId) {
        return res.status(400).json({
          success: false,
          message: '歌曲 ID 不能为空'
        });
      }

      const playlist = await Playlist.addSong(id, songId);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: '歌单或歌曲不存在'
        });
      }

      res.json({
        success: true,
        data: playlist,
        message: '添加歌曲成功'
      });
    } catch (error) {
      console.error('添加歌曲失败:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: '歌曲已存在于歌单中'
        });
      }
      res.status(500).json({
        success: false,
        message: '添加歌曲失败',
        error: error.message
      });
    }
  },

  /**
   * 从歌单移除歌曲
   * DELETE /api/playlists/:id/songs/:songId
   */
  async removeSongFromPlaylist(req, res) {
    try {
      const { id, songId } = req.params;

      const playlist = await Playlist.removeSong(id, songId);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: '歌单不存在'
        });
      }

      res.json({
        success: true,
        data: playlist,
        message: '移除歌曲成功'
      });
    } catch (error) {
      console.error('移除歌曲失败:', error);
      res.status(500).json({
        success: false,
        message: '移除歌曲失败',
        error: error.message
      });
    }
  }
};
