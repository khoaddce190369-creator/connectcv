'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy cho môi trường Render
app.set('trust proxy', 1);

// Cấu hình Helmet an toàn cho phép CDN, Google OAuth popup & script
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Middleware CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'If-Match']
}));

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check & Ping cho Render Web Service và Cron Uptime
app.all(['/ping', '/health'], (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    status: 'OK',
    message: 'ConnectCV Unified Fullstack Service is running!',
    platform: 'Render',
    timestamp: new Date().toISOString()
  });
});

// Middleware xác thực JWT cầu nối cho các module mở rộng
const { authMiddleware, optionalAuth } = require('./src/middlewares/authMiddleware');
const featureAuthBridge = (req, res, next) => {
  if (req.headers.authorization) {
    return authMiddleware(req, res, (err) => {
      if (err || !req.user) {
        req.user = { id: 'guest_' + (req.ip || '127.0.0.1').replace(/[^a-zA-Z0-9]/g, '_'), role: 'Student', isPro: false };
      }
      return next();
    });
  }
  req.user = { id: 'guest_' + (req.ip || '127.0.0.1').replace(/[^a-zA-Z0-9]/g, '_'), role: 'Student', isPro: false };
  return next();
};

// ==========================================
// 1. TÍCH HỢP TOÀN BỘ CÁC ROUTE ĐẶC TẢ KỸ THUẬT
// ==========================================
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/cv', require('./src/routes/cv'));
// /api/interview được tích hợp và bảo mật đầy đủ trong module AI Studio (mountFeatures bên dưới)
app.use('/api/freelance', require('./features/connectcv/src/routes/interview')); // Hỗ trợ POST /api/freelance/proposal
app.use('/api/jobs', require('./src/routes/jobs'));
app.use('/api/filter/jobs', (req, res, next) => {
  req.url = '/filter';
  return require('./src/routes/jobs')(req, res, next);
});
app.use('/api/portfolios', require('./src/routes/portfolios'));
app.use('/api/posts', require('./src/routes/posts'));
app.use('/api/filter/candidates', (req, res, next) => {
  req.url = '/filter/candidates';
  return require('./src/routes/candidates')(req, res, next);
});
app.use('/api/applications', (req, res, next) => {
  req.url = '/applications' + req.url;
  return require('./src/routes/candidates')(req, res, next);
});
app.use('/api/feedback', require('./src/routes/feedback'));
app.use('/api/payment', require('./src/routes/payment'));

// ==========================================
// 2. TÍCH HỢP TÍNH NĂNG MỚI (AI STUDIO & CV RENDERER)
// ==========================================
app.get('/ai/runtime.js', (req, res) => {
  let pdfReady = false;
  try {
    pdfReady = require('./features/connectcv/src/services/pdfService').isRendererReady();
  } catch {}
  res.type('application/javascript').set('Cache-Control', 'no-store').send(
    'window.connectCVParentOrigins=' + JSON.stringify([`${req.protocol}://${req.get('host')}`, 'https://connectcv.id.vn']) +
    ';window.connectCVServerPdf=' + JSON.stringify(pdfReady) + ';'
  );
});

const featuresMountPath = path.join(__dirname, 'features/connectcv/mount.js');
if (fs.existsSync(featuresMountPath)) {
  try {
    const mountFeatures = require('./features/connectcv/mount');
    mountFeatures(app, { authenticate: featureAuthBridge });
    console.log('✅ Đã tích hợp thành công module AI Studio từ features/connectcv tại đường dẫn /ai');
  } catch (err) {
    console.warn('⚠️ Lỗi khởi tạo module AI Studio:', err.message);
  }
} else {
  console.log('ℹ️ Module features/connectcv chưa được mount.');
}

// ==========================================
// 3. PHỤC VỤ GIAO DIỆN WEB MỚI (UI MỚI)
// ==========================================
// Thư mục connectcv chứa 19 trang HTML giao diện mới
const connectcvUiPath = path.join(__dirname, '../connectcv');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// Phục vụ favicon chống lỗi 404 trên browser console
app.get('/favicon.ico', (req, res) => {
  const faviconFile = path.join(connectcvUiPath, 'assets/logo.png');
  if (fs.existsSync(faviconFile)) {
    return res.sendFile(faviconFile);
  }
  return res.status(204).end();
});

// Phục vụ trang tĩnh Portfolio Công Khai kèm Subdomain (/p/:subdomain)
app.get(['/p/:subdomain', '/portfolio/:subdomain'], (req, res) => {
  const portfolioHtml = path.join(connectcvUiPath, 'portfolio-public.html');
  if (fs.existsSync(portfolioHtml)) {
    return res.sendFile(portfolioHtml);
  }
  return res.redirect('/#portfolio');
});

