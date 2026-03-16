/**
 * 歌单管理控制器
 * 处理歌单创建、删除、编辑等管理功能
 */

import { query } from '../config/database.js';

/**
 * 生成唯一ID
 */
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 获取所有歌单（管理后台用）
 */
export async function getAllPlaylists(req, res) {
  try {
    // 获取所有歌单，并统计每个歌单的歌曲数量
    const playlists = await query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.cover_url AS coverUrl,
        p.created_at AS createdAt,
        COUNT(ps.song_id) AS songCount
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

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
}

/**
 * 创建歌单
 */
export async function createPlaylist(req, res) {
  try {
    const { name, description } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '歌单名称是必填项'
      });
    }

    // 生成歌单ID
    const id = generateId('playlist');

    // 插入数据库
    const sql = `
      INSERT INTO playlists (id, name, description, cover_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    await query(sql, [id, name, description || null, null]);

    // 获取创建的歌单
    const playlists = await query(`
      SELECT
        id,
        name,
        description,
        cover_url AS coverUrl,
        created_at AS createdAt,
        0 AS songCount
      FROM playlists
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: '歌单创建成功',
      data: playlists[0]
    });
  } catch (error) {
    console.error('创建歌单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建歌单失败',
      error: error.message
    });
  }
}

/**
 * 更新歌单
 */
export async function updatePlaylist(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // 检查歌单是否存在
    const playlists = await query('SELECT id FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌单不存在'
      });
    }

    // 更新歌单信息
    const sql = `
      UPDATE playlists
      SET name = ?, description = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await query(sql, [name, description || null, id]);

    res.json({
      success: true,
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
}

/**
 * 删除歌单
 */
export async function deletePlaylist(req, res) {
  try {
    const { id } = req.params;

    // 检查歌单是否存在
    const playlists = await query('SELECT id FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌单不存在'
      });
    }

    // 先删除关联的歌单歌曲记录
    await query('DELETE FROM playlist_songs WHERE playlist_id = ?', [id]);

    // 删除歌单
    await query('DELETE FROM playlists WHERE id = ?', [id]);

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
}

/**
 * 获取歌单详情（包含歌曲列表）
 */
export async function getPlaylistDetail(req, res) {
  try {
    const { id } = req.params;

    // 获取歌单基本信息
    const playlists = await query(`
      SELECT
        id,
        name,
        description,
        cover_url AS coverUrl,
        created_at AS createdAt
      FROM playlists
      WHERE id = ?
    `, [id]);

    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌单不存在'
      });
    }

    const playlist = playlists[0];

    // 获取歌单中的歌曲
    const songs = await query(`
      SELECT
        s.id,
        s.title,
        s.artist,
        s.album,
        s.duration,
        s.cover_url AS coverUrl,
        s.audio_url AS audioUrl,
        ps.position
      FROM songs s
      INNER JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = ?
      ORDER BY ps.position ASC
    `, [id]);

    playlist.songs = songs;

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
}

/**
 * 添加歌曲到歌单
 */
export async function addSongToPlaylist(req, res) {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: '歌曲ID是必填项'
      });
    }

    // 检查歌单是否存在
    const playlists = await query('SELECT id FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌单不存在'
      });
    }

    // 检查歌曲是否存在
    const songs = await query('SELECT id FROM songs WHERE id = ?', [songId]);
    if (songs.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌曲不存在'
      });
    }

    // 检查歌曲是否已在歌单中
    const existing = await query(
      'SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
      [id, songId]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该歌曲已在歌单中'
      });
    }

    // 获取当前最大位置
    const maxPositionResult = await query(
      'SELECT COALESCE(MAX(position), 0) AS maxPos FROM playlist_songs WHERE playlist_id = ?',
      [id]
    );
    const position = maxPositionResult[0].maxPos + 1;

    // 添加歌曲到歌单
    await query(
      'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
      [id, songId, position]
    );

    res.json({
      success: true,
      message: '歌曲已添加到歌单'
    });
  } catch (error) {
    console.error('添加歌曲到歌单失败:', error);
    res.status(500).json({
      success: false,
      message: '添加歌曲到歌单失败',
      error: error.message
    });
  }
}

/**
 * 从歌单移除歌曲
 */
export async function removeSongFromPlaylist(req, res) {
  try {
    const { id, songId } = req.params;

    // 检查歌单是否存在
    const playlists = await query('SELECT id FROM playlists WHERE id = ?', [id]);
    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: '歌单不存在'
      });
    }

    // 从歌单移除歌曲
    await query(
      'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
      [id, songId]
    );

    res.json({
      success: true,
      message: '歌曲已从歌单移除'
    });
  } catch (error) {
    console.error('从歌单移除歌曲失败:', error);
    res.status(500).json({
      success: false,
      message: '从歌单移除歌曲失败',
      error: error.message
    });
  }
}

/**
 * 获取所有歌曲（用于添加到歌单）
 */
export async function getAllSongsForPlaylist(req, res) {
  try {
    const { id } = req.params;

    // 获取歌单中已有的歌曲ID
    const existingSongs = await query(
      'SELECT song_id FROM playlist_songs WHERE playlist_id = ?',
      [id]
    );
    const existingSongIds = existingSongs.map(s => s.song_id);

    // 获取所有歌曲，标记哪些已在歌单中
    let sql = `
      SELECT
        id,
        title,
        artist,
        album,
        duration,
        cover_url AS coverUrl
      FROM songs
      ORDER BY created_at DESC
    `;

    const songs = await query(sql);

    // 标记已在歌单中的歌曲
    const songsWithStatus = songs.map(song => ({
      ...song,
      isInPlaylist: existingSongIds.includes(song.id)
    }));

    res.json({
      success: true,
      data: songsWithStatus
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
