require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PORT } = require('./config/env');

const app = express();

// middlewares
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// routes (we’ll add upload next)
app.use('/api', require('./routes'));

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'internal_server_error' });
});

// MongoDb connection
const connectDB = require('./config/db');
connectDB();




app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
