import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Plus } from 'lucide-react';

export const TemplateMinimalistClean: React.FC = () => {
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
    addCertificate,
    removeCertificate,
    updateCertificate,
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
      {/* MINIMALIST HEADER WITH AVATAR */}
      <div className="flex flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 mb-6">
        <div className="flex-1">
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className={`${name} tracking-tight font-light`}
            style={{ color: '#0f172a' }}
          />
          <div className="mt-1 font-semibold tracking-wider uppercase text-xs" style={{ color: primary }}>
            <EditableText
              tag="h2"
              value={cvData.profile.jobTitle}
              onChange={(val) => updateProfile('jobTitle', val)}
              placeholder={t.jobTitlePlaceholder}
            />
          </div>

          {/* Minimal inline contact info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-slate-500">
            <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
            <span>/</span>
            <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} />
            <span>/</span>
            <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
            {cvData.profile.website && (
              <>
                <span>/</span>
                <EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} />
              </>
            )}
          </div>
        </div>

        {/* Avatar */}
        <AvatarUpload size="w-24 h-24" shape="circle" borderColor={primary} />
      </div>

      {/* OBJECTIVE */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-6 flex flex-row gap-6">
          <div className="w-[25%] shrink-0">
            <h3 className={`${heading} text-slate-400 font-medium`}>
              {t.careerObjective}
            </h3>
          </div>
          <div className="w-[75%]">
            <EditableText
              tag="p"
              value={cvData.objective}
              onChange={(val) => setCVData((prev) => ({ ...prev, objective: val }))}
              multiline
              className="text-slate-700 leading-relaxed text-justify"
            />
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-6 flex flex-row gap-6">
          <div className="w-[25%] shrink-0">
            <h3 className={`${heading} text-slate-400 font-medium`}>
              {t.workExperience}
            </h3>
            <button
              onClick={addExperience}
              className="text-xs flex items-center gap-1 font-medium mt-2 hover:underline print:hidden"
              style={{ color: primary }}
            >
              <Plus className="w-3.5 h-3.5" /> {t.addItem}
            </button>
          </div>

          <div className="w-[75%] space-y-5">
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="relative group">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                </div>
                <div className="flex justify-between items-baseline">
                  <EditableText
                    value={exp.position}
                    onChange={(val) => updateExperience(exp.id, 'position', val)}
                    className="font-semibold text-slate-900"
                  />
                  <span className="text-xs text-slate-400 shrink-0">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500 mb-1.5">
                  <EditableText value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                </div>
                <ul className="space-y-1 text-slate-700 text-xs">
                  {exp.description.map((desc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 select-none mt-0.5">—</span>
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

      {/* EDUCATION */}
      {cvData.sectionsVisibility.education && (
        <section className="mb-6 flex flex-row gap-6">
          <div className="w-[25%] shrink-0">
            <h3 className={`${heading} text-slate-400 font-medium`}>
              {t.education}
            </h3>
            <button
              onClick={addEducation}
              className="text-xs flex items-center gap-1 font-medium mt-2 hover:underline print:hidden"
              style={{ color: primary }}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[75%] space-y-3">
            {cvData.education.map((edu) => (
              <div key={edu.id} className="relative group">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeEducation(edu.id)} />
                </div>
                <div className="flex justify-between items-baseline">
                  <EditableText value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} className="font-semibold text-slate-900" />
                  <span className="text-xs text-slate-400 shrink-0">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="text-xs text-slate-600">
                  <EditableText value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} />
                  <span> / </span>
                  <EditableText value={edu.fieldOfStudy} onChange={(v) => updateEducation(edu.id, 'fieldOfStudy', v)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {cvData.sectionsVisibility.skills && (
        <section className="mb-6 flex flex-row gap-6">
          <div className="w-[25%] shrink-0">
            <h3 className={`${heading} text-slate-400 font-medium`}>
              {t.skills}
            </h3>
            <button
              onClick={() => addSkill()}
              className="text-xs flex items-center gap-1 font-medium mt-2 hover:underline print:hidden"
              style={{ color: primary }}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[75%] flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-700">
            {cvData.skills.map((skill) => (
              <div key={skill.id} className="group relative flex items-center gap-1">
                <span>•</span>
                <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-xs ml-0.5 print:hidden"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {cvData.sectionsVisibility.projects && cvData.projects.length > 0 && (
        <section className="mb-6 flex flex-row gap-6">
          <div className="w-[25%] shrink-0">
            <h3 className={`${heading} text-slate-400 font-medium`}>
              {t.projects}
            </h3>
          </div>
          <div className="w-[75%] space-y-3 text-xs">
            {cvData.projects.map((proj) => (
              <div key={proj.id} className="relative group">
                <div className="font-semibold text-slate-900 flex justify-between">
                  <EditableText value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} />
                  <span className="text-slate-400">{proj.time}</span>
                </div>
                <div className="text-slate-500 italic mb-1">
                  <EditableText value={proj.role} onChange={(v) => updateProject(proj.id, 'role', v)} />
                </div>
                <ul className="space-y-1 text-slate-700">
                  {proj.description.map((desc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400">—</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
