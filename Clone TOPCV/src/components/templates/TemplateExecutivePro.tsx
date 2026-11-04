import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Plus, Calendar } from 'lucide-react';

export const TemplateExecutivePro: React.FC = () => {
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
    addAward,
    removeAward,
    updateAward,
  } = useCV();

  const t = getT(cvData.language);
  const theme = cvData.theme;
  const { baseText, heading, name } = getTypographyClasses(theme);
  const primary = theme.primaryColor;

  return (
    <div
      className={`w-full min-h-[297mm] bg-white text-slate-800 transition-all ${baseText}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* EXECUTIVE FULL-WIDTH HEADER */}
      <div
        className="text-white p-8 flex flex-row items-center justify-between gap-6"
        style={{ backgroundColor: primary }}
      >
        <div className="flex-1">
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className={`${name} tracking-widest text-white`}
          />
          <div className="mt-1">
            <EditableText
              tag="h2"
              value={cvData.profile.jobTitle}
              onChange={(val) => updateProfile('jobTitle', val)}
              placeholder={t.jobTitlePlaceholder}
              className="text-sm font-medium tracking-wider text-white/90 uppercase"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs text-white/90">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
            </div>
            {cvData.profile.dateOfBirth && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <EditableText value={cvData.profile.dateOfBirth} onChange={(v) => updateProfile('dateOfBirth', v)} />
                </div>
              </>
            )}
            {cvData.profile.website && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avatar */}
        <AvatarUpload size="w-32 h-32" shape="rounded" borderColor="#ffffff" />
      </div>

      {/* EXECUTIVE BODY */}
      <div className="p-8 space-y-6">
        {/* Objective */}
        {cvData.sectionsVisibility.objective && (
          <section className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className={`${heading} mb-1.5`} style={{ color: primary }}>
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

        {/* 2-column fixed layout: 65% Main & 35% Sidebar */}
        <div className="flex flex-row gap-8">
          {/* Main 65% (Work experience & Projects) */}
          <div className="w-[65%] space-y-6">
            {cvData.sectionsVisibility.experience && (
              <section>
                <div className="flex items-center justify-between border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
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
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">
                        <EditableText value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs">
                        {exp.description.map((desc, idx) => (
                          <li key={idx}>
                            <EditableText
                              value={desc}
                              onChange={(newDesc) => {
                                const newDescs = [...exp.description];
                                newDescs[idx] = newDesc;
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
                <div className="flex items-center justify-between border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
                  <h3 className={heading} style={{ color: primary }}>
                    {t.projects}
                  </h3>
                  <button onClick={addProject} className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden" style={{ color: primary }}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {cvData.projects.map((proj) => (
                    <div key={proj.id} className="relative group">
                      <div className="absolute -right-2 top-0">
                        <ItemToolbar onDelete={() => removeProject(proj.id)} />
                      </div>
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <EditableText value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} />
                        <span className="text-xs font-semibold text-slate-500 shrink-0">{proj.time}</span>
                      </div>
                      <div className="text-xs italic text-slate-600 mb-1">
                        Vai trò: <EditableText value={proj.role} onChange={(v) => updateProject(proj.id, 'role', v)} />
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs">
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

          {/* Sidebar 35% (Skills, Education, Certs, Awards) */}
          <div className="w-[35%] space-y-6">
            {cvData.sectionsVisibility.skills && (
              <section>
                <div className="flex items-center justify-between border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
                  <h3 className={heading} style={{ color: primary }}>
                    {t.skills}
                  </h3>
                  <button onClick={() => addSkill()} className="text-xs flex items-center gap-0.5 font-medium hover:underline print:hidden" style={{ color: primary }}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {cvData.skills.map((skill) => (
                    <div key={skill.id} className="group relative text-xs">
                      <div className="flex justify-between font-medium text-slate-800 mb-1">
                        <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                        <button onClick={() => removeSkill(skill.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 print:hidden">
                          ×
                        </button>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${((skill.level || 4) / 5) * 100}%`, backgroundColor: primary }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cvData.sectionsVisibility.education && (
              <section>
                <div className="flex items-center justify-between border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
                  <h3 className={heading} style={{ color: primary }}>
                    {t.education}
                  </h3>
                  <button onClick={addEducation} className="text-xs flex items-center gap-0.5 font-medium hover:underline print:hidden" style={{ color: primary }}>
                    <Plus className="w-3.5 h-3.5" />
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
                      <div className="text-slate-500">
                        {edu.startDate} - {edu.endDate}
                      </div>
                      <div className="absolute -right-1 top-0">
                        <ItemToolbar onDelete={() => removeEducation(edu.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cvData.sectionsVisibility.certificates && cvData.certificates.length > 0 && (
              <section>
                <div className="flex items-center justify-between border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
                  <h3 className={heading} style={{ color: primary }}>
                    {t.certificates}
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  {cvData.certificates.map((cert) => (
                    <div key={cert.id} className="relative group">
                      <div className="font-semibold text-slate-800">
                        <EditableText value={cert.name} onChange={(v) => updateCertificate(cert.id, 'name', v)} />
                      </div>
                      <div className="text-slate-500 flex justify-between">
                        <span>{cert.issuer}</span>
                        <span>{cert.year}</span>
                      </div>
                      <div className="absolute -right-1 top-0">
                        <ItemToolbar onDelete={() => removeCertificate(cert.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
