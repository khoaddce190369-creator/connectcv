'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');

function createApp({ frontendDistPath = path.join(__dirname, '../frontend/dist'), authenticate } = {}) {
  const app = express();

  // Preserve the team's dev/production CORS contract.
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  app.all('/health', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ status: 'OK', message: 'Backend & Frontend service is running!', timestamp: new Date().toISOString() });
  });

  // Feature routes own their parser and identity checks. Mount before the global
  // parser and React fallback so large CV requests and APIs reach the right code.
  require('./features/connectcv/mount')(app, { authenticate });
  app.use(express.json());
  app.use('/api', (req, res) => res.status(404).json({ success: false, code: 'API_NOT_FOUND' }));
  app.use('/ai', (req, res) => res.status(404).send('AI resource not found.'));

  if (fs.existsSync(path.join(frontendDistPath, 'index.html'))) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => res.sendFile(path.join(frontendDistPath, 'index.html')));
  } else {
    app.get('/', (req, res) => res.send('ConnectCV API is ready. (Frontend chưa được build, hãy chạy "npm run build")'));
  }
  return app;
}
module.exports = { createApp };
