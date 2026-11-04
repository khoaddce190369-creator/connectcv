export type Language = 'vi' | 'en';

export type FontSize = 'small' | 'medium' | 'large';
export type LineSpacing = 'compact' | 'normal' | 'relaxed';

export interface CVProfile {
  fullName: string;
  jobTitle: string;
  avatar: string;
  showAvatar: boolean;
  email: string;
  phone: string;
  address: string;
  website?: string;
  linkedin?: string;
  github?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level?: number; // 1-5 or percentage
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  time: string;
  customer?: string;
  teamSize?: string;
  technologies?: string;
  description: string[];
  link?: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface AwardItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ActivityItem {
  id: string;
  role: string;
  organization: string;
  time: string;
  description: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CVSectionsVisibility {
  objective: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  certificates: boolean;
  awards: boolean;
  activities: boolean;
  interests: boolean;
  references: boolean;
  customSections: boolean;
}

export interface CVTheme {
  primaryColor: string;
  secondaryColor?: string;
  textColor: string;
  bgColor: string;
  fontFamily: string;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
}

export interface CVData {
  id: string;
  title: string;
  templateId: string;
  language: Language;
  theme: CVTheme;
  profile: CVProfile;
  objective: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  awards: AwardItem[];
  activities: ActivityItem[];
  interests: string[];
  references: ReferenceItem[];
  customSections: CustomSection[];
  sectionsVisibility: CVSectionsVisibility;
  sectionOrder: string[];
}

export interface CVTemplateMeta {
  id: string;
  name: string;
  badge?: string;
  category: 'ats' | 'modern' | 'professional' | 'creative' | 'academic';
  description: string;
  recommendedFor: string[];
  thumbnail: string;
  tags: string[];
  atsCompliant: boolean;
}
