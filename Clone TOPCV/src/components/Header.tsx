import React, { useState, useRef } from 'react';
import { useCV } from '../context/CVContext';
import { colorPresets } from '../data/templates';
import {
  ArrowLeft,
  Palette,
  LayoutGrid,
  User,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  Edit2,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    cvData,
    setCVData,
    updateTheme,
    updateProfile,
    zoom,
    setZoom,
    setIsTemplateModalOpen,
    showToast,
  } = useCV();

  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSaveCV = () => {
    localStorage.setItem('connectcv_builder_cv_data', JSON.stringify(cvData));
    showToast('CV đã được lưu thành công vào hồ sơ!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateProfile('avatarUrl', reader.result);
          showToast('Ảnh hồ sơ đã được cập nhật!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-3 pb-1 px-4 print:hidden pointer-events-none">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        {/* Floating Navy Toolbar (Giống MyCV) */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#172554] text-white px-3 sm:px-5 py-2 rounded-full border border-white/20 shadow-2xl backdrop-blur-md">
          {/* Nút Quay lại chọn mẫu */}
          <a
            href="/#cv"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-[#0284c7] text-white text-xs font-bold border border-white/25 hover:border-sky-400 transition-all shadow-sm shrink-0"
            title="Quay lại trang danh mục mẫu CV"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại chọn mẫu</span>
          </a>

          <div className="h-4 w-[1px] bg-white/20 hidden sm:block shrink-0" />

          {/* Màu sắc dropdown */}
          <div className="relative">
            <button
              onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/10 text-xs font-semibold text-slate-100 transition-colors"
              title="Đổi màu sắc chủ đạo của CV"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs inline-block shrink-0"
                style={{ backgroundColor: cvData.theme.primaryColor }}
              />
              <span>Màu sắc</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </button>

            {colorDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl p-3 z-50 w-64 animate-in fade-in slide-in-from-top-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Bảng màu ConnectCV tuyển dụng
                </div>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() => {
                        updateTheme({ primaryColor: preset.hex });
                        setColorDropdownOpen(false);
                      }}
                      title={preset.name}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 border ${
                        cvData.theme.primaryColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 border-white'
                          : 'border-white/20'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Tự chọn:</span>
                  <input
                    type="color"
                    value={cvData.theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-slate-700 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={cvData.theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="text-xs uppercase font-mono px-2 py-1 bg-slate-800 border border-slate-700 rounded w-20 text-center text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mẫu CV Modal Button */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/10 text-xs font-semibold text-slate-100 transition-colors"
            title="Đổi sang mẫu CV chuẩn ATS khác"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
            <span>Mẫu CV</span>
          </button>

          {/* Ảnh hồ sơ Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/10 text-xs font-semibold text-slate-100 transition-colors"
            title="Tải ảnh chân dung mới lên"
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Ảnh hồ sơ</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-800/80 rounded-full px-1.5 py-0.5 border border-white/15">
            <button
              onClick={() => setZoom((prev) => Math.max(60, prev - 10))}
              className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold text-slate-300 w-8 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((prev) => Math.min(150, prev + 10))}
              className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nút Tải xuống (Sky blue pill) */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            title="Tải CV định dạng PDF / In ấn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải xuống</span>
          </button>

          {/* Quản lý / Lưu CV */}
          <button
            onClick={handleSaveCV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
            title="Lưu CV hiện tại vào hồ sơ"
          >
            <Save className="w-3.5 h-3.5 text-slate-300" />
            <span>Quản lý CV</span>
          </button>
        </div>

        {/* Tiêu đề CV hiển thị giữa thanh công cụ và trang giấy */}
        <div className="pointer-events-auto my-3 select-none">
          {isEditingTitle ? (
            <input
              type="text"
              value={cvData.title}
              onChange={(e) => setCVData((prev) => ({ ...prev, title: e.target.value }))}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className="text-base sm:text-lg font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1 text-center outline-none shadow-sm focus:border-sky-500"
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="inline-flex items-center gap-2 cursor-pointer hover:bg-slate-200/80 rounded-lg px-3 py-1 transition-colors group"
              title="Nhấn để đổi tên CV"
            >
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-wide">
                {cvData.title || 'CV Chuyên Nghiệp'}
              </h1>
              <Edit2 className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
