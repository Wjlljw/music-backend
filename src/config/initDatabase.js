/**
 * 初始化数据库表结构
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('正在初始化数据库...');

    // 创建数据库
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'music_player'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✅ 创建数据库成功');

    // 选择数据库
    await connection.query(`USE ${process.env.DB_NAME || 'music_player'}`);

    // 创建歌曲表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS songs (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        album VARCHAR(255),
        duration INT NOT NULL,
        cover_url VARCHAR(500),
        audio_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ 创建 songs 表成功');

    // 创建歌单表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS playlists (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ 创建 playlists 表成功');

    // 创建歌单歌曲关联表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        playlist_id VARCHAR(50) NOT NULL,
        song_id VARCHAR(50) NOT NULL,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_playlist_song (playlist_id, song_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ 创建 playlist_songs 表成功');

    console.log('🎉 数据库初始化完成！');

    // 插入示例数据
    await insertSampleData(connection);

  } catch (error) {
    console.error('初始化数据库失败:', error);
  } finally {
    await connection.end();
  }
}

async function insertSampleData(connection) {
  console.log('正在插入示例数据...');

  // 检查是否已有数据
  const [songs] = await connection.execute('SELECT COUNT(*) as count FROM songs');
  if (songs[0].count > 0) {
    console.log('⏭️  数据已存在，跳过插入');
    return;
  }

  // 示例歌曲数据
  const sampleSongs = [
    {
      id: 's1',
      title: '夜曲',
      artist: '周杰伦',
      album: '十一月的萧邦',
      duration: 239,
      cover_url: 'https://picsum.photos/seed/s1/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: 's2',
      title: '稻香',
      artist: '周杰伦',
      album: '魔杰座',
      duration: 215,
      cover_url: 'https://picsum.photos/seed/s2/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
      id: 's3',
      title: '青花瓷',
      artist: '周杰伦',
      album: '我很忙',
      duration: 248,
      cover_url: 'https://picsum.photos/seed/s3/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      id: 's4',
      title: '七里香',
      artist: '周杰伦',
      album: '七里香',
      duration: 278,
      cover_url: 'https://picsum.photos/seed/s4/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    },
    {
      id: 's5',
      title: '晴天',
      artist: '周杰伦',
      album: '叶惠美',
      duration: 269,
      cover_url: 'https://picsum.photos/seed/s5/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
    },
    {
      id: 's6',
      title: '告白气球',
      artist: '周杰伦',
      album: '周杰伦的床边故事',
      duration: 200,
      cover_url: 'https://picsum.photos/seed/s6/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
    },
    {
      id: 's7',
      title: '慢慢喜欢你',
      artist: '莫文蔚',
      album: '我们在中场相遇',
      duration: 267,
      cover_url: 'https://picsum.photos/seed/s7/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
    },
    {
      id: 's8',
      title: '光年之外',
      artist: '邓紫棋',
      album: '新的心跳',
      duration: 252,
      cover_url: 'https://picsum.photos/seed/s8/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    },
    {
      id: 's9',
      title: '演员',
      artist: '薛之谦',
      album: '意外',
      duration: 263,
      cover_url: 'https://picsum.photos/seed/s9/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
    },
    {
      id: 's10',
      title: '起风了',
      artist: '买辣椒也用券',
      album: '起风了',
      duration: 315,
      cover_url: 'https://picsum.photos/seed/s10/300/300',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
    }
  ];

  for (const song of sampleSongs) {
    await connection.execute(
      'INSERT INTO songs (id, title, artist, album, duration, cover_url, audio_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [song.id, song.title, song.artist, song.album, song.duration, song.cover_url, song.audio_url]
    );
  }
  console.log(`✅ 插入 ${sampleSongs.length} 首歌曲`);

  // 示例歌单数据
  const samplePlaylists = [
    {
      id: 'p1',
      name: '周杰伦精选',
      description: '周杰伦经典歌曲合集',
      cover_url: 'https://picsum.photos/seed/p1/400/400'
    },
    {
      id: 'p2',
      name: '流行热歌',
      description: '当前最热门的流行歌曲',
      cover_url: 'https://picsum.photos/seed/p2/400/400'
    },
    {
      id: 'p3',
      name: '深夜emo',
      description: '深夜独自聆听的伤感歌曲',
      cover_url: 'https://picsum.photos/seed/p3/400/400'
    }
  ];

  for (const playlist of samplePlaylists) {
    await connection.execute(
      'INSERT INTO playlists (id, name, description, cover_url) VALUES (?, ?, ?, ?)',
      [playlist.id, playlist.name, playlist.description, playlist.cover_url]
    );
  }
  console.log(`✅ 插入 ${samplePlaylists.length} 个歌单`);

  // 歌单歌曲关联
  const playlistSongs = [
    { playlistId: 'p1', songIds: ['s1', 's2', 's3', 's4', 's5'] },
    { playlistId: 'p2', songIds: ['s1', 's6', 's8', 's9'] },
    { playlistId: 'p3', songIds: ['s7', 's8', 's9', 's10'] }
  ];

  for (const ps of playlistSongs) {
    for (const songId of ps.songIds) {
      await connection.execute(
        'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
        [ps.playlistId, songId, ps.songIds.indexOf(songId)]
      );
    }
  }
  console.log('✅ 插入歌单歌曲关联');
}

// 运行初始化
initDatabase();
