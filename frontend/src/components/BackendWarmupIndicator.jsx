import React, { useEffect, useState } from 'react';
import { subscribeBackendStatus } from '../utils/backendWarmup';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function BackendWarmupIndicator() {
  const [state, setState] = useState({ status: 'idle' });
  const [visible, setVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    let showTimer = null;

    const unsubscribe = subscribeBackendStatus((newState) => {
      setState(newState);

      if (newState.status === 'waking') {
        // Chỉ hiển thị popup nếu sau 1.5s server chưa trả về (nghĩa là server đang ngủ thật sự)
        // Nếu server đã thức từ trước (phản hồi trong 0.5-1s) thì không làm phiền người dùng
        showTimer = setTimeout(() => {
          if (!hasDismissed) {
            setVisible(true);
          }
        }, 1500);
      } else if (newState.status === 'ready') {
        if (showTimer) clearTimeout(showTimer);
        // Nếu popup đã hiện, giữ thông báo thành công 3 giây rồi tự ẩn
        if (visible) {
          const hideTimer = setTimeout(() => {
            setVisible(false);
          }, 3000);
          return () => clearTimeout(hideTimer);
        }
      } else if (newState.status === 'error') {
        if (showTimer) clearTimeout(showTimer);
      }
    });

    return () => {
      unsubscribe();
      if (showTimer) clearTimeout(showTimer);
    };
  }, [visible, hasDismissed]);

  if (!visible || hasDismissed) return null;

  return (
    <aside 
      aria-label="Trạng thái kết nối máy chủ"
      className="fixed bottom-5 right-5 z-50 transition-all duration-300 transform translate-y-0"
    >
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg border text-sm backdrop-blur-md ${
        state.status === 'ready'
          ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 shadow-emerald-500/10'
          : state.status === 'error'
          ? 'bg-amber-50/95 border-amber-200 text-amber-800 shadow-amber-500/10'
          : 'bg-white/95 border-indigo-100 text-slate-700 shadow-indigo-500/10'
      }`}>
        {state.status === 'waking' && (
          <>
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-slate-800">Đang khởi động máy chủ</span>
              <span className="text-xs text-slate-500">Render free tier mất ~30s khi thức dậy</span>
            </div>
          </>
        )}

        {state.status === 'ready' && (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium text-emerald-800">Máy chủ đã sẵn sàng!</span>
          </>
        )}

        {state.status === 'error' && (
          <>
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-amber-900">Máy chủ phản hồi chậm</span>
              <span className="text-xs text-amber-700">Đang tự động thử lại...</span>
            </div>
          </>
        )}

        <button
          onClick={() => {
            setHasDismissed(true);
            setVisible(false);
          }}
          className="ml-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Đóng thông báo"
          aria-label="Đóng thông báo trạng thái máy chủ"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
