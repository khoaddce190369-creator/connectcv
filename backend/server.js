// [Server] Express server phục vụ API & Static Frontend cho Render Web Service (Monolith 1 node)
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware CORS (hỗ trợ cả môi trường dev tách port và production)
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

// Endpoint kiểm tra sức khỏe máy chủ (dành cho Render health check & Cron-job bên ngoài)
app.all('/health', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    status: 'OK',
    message: 'Backend & Frontend service is running!',
    timestamp: new Date().toISOString()
  });
});

// Đường dẫn tới thư mục build của React frontend
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  // Phục vụ các file tĩnh (js, css, hình ảnh...) từ frontend/dist
  app.use(express.static(frontendDistPath));

  // SPA fallback: Mọi URL giao diện (trừ static files và API) đều trả về index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Nếu chưa build frontend (chạy dev backend độc lập)
  app.get('/', (req, res) => {
    res.send('ConnectCV API is ready. (Frontend chưa được build, hãy chạy "npm run build")');
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
