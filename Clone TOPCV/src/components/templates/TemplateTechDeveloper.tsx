import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Code2, Plus, Terminal, ExternalLink } from 'lucide-react';

export const TemplateTechDeveloper: React.FC = () => {
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
      className={`w-full min-h-[297mm] bg-white text-slate-800 p-8 transition-all ${baseText}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* TECH DEVELOPER TERMINAL HEADER WITH AVATAR */}
      <div className="border border-slate-700 rounded-xl p-6 mb-6 shadow-md bg-slate-900 text-white">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2.5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          </div>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Terminal className="w-3 h-3" /> developer_environment.profile
          </span>
        </div>

        <div className="flex flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <EditableText
              tag="h1"
              value={cvData.profile.fullName}
              onChange={(val) => updateProfile('fullName', val)}
              placeholder={t.fullNamePlaceholder}
              className={`${name} text-white font-mono tracking-tight`}
            />
            <div className="mt-1 flex items-center gap-2 text-emerald-400 font-mono text-sm">
              <Code2 className="w-4 h-4" />
              <EditableText
                tag="h2"
                value={cvData.profile.jobTitle}
                onChange={(val) => updateProfile('jobTitle', val)}
                placeholder={t.jobTitlePlaceholder}
                className="font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300 mt-4 font-mono">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
              </div>
              {cvData.profile.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} />
                </div>
              )}
            </div>
          </div>

          {/* Tech Developer Avatar with glowing border */}
          <AvatarUpload size="w-28 h-28" shape="rounded" borderColor="#10b981" />
        </div>
      </div>

      {/* OBJECTIVE */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-6">
          <div className="flex items-center gap-2 border-b-2 pb-1 mb-2" style={{ borderColor: primary }}>
            <span className="font-mono font-bold" style={{ color: primary }}>//</span>
            <h3 className={heading} style={{ color: primary }}>
              {t.careerObjective}
            </h3>
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

      {/* TECH SKILLS / STACK HIGHLIGHT */}
      {cvData.sectionsVisibility.skills && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b-2 pb-1 mb-3" style={{ borderColor: primary }}>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold" style={{ color: primary }}>//</span>
              <h3 className={heading} style={{ color: primary }}>
                CORE SKILLS & TECH STACK
              </h3>
            </div>
            <button onClick={() => addSkill()} className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden" style={{ color: primary }}>
              <Plus className="w-3.5 h-3.5" /> Thêm Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill) => (
              <div
                key={skill.id}
                className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-xs font-semibold"
                style={{
                  backgroundColor: `${primary}10`,
                  borderColor: `${primary}40`,
                  color: primary
                }}
              >
                <span>⚡</span>
                <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 print:hidden"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b-2 pb-1 mb-3" style={{ borderColor: primary }}>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold" style={{ color: primary }}>//</span>
              <h3 className={heading} style={{ color: primary }}>
                {t.workExperience}
              </h3>
            </div>
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
              <div key={exp.id} className="relative group pl-3 border-l-2" style={{ borderColor: primary }}>
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                </div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <EditableText value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} />
                  <span className="text-xs font-mono text-slate-500 shrink-0">
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

      {/* FEATURED PROJECTS */}
      {cvData.sectionsVisibility.projects && cvData.projects.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b-2 pb-1 mb-3" style={{ borderColor: primary }}>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold" style={{ color: primary }}>//</span>
              <h3 className={heading} style={{ color: primary }}>
                FEATURED PROJECTS
              </h3>
            </div>
            <button onClick={addProject} className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden" style={{ color: primary }}>
              <Plus className="w-3.5 h-3.5" /> Thêm Project
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {cvData.projects.map((proj) => (
              <div key={proj.id} className="relative group bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="absolute -right-1 -top-1">
                  <ItemToolbar onDelete={() => removeProject(proj.id)} />
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <EditableText value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">{proj.time}</span>
                </div>
                <div className="text-xs text-slate-600 mb-1.5">
                  <span className="font-semibold">Role:</span>{' '}
                  <EditableText value={proj.role} onChange={(v) => updateProject(proj.id, 'role', v)} />
                </div>
                {proj.technologies && (
                  <div className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200 mb-2 text-slate-700">
                    <EditableText value={proj.technologies} onChange={(v) => updateProject(proj.id, 'technologies', v)} />
                  </div>
                )}
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

      {/* EDUCATION & CERTIFICATES */}
      <div className="grid grid-cols-2 gap-6">
        {cvData.sectionsVisibility.education && (
          <section>
            <div className="flex items-center justify-between border-b-2 pb-1 mb-3" style={{ borderColor: primary }}>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold" style={{ color: primary }}>//</span>
                <h3 className={heading} style={{ color: primary }}>
                  {t.education}
                </h3>
              </div>
              <button onClick={addEducation} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {cvData.education.map((edu) => (
                <div key={edu.id} className="relative group text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <EditableText value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} />
                    <span className="font-mono text-slate-500">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-slate-600">
                    <EditableText value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} /> -{' '}
                    <EditableText value={edu.fieldOfStudy} onChange={(v) => updateEducation(edu.id, 'fieldOfStudy', v)} />
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
            <div className="flex items-center justify-between border-b-2 pb-1 mb-3" style={{ borderColor: primary }}>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold" style={{ color: primary }}>//</span>
                <h3 className={heading} style={{ color: primary }}>
                  {t.certificates}
                </h3>
              </div>
              <button onClick={addCertificate} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {cvData.certificates.map((cert) => (
                <div key={cert.id} className="relative group flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{cert.name}</span>
                    <div className="text-slate-500">{cert.issuer}</div>
                  </div>
                  <span className="font-mono text-slate-500">{cert.year}</span>
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
  );
};
