import React, { createContext, useContext, useState, useEffect } from 'react';
import { CVData, Language, FontSize, LineSpacing } from '../types/cv';
import { initialSalesCVData } from '../data/sampleData';

const STORAGE_KEY = 'connectcv_builder_cv_data';

export function normalizeTemplateId(id?: string | null): string {
  if (!id) return 'topcv-modern';
  const lower = id.toLowerCase().trim();
  const valid = [
    'ats-standard', 'topcv-modern', 'executive-pro', 'tech-developer',
    'minimalist-clean', 'academic-harvard', 'corporate-business',
    'creative-accent', 'fresh-graduate', 'compact-one-page',
    'elegant-sidebar', 'bold-modern'
  ];
  if (valid.includes(lower)) return lower;
  if (lower.includes('ats') || lower.includes('standard') || lower.includes('rabbit') || lower.includes('simple')) return 'ats-standard';
  if (lower.includes('tech') || lower.includes('dev') || lower.includes('concept') || lower.includes('lap_trinh')) return 'tech-developer';
  if (lower.includes('executive') || lower.includes('decker') || lower.includes('pro') || lower.includes('leader')) return 'executive-pro';
  if (lower.includes('minimal') || lower.includes('toi_gian')) return 'minimalist-clean';
  if (lower.includes('harvard') || lower.includes('academic') || lower.includes('basic')) return 'academic-harvard';
  if (lower.includes('corporate') || lower.includes('business') || lower.includes('buffalo') || lower.includes('sales')) return 'corporate-business';
  if (lower.includes('creative') || lower.includes('accent') || lower.includes('vibes') || lower.includes('sang_tao')) return 'creative-accent';
  if (lower.includes('graduate') || lower.includes('fresh') || lower.includes('chicken') || lower.includes('sinh_vien')) return 'fresh-graduate';
  if (lower.includes('compact') || lower.includes('one-page') || lower.includes('1-trang')) return 'compact-one-page';
  if (lower.includes('sidebar') || lower.includes('elegant') || lower.includes('bubbles')) return 'elegant-sidebar';
  if (lower.includes('bold') || lower.includes('an_tuong')) return 'bold-modern';
  if (lower.includes('modern') || lower.includes('topcv') || lower.includes('cascade')) return 'topcv-modern';
  return 'topcv-modern';
}

