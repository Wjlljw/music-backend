/**
 * 歌曲管理控制器
 * 处理歌曲上传、删除、编辑等管理功能
 */

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

/**
 * 生成唯一ID
 */
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 上传歌曲
 */
export async function uploadSong(req, res) {
  try {
    const { title, artist, album, duration } = req.body;

    // 验证必填字段
    if (!title || !artist) {
      return res.status(400).json({
        success: false,
        message: '标题和艺术家是必填项'
      });
    }

    // 生成歌曲ID
    const id = generateId('song');

    // 获取文件路径
    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];

    const audioUrl = audioFile ? `/uploads/songs/${audioFile.filename}` : null;
    const coverUrl = coverFile ? `/uploads/covers/${coverFile.filename}` : null;

    // 插入数据库
    const sql = `
      INSERT INTO songs (id, title, artist, album, duration, cover_url, audio_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await query(sql, [id, title, artist, album || null, duration || 0, coverUrl, audioUrl]);

    res.json({
      success: true,
      message: '歌曲上传成功',
      data: {
        id,
        title,
        artist,
        album,
        duration,
        audioUrl,
        coverUrl
      }
    });
  } catch (error) {
    console.error('上传歌曲失败:', error);
    res.status(500).json({
      success: false,
      message: '上传歌曲失败',
      error: error.message
    });
  }
}

/**
 * 删除歌曲
 */
export async function deleteSong(req, res) {
  try {
    const { id } = req.params;

    // 查询歌曲信息
    const songs = await query('SELECT audio_url, cover_url FROM songs WHERE id = ?', [id]);

    if (songs.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌曲不存在'
      });
    }

    const song = songs[0];

    // 删除关联的歌单歌曲记录
    await query('DELETE FROM playlist_songs WHERE song_id = ?', [id]);

    // 删除歌曲记录
    await query('DELETE FROM songs WHERE id = ?', [id]);

    // 删除文件
    if (song.audioUrl) {
      const audioPath = path.join(__dirname, '..', song.audioUrl);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }

    if (song.coverUrl) {
      const coverPath = path.join(__dirname, '..', song.coverUrl);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

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

/**
 * 获取所有歌曲（管理后台用）
 */
export async function getAllSongs(req, res) {
  try {
    const songs = await query(`
      SELECT
        id,
        title,
        artist,
        album,
        duration,
        audio_url AS audioUrl,
        cover_url AS coverUrl,
        created_at AS createdAt
      FROM songs
      ORDER BY created_at DESC
    `);

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
}

/**
 * 更新歌曲信息
 */
export async function updateSong(req, res) {
  try {
    const { id } = req.params;
    const { title, artist, album, duration } = req.body;

    // 检查歌曲是否存在
    const songs = await query('SELECT id FROM songs WHERE id = ?', [id]);
    if (songs.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌曲不存在'
      });
    }

    // 更新歌曲信息
    const sql = `
      UPDATE songs
      SET title = ?, artist = ?, album = ?, duration = ?
      WHERE id = ?
    `;
    await query(sql, [title, artist, album, duration, id]);

    res.json({
      success: true,
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
}
