/**
 * Song Controller - 歌曲接口控制器
 */

import { Song } from '../models/Song.js';

export const songController = {
  /**
   * 获取所有歌曲
   * GET /api/songs
   */
  async getAllSongs(req, res) {
    try {
      const songs = await Song.findAll();
      res.json({
        success: true,
        data: songs
      });
    } catch (error) {
      console.error('获取歌曲列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取歌曲列表失败',
        error: error.message
      });
    }
  },

  /**
   * 获取单首歌曲
   * GET /api/songs/:id
   */
  async getSongById(req, res) {
    try {
      const { id } = req.params;
      const song = await Song.findById(id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: '歌曲不存在'
        });
      }

      res.json({
        success: true,
        data: song
      });
    } catch (error) {
      console.error('获取歌曲详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取歌曲详情失败',
        error: error.message
      });
    }
  },

  /**
   * 搜索歌曲
   * GET /api/songs/search?query=xxx
   */
  async searchSongs(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: '请提供搜索关键词'
        });
      }

      const songs = await Song.search(query);

      res.json({
        success: true,
        data: songs
      });
    } catch (error) {
      console.error('搜索歌曲失败:', error);
      res.status(500).json({
        success: false,
        message: '搜索歌曲失败',
        error: error.message
      });
    }
  },

  /**
   * 创建歌曲
   * POST /api/songs
   */
  async createSong(req, res) {
    try {
      const songData = req.body;

      if (!songData.title || !songData.artist || !songData.audioUrl) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段'
        });
      }

      const song = await Song.create(songData);

      res.status(201).json({
        success: true,
        data: song,
        message: '歌曲创建成功'
      });
    } catch (error) {
      console.error('创建歌曲失败:', error);
      res.status(500).json({
        success: false,
        message: '创建歌曲失败',
        error: error.message
      });
    }
  },

  /**
   * 更新歌曲
   * PUT /api/songs/:id
   */
  async updateSong(req, res) {
    try {
      const { id } = req.params;
      const songData = req.body;

      const song = await Song.update(id, songData);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: '歌曲不存在'
        });
      }

      res.json({
        success: true,
        data: song,
        message: '歌曲更新成功'
      });
    } catch (error) {
      console.error('更新歌曲失败:', error);
      res.status(500).json({
        success: false,
        message: '更新歌曲失败',
        error: error.message
      });
    }
  },

  /**
   * 删除歌曲
   * DELETE /api/songs/:id
   */
  async deleteSong(req, res) {
    try {
      const { id } = req.params;
      await Song.delete(id);

      res.json({
        success: true,
        message: '歌曲删除成功'
      });
    } catch (error) {
      console.error('删除歌曲失败:', error);
      res.status(500).json({
        success: false,
        message: '删除歌曲失败',
        error: error.message
      });
    }
  }
};