interface CVContextType {
  cvData: CVData;
  setCVData: React.Dispatch<React.SetStateAction<CVData>>;
  updateProfile: (field: string, value: any) => void;
  updateTheme: (updates: Partial<CVData['theme']>) => void;
  setLanguage: (lang: Language) => void;
  setTemplateId: (templateId: string) => void;
  setFontSize: (size: FontSize) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  
  // Section items management
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, field: string, value: any) => void;
  
  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateEducation: (id: string, field: string, value: any) => void;
  
  addSkill: (name?: string) => void;
  removeSkill: (id: string) => void;
  updateSkill: (id: string, field: string, value: any) => void;

  addProject: () => void;
  removeProject: (id: string) => void;
  updateProject: (id: string, field: string, value: any) => void;

  addCertificate: () => void;
  removeCertificate: (id: string) => void;
  updateCertificate: (id: string, field: string, value: any) => void;

  addAward: () => void;
  removeAward: (id: string) => void;
  updateAward: (id: string, field: string, value: any) => void;

  addActivity: () => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, field: string, value: any) => void;

  addReference: () => void;
  removeReference: (id: string) => void;
  updateReference: (id: string, field: string, value: any) => void;

  toggleSectionVisibility: (sectionKey: keyof CVData['sectionsVisibility']) => void;
  reorderSections: (newOrder: string[]) => void;
  resetToSample: () => void;
  loadPresetData: (preset: Partial<CVData>) => void;

  // Zoom
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;

  // Modals state
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (open: boolean) => void;
  isContentLibraryOpen: boolean;
  setIsContentLibraryOpen: (open: boolean) => void;
  isATSModalOpen: boolean;
  setIsATSModalOpen: (open: boolean) => void;
  isSectionManagerOpen: boolean;
  setIsSectionManagerOpen: (open: boolean) => void;
  
  // Notification toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cvData, setCVData] = useState<CVData>(() => {
    // 1. Đọc template và tiêu đề từ URL query params
    const searchParams = new URLSearchParams(window.location.search);
    const tplParam = searchParams.get('template');
    const nameParam = searchParams.get('name');

    // 2. Tự động đồng bộ thông tin ứng viên từ tài khoản ConnectCV
    const syncedProfile: any = {};
    try {
      const savedUser = JSON.parse(localStorage.getItem('connectcv_user') || '{}');
      const savedCv = JSON.parse(localStorage.getItem('connectcv_saved_cv') || '{}');
      if (savedCv.fullName || savedUser.fullName) syncedProfile.fullName = (savedCv.fullName || savedUser.fullName).toUpperCase();
      if (savedCv.jobTitle || savedUser.title) syncedProfile.jobTitle = savedCv.jobTitle || savedUser.title;
      if (savedCv.email || savedUser.email) syncedProfile.email = savedCv.email || savedUser.email;
      if (savedCv.phone || savedUser.phone) syncedProfile.phone = savedCv.phone || savedUser.phone;
      if (savedCv.address || savedUser.location) syncedProfile.address = savedCv.address || savedUser.location;
    } catch(e) {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = {
          ...initialSalesCVData,
          ...parsed,
          theme: { ...initialSalesCVData.theme, ...(parsed.theme || {}) },
          profile: { ...initialSalesCVData.profile, ...(parsed.profile || {}), ...syncedProfile },
          sectionsVisibility: { ...initialSalesCVData.sectionsVisibility, ...(parsed.sectionsVisibility || {}) },
        };
        if (tplParam) data.templateId = normalizeTemplateId(tplParam);
        if (nameParam) data.title = nameParam;
        return data;
      }
    } catch (e) {
      console.error('Failed to parse saved CV:', e);
    }

    const data = {
      ...initialSalesCVData,
      profile: { ...initialSalesCVData.profile, ...syncedProfile },
    };
    if (tplParam) data.templateId = normalizeTemplateId(tplParam);
    if (nameParam) data.title = nameParam;
    return data;
  });

  const [zoom, setZoom] = useState<number>(100);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isContentLibraryOpen, setIsContentLibraryOpen] = useState(false);
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-save on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    } catch (e) {
      console.error('Failed to save CV:', e);
    }
  }, [cvData]);

  const updateProfile = (field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const updateTheme = (updates: Partial<CVData['theme']>) => {
    setCVData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...updates
      }
    }));
  };

  const setLanguage = (lang: Language) => {
    setCVData(prev => ({ ...prev, language: lang }));
  };

  const setTemplateId = (templateId: string) => {
    setCVData(prev => ({ ...prev, templateId }));
  };

  const setFontSize = (fontSize: FontSize) => {
    setCVData(prev => ({
      ...prev,
      theme: { ...prev.theme, fontSize }
    }));
  };

  const setLineSpacing = (lineSpacing: LineSpacing) => {
    setCVData(prev => ({
      ...prev,
      theme: { ...prev.theme, lineSpacing }
    }));
  };

  // Experience
  const addExperience = () => {
    const newItem = {
      id: `exp-${Date.now()}`,
      position: 'Vị trí công việc mới',
      company: 'Tên Công Ty',
      startDate: '01/2023',
      endDate: 'Hiện tại',
      current: true,
      description: ['Mô tả trách nhiệm công việc và kết quả định lượng cụ thể.']
    };
    setCVData(prev => ({
      ...prev,
      experience: [newItem, ...prev.experience]
    }));
  };

  const removeExperience = (id: string) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // Education
  const addEducation = () => {
    const newItem = {
      id: `edu-${Date.now()}`,
      school: 'Tên Trường Đại Học / Cao Đẳng',
      degree: 'Cử nhân / Kỹ sư',
      fieldOfStudy: 'Chuyên ngành đào tạo',
      startDate: '2018',
      endDate: '2022',
      gpa: '3.2 / 4.0',
      description: 'Thành tích nổi bật, học bổng hoặc hoạt động nghiên cứu khoa học.'
    };
    setCVData(prev => ({
      ...prev,
      education: [newItem, ...prev.education]
    }));
  };

  const removeEducation = (id: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // Skills
  const addSkill = (name: string = 'Kỹ năng mới') => {
    const newItem = {
      id: `sk-${Date.now()}`,
      name,
      level: 4
    };
    setCVData(prev => ({
      ...prev,
      skills: [...prev.skills, newItem]
    }));
  };

  const removeSkill = (id: string) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
  };

  const updateSkill = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  // Projects
  const addProject = () => {
    const newItem = {
      id: `proj-${Date.now()}`,
      name: 'Tên dự án mới',
      role: 'Vai trò trong dự án',
      time: '01/2023 - 06/2023',
      technologies: 'Công nghệ / Công cụ sử dụng',
      description: ['Mô tả chi tiết mục tiêu, giải pháp và kết quả dự án mang lại.']
    };
    setCVData(prev => ({
      ...prev,
      projects: [newItem, ...prev.projects]
    }));
  };

  const removeProject = (id: string) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const updateProject = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // Certificates
  const addCertificate = () => {
    const newItem = {
      id: `cert-${Date.now()}`,
      name: 'Tên chứng chỉ nghề nghiệp',
      issuer: 'Tổ chức cấp chứng chỉ',
      year: new Date().getFullYear().toString()
    };
    setCVData(prev => ({
      ...prev,
      certificates: [...prev.certificates, newItem]
    }));
  };

  const removeCertificate = (id: string) => {
    setCVData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(c => c.id !== id)
    }));
  };

  const updateCertificate = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      certificates: prev.certificates.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  // Awards
  const addAward = () => {
    const newItem = {
      id: `aw-${Date.now()}`,
      name: 'Tên giải thưởng hoặc thành tựu',
      issuer: 'Đơn vị trao giải',
      year: new Date().getFullYear().toString()
    };
    setCVData(prev => ({
      ...prev,
      awards: [...prev.awards, newItem]
    }));
  };

  const removeAward = (id: string) => {
    setCVData(prev => ({
      ...prev,
      awards: prev.awards.filter(a => a.id !== id)
    }));
  };

  const updateAward = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      awards: prev.awards.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  // Activities
  const addActivity = () => {
    const newItem = {
      id: `act-${Date.now()}`,
      role: 'Thành viên / Trưởng ban',
      organization: 'Tên tổ chức / Câu lạc bộ',
      time: '2022 - 2023',
      description: 'Mô tả đóng góp và hoạt động đã thực hiện.'
    };
    setCVData(prev => ({
      ...prev,
      activities: [...prev.activities, newItem]
    }));
  };

  const removeActivity = (id: string) => {
    setCVData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  const updateActivity = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  // References
  const addReference = () => {
    const newItem = {
      id: `ref-${Date.now()}`,
      name: 'Tên người tham chiếu',
      position: 'Chức vụ',
      company: 'Tên công ty',
      email: 'email@company.com',
      phone: '0987 000 111'
    };
    setCVData(prev => ({
      ...prev,
      references: [...prev.references, newItem]
    }));
  };

  const removeReference = (id: string) => {
    setCVData(prev => ({
      ...prev,
      references: prev.references.filter(r => r.id !== id)
    }));
  };

  const updateReference = (id: string, field: string, value: any) => {
    setCVData(prev => ({
      ...prev,
      references: prev.references.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const toggleSectionVisibility = (sectionKey: keyof CVData['sectionsVisibility']) => {
    setCVData(prev => ({
      ...prev,
      sectionsVisibility: {
        ...prev.sectionsVisibility,
        [sectionKey]: !prev.sectionsVisibility[sectionKey]
      }
    }));
  };

  const reorderSections = (newOrder: string[]) => {
    setCVData(prev => ({ ...prev, sectionOrder: newOrder }));
  };

  const resetToSample = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục về dữ liệu CV mẫu chuyên nghiệp của ConnectCV không?')) {
      setCVData(initialSalesCVData);
      showToast('Đã khôi phục về CV mẫu chuẩn ConnectCV!');
    }
  };

  const loadPresetData = (preset: Partial<CVData>) => {
    setCVData(prev => ({
      ...prev,
      ...preset,
      profile: { ...prev.profile, ...(preset.profile || {}) },
      theme: { ...prev.theme, ...(preset.theme || {}) }
    }));
    showToast('Đã áp dụng mẫu nội dung ngành thành công!');
  };

  return (
    <CVContext.Provider
      value={{
        cvData,
        setCVData,
        updateProfile,
        updateTheme,
        setLanguage,
        setTemplateId,
        setFontSize,
        setLineSpacing,
        addExperience,
        removeExperience,
        updateExperience,
        addEducation,
        removeEducation,
        updateEducation,
        addSkill,
        removeSkill,
        updateSkill,
        addProject,
        removeProject,
        updateProject,
        addCertificate,
        removeCertificate,
        updateCertificate,
        addAward,
        removeAward,
        updateAward,
        addActivity,
        removeActivity,
        updateActivity,
        addReference,
        removeReference,
        updateReference,
        toggleSectionVisibility,
        reorderSections,
        resetToSample,
        loadPresetData,
        zoom,
        setZoom,
        isTemplateModalOpen,
        setIsTemplateModalOpen,
        isContentLibraryOpen,
        setIsContentLibraryOpen,
        isATSModalOpen,
        setIsATSModalOpen,
        isSectionManagerOpen,
        setIsSectionManagerOpen,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};
