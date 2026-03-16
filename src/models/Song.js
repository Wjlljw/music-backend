/**
 * Song Model - 歌曲数据模型
 */

import { query } from '../config/database.js';

export class Song {
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
      title: data.title,
      artist: data.artist,
      album: data.album,
      duration: data.duration,
      coverUrl: data.cover_url,
      audioUrl: data.audio_url,
      createdAt: data.created_at
    };
  }

  /**
   * 获取所有歌曲
   */
  static async findAll() {
    const sql = 'SELECT * FROM songs ORDER BY created_at DESC';
    const results = await query(sql);
    return this.toCamelCase(results);
  }

  /**
   * 根据 ID 获取歌曲
   */
  static async findById(id) {
    const sql = 'SELECT * FROM songs WHERE id = ?';
    const results = await query(sql, [id]);
    return this.toCamelCase(results[0] || null);
  }

  /**
   * 搜索歌曲
   */
  static async search(query) {
    const sql = `
      SELECT * FROM songs
      WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
      ORDER BY created_at DESC
    `;
    const searchTerm = `%${query}%`;
    const results = await query(sql, [searchTerm, searchTerm, searchTerm]);
    return this.toCamelCase(results);
  }

  /**
   * 创建歌曲
   */
  static async create(songData) {
    const sql = `
      INSERT INTO songs (id, title, artist, album, duration, cover_url, audio_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const { id, title, artist, album, duration, coverUrl, audioUrl } = songData;
    await query(sql, [id, title, artist, album, duration, coverUrl, audioUrl]);
    return await this.findById(id);
  }

  /**
   * 更新歌曲
   */
  static async update(id, songData) {
    const sql = `
      UPDATE songs 
      SET title = ?, artist = ?, album = ?, duration = ?, cover_url = ?, audio_url = ?
      WHERE id = ?
    `;
    const { title, artist, album, duration, coverUrl, audioUrl } = songData;
    await query(sql, [title, artist, album, duration, coverUrl, audioUrl, id]);
    return await this.findById(id);
  }

  /**
   * 删除歌曲
   */
  static async delete(id) {
    const sql = 'DELETE FROM songs WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}
