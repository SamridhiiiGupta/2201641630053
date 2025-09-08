const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const shortUrlsRouter = require('./routes/shorturls');
const { loggingMiddleware } = require('./middlewares/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(loggingMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', shortUrlsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});


