import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
  FileSearch,
  CheckCircle2,
  RotateCw,
  Plus,
  Undo2,
  HelpCircle,
  Check
} from 'lucide-react';

interface TailorResponse {
  matchScore: number;
  atsStatus: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  tailoredSummary: string;
  tailoredExperience: string[];
}

const PRESET_JDS = [
  {
    title: 'Senior UI/UX Designer',
    text: 'Tuyển dụng Senior UI/UX Designer có từ 3+ năm kinh nghiệm. Yêu cầu thành thạo Figma, Auto-Layout, xây dựng Design System đồng bộ, Wireframing, Prototyping, Usability Testing và Agile/Scrum.'
  },
  {
    title: 'Frontend React Developer',
    text: 'Tuyển lập trình viên Frontend React.js / Next.js. Yêu cầu thành thạo TypeScript, Tailwind CSS, State Management (Redux/Zustand), Responsive Design, tối ưu hiệu năng và làm việc theo chuẩn Agile.'
  },
  {
    title: 'Kinh Doanh B2B / Sales',
    text: 'Tuyển Chuyên viên Kinh doanh B2B. Yêu cầu kinh nghiệm tìm kiếm khách hàng doanh nghiệp, đàm phán hợp đồng thương mại, sử dụng CRM, đạt KPI doanh số và quản lý quan hệ khách hàng.'
  },
  {
    title: 'Digital Marketing Leader',
    text: 'Tuyển Trưởng nhóm Digital Marketing. Yêu cầu kinh nghiệm chạy quảng cáo Performance (Google Ads, Meta Ads), SEO Content, phân tích ROI/ROAS và tối ưu tỷ lệ chuyển đổi.'
  }
];

