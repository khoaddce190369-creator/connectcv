/**
 * Tiện ích gửi ping đánh thức Backend trên Render (tránh cold start và chống ngủ lại).
 */

const DEFAULT_BACKEND_URL = 'https://connectcv.onrender.com';
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 phút (Render ngủ sau 15 phút)
const TIMEOUT_MS = 50 * 1000; // 50 giây (Render cold start trung bình 30-45s)

export const getBackendBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;
  // Loại bỏ hậu tố /api nếu có để gọi chính xác endpoint /health ở root
  return rawUrl.replace(/\/api\/?$/, '');
};

let currentStatus = 'idle'; // 'idle' | 'waking' | 'ready' | 'error'
const listeners = new Set();

const notifyListeners = (status, details = null) => {
  currentStatus = status;
  listeners.forEach((listener) => {
    try {
      listener({ status, details });
    } catch (err) {
      console.error('[BackendWarmup] Listener error:', err);
    }
  });
};

export const subscribeBackendStatus = (listener) => {
  listeners.add(listener);
  // Báo trạng thái hiện tại ngay khi đăng ký
  listener({ status: currentStatus });
  return () => listeners.delete(listener);
};

export const getBackendStatus = () => currentStatus;

/**
 * Gửi một lượt ping tới endpoint /health của Backend.
 */
export const pingBackend = async (options = {}) => {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}/health`;
  const { isKeepAlive = false, maxRetries = 2 } = options;

  if (!isKeepAlive && currentStatus !== 'ready') {
    notifyListeners('waking');
  }

  console.log(`[BackendWarmup] ${isKeepAlive ? 'Keep-alive ping' : 'Waking up backend'} at: ${url}`);

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        console.log('[BackendWarmup] ✅ Backend is awake and responsive!');
        notifyListeners('ready', { timestamp: Date.now() });
        return { success: true, status: response.status };
      } else {
        console.warn(`[BackendWarmup] ⚠️ Server returned HTTP ${response.status}`);
      }
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[BackendWarmup] ⏳ Attempt ${attempt} failed: ${err.message}`);
      if (attempt <= maxRetries) {
        // Đợi 4 giây rồi thử lại
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }

  if (currentStatus !== 'ready') {
    notifyListeners('error', { error: 'Không thể kết nối máy chủ sau nhiều lần thử' });
  }
  return { success: false };
};

/**
 * Tự động bắt đầu ping ngay khi vào web và duy trì ping mỗi 10 phút.
 */
let keepAliveTimer = null;

export const initBackendWarmup = () => {
  // Chỉ chạy trong môi trường browser
  if (typeof window === 'undefined') return;

  // Gửi ping ngay lập tức
  pingBackend({ isKeepAlive: false });

  // Thiết lập interval keep-alive (10 phút 1 lần)
  if (!keepAliveTimer) {
    keepAliveTimer = setInterval(() => {
      // Chỉ gửi keep-alive nếu tab đang hoạt động hoặc mở
      pingBackend({ isKeepAlive: true });
    }, KEEP_ALIVE_INTERVAL_MS);
  }

  // Lắng nghe khi người dùng focus lại tab sau thời gian dài
  window.addEventListener('focus', () => {
    if (currentStatus !== 'waking') {
      pingBackend({ isKeepAlive: true, maxRetries: 1 });
    }
  });
};
