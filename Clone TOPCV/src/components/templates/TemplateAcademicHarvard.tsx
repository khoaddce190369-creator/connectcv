import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { Plus } from 'lucide-react';

export const TemplateAcademicHarvard: React.FC = () => {
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
    addProject,
    removeProject,
    updateProject,
  } = useCV();

  const t = getT(cvData.language);

  return (
    <div
      className="w-full min-h-[297mm] bg-white text-slate-900 p-10 leading-normal"
      style={{ fontFamily: 'Merriweather, Georgia, serif' }}
    >
      {/* HARVARD HEADER WITH CLASSIC AVATAR */}
      <div className="flex flex-row items-center justify-between border-b-2 border-black pb-5 mb-6 gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-wider uppercase mb-1">
            <EditableText
              value={cvData.profile.fullName}
              onChange={(val) => updateProfile('fullName', val)}
              placeholder={t.fullNamePlaceholder}
            />
          </h1>
          <div className="text-xs uppercase tracking-widest text-slate-700 font-sans font-semibold mb-2">
            <EditableText
              value={cvData.profile.jobTitle}
              onChange={(val) => updateProfile('jobTitle', val)}
              placeholder={t.jobTitlePlaceholder}
            />
          </div>

          <div className="text-xs text-slate-700 font-sans flex flex-wrap gap-x-3 gap-y-1">
            <span><EditableText value={cvData.profile.address} onChange={(v) => updateProfile('address', v)} /></span>
            <span>•</span>
            <span><EditableText value={cvData.profile.phone} onChange={(v) => updateProfile('phone', v)} /></span>
            <span>•</span>
            <span><EditableText value={cvData.profile.email} onChange={(v) => updateProfile('email', v)} /></span>
            {cvData.profile.website && (
              <>
                <span>•</span>
                <span><EditableText value={cvData.profile.website} onChange={(v) => updateProfile('website', v)} /></span>
              </>
            )}
          </div>
        </div>

        {/* Academic Harvard Portrait */}
        <AvatarUpload size="w-24 h-28" shape="square" borderColor="#1e293b" />
      </div>

      {/* SUMMARY */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-5">
          <div className="border-b border-black pb-0.5 mb-2">
            <h3 className="font-bold uppercase tracking-wider text-xs font-sans">
              PROFESSIONAL SUMMARY
            </h3>
          </div>
          <EditableText
            tag="p"
            value={cvData.objective}
            onChange={(val) => setCVData((prev) => ({ ...prev, objective: val }))}
            multiline
            className="text-slate-800 text-xs leading-relaxed text-justify"
          />
        </section>
      )}

      {/* EDUCATION (Harvard CVs put Education upfront) */}
      {cvData.sectionsVisibility.education && (
        <section className="mb-5">
          <div className="flex justify-between items-center border-b border-black pb-0.5 mb-2.5">
            <h3 className="font-bold uppercase tracking-wider text-xs font-sans">
              {t.education}
            </h3>
            <button onClick={addEducation} className="text-xs font-sans hover:underline print:hidden">
              + {t.addItem}
            </button>
          </div>
          <div className="space-y-3 text-xs">
            {cvData.education.map((edu) => (
              <div key={edu.id} className="relative group">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeEducation(edu.id)} />
                </div>
                <div className="flex justify-between items-baseline font-bold">
                  <EditableText value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} />
                  <span className="font-sans font-normal text-slate-600 shrink-0">{edu.startDate} – {edu.endDate}</span>
                </div>
                <div className="italic text-slate-800">
                  <EditableText value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} />, Major in{' '}
                  <EditableText value={edu.fieldOfStudy} onChange={(v) => updateEducation(edu.id, 'fieldOfStudy', v)} />
                  {edu.gpa && <span className="not-italic font-sans font-normal"> (GPA: {edu.gpa})</span>}
                </div>
                {edu.description && (
                  <p className="text-slate-700 mt-0.5">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-5">
          <div className="flex justify-between items-center border-b border-black pb-0.5 mb-2.5">
            <h3 className="font-bold uppercase tracking-wider text-xs font-sans">
              {t.workExperience}
            </h3>
            <button onClick={addExperience} className="text-xs font-sans hover:underline print:hidden">
              + {t.addItem}
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="relative group">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">
                    <EditableText value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                  </span>
                  <span className="font-sans text-slate-600 shrink-0">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="italic text-slate-800 mb-1">
                  <EditableText value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} />
                </div>
                <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800">
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

      {/* SKILLS & EXPERTISE */}
      {cvData.sectionsVisibility.skills && (
        <section className="mb-5">
          <div className="flex justify-between items-center border-b border-black pb-0.5 mb-2">
            <h3 className="font-bold uppercase tracking-wider text-xs font-sans">
              {t.skills} & AREAS OF EXPERTISE
            </h3>
            <button onClick={() => addSkill()} className="text-xs font-sans hover:underline print:hidden">
              + {t.addItem}
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-800">
            <div className="flex flex-wrap gap-x-2">
              {cvData.skills.map((skill, index) => (
                <span key={skill.id} className="inline-flex items-center">
                  <EditableText value={skill.name} onChange={(v) => updateSkill(skill.id, 'name', v)} />
                  {index < cvData.skills.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CERTIFICATES */}
      {cvData.sectionsVisibility.certificates && cvData.certificates.length > 0 && (
        <section>
          <div className="flex justify-between items-center border-b border-black pb-0.5 mb-2">
            <h3 className="font-bold uppercase tracking-wider text-xs font-sans">
              {t.certificates} & HONORS
            </h3>
          </div>
          <div className="space-y-1.5 text-xs">
            {cvData.certificates.map((cert) => (
              <div key={cert.id} className="relative group flex justify-between">
                <span>
                  <strong>{cert.name}</strong> — {cert.issuer}
                </span>
                <span className="font-sans text-slate-600 shrink-0">{cert.year}</span>
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeCertificate(cert.id)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
