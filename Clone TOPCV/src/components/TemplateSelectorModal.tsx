import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { templatesList } from '../data/templates';
import { getT } from '../utils/translations';
import { X, Check, ShieldCheck, Sparkles, Filter } from 'lucide-react';

export const TemplateSelectorModal: React.FC = () => {
  const {
    cvData,
    setTemplateId,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    showToast,
  } = useCV();

  const [activeTab, setActiveTab] = useState<string>('all');
  const t = getT(cvData.language);

  if (!isTemplateModalOpen) return null;

  const categories = [
    { id: 'all', name: t.allTemplates },
    { id: 'ats', name: t.atsCategory },
    { id: 'modern', name: t.modernCategory },
    { id: 'professional', name: t.proCategory },
    { id: 'creative', name: t.creativeCategory },
    { id: 'academic', name: t.academicCategory },
  ];

  const filteredTemplates = activeTab === 'all'
    ? templatesList
    : templatesList.filter((item) => item.category === activeTab);

  const handleSelectTemplate = (id: string) => {
    setTemplateId(id);
    setIsTemplateModalOpen(false);
    showToast('Đã đổi mẫu CV thành công! Dữ liệu của bạn được giữ nguyên.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">{t.templateModalTitle}</h2>
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {templatesList.length} Mẫu CV
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t.templateModalSubtitle}</p>
          </div>
          <button
            onClick={() => setIsTemplateModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === cat.id
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-[#f8fafc]">
          {filteredTemplates.map((template) => {
            const isCurrent = cvData.templateId === template.id;

            return (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className={`group bg-white rounded-xl border-2 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col ${
                  isCurrent
                    ? 'border-[#0284c7] ring-2 ring-sky-400/20'
                    : 'border-slate-200 hover:border-sky-400'
                }`}
              >
                {/* Thumbnail Image Container with fixed height so it never collapses */}
                <div className="relative w-full h-60 sm:h-64 bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300 block"
                    onError={(e) => {
                      (e.target as any).src = '/assets/templates/01_CV_ATS_Tieu_Chuan_default_v2.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button
                      className="w-full py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-lg transition-colors"
                    >
                      {isCurrent ? t.currentUsing : t.useTemplate}
                    </button>
                  </div>

                  {/* Badge */}
                  {template.badge && (
                    <div className="absolute top-2.5 left-2.5 bg-[#0284c7] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {template.badge}
                    </div>
                  )}

                  {/* ATS Compliant Pill */}
                  {template.atsCompliant && (
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-sky-400" />
                      ATS
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute inset-0 bg-sky-600/10 flex items-center justify-center">
                      <div className="bg-[#0284c7] text-white p-2 rounded-full shadow-lg">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-[#00b14f] transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {template.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>* Khi đổi mẫu CV, nội dung và các chỉnh sửa của bạn được tự động bảo toàn 100%.</span>
          <button
            onClick={() => setIsTemplateModalOpen(false)}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
