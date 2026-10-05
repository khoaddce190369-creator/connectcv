// [Server] File khởi động Express server: bật CORS, parse JSON, mount toàn bộ routes, lắng nghe cổng PORT
const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware CORS cho phép frontend (connectcv-web.onrender.com & localhost) gọi API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Endpoint kiểm tra sức khỏe và đánh thức server (Ping endpoint)
app.all('/health', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    status: 'OK',
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('AI Career is ready.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
