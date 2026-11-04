import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { Mail, Phone, MapPin, Globe, Plus } from 'lucide-react';

export const TemplateCompactOnePage: React.FC = () => {
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
  const primary = theme.primaryColor;

  return (
    <div
      className="w-full min-h-[297mm] bg-white text-slate-800 p-8 leading-snug text-xs transition-all"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* COMPACT HEADER WITH AVATAR */}
      <div className="flex flex-row items-center justify-between border-b pb-4 mb-4 gap-4" style={{ borderColor: primary }}>
        <AvatarUpload size="w-20 h-20" shape="rounded" borderColor={primary} />

        <div className="flex-1">
          <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: primary }}>
            <EditableText value={cvData.profile.fullName} onChange={(v) => updateProfile('fullName', v)} />
          </h1>
          <div className="font-semibold text-slate-600 uppercase text-[11px] tracking-wide mt-0.5">
            <EditableText value={cvData.profile.jobTitle} onChange={(v) => updateProfile('jobTitle', v)} />
          </div>
        </div>

        <div className="text-[11px] text-slate-600 text-right space-y-0.5 shrink-0">
          <div className="flex items-center justify-end gap-1">
            <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
            <Phone className="w-3 h-3 text-slate-400" />
          </div>
          <div className="flex items-center justify-end gap-1">
            <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} />
            <Mail className="w-3 h-3 text-slate-400" />
          </div>
          <div className="flex items-center justify-end gap-1">
            <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
            <MapPin className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-3">
          <h3 className="font-bold uppercase text-[11px] tracking-wider mb-1" style={{ color: primary }}>
            {t.careerObjective}
          </h3>
          <EditableText
            value={cvData.objective}
            onChange={(val) => setCVData((prev) => ({ ...prev, objective: val }))}
            multiline
            className="text-slate-700 text-justify block text-[11.5px]"
          />
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-3">
          <div className="flex justify-between items-center border-b pb-0.5 mb-2" style={{ borderColor: `${primary}30` }}>
            <h3 className="font-bold uppercase text-[11px] tracking-wider" style={{ color: primary }}>
              {t.workExperience}
            </h3>
            <button onClick={addExperience} className="text-[10px] hover:underline print:hidden" style={{ color: primary }}>
              + {t.addItem}
            </button>
          </div>

          <div className="space-y-2.5">
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="relative group">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                </div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <EditableText value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} />
                  <span className="text-[10px] text-slate-500 font-normal shrink-0">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="font-semibold text-slate-600 text-[11px] mb-0.5">
                  <EditableText value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                </div>
                <ul className="list-disc list-outside pl-3.5 space-y-0.5 text-slate-700 text-[11.5px]">
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

      {/* 2 COMPACT COLUMNS: EDUCATION & SKILLS */}
      <div className="grid grid-cols-2 gap-4">
        {cvData.sectionsVisibility.education && (
          <section>
            <div className="flex justify-between items-center border-b pb-0.5 mb-1.5" style={{ borderColor: `${primary}30` }}>
              <h3 className="font-bold uppercase text-[11px] tracking-wider" style={{ color: primary }}>
                {t.education}
              </h3>
              <button onClick={addEducation} className="text-[10px] hover:underline print:hidden" style={{ color: primary }}>
                +
              </button>
            </div>
            <div className="space-y-2">
              {cvData.education.map((edu) => (
                <div key={edu.id} className="relative group">
                  <div className="font-bold text-slate-900">
                    <EditableText value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} />
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <EditableText value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} />
                  </div>
                  <div className="text-slate-500 text-[10px]">{edu.startDate} - {edu.endDate}</div>
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
            <div className="flex justify-between items-center border-b pb-0.5 mb-1.5" style={{ borderColor: `${primary}30` }}>
              <h3 className="font-bold uppercase text-[11px] tracking-wider" style={{ color: primary }}>
                {t.skills}
              </h3>
              <button onClick={() => addSkill()} className="text-[10px] hover:underline print:hidden" style={{ color: primary }}>
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              {cvData.skills.map((skill) => (
                <span key={skill.id} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
