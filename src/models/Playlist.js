/**
 * Playlist Model - 歌单数据模型
 */

import { query } from '../config/database.js';

export class Playlist {
  /**
   * 将数据库字段转换为驼峰命名
   */
  static toCamelCase(data) {
    if (!data) return null;
    if (Array.isArray(data)) {
      return data.map(item => this.toCamelCase(item));
    }
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      coverUrl: data.cover_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * 获取所有歌单
   */
  static async findAll() {
    const sql = 'SELECT * FROM playlists ORDER BY created_at DESC';
    const results = await query(sql);
    return this.toCamelCase(results);
  }

  /**
   * 根据 ID 获取歌单
   */
  static async findById(id) {
    const sql = 'SELECT * FROM playlists WHERE id = ?';
    const results = await query(sql, [id]);
    if (results.length === 0) return null;

    const playlist = this.toCamelCase(results[0]);

    // 获取歌单中的歌曲
    const songsSql = `
      SELECT s.*
      FROM songs s
      INNER JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = ?
      ORDER BY ps.position ASC
    `;
    const songs = await query(songsSql, [id]);
    playlist.songs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      coverUrl: song.cover_url,
      audioUrl: song.audio_url
    }));

    return playlist;
  }

  /**
   * 创建歌单
   */
  static async create(playlistData) {
    const sql = `
      INSERT INTO playlists (id, name, description, cover_url)
      VALUES (?, ?, ?, ?)
    `;
    const { id, name, description, coverUrl } = playlistData;
    await query(sql, [id, name, description, coverUrl]);
    return await this.findById(id);
  }

  /**
   * 更新歌单
   */
  static async update(id, playlistData) {
    const sql = `
      UPDATE playlists 
      SET name = ?, description = ?, cover_url = ?
      WHERE id = ?
    `;
    const { name, description, coverUrl } = playlistData;
    await query(sql, [name, description, coverUrl, id]);
    return await this.findById(id);
  }

  /**
   * 删除歌单
   */
  static async delete(id) {
    const sql = 'DELETE FROM playlists WHERE id = ?';
    await query(sql, [id]);
    return true;
  }

  /**
   * 添加歌曲到歌单
   */
  static async addSong(playlistId, songId) {
    const sql = `
      INSERT INTO playlist_songs (playlist_id, song_id, position)
      SELECT ?, ?, COALESCE(MAX(position), 0) + 1
      FROM playlist_songs 
      WHERE playlist_id = ?
    `;
    await query(sql, [playlistId, songId, playlistId]);
    return await this.findById(playlistId);
  }

  /**
   * 从歌单移除歌曲
   */
  static async removeSong(playlistId, songId) {
    const sql = 'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?';
    await query(sql, [playlistId, songId]);
    return await this.findById(playlistId);
  }
}
