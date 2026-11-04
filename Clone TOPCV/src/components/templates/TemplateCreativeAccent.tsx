import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Plus, Sparkles } from 'lucide-react';

export const TemplateCreativeAccent: React.FC = () => {
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
      className={`w-full min-h-[297mm] bg-white text-slate-800 p-8 transition-all ${baseText}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* CREATIVE ACCENT TOP BANNER WITH AVATAR */}
      <div className="relative rounded-2xl p-6 mb-6 overflow-hidden shadow-xs border border-slate-100" style={{ backgroundColor: `${primary}12` }}>
        <div className="flex flex-row items-center gap-6 relative z-10">
          <AvatarUpload size="w-28 h-28" shape="rounded" borderColor={primary} />

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2" style={{ backgroundColor: `${primary}25`, color: primary }}>
              <Sparkles className="w-3.5 h-3.5" />
              <EditableText value={cvData.profile.jobTitle} onChange={(v) => updateProfile('jobTitle', v)} />
            </div>

            <EditableText
              tag="h1"
              value={cvData.profile.fullName}
              onChange={(val) => updateProfile('fullName', val)}
              placeholder={t.fullNamePlaceholder}
              className={`${name} tracking-tight font-black`}
              style={{ color: '#0f172a' }}
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} />
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
              </div>
              {cvData.profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MODERN ACCENT (32% Left & 68% Right) */}
      <div className="flex flex-row gap-6">
        {/* Left Side (Skills, Education) */}
        <div className="w-[32%] space-y-6">
          {cvData.sectionsVisibility.skills && (
            <section className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h3 className={heading} style={{ color: primary }}>
                  {t.skills}
                </h3>
                <button onClick={() => addSkill()} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                  + Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cvData.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group relative inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium text-white shadow-xs"
                    style={{ backgroundColor: primary }}
                  >
                    <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 text-white/80 hover:text-white print:hidden"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cvData.sectionsVisibility.education && (
            <section className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h3 className={heading} style={{ color: primary }}>
                  {t.education}
                </h3>
                <button onClick={addEducation} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                  + Thêm
                </button>
              </div>
              <div className="space-y-3 text-xs">
                {cvData.education.map((edu) => (
                  <div key={edu.id} className="relative group">
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
        </div>

        {/* Right Main (Objective, Experience, Projects) */}
        <div className="w-[68%] space-y-6">
          {cvData.sectionsVisibility.objective && (
            <section>
              <h3 className={`${heading} mb-2`} style={{ color: primary }}>
                {t.careerObjective}
              </h3>
              <EditableText
                tag="p"
                value={cvData.objective}
                onChange={(val) => setCVData((prev) => ({ ...prev, objective: val }))}
                multiline
                className="text-slate-700 leading-relaxed text-justify"
              />
            </section>
          )}

          {cvData.sectionsVisibility.experience && (
            <section>
              <div className="flex items-center justify-between border-b pb-1 mb-3">
                <h3 className={heading} style={{ color: primary }}>
                  {t.workExperience}
                </h3>
                <button
                  onClick={addExperience}
                  className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden"
                  style={{ color: primary }}
                >
                  <Plus className="w-3.5 h-3.5" /> {t.addItem}
                </button>
              </div>

              <div className="space-y-4">
                {cvData.experience.map((exp) => (
                  <div key={exp.id} className="relative group">
                    <div className="absolute -right-2 top-0">
                      <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                    </div>
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <EditableText value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} />
                      <span className="text-xs font-semibold text-slate-500 shrink-0">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-semibold mb-1.5" style={{ color: primary }}>
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

          {cvData.sectionsVisibility.projects && cvData.projects.length > 0 && (
            <section>
              <div className="flex items-center justify-between border-b pb-1 mb-3">
                <h3 className={heading} style={{ color: primary }}>
                  {t.projects}
                </h3>
                <button onClick={addProject} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                  + Thêm
                </button>
              </div>
              <div className="space-y-3 text-xs">
                {cvData.projects.map((proj) => (
                  <div key={proj.id} className="relative group">
                    <div className="font-bold text-slate-900 flex justify-between">
                      <EditableText value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} />
                      <span className="text-slate-500">{proj.time}</span>
                    </div>
                    <div className="italic text-slate-600 mb-1">
                      Vai trò: <EditableText value={proj.role} onChange={(v) => updateProject(proj.id, 'role', v)} />
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700">
                      {proj.description.map((desc, idx) => (
                        <li key={idx}>
                          <EditableText
                            value={desc}
                            onChange={(newD) => {
                              const d = [...proj.description];
                              d[idx] = newD;
                              updateProject(proj.id, 'description', d);
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
