import React from 'react';
import { useCV } from '../../context/CVContext';
import { TemplateATSClassic } from './TemplateATSClassic';
import { TemplateTopCVModern } from './TemplateTopCVModern';
import { TemplateExecutivePro } from './TemplateExecutivePro';
import { TemplateTechDeveloper } from './TemplateTechDeveloper';
import { TemplateMinimalistClean } from './TemplateMinimalistClean';
import { TemplateAcademicHarvard } from './TemplateAcademicHarvard';
import { TemplateCorporateBusiness } from './TemplateCorporateBusiness';
import { TemplateCreativeAccent } from './TemplateCreativeAccent';
import { TemplateFreshGraduate } from './TemplateFreshGraduate';
import { TemplateCompactOnePage } from './TemplateCompactOnePage';
import { TemplateElegantSidebar } from './TemplateElegantSidebar';
import { TemplateBoldModern } from './TemplateBoldModern';

export const TemplateRenderer: React.FC = () => {
  const { cvData } = useCV();

  switch (cvData.templateId) {
    case 'ats-standard':
      return <TemplateATSClassic />;
    case 'topcv-modern':
      return <TemplateTopCVModern />;
    case 'executive-pro':
      return <TemplateExecutivePro />;
    case 'tech-developer':
      return <TemplateTechDeveloper />;
    case 'minimalist-clean':
      return <TemplateMinimalistClean />;
    case 'academic-harvard':
      return <TemplateAcademicHarvard />;
    case 'corporate-business':
      return <TemplateCorporateBusiness />;
    case 'creative-accent':
      return <TemplateCreativeAccent />;
    case 'fresh-graduate':
      return <TemplateFreshGraduate />;
    case 'compact-one-page':
      return <TemplateCompactOnePage />;
    case 'elegant-sidebar':
      return <TemplateElegantSidebar />;
    case 'bold-modern':
      return <TemplateBoldModern />;
    default:
      return <TemplateTopCVModern />;
  }
};
