import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Plus, Target, TrendingUp, Calendar } from 'lucide-react';

export const TemplateCorporateBusiness: React.FC = () => {
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
      className={`w-full min-h-[297mm] bg-white text-slate-800 p-8 transition-all ${baseText}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* CORPORATE BORDERED HEADER WITH AVATAR */}
      <div className="border-l-4 pl-6 py-2 mb-6 flex flex-row items-center justify-between gap-6" style={{ borderColor: primary }}>
        <div className="flex-1">
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className={`${name} tracking-tight font-extrabold`}
            style={{ color: primary }}
          />
          <div className="mt-1 font-semibold text-slate-600 uppercase text-xs tracking-wider">
            <EditableText
              tag="h2"
              value={cvData.profile.jobTitle}
              onChange={(val) => updateProfile('jobTitle', val)}
              placeholder={t.jobTitlePlaceholder}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 mt-3">
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
            {cvData.profile.website && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" style={{ color: primary }} />
                  <EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avatar */}
        <AvatarUpload size="w-28 h-28" shape="rounded" borderColor={primary} />
      </div>

      {/* EXECUTIVE SUMMARY */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-6">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded mb-2">
            <Target className="w-4 h-4" style={{ color: primary }} />
            <h3 className={heading} style={{ color: primary }}>
              {t.careerObjective}
            </h3>
          </div>
          <EditableText
            tag="p"
            value={cvData.objective}
            onChange={(val) => setCVData((prev) => ({ ...prev, objective: val }))}
            multiline
            className="text-slate-700 leading-relaxed text-justify px-2"
          />
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-3" style={{ borderColor: primary }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: primary }} />
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
              <div key={exp.id} className="relative group bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                </div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <EditableText value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} />
                  <span className="text-xs font-semibold text-slate-500 shrink-0">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-semibold mb-2" style={{ color: primary }}>
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
            <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: primary }}>
              <h3 className={heading} style={{ color: primary }}>
                {t.education}
              </h3>
              <button onClick={addEducation} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                + {t.addItem}
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
                  <div className="text-slate-500">{edu.startDate} - {edu.endDate}</div>
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
            <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: primary }}>
              <h3 className={heading} style={{ color: primary }}>
                {t.skills}
              </h3>
              <button onClick={() => addSkill()} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                + {t.addItem}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {cvData.skills.map((skill) => (
                <div key={skill.id} className="group relative">
                  <div className="flex justify-between font-medium text-slate-800">
                    <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
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
      </div>
    </div>
  );
};
