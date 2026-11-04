import React from 'react';
import { useCV } from '../../context/CVContext';
import { getT } from '../../utils/translations';
import { EditableText } from '../EditableText';
import { ItemToolbar } from '../SectionToolbar';
import { AvatarUpload } from '../AvatarUpload';
import { getTypographyClasses } from './shared';
import { Mail, Phone, MapPin, Globe, Calendar, User, Plus } from 'lucide-react';

export const TemplateTopCVModern: React.FC = () => {
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
      className={`w-full min-h-[297mm] bg-white text-slate-800 flex flex-row transition-all ${baseText}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* LEFT COLUMN (34% width fixed) */}
      <div
        className="w-[34%] p-6 border-r border-slate-200 flex flex-col gap-6 shrink-0"
        style={{ backgroundColor: '#f8fafc' }}
      >
        {/* Avatar */}
        <div className="flex justify-center">
          <AvatarUpload size="w-36 h-36" shape="circle" borderColor={primary} />
        </div>

        {/* Contact Info */}
        <section>
          <div className="flex items-center gap-2 border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
            <h3 className={heading} style={{ color: primary }}>
              {t.contactInfo}
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-full text-white shrink-0 mt-0.5" style={{ backgroundColor: primary }}>
                <Phone className="w-3 h-3" />
              </div>
              <EditableText
                value={cvData.profile.phone}
                onChange={(val) => updateProfile('phone', val)}
                placeholder={t.phonePlaceholder}
                className="font-medium"
              />
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-full text-white shrink-0 mt-0.5" style={{ backgroundColor: primary }}>
                <Mail className="w-3 h-3" />
              </div>
              <EditableText
                value={cvData.profile.email}
                onChange={(val) => updateProfile('email', val)}
                placeholder={t.emailPlaceholder}
                className="break-all font-medium"
              />
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-full text-white shrink-0 mt-0.5" style={{ backgroundColor: primary }}>
                <MapPin className="w-3 h-3" />
              </div>
              <EditableText
                value={cvData.profile.address}
                onChange={(val) => updateProfile('address', val)}
                placeholder={t.addressPlaceholder}
              />
            </div>

            {cvData.profile.dateOfBirth && (
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-full text-white shrink-0 mt-0.5" style={{ backgroundColor: primary }}>
                  <Calendar className="w-3 h-3" />
                </div>
                <EditableText
                  value={cvData.profile.dateOfBirth}
                  onChange={(val) => updateProfile('dateOfBirth', val)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
            )}

            {cvData.profile.gender && (
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-full text-white shrink-0 mt-0.5" style={{ backgroundColor: primary }}>
                  <User className="w-3 h-3" />
                </div>
                <EditableText
                  value={cvData.profile.gender}
                  onChange={(val) => updateProfile('gender', val)}
                  placeholder="Giới tính"
                />
              </div>
            )}

            {cvData.profile.website && (
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-full text-white shrink-0 mt-0.5" style={{ backgroundColor: primary }}>
                  <Globe className="w-3 h-3" />
                </div>
                <EditableText
                  value={cvData.profile.website}
                  onChange={(val) => updateProfile('website', val)}
                  placeholder={t.websitePlaceholder}
                  className="break-all"
                />
              </div>
            )}
          </div>
        </section>

        {/* Skills */}
        {cvData.sectionsVisibility.skills && (
          <section>
            <div className="flex items-center justify-between border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
              <h3 className={heading} style={{ color: primary }}>
                {t.skills}
              </h3>
              <button
                onClick={() => addSkill()}
                className="text-xs flex items-center gap-0.5 font-medium hover:underline print:hidden"
                style={{ color: primary }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {cvData.skills.map((skill) => (
                <div key={skill.id} className="group relative">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-800 mb-1">
                    <EditableText
                      value={skill.name}
                      onChange={(val) => updateSkill(skill.id, 'name', val)}
                      placeholder="Tên kỹ năng"
                    />
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden text-xs"
                    >
                      ×
                    </button>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((skill.level || 4) / 5) * 100}%`,
                        backgroundColor: primary
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications in left sidebar */}
        {cvData.sectionsVisibility.certificates && cvData.certificates.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-b-2 pb-1.5 mb-3" style={{ borderColor: primary }}>
              <h3 className={heading} style={{ color: primary }}>
                {t.certificates}
              </h3>
              <button
                onClick={addCertificate}
                className="text-xs flex items-center gap-0.5 font-medium hover:underline print:hidden"
                style={{ color: primary }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {cvData.certificates.map((cert) => (
                <div key={cert.id} className="relative group text-xs">
                  <div className="font-semibold text-slate-800">
                    <EditableText
                      value={cert.name}
                      onChange={(val) => updateCertificate(cert.id, 'name', val)}
                      placeholder="Tên chứng chỉ"
                    />
                  </div>
                  <div className="text-slate-500 flex justify-between">
                    <EditableText
                      value={cert.issuer}
                      onChange={(val) => updateCertificate(cert.id, 'issuer', val)}
                      placeholder="Đơn vị cấp"
                    />
                    <EditableText
                      value={cert.year}
                      onChange={(val) => updateCertificate(cert.id, 'year', val)}
                      placeholder="Năm"
                    />
                  </div>
                  <div className="absolute -right-1 top-0">
                    <ItemToolbar onDelete={() => removeCertificate(cert.id)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {cvData.sectionsVisibility.interests && cvData.interests.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-b-2 pb-1.5 mb-2.5" style={{ borderColor: primary }}>
              <h3 className={heading} style={{ color: primary }}>
                {t.interests}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-700">
              {cvData.interests.map((interest, i) => (
                <span
                  key={i}
                  className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[11px]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* RIGHT COLUMN (66% width fixed) */}
      <div className="w-[66%] p-6 flex flex-col gap-6">
        {/* Name and Job Title Header */}
        <div className="border-b pb-4" style={{ borderColor: '#e2e8f0' }}>
          <EditableText
            tag="h1"
            value={cvData.profile.fullName}
            onChange={(val) => updateProfile('fullName', val)}
            placeholder={t.fullNamePlaceholder}
            className={`${name} tracking-wide`}
            style={{ color: primary }}
          />
          <div className="mt-1">
            <EditableText
              tag="h2"
              value={cvData.profile.jobTitle}
              onChange={(val) => updateProfile('jobTitle', val)}
              placeholder={t.jobTitlePlaceholder}
              className="text-sm font-semibold tracking-wider text-slate-600 uppercase"
            />
          </div>
        </div>

        {/* Career Objective */}
        {cvData.sectionsVisibility.objective && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
              <h3 className={heading} style={{ color: primary }}>
                {t.careerObjective}
              </h3>
            </div>
            <EditableText
              tag="p"
              value={cvData.objective}
              onChange={(val) => setCVData((prev) => ({ ...prev, objective: val }))}
              multiline
              className="text-slate-700 leading-relaxed text-justify pl-4 border-l-2"
              style={{ borderColor: '#e2e8f0' }}
            />
          </section>
        )}

        {/* Work Experience */}
        {cvData.sectionsVisibility.experience && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
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

            <div className="space-y-4 border-l-2 pl-4 ml-1" style={{ borderColor: '#e2e8f0' }}>
              {cvData.experience.map((exp) => (
                <div key={exp.id} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: primary }} />
                  <div className="absolute -right-2 top-0">
                    <ItemToolbar onDelete={() => removeExperience(exp.id)} />
                  </div>

                  <div className="flex items-baseline justify-between font-bold text-slate-800">
                    <EditableText
                      value={exp.position}
                      onChange={(val) => updateExperience(exp.id, 'position', val)}
                      placeholder="Vị trí công việc"
                      className="font-bold text-slate-900"
                    />
                    <div className="text-xs font-semibold text-slate-500 shrink-0">
                      <EditableText
                        value={exp.startDate}
                        onChange={(val) => updateExperience(exp.id, 'startDate', val)}
                      />
                      <span> - </span>
                      <EditableText
                        value={exp.endDate}
                        onChange={(val) => updateExperience(exp.id, 'endDate', val)}
                      />
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-600 mb-1.5">
                    <EditableText
                      value={exp.company}
                      onChange={(val) => updateExperience(exp.id, 'company', val)}
                      placeholder="Tên công ty"
                    />
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

        {/* Education */}
        {cvData.sectionsVisibility.education && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                <h3 className={heading} style={{ color: primary }}>
                  {t.education}
                </h3>
              </div>
              <button
                onClick={addEducation}
                className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden"
                style={{ color: primary }}
              >
                <Plus className="w-3.5 h-3.5" /> {t.addItem}
              </button>
            </div>

            <div className="space-y-4 border-l-2 pl-4 ml-1" style={{ borderColor: '#e2e8f0' }}>
              {cvData.education.map((edu) => (
                <div key={edu.id} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: primary }} />
                  <div className="absolute -right-2 top-0">
                    <ItemToolbar onDelete={() => removeEducation(edu.id)} />
                  </div>

                  <div className="flex justify-between items-baseline font-bold text-slate-800">
                    <EditableText
                      value={edu.school}
                      onChange={(val) => updateEducation(edu.id, 'school', val)}
                      className="font-bold text-slate-900"
                    />
                    <div className="text-xs font-semibold text-slate-500 shrink-0">
                      <EditableText
                        value={edu.startDate}
                        onChange={(val) => updateEducation(edu.id, 'startDate', val)}
                      />
                      <span> - </span>
                      <EditableText
                        value={edu.endDate}
                        onChange={(val) => updateEducation(edu.id, 'endDate', val)}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-700">
                    <EditableText
                      value={edu.degree}
                      onChange={(val) => updateEducation(edu.id, 'degree', val)}
                    />
                    <span> • </span>
                    <EditableText
                      value={edu.fieldOfStudy}
                      onChange={(val) => updateEducation(edu.id, 'fieldOfStudy', val)}
                    />
                    {edu.gpa && (
                      <span className="ml-1 text-slate-500">
                        (GPA: <EditableText value={edu.gpa} onChange={(val) => updateEducation(edu.id, 'gpa', val)} />)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {cvData.sectionsVisibility.projects && cvData.projects.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                <h3 className={heading} style={{ color: primary }}>
                  {t.projects}
                </h3>
              </div>
              <button
                onClick={addProject}
                className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden"
                style={{ color: primary }}
              >
                <Plus className="w-3.5 h-3.5" /> {t.addItem}
              </button>
            </div>

            <div className="space-y-4 border-l-2 pl-4 ml-1" style={{ borderColor: '#e2e8f0' }}>
              {cvData.projects.map((proj) => (
                <div key={proj.id} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: primary }} />
                  <div className="absolute -right-2 top-0">
                    <ItemToolbar onDelete={() => removeProject(proj.id)} />
                  </div>

                  <div className="flex justify-between items-baseline font-bold text-slate-800">
                    <EditableText
                      value={proj.name}
                      onChange={(val) => updateProject(proj.id, 'name', val)}
                      className="font-bold text-slate-900"
                    />
                    <span className="text-xs text-slate-500 font-semibold shrink-0">
                      <EditableText
                        value={proj.time}
                        onChange={(val) => updateProject(proj.id, 'time', val)}
                      />
                    </span>
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

        {/* References */}
        {cvData.sectionsVisibility.references && cvData.references.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                <h3 className={heading} style={{ color: primary }}>
                  {t.references}
                </h3>
              </div>
              <button
                onClick={addReference}
                className="text-xs flex items-center gap-1 font-medium hover:underline print:hidden"
                style={{ color: primary }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 border-l-2 pl-4 ml-1" style={{ borderColor: '#e2e8f0' }}>
              {cvData.references.map((ref) => (
                <div key={ref.id} className="relative group text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="font-bold text-slate-900">
                    <EditableText value={ref.name} onChange={(v) => updateReference(ref.id, 'name', v)} />
                  </div>
                  <div>
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
    </div>
  );
};