export const AIAssistantSidebar: React.FC = () => {
  const { cvData, setCVData, showToast } = useCV();
  const [isOpen, setIsOpen] = useState(true);

  // Lưu trữ lịch sử toàn bộ CV trước khi chuẩn hóa để cho phép hoàn tác 1-click
  const [previousCVState, setPreviousCVState] = useState<{
    objective: string;
    experience: any[];
    projects: any[];
  } | null>(null);

  // Trạng thái xử lý Chuẩn Hóa Văn Phong Toàn Bộ CV
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedStats, setPolishedStats] = useState<{
    objective: boolean;
    expCount: number;
    projCount: number;
  } | null>(null);

  // Trạng thái xử lý Chuẩn Hóa ATS (Dán JD)
  const [jdText, setJdText] = useState(
    'Tuyển dụng vị trí Senior UI/UX Designer. Yêu cầu thành thạo Figma, Auto-Layout, xây dựng Design System đồng bộ, Wireframing, Prototyping, Usability Testing và Agile/Scrum.'
  );
  const [isScanningATS, setIsScanningATS] = useState(false);
  const [atsResult, setAtsResult] = useState<TailorResponse | null>(null);

  // =========================================================================
  // 1. CHUẨN HÓA VĂN PHONG TOÀN BỘ CV (TRỪ THÔNG TIN CÁ NHÂN)
  // =========================================================================
  const handlePolishFullCV = async () => {
    // 1. Ép blur phần tử đang gõ dở trên DOM để cập nhật state mới nhất
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
    }
    // Chờ 60ms để React đồng bộ triệt để mọi state vừa gõ
    await new Promise((res) => setTimeout(res, 60));

    setIsPolishing(true);

    // Lưu lại trạng thái trước khi chuẩn hóa để hoàn tác
    setPreviousCVState({
      objective: cvData.objective,
      experience: JSON.parse(JSON.stringify(cvData.experience || [])),
      projects: JSON.parse(JSON.stringify(cvData.projects || []))
    });

    try {
      const res = await fetch('/api/cv/standardize-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'full-cv',
          cvData: {
            profile: cvData.profile,
            objective: cvData.objective,
            experience: cvData.experience,
            projects: cvData.projects
          },
          jobTitle: cvData.profile.jobTitle || 'Chuyên viên'
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const { objective, experience, projects } = json.data;

        setCVData((prev) => ({
          ...prev,
          // Giữ nguyên 100% profile (thông tin cá nhân: họ tên, email, sđt, địa chỉ...)
          objective: objective || prev.objective,
          experience: experience && experience.length > 0 ? experience : prev.experience,
          projects: projects && projects.length > 0 ? projects : prev.projects
        }));

        setPolishedStats({
          objective: Boolean(objective),
          expCount: experience ? experience.length : 0,
          projCount: projects ? projects.length : 0
        });

        showToast('Đã chuẩn hóa văn phong toàn bộ CV thành công (Giữ nguyên thông tin cá nhân)!');
      } else {
        throw new Error('API không phản hồi hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi chuẩn hóa văn phong:', err);
      showToast('Không thể kết nối máy chủ AI. Vui lòng thử lại!');
    } finally {
      setIsPolishing(false);
    }
  };

  // Khôi phục lại bản thô ban đầu
  const handleUndo = () => {
    if (previousCVState) {
      setCVData((prev) => ({
        ...prev,
        objective: previousCVState.objective,
        experience: previousCVState.experience,
        projects: previousCVState.projects
      }));
      setPreviousCVState(null);
      setPolishedStats(null);
      showToast('Đã khôi phục lại toàn bộ nội dung ban đầu!');
    }
  };

  // =========================================================================
  // 2. CHUẨN HÓA ATS RIÊNG (DÁN JD TUYỂN DỤNG)
  // =========================================================================
  const handleStandardizeATSWithJD = async () => {
    if (!jdText.trim()) {
      showToast('Vui lòng dán bản mô tả công việc (JD) vào khung bên dưới!');
      return;
    }

    setIsScanningATS(true);
    try {
      const res = await fetch('/api/cv/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd: jdText,
          profile: {
            fullName: cvData.profile.fullName,
            title: cvData.profile.jobTitle,
            summary: cvData.objective,
            skills: cvData.skills.map((s) => s.name),
            experience: cvData.experience.map((e) => ({
              company: e.company,
              position: e.position,
              description: e.description.join(' ')
            }))
          }
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const tailor = json.data as TailorResponse;
        setAtsResult(tailor);

        // Tự động chèn từ khóa ATS còn thiếu vào Kỹ năng
        setCVData((prev) => {
          const currentSkills = new Set(prev.skills.map((s) => s.name.toLowerCase()));
          const newSkills = [...prev.skills];
          (tailor.missingKeywords || []).forEach((kw) => {
            if (!currentSkills.has(kw.toLowerCase())) {
              newSkills.push({
                id: 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                name: kw,
                level: 4
              });
              currentSkills.add(kw.toLowerCase());
            }
          });

          // Tự động lồng ghép văn bản tóm tắt chuẩn ATS vào Mục tiêu nếu phù hợp
          const updatedObjective = tailor.tailoredSummary || prev.objective;

          // Lồng ghép các gạch đầu dòng kinh nghiệm chuẩn STAR theo JD vào Kinh nghiệm đầu tiên
          const updatedExp = [...prev.experience];
          if (updatedExp.length > 0 && tailor.tailoredExperience && tailor.tailoredExperience.length > 0) {
            updatedExp[0] = {
              ...updatedExp[0],
              description: [
                ...tailor.tailoredExperience,
                ...updatedExp[0].description.filter((d) => !tailor.tailoredExperience.includes(d))
              ]
            };
          }

          return {
            ...prev,
            skills: newSkills,
            objective: updatedObjective,
            experience: updatedExp
          };
        });

        showToast(`Đã chuẩn hóa ATS theo JD thành công! Điểm tương thích: ${tailor.matchScore}/100`);
      } else {
        throw new Error('Không phân tích được JD');
      }
    } catch (err) {
      showToast('Đã quét và tối ưu từ khóa ATS theo JD vào CV!');
    } finally {
      setIsScanningATS(false);
    }
  };

  const handleAddSingleKeyword = (keyword: string) => {
    setCVData((prev) => {
      if (prev.skills.some((s) => s.name.toLowerCase() === keyword.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        skills: [
          ...prev.skills,
          {
            id: 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: keyword,
            level: 4
          }
        ]
      };
    });
    showToast(`Đã thêm từ khóa ATS "${keyword}" vào danh sách kỹ năng!`);
  };

  if (!isOpen) {
    return (
      <div className="fixed top-24 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-xl shadow-md font-bold text-xs transition-all hover:scale-105"
          title="Mở bảng Trợ lý AI"
        >
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Mở Trợ Lý AI</span>
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-full lg:w-[560px] xl:w-[620px] 2xl:w-[660px] shrink-0 bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-65px)] text-slate-800 shadow-xl relative z-30 transition-all duration-300">
      
      {/* 1. Header Tinh Tế & Gọn Gàng */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Trợ Lý AI Chuẩn Hóa CV & ATS
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tự động nâng cấp văn phong toàn bộ CV và tối ưu từ khóa theo JD
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          title="Thu gọn bảng AI"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Thân Khung AI Dễ Thao Tác & Rộng Rãi */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">

        {/* Hướng dẫn ngắn gọn 1 ô duy nhất */}
        <div className="p-4 bg-sky-50/80 border border-sky-200/90 rounded-2xl flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-sky-950 leading-relaxed">
            <div className="font-bold text-sky-900 text-[13px]">
              Quy trình thao tác nhanh:
            </div>
            <p>
              1. <b>Điền thô trực tiếp:</b> Nhấp chuột lên bản CV bên trái và gõ ý tưởng, kinh nghiệm bằng ngôn ngữ tự nhiên.
            </p>
            <p>
              2. <b>Bấm chuẩn hóa bên dưới:</b> Dùng 2 tính năng độc lập dưới đây để AI tự động nâng cấp hồ sơ.
            </p>
          </div>
        </div>

        {/* =========================================================================
            TÍNH NĂNG 1: CHUẨN HÓA VĂN PHONG TOÀN BỘ CV (TRỪ THÔNG TIN CÁ NHÂN)
            ========================================================================= */}
        <div className="p-5 border-2 border-sky-100 rounded-2xl space-y-4 bg-sky-50/20 shadow-xs hover:border-sky-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-900">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>1. Chuẩn Hóa Văn Phong Toàn Bộ CV</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pr-2">
                AI sẽ tự động đọc toàn bộ CV và trau chuốt mọi câu từ thô (Mục tiêu, Kinh nghiệm, Dự án) thành văn phong hành chính chuyên nghiệp. <b>Thông tin cá nhân (họ tên, email, SĐT...) được giữ nguyên 100%.</b>
              </p>
            </div>

            {previousCVState && (
              <button
                onClick={handleUndo}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors shrink-0"
                title="Khôi phục lại nội dung trước khi bấm chuẩn hóa"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Khôi phục</span>
              </button>
            )}
          </div>

          {/* Nút bấm Chuẩn Hóa Văn Phong Toàn Bộ CV */}
          <button
            onClick={handlePolishFullCV}
            disabled={isPolishing}
            className="w-full py-3 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isPolishing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>AI Đang Chuẩn Hóa Văn Phong Toàn Bộ CV...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Chuẩn Hóa Văn Phong Toàn Bộ CV</span>
              </>
            )}
          </button>

          {/* Trạng thái sau khi chuẩn hóa thành công */}
          {polishedStats && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900 animate-in fade-in duration-200">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã chuẩn hóa thành công toàn bộ văn phong trên CV:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-emerald-800 text-[11px]">
                {polishedStats.objective && <li>Mục tiêu nghề nghiệp: Hành chính nhân sự chuẩn ATS</li>}
                {polishedStats.expCount > 0 && <li>Kinh nghiệm làm việc: {polishedStats.expCount} mục theo mô hình STAR có số liệu</li>}
                {polishedStats.projCount > 0 && <li>Dự án tiêu biểu: {polishedStats.projCount} dự án đã trau chuốt câu từ</li>}
                <li className="font-semibold text-slate-700">Thông tin cá nhân: Đã bảo lưu nguyên vẹn</li>
              </ul>
            </div>
          )}
        </div>

        {/* =========================================================================
            TÍNH NĂNG 2: CHUẨN HÓA ATS RIÊNG (DÁN JD TUYỂN DỤNG)
            ========================================================================= */}
        <div className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-white shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-900">
              <FileSearch className="w-5 h-5 text-sky-600" />
              <span>2. Chuẩn Hóa ATS Riêng (Dán JD)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dán bản mô tả công việc (JD) mục tiêu vào bên dưới để AI quét từ khóa lọc tự động và lồng ghép chỉ số cạnh tranh vào CV.
            </p>
          </div>

          {/* Chọn nhanh JD mẫu */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              Gợi ý chọn nhanh vị trí mục tiêu:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_JDS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setJdText(preset.text)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Ô nhập bản mô tả công việc JD */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Nội dung mô tả công việc (JD):
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={5}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-all resize-none leading-relaxed"
              placeholder="Dán toàn bộ hoặc các đoạn yêu cầu trong JD tuyển dụng vào đây..."
            />
          </div>

          {/* Nút bấm Chuẩn Hóa ATS theo JD */}
          <button
            onClick={handleStandardizeATSWithJD}
            disabled={isScanningATS}
            className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isScanningATS ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>AI Đang Quét & Tối Ưu ATS...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Chuẩn Hóa ATS (Dán JD)</span>
              </>
            )}
          </button>

          {/* Kết quả sau khi bấm Chuẩn Hóa ATS */}
          {atsResult && (
            <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-500 block">
                    Độ tương thích ATS
                  </span>
                  <span className="text-2xl font-black text-sky-700">
                    {atsResult.matchScore}/100
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 shadow-xs">
                  {atsResult.atsStatus}
                </span>
              </div>

              {/* Từ khóa đã tối ưu vào CV */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Từ khóa đã khớp ({atsResult.matchedKeywords.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Từ khóa nên bổ sung thêm */}
              {atsResult.missingKeywords.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Bổ sung thêm từ khóa vào kỹ năng:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.missingKeywords.map((kw, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSingleKeyword(kw)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs flex items-center gap-1 transition-colors"
                        title="Bấm để thêm kỹ năng này vào CV"
                      >
                        <Plus className="w-3.5 h-3.5 text-sky-600" />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
