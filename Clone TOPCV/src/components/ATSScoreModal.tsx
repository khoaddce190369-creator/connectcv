import React from 'react';
import { useCV } from '../context/CVContext';
import { evaluateATS } from '../utils/atsScorer';
import { getT } from '../utils/translations';
import { X, Award, CheckCircle2, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';

export const ATSScoreModal: React.FC = () => {
  const {
    cvData,
    isATSModalOpen,
    setIsATSModalOpen,
  } = useCV();

  const t = getT(cvData.language);

  if (!isATSModalOpen) return null;

  const result = evaluateATS(cvData);
  const score = result.totalScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.atsScoreTitle}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.atsScoreSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsATSModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {/* Top Score Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Radial Score Circle */}
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-slate-100 border-4 border-emerald-500 shadow-inner">
                <span className="text-2xl font-black text-slate-900">{score}</span>
                <span className="text-[10px] text-slate-500 font-bold absolute bottom-4">/100</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.atsOverallScore}
                </span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  Xếp loại: <span className="text-emerald-600">{result.level}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  {score >= 85
                    ? 'CV của bạn tối ưu rất tốt cho các hệ thống lọc hồ sơ tự động (ATS) và nhà tuyển dụng chuyên nghiệp!'
                    : 'Cần bổ sung thêm một số số liệu và thông tin để tăng cơ hội vượt qua vòng lọc CV.'}
                </p>
              </div>
            </div>
          </div>

          {/* Criteria Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3">{t.atsCriteria}</h3>
            <div className="space-y-3">
              {result.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {item.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.message}</div>
                    </div>
                  </div>
                  <div className="font-bold text-xs text-slate-700 font-mono shrink-0">
                    {item.score}/{item.maxScore}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations / Tips */}
          {result.tips.length > 0 && (
            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>{t.atsRecommendations}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-800 list-disc pl-5">
                {result.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsATSModalOpen(false)}
            className="px-5 py-2 bg-[#00b14f] hover:bg-[#009643] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
