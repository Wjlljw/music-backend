/**
 * adminController 单元测试
 * 测试 getAllSongs 函数的各个场景
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock 剩余的依赖
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => false),
    mkdirSync: vi.fn(),
    unlinkSync: vi.fn()
  }
}));

vi.mock('path', () => ({
  default: {
    join: (...args) => args.join('/'),
    dirname: (path) => path.split('/').slice(0, -1).join('/')
  }
}));

vi.mock('url', () => ({
  fileURLToPath: (url) => url.replace('file://', '')
}));

// Mock database 模块
const mockQuery = vi.fn();
vi.mock('../config/database.js', () => ({
  query: mockQuery
}));

// 导入被测试的函数
import { getAllSongs } from '../adminController.js';

describe('getAllSongs', () => {
  let req, res;

  beforeEach(() => {
    // 重置模拟
    mockQuery.mockReset();

    // 创建模拟的请求和响应对象
    req = {};

    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('正常情况', () => {
    it('应该成功返回所有歌曲列表', async () => {
      // 准备测试数据
      const mockSongs = [
        {
          id: 'song_123',
          title: '测试歌曲1',
          artist: '艺术家1',
          album: '专辑1',
          duration: 180,
          audioUrl: '/uploads/songs/song1.mp3',
          coverUrl: '/uploads/covers/cover1.jpg',
          createdAt: '2024-01-01 12:00:00'
        },
        {
          id: 'song_456',
          title: '测试歌曲2',
          artist: '艺术家2',
          album: null,
          duration: null,
          audioUrl: '/uploads/songs/song2.mp3',
          coverUrl: null,
          createdAt: '2024-01-02 14:00:00'
        }
      ];

      // 设置 mock 返回值
      mockQuery.mockResolvedValue(mockSongs);

      // 执行函数
      await getAllSongs(req, res);

      // 验证
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        []
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSongs
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('应该正确处理空歌曲列表', async () => {
      // 准备测试数据 - 空数组
      const mockSongs = [];
      mockQuery.mockResolvedValue(mockSongs);

      // 执行函数
      await getAllSongs(req, res);

      // 验证
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    it('应该按创建时间倒序排列', async () => {
      const mockSongs = [
        { id: 'song_1', createdAt: '2024-01-02' },
        { id: 'song_2', createdAt: '2024-01-01' }
      ];
      mockQuery.mockResolvedValue(mockSongs);

      await getAllSongs(req, res);

      // 验证 SQL 包含 ORDER BY created_at DESC
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        []
      );
    });

    it('应该正确转换字段名（snake_case 到 camelCase）', async () => {
      const mockSongs = [
        {
          id: 'song_123',
          title: '测试',
          audioUrl: '/uploads/songs/test.mp3',
          coverUrl: '/uploads/covers/test.jpg',
          createdAt: '2024-01-01'
        }
      ];
      mockQuery.mockResolvedValue(mockSongs);

      await getAllSongs(req, res);

      // 验证 SQL 使用了 AS 别名
      const sqlCall = mockQuery.mock.calls[0][0];
      expect(sqlCall).toContain('audio_url AS audioUrl');
      expect(sqlCall).toContain('cover_url AS coverUrl');
      expect(sqlCall).toContain('created_at AS createdAt');
    });
  });

  describe('边界情况', () => {
    it('应该处理包含 null 字段的歌曲', async () => {
      const mockSongs = [
        {
          id: 'song_123',
          title: '测试',
          artist: '艺术家',
          album: null,
          duration: null,
          audioUrl: '/uploads/songs/test.mp3',
          coverUrl: null,
          createdAt: '2024-01-01'
        }
      ];
      mockQuery.mockResolvedValue(mockSongs);

      await getAllSongs(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSongs
      });
    });

    it('应该处理单首歌曲的情况', async () => {
      const mockSongs = [
        {
          id: 'song_123',
          title: '单曲',
          artist: '艺术家',
          album: '专辑',
          duration: 200,
          audioUrl: '/uploads/songs/song.mp3',
          coverUrl: '/uploads/covers/cover.jpg',
          createdAt: '2024-01-01'
        }
      ];
      mockQuery.mockResolvedValue(mockSongs);

      await getAllSongs(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSongs
      });
    });

    it('应该处理大量歌曲（100首）', async () => {
      const mockSongs = Array.from({ length: 100 }, (_, i) => ({
        id: `song_${i}`,
        title: `歌曲${i}`,
        artist: '艺术家',
        album: '专辑',
        duration: 180,
        audioUrl: '/uploads/songs/song.mp3',
        coverUrl: '/uploads/covers/cover.jpg',
        createdAt: '2024-01-01'
      }));
      mockQuery.mockResolvedValue(mockSongs);

      await getAllSongs(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSongs
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('错误情况', () => {
    it('应该处理数据库查询错误', async () => {
      const mockError = new Error('Database connection failed');
      mockQuery.mockRejectedValue(mockError);

      await getAllSongs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '获取歌曲列表失败',
        error: 'Database connection failed'
      });
    });

    it('应该处理 SQL 语法错误', async () => {
      const sqlError = new Error('ER_PARSE_ERROR: syntax error');
      sqlError.code = 'ER_PARSE_ERROR';
      mockQuery.mockRejectedValue(sqlError);

      await getAllSongs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '获取歌曲列表失败'
        })
      );
    });

    it('应该处理数据库连接超时', async () => {
      const timeoutError = new Error('ETIMEDOUT: Connection timeout');
      timeoutError.code = 'ETIMEDOUT';
      mockQuery.mockRejectedValue(timeoutError);

      await getAllSongs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });
  });

  describe('字段完整性', () => {
    it('应该返回所有必需的字段', async () => {
      const mockSongs = [
        {
          id: 'song_123',
          title: '测试',
          artist: '艺术家',
          album: '专辑',
          duration: 180,
          audioUrl: '/uploads/songs/test.mp3',
          coverUrl: '/uploads/covers/test.jpg',
          createdAt: '2024-01-01'
        }
      ];
      mockQuery.mockResolvedValue(mockSongs);

      await getAllSongs(req, res);

      const sqlCall = mockQuery.mock.calls[0][0];
      expect(sqlCall).toContain('id');
      expect(sqlCall).toContain('title');
      expect(sqlCall).toContain('artist');
      expect(sqlCall).toContain('album');
      expect(sqlCall).toContain('duration');
      expect(sqlCall).toContain('audio_url');
      expect(sqlCall).toContain('cover_url');
      expect(sqlCall).toContain('created_at');
    });

    it('应该只从 songs 表查询数据', async () => {
      const mockSongs = [{ id: 'song_123', title: '测试' }];
      mockQuery.mockResolvedValue(mockSongs);

      await getAllSongs(req, res);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM songs'),
        []
      );
    });
  });
});
