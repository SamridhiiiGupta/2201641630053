const fs = require('fs');
const path = require('path');

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFilePath = path.join(logsDir, 'requests.log');

function loggingMiddleware(req, res, next) {
  const startedAt = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  req.requestId = requestId;

  res.on('finish', () => {
    const line = JSON.stringify({
      ts: new Date(startedAt).toISOString(),
      id: requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
      ua: req.headers['user-agent'] || ''
    }) + '\n';
    fs.appendFile(logFilePath, line, () => {});
  });

  next();
}

module.exports = { loggingMiddleware };
