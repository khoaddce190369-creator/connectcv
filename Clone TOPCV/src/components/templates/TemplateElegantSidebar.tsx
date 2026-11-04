import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Plus } from 'lucide-react';

export const TemplateElegantSidebar: React.FC = () => {
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
      className={`w-full min-h-[297mm] bg-white text-slate-800 flex flex-row transition-all ${baseText}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* SOLID DARK / ACCENT SIDEBAR (34%) WITH AVATAR */}
      <div
        className="w-[34%] p-6 text-white flex flex-col gap-6 shrink-0"
        style={{ backgroundColor: primary }}
      >
        <div className="flex justify-center">
          <AvatarUpload size="w-32 h-32" shape="circle" borderColor="#ffffff" />
        </div>

        <div className="text-center">
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className="text-xl font-black uppercase tracking-wide text-white"
          />
          <div className="mt-1 text-xs uppercase tracking-wider text-white/80 font-medium">
            <EditableText value={cvData.profile.jobTitle} onChange={(v) => updateProfile('jobTitle', v)} />
          </div>
        </div>

        {/* Contact details */}
        <section className="border-t border-white/20 pt-4">
          <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-white/90">
            {t.contactInfo}
          </h3>
          <div className="space-y-2.5 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} />
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} className="break-all" />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} />
            </div>
            {cvData.profile.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} className="break-all" />
              </div>
            )}
          </div>
        </section>

        {/* Skills in sidebar */}
        {cvData.sectionsVisibility.skills && (
          <section className="border-t border-white/20 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white/90">
                {t.skills}
              </h3>
              <button onClick={() => addSkill()} className="text-xs hover:underline print:hidden text-white/80">
                + Thêm
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              {cvData.skills.map((skill) => (
                <div key={skill.id} className="group relative">
                  <div className="flex justify-between mb-1">
                    <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-white print:hidden"
                    >
                      ×
                    </button>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full"
                      style={{ width: `${((skill.level || 4) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certificates */}
        {cvData.sectionsVisibility.certificates && cvData.certificates.length > 0 && (
          <section className="border-t border-white/20 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white/90">
                {t.certificates}
              </h3>
              <button onClick={addCertificate} className="text-xs hover:underline print:hidden text-white/80">
                +
              </button>
            </div>
            <div className="space-y-2 text-xs text-white/90">
              {cvData.certificates.map((cert) => (
                <div key={cert.id} className="relative group">
                  <div className="font-semibold">{cert.name}</div>
                  <div className="text-white/70 flex justify-between text-[11px]">
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

      {/* RIGHT BODY (66%) */}
      <div className="w-[66%] p-8 space-y-6">
        {/* Objective */}
        {cvData.sectionsVisibility.objective && (
          <section>
            <h3 className={`${heading} border-b pb-1 mb-2`} style={{ color: primary }}>
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

        {/* Work experience */}
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

        {/* Education */}
        {cvData.sectionsVisibility.education && (
          <section>
            <div className="flex items-center justify-between border-b pb-1 mb-3">
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
                  <div className="font-bold text-slate-900 flex justify-between">
                    <EditableText value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} />
                    <span className="text-slate-500 font-normal shrink-0">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-slate-700">
                    <EditableText value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} /> -{' '}
                    <EditableText value={edu.fieldOfStudy} onChange={(v) => updateEducation(edu.id, 'fieldOfStudy', v)} />
                  </div>
                  <div className="absolute -right-2 top-0">
                    <ItemToolbar onDelete={() => removeEducation(edu.id)} />
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