// Phục vụ Trang Cá Nhân LinkedIn Style (/profile, /profile.html, /my-profile)
app.get(['/profile', '/profile.html', '/my-profile'], (req, res) => {
  const profileHtml = path.join(connectcvUiPath, 'profile.html');
  if (fs.existsSync(profileHtml)) {
    return res.sendFile(profileHtml);
  }
  return res.redirect('/');
});

// Tuyến đường riêng cho Trang Quản Trị Hệ Thống (/admin) - Không hiển thị link trên web chính
app.get(['/admin', '/admin-dashboard'], (req, res) => {
  const adminHtml = path.join(connectcvUiPath, 'admin-dashboard.html');
  if (fs.existsSync(adminHtml)) {
    return res.sendFile(adminHtml);
  }
  return res.status(404).send('Không tìm thấy trang quản trị.');
});

// ==========================================
// ==========================================
// 4. PHỤC VỤ TRÌNH TẠO CV CHUẨN ATS (TÍCH HỢP TRỰC TIẾP TRONG BACKEND)
// ==========================================
const possibleTopcvPaths = [
  path.join(__dirname, 'public/cv-assets'),
  path.join(__dirname, '../connectcv/cv-editor'),
  path.join(__dirname, '../subfolder/Clone TOPCV/dist'),
  path.join(__dirname, '../Clone TOPCV/dist')
];
const topcvDistPath = possibleTopcvPaths.find(p => fs.existsSync(p)) || possibleTopcvPaths[0];
const topcvIndex = path.join(topcvDistPath, 'index.html');

if (fs.existsSync(topcvDistPath)) {
  console.log(`[ConnectCV] Serving CV Editor SPA directly from: ${topcvDistPath}`);
  app.use('/cv-assets', express.static(topcvDistPath, {
    setHeaders: (res, p) => {
      if (p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.html')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.set('CDN-Cache-Control', 'no-store');
        res.set('Cloudflare-CDN-Cache-Control', 'no-store');
      }
    }
  }));

  // Tuyến đường SPA phục vụ trình tạo CV theo mẫu chuẩn ATS quốc tế (12 mẫu)
  app.get([
    '/cv-editor',
    '/cv-editor/*',
    '/editor',
    '/editor/*',
    '/new'
  ], (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(topcvIndex);
  });
}

const mycvPath = fs.existsSync(path.join(__dirname, '../MyCV'))
  ? path.join(__dirname, '../MyCV')
  : path.join(__dirname, '../subfolder/MyCV');
if (fs.existsSync(mycvPath)) {
  app.use('/static', express.static(path.join(mycvPath, 'static'), {
    setHeaders: (res, p) => {
      if (p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.html')) {
        res.set('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  }));
  app.use('/backgrounds', express.static(path.join(mycvPath, 'backgrounds')));
  app.use('/favicon', express.static(path.join(mycvPath, 'favicon')));
  
  app.get('/manifest.json', (req, res) => res.sendFile(path.join(mycvPath, 'manifest.json')));
  app.get('/asset_manifest.json', (req, res) => res.sendFile(path.join(mycvPath, 'asset_manifest.json')));

  // Tuyến đường SPA phục vụ MyCV dự phòng
  const mycvIndex = path.join(mycvPath, 'index.html');
  app.get([
    '/mycv',
    '/mycv/*',
    '/edit/:documentId',
    '/view/:documentId',
    '/my-documents'
  ], (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(mycvIndex);
  });
}

if (fs.existsSync(connectcvUiPath)) {
  // Phục vụ các trang HTML tĩnh giao diện mới
  app.use(express.static(connectcvUiPath, {
    index: 'index.html',
    extensions: ['html']
  }));
}

if (fs.existsSync(frontendDistPath)) {
  // Phục vụ React frontend nếu có
  app.use('/react', express.static(frontendDistPath));
}

// Fallback trang chủ mặc định nếu chưa khớp
app.get('/', (req, res) => {
  const indexFile = path.join(connectcvUiPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  return res.send('ConnectCV API Server is running on Render.');
});

// Xử lý lỗi tập trung
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('Lỗi Server:', err);
  const status = [400, 401, 402, 403, 404, 409, 413, 429].includes(err.status) ? err.status : 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Lỗi xử lý yêu cầu hệ thống.'
  });
});

// Xử lý lỗi không đồng bộ toàn cục để server không bị crash đột ngột
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
});

const db = require('./src/config/db');
db.ready.catch(() => false).finally(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ConnectCV Server is listening on port ${PORT} (0.0.0.0)`);
    console.log(`🌐 Website URL: http://localhost:${PORT}`);
    console.log(`🤖 AI Studio: http://localhost:${PORT}/ai`);
  });
});
