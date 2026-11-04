import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Plus } from 'lucide-react';

export const TemplateBoldModern: React.FC = () => {
  const {
    cvData,
    updateProfile,
    setCVData,
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
  } = useCV();

  const t = getT(cvData.language);
  const theme = cvData.theme;
  const { baseText, heading, name } = getTypographyClasses(theme);
  const primary = theme.primaryColor;

  return (
    <div
      className={`w-full min-h-[297mm] bg-white text-slate-800 p-10 transition-all ${baseText}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* BOLD MODERN HEADER WITH AVATAR */}
      <div className="flex flex-row justify-between items-center gap-6 pb-6 border-b-4 border-slate-900 mb-6">
        <div className="flex-1">
          <div className="text-xs font-mono tracking-widest uppercase mb-1 font-bold" style={{ color: primary }}>
            CURRICULUM VITAE //
          </div>
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className={`${name} font-black tracking-tight text-slate-900`}
          />
          <div className="mt-1 font-bold tracking-wider text-xs uppercase text-slate-500">
            <EditableText value={cvData.profile.jobTitle} onChange={(v) => updateProfile('jobTitle', v)} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-700 mt-3">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: primary }} />
              <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: primary }} />
              <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: primary }} />
              <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
            </div>
          </div>
        </div>

        {/* Bold Modern Avatar */}
        <AvatarUpload size="w-28 h-28" shape="rounded" borderColor="#0f172a" />
      </div>

      {/* SUMMARY */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-6">
          <div className="inline-block px-3 py-1 text-white text-xs font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: primary }}>
            {t.careerObjective}
          </div>
          <EditableText
            tag="p"
            value={cvData.objective}
            onChange={(val) => setCVData((prev) => ({ ...prev, objective: val }))}
            multiline
            className="text-slate-700 leading-relaxed text-justify"
          />
        </section>
      )}

      {/* EXPERIENCE */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="inline-block px-3 py-1 text-white text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: primary }}>
              {t.workExperience}
            </div>
            <button onClick={addExperience} className="text-xs font-bold hover:underline print:hidden" style={{ color: primary }}>
              + {t.addItem}
            </button>
          </div>

          <div className="space-y-4">
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="relative group border-l-2 border-slate-900 pl-4 ml-1">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                </div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <EditableText value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} />
                  <span className="text-xs font-mono text-slate-500 shrink-0">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-xs font-bold text-slate-600 mb-1">
                  <EditableText value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                </div>
                <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs">
                  {exp.description.map((desc, idx) => (
                    <li key={idx}>
                      <EditableText
                        value={desc}
                        onChange={(newDesc) => {
                          const descs = [...exp.description];
                          descs[idx] = newDesc;
                          updateExperience(exp.id, 'description', newDescs);
                        }}
                        multiline
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2 COLUMNS: EDUCATION & SKILLS */}
      <div className="grid grid-cols-2 gap-6">
        {cvData.sectionsVisibility.education && (
          <section>
            <div className="inline-block px-3 py-1 text-white text-xs font-bold uppercase tracking-wider mb-2.5" style={{ backgroundColor: primary }}>
              {t.education}
            </div>
            <div className="space-y-3 text-xs">
              {cvData.education.map((edu) => (
                <div key={edu.id} className="relative group border-l-2 border-slate-900 pl-3">
                  <div className="font-bold text-slate-900">
                    <EditableText value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} />
                  </div>
                  <div className="text-slate-700">
                    <EditableText value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} />
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">{edu.startDate} - {edu.endDate}</div>
                  <div className="absolute -right-2 top-0">
                    <ItemToolbar onDelete={() => removeEducation(edu.id)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.sectionsVisibility.skills && (
          <section>
            <div className="inline-block px-3 py-1 text-white text-xs font-bold uppercase tracking-wider mb-2.5" style={{ backgroundColor: primary }}>
              {t.skills}
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {cvData.skills.map((skill) => (
                <span key={skill.id} className="bg-slate-900 text-white px-2.5 py-1 rounded font-medium">
                  <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
