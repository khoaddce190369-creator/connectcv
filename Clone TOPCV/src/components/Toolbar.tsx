import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { colorPresets, fontFamilies } from '../data/templates';
import { getT } from '../utils/translations';
import { FontSize, LineSpacing } from '../types/cv';
import {
  Palette,
  Type,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Layers,
  Sparkles,
  LayoutGrid
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const {
    cvData,
    updateTheme,
    setFontSize,
    setLineSpacing,
    zoom,
    setZoom,
    resetToSample,
    setIsSectionManagerOpen,
    setIsTemplateModalOpen,
    setIsContentLibraryOpen,
  } = useCV();

  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const t = getT(cvData.language);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-20 px-4 py-2 shadow-xs print:hidden">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
        {/* Left tools: Styling controls */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* Mobile Quick Action Buttons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="p-1.5 border border-slate-200 rounded-lg text-emerald-600 bg-emerald-50"
              title="Đổi mẫu CV"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsContentLibraryOpen(true)}
              className="p-1.5 border border-slate-200 rounded-lg text-amber-500 bg-amber-50"
              title="Gợi ý nội dung"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Color Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setColorDropdownOpen(!colorDropdownOpen);
                setFontDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white font-medium shadow-xs"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs inline-block"
                style={{ backgroundColor: cvData.theme.primaryColor }}
              />
              <span className="hidden sm:inline">{t.themeColor}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {colorDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 w-64 animate-in fade-in slide-in-from-top-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs border ${
                        cvData.theme.primaryColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'ring-2 ring-sky-500 ring-offset-2 border-white'
                          : 'border-black/10'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                </div>
                {/* Custom Color input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">Tự chọn:</span>
                  <input
                    type="color"
                    value={cvData.theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-slate-200 p-0"
                  />
                  <input
                    type="text"
                    value={cvData.theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="text-xs uppercase font-mono px-2 py-1 border border-slate-200 rounded w-20 text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setFontDropdownOpen(!fontDropdownOpen);
                setColorDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white font-medium shadow-xs"
            >
              <Type className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline max-w-[100px] truncate">{cvData.theme.fontFamily}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {fontDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 w-56 animate-in fade-in slide-in-from-top-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
                  Chọn font chữ hỗ trợ tiếng Việt
                </div>
                <div className="space-y-1">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => {
                        updateTheme({ fontFamily: font.value });
                        setFontDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        cvData.theme.fontFamily === font.value
                          ? 'bg-sky-50 text-sky-700 font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <span>{font.name}</span>
                      {cvData.theme.fontFamily === font.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Font Size (Nhỏ, Vừa, Lớn) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 px-1 font-semibold hidden md:inline">
              {t.fontSize}:
            </span>
            {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  cvData.theme.fontSize === size
                    ? 'bg-white text-sky-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {size === 'small' ? t.fontSizeSmall : size === 'medium' ? t.fontSizeMedium : t.fontSizeLarge}
              </button>
            ))}
          </div>

          {/* Line Spacing (Hẹp, Vừa, Rộng) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 px-1 font-semibold hidden md:inline">
              {t.lineSpacing}:
            </span>
            {(['compact', 'normal', 'relaxed'] as LineSpacing[]).map((sp) => (
              <button
                key={sp}
                onClick={() => setLineSpacing(sp)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  cvData.theme.lineSpacing === sp
                    ? 'bg-white text-sky-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sp === 'compact' ? t.lineSpacingCompact : sp === 'normal' ? t.lineSpacingNormal : t.lineSpacingRelaxed}
              </button>
            ))}
          </div>

          {/* Manage Sections / Layout */}
          <button
            onClick={() => setIsSectionManagerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-sky-500 hover:text-sky-700 bg-white font-medium shadow-xs"
            title="Bật / tắt các mục hiển thị trên CV"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{t.manageSections}</span>
          </button>
        </div>

        {/* Right tools: Reset & Zoom controls */}
        <div className="flex items-center gap-2">
          {/* Reset sample button */}
          <button
            onClick={resetToSample}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            title="Khôi phục lại nội dung mẫu"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">{t.resetToDefault}</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setZoom((prev) => Math.max(50, prev - 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="text-[11px] font-mono font-semibold px-1 text-slate-600 hover:text-slate-900"
              title="Đặt lại 100%"
            >
              {zoom}%
            </button>
            <button
              onClick={() => setZoom((prev) => Math.min(150, prev + 10))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
