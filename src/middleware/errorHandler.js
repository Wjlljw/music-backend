/**
 * 全局错误处理中间件
 */

export function errorHandler(err, req, res, next) {
  console.error('错误:', err);

  // 数据库连接错误
  if (err.code === 'ECONNREFUSED') {
    return res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: '无法连接到数据库，请检查数据库配置'
    });
  }

  // 语法错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: '请求数据格式错误',
      error: 'Invalid JSON'
    });
  }

  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.path
  });
}
