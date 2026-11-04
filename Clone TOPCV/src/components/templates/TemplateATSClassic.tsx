import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Calendar, User, Plus } from 'lucide-react';

export const TemplateATSClassic: React.FC = () => {
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
    addActivity,
    removeActivity,
    updateActivity,
    addReference,
    removeReference,
    updateReference,
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
      {/* ATS Classic Header with Avatar */}
      <div className="border-b-2 pb-6 mb-6 flex items-center justify-between gap-6" style={{ borderColor: primary }}>
        <div className="flex-1">
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className={`${name} tracking-wide font-extrabold`}
            style={{ color: primary }}
          />
          <div className="mt-1">
            <EditableText
              tag="h2"
              value={cvData.profile.jobTitle}
              onChange={(val) => updateProfile('jobTitle', val)}
              placeholder={t.jobTitlePlaceholder}
              className="text-sm font-bold tracking-wider text-slate-600 uppercase"
            />
          </div>

          {/* Contact info row - 100% ATS friendly */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <EditableText value={cvData.profile.phone} onChange={(val) => updateProfile('phone', val)} placeholder={t.phonePlaceholder} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <EditableText value={cvData.profile.email} onChange={(val) => updateProfile('email', val)} placeholder={t.emailPlaceholder} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <EditableText value={cvData.profile.address} onChange={(val) => updateProfile('address', val)} placeholder={t.addressPlaceholder} />
            </div>
            {cvData.profile.dateOfBirth && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <EditableText value={cvData.profile.dateOfBirth} onChange={(val) => updateProfile('dateOfBirth', val)} />
                </div>
              </>
            )}
            {cvData.profile.website && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <EditableText value={cvData.profile.website} onChange={(val) => updateProfile('website', val)} placeholder={t.websitePlaceholder} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avatar */}
        <AvatarUpload size="w-28 h-28" shape="rounded" borderColor={primary} />
      </div>

      {/* 1. Career Objective */}
      {cvData.sectionsVisibility.objective && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: primary }}>
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
            placeholder="Nêu tóm tắt mục tiêu và thế mạnh của bạn..."
          />
        </section>
      )}

      {/* 2. Work Experience */}
      {cvData.sectionsVisibility.experience && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-3" style={{ borderColor: primary }}>
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
              <div key={exp.id} className="relative group pl-1">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                </div>
                <div className="flex items-baseline justify-between font-bold text-slate-800">
                  <EditableText
                    value={exp.position}
                    onChange={(val) => updateExperience(exp.id, 'position', val)}
                    placeholder="Chức danh công việc"
                    className="font-bold text-slate-900"
                  />
                  <div className="text-xs font-semibold text-slate-500 shrink-0">
                    <EditableText value={exp.startDate} onChange={(val) => updateExperience(exp.id, 'startDate', val)} />
                    <span> - </span>
                    <EditableText value={exp.endDate} onChange={(val) => updateExperience(exp.id, 'endDate', val)} />
                  </div>
                </div>

                <div className="text-xs font-semibold italic text-slate-600 mb-2">
                  <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, 'company', val)} placeholder="Tên công ty" />
                </div>

                <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs md:text-[13px]">
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

      {/* 3. Education */}
      {cvData.sectionsVisibility.education && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-3" style={{ borderColor: primary }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.education}
            </h3>
            <button
              onClick={addEducation}
              className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden"
              style={{ color: primary }}
            >
              <Plus className="w-3.5 h-3.5" /> {t.addItem}
            </button>
          </div>

          <div className="space-y-3">
            {cvData.education.map((edu) => (
              <div key={edu.id} className="relative group">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeEducation(edu.id)} />
                </div>
                <div className="flex justify-between items-baseline font-bold text-slate-800">
                  <EditableText value={edu.school} onChange={(val) => updateEducation(edu.id, 'school', val)} className="font-bold text-slate-900" />
                  <div className="text-xs font-semibold text-slate-500 shrink-0">
                    <EditableText value={edu.startDate} onChange={(val) => updateEducation(edu.id, 'startDate', val)} />
                    <span> - </span>
                    <EditableText value={edu.endDate} onChange={(val) => updateEducation(edu.id, 'endDate', val)} />
                  </div>
                </div>
                <div className="text-xs text-slate-700">
                  <span className="font-medium">
                    <EditableText value={edu.degree} onChange={(val) => updateEducation(edu.id, 'degree', val)} />
                  </span>
                  <span> | </span>
                  <EditableText value={edu.fieldOfStudy} onChange={(val) => updateEducation(edu.id, 'fieldOfStudy', val)} />
                  {edu.gpa && (
                    <span className="ml-2 font-medium text-slate-500">
                      (GPA: <EditableText value={edu.gpa} onChange={(val) => updateEducation(edu.id, 'gpa', val)} />)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Skills */}
      {cvData.sectionsVisibility.skills && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-3" style={{ borderColor: primary }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.skills}
            </h3>
            <button onClick={() => addSkill()} className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden" style={{ color: primary }}>
              <Plus className="w-3.5 h-3.5" /> {t.addItem}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill) => (
              <div key={skill.id} className="group relative inline-flex items-center bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-800">
                <EditableText value={skill.name} onChange={(val) => updateSkill(skill.id, 'name', val)} placeholder="Kỹ năng..." />
                <button onClick={() => removeSkill(skill.id)} className="ml-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Projects */}
      {cvData.sectionsVisibility.projects && cvData.projects.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between border-b pb-1 mb-3" style={{ borderColor: primary }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.projects}
            </h3>
            <button onClick={addProject} className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden" style={{ color: primary }}>
              <Plus className="w-3.5 h-3.5" /> {t.addItem}
            </button>
          </div>

          <div className="space-y-4">
            {cvData.projects.map((proj) => (
              <div key={proj.id} className="relative group">
                <div className="absolute -right-2 top-0">
                  <ItemToolbar onDelete={() => removeProject(proj.id)} />
                </div>
                <div className="flex justify-between items-baseline font-bold text-slate-800">
                  <EditableText value={proj.name} onChange={(val) => updateProject(proj.id, 'name', val)} className="font-bold text-slate-900" />
                  <span className="text-xs text-slate-500 font-semibold">{proj.time}</span>
                </div>
                <div className="text-xs italic text-slate-600 mb-1">
                  Vai trò: <EditableText value={proj.role} onChange={(val) => updateProject(proj.id, 'role', val)} />
                  {proj.technologies && (
                    <span className="ml-2 font-normal">
                      | Công nghệ: <EditableText value={proj.technologies} onChange={(val) => updateProject(proj.id, 'technologies', val)} />
                    </span>
                  )}
                </div>
                <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs">
                  {proj.description.map((desc, idx) => (
                    <li key={idx}>
                      <EditableText
                        value={desc}
                        onChange={(newDesc) => {
                          const descs = [...proj.description];
                          descs[idx] = newDesc;
                          updateProject(proj.id, 'description', descs);
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

      {/* 6. Two-Column Row for Certifications, Awards, Activities */}
      <div className="grid grid-cols-2 gap-6">
        {cvData.sectionsVisibility.certificates && cvData.certificates.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: primary }}>
              <h3 className={heading} style={{ color: primary }}>
                {t.certificates}
              </h3>
              <button onClick={addCertificate} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {cvData.certificates.map((cert) => (
                <div key={cert.id} className="relative group flex justify-between items-baseline">
                  <div>
                    <EditableText value={cert.name} onChange={(val) => updateCertificate(cert.id, 'name', val)} className="font-semibold text-slate-800" />
                    <div className="text-slate-500">{cert.issuer}</div>
                  </div>
                  <div className="text-slate-500 font-medium shrink-0">{cert.year}</div>
                  <div className="absolute -right-2 top-0">
                    <ItemToolbar onDelete={() => removeCertificate(cert.id)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.sectionsVisibility.awards && cvData.awards.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: primary }}>
              <h3 className={heading} style={{ color: primary }}>
                {t.awards}
              </h3>
              <button onClick={addAward} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {cvData.awards.map((aw) => (
                <div key={aw.id} className="relative group flex justify-between items-baseline">
                  <div>
                    <EditableText value={aw.name} onChange={(val) => updateAward(aw.id, 'name', val)} className="font-semibold text-slate-800" />
                    <div className="text-slate-500">{aw.issuer}</div>
                  </div>
                  <div className="text-slate-500 font-medium shrink-0">{aw.year}</div>
                  <div className="absolute -right-2 top-0">
                    <ItemToolbar onDelete={() => removeAward(aw.id)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 7. References */}
      {cvData.sectionsVisibility.references && cvData.references.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between border-b pb-1 mb-2.5" style={{ borderColor: primary }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.references}
            </h3>
            <button onClick={addReference} className="text-xs hover:underline print:hidden" style={{ color: primary }}>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {cvData.references.map((ref) => (
              <div key={ref.id} className="relative group bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="font-bold text-slate-900">
                  <EditableText value={ref.name} onChange={(v) => updateReference(ref.id, 'name', v)} />
                </div>
                <div className="text-slate-700">
                  <EditableText value={ref.position} onChange={(v) => updateReference(ref.id, 'position', v)} /> -{' '}
                  <EditableText value={ref.company} onChange={(v) => updateReference(ref.id, 'company', v)} />
                </div>
                <div className="text-slate-500 mt-1">
                  ĐT: <EditableText value={ref.phone} onChange={(v) => updateReference(ref.id, 'phone', v)} /> |{' '}
                  <EditableText value={ref.email} onChange={(v) => updateReference(ref.id, 'email', v)} />
                </div>
                <div className="absolute top-1 right-1">
                  <ItemToolbar onDelete={() => removeReference(ref.id)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
