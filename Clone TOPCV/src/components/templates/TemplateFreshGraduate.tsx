import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Plus, GraduationCap } from 'lucide-react';

export const TemplateFreshGraduate: React.FC = () => {
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
    addActivity,
    removeActivity,
    updateActivity,
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
      {/* FRESH GRADUATE HEADER WITH AVATAR */}
      <div className="flex flex-row items-center justify-between gap-6 border-b pb-6 mb-6">
        <div className="flex-1">
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className={`${name} tracking-wide font-bold`}
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} />
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
            </div>
            {cvData.profile.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} />
              </div>
            )}
          </div>
        </div>

        {/* Avatar */}
        <AvatarUpload size="w-28 h-28" shape="circle" borderColor={primary} />
      </div>

      {/* OBJECTIVE */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-6">
          <h3 className={`${heading} border-b pb-1 mb-2`} style={{ color: primary, borderColor: `${primary}40` }}>
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

      {/* EDUCATION - FIRST FOR FRESHERS */}
      {cvData.sectionsVisibility.education && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-3" style={{ borderColor: `${primary}40` }}>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" style={{ color: primary }} />
              <h3 className={heading} style={{ color: primary }}>
                {t.education}
              </h3>
            </div>
            <button onClick={addEducation} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
              + Thêm
            </button>
          </div>
          <div className="space-y-3">
            {cvData.education.map((edu) => (
              <div key={edu.id} className="relative group bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <EditableText value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} />
                  <span className="text-xs font-semibold text-slate-500 shrink-0">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="text-xs text-slate-700">
                  <EditableText value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} /> -{' '}
                  <EditableText value={edu.fieldOfStudy} onChange={(v) => updateEducation(edu.id, 'fieldOfStudy', v)} />
                  {edu.gpa && (
                    <span className="font-semibold text-emerald-600 ml-2">
                      (GPA: <EditableText value={edu.gpa} onChange={(v) => updateEducation(edu.id, 'gpa', v)} />)
                    </span>
                  )}
                </div>
                {edu.description && (
                  <p className="text-xs text-slate-600 mt-1 italic">{edu.description}</p>
                )}
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeEducation(edu.id)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {cvData.sectionsVisibility.skills && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: `${primary}40` }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.skills}
            </h3>
            <button onClick={() => addSkill()} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
              + Thêm
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {cvData.skills.map((skill) => (
              <div key={skill.id} className="group relative border border-slate-300 rounded-full px-3 py-1 bg-white text-slate-800">
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

      {/* INTERNSHIP & EXPERIENCE */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-3" style={{ borderColor: `${primary}40` }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.workExperience} / THỰC TẬP
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
                  <span className="text-xs font-semibold text-slate-500 shrink-0">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-xs font-semibold mb-1" style={{ color: primary }}>
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

      {/* ACTIVITIES */}
      {cvData.sectionsVisibility.activities && cvData.activities.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: `${primary}40` }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.activities}
            </h3>
            <button onClick={addActivity} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
              + Thêm
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {cvData.activities.map((act) => (
              <div key={act.id} className="relative group">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{act.role} – {act.organization}</span>
                  <span className="text-slate-500 font-normal shrink-0">{act.time}</span>
                </div>
                <p className="text-slate-700 mt-0.5">{act.description}</p>
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeActivity(act.id)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
