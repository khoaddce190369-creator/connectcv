import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { industryTemplates } from '../data/industryPresets';
import { getT } from '../utils/translations';
import {
  X,
  Sparkles,
  TrendingUp,
  Code,
  Megaphone,
  Calculator,
  Users,
  CheckCircle,
  Briefcase
} from 'lucide-react';

export const ContentLibraryModal: React.FC = () => {
  const {
    cvData,
    loadPresetData,
    isContentLibraryOpen,
    setIsContentLibraryOpen,
  } = useCV();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(industryTemplates[0].id);
  const t = getT(cvData.language);

  if (!isContentLibraryOpen) return null;

  const selectedPreset = industryTemplates.find((p) => p.id === selectedPresetId) || industryTemplates[0];

  const getIcon = (name: string) => {
    switch (name) {
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'Code':
        return <Code className="w-5 h-5 text-blue-600" />;
      case 'Megaphone':
        return <Megaphone className="w-5 h-5 text-rose-600" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-amber-600" />;
      case 'Users':
        return <Users className="w-5 h-5 text-indigo-600" />;
      default:
        return <Briefcase className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleApply = () => {
    if (window.confirm(`Áp dụng nội dung mẫu của "${selectedPreset.name}" vào CV hiện tại?`)) {
      loadPresetData(selectedPreset.data);
      setIsContentLibraryOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.contentLibraryTitle}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.contentLibrarySubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsContentLibraryOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left industry list & Right preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          {/* Industry Sidebar */}
          <div className="w-full md:w-1/3 border-r border-slate-200 bg-white p-4 space-y-2 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Chọn vị trí công việc
            </div>
            {industryTemplates.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-2xs shrink-0">
                    {getIcon(preset.iconName)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{preset.category}</div>
                    <span className="inline-block mt-1 text-[10px] font-medium text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                      {preset.level}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preset Content Detail Preview */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedPreset.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedPreset.description}</p>
                </div>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 bg-[#00b14f] hover:bg-[#009643] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t.applyIndustryContent}
                </button>
              </div>

              {/* Sample Objective Preview */}
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Mục tiêu nghề nghiệp mẫu:
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed italic">
                  "{selectedPreset.data.objective}"
                </p>
              </div>

              {/* Sample Experience Preview */}
              {selectedPreset.data.experience && selectedPreset.data.experience.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Kinh nghiệm & Thành tích đo lường được:
                  </span>
                  <div className="space-y-2">
                    {selectedPreset.data.experience.map((exp) => (
                      <div key={exp.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900">{exp.position} - {exp.company}</div>
                        <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-600">
                          {exp.description.map((desc, i) => (
                            <li key={i}>{desc}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Skills Preview */}
              {selectedPreset.data.skills && (
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Kỹ năng cốt lõi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPreset.data.skills.map((s) => (
                      <span key={s.id} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
