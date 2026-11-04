import React from 'react';
import { useCV } from '../context/CVContext';
import { getT } from '../utils/translations';
import { X, Eye, EyeOff, Layers } from 'lucide-react';
import { CVSectionsVisibility } from '../types/cv';

export const SectionManagerModal: React.FC = () => {
  const {
    cvData,
    toggleSectionVisibility,
    isSectionManagerOpen,
    setIsSectionManagerOpen,
  } = useCV();

  const t = getT(cvData.language);

  if (!isSectionManagerOpen) return null;

  const sectionsList: { key: keyof CVSectionsVisibility; label: string }[] = [
    { key: 'objective', label: t.careerObjective },
    { key: 'experience', label: t.workExperience },
    { key: 'education', label: t.education },
    { key: 'skills', label: t.skills },
    { key: 'projects', label: t.projects },
    { key: 'certificates', label: t.certificates },
    { key: 'awards', label: t.awards },
    { key: 'activities', label: t.activities },
    { key: 'interests', label: t.interests },
    { key: 'references', label: t.references },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">{t.manageSections}</h2>
          </div>
          <button
            onClick={() => setIsSectionManagerOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Visibility Toggles */}
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-slate-500 mb-3">
            Bật/tắt các mục theo nhu cầu ứng tuyển của bạn:
          </p>
          {sectionsList.map((sec) => {
            const isVisible = cvData.sectionsVisibility[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => toggleSectionVisibility(sec.key)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isVisible
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <span className="text-xs font-semibold text-slate-800">{sec.label}</span>
                <button
                  type="button"
                  className={`p-1.5 rounded-lg transition-colors ${
                    isVisible
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsSectionManagerOpen(false)}
            className="px-4 py-2 bg-[#00b14f] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
