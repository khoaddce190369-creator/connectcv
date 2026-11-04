import { CVTheme } from '../../types/cv';

export function getTypographyClasses(theme: CVTheme) {
  let sizeClass = 'text-[13px]';
  let headingSize = 'text-base';
  let nameSize = 'text-2xl';

  if (theme.fontSize === 'small') {
    sizeClass = 'text-[11.5px]';
    headingSize = 'text-[14px]';
    nameSize = 'text-xl';
  } else if (theme.fontSize === 'large') {
    sizeClass = 'text-[14.5px]';
    headingSize = 'text-lg';
    nameSize = 'text-3xl';
  }

  let leadingClass = 'leading-relaxed';
  if (theme.lineSpacing === 'compact') {
    leadingClass = 'leading-snug';
  } else if (theme.lineSpacing === 'relaxed') {
    leadingClass = 'leading-loose';
  }

  return {
    baseText: `${sizeClass} ${leadingClass}`,
    heading: `${headingSize} font-bold tracking-tight uppercase`,
    name: `${nameSize} font-extrabold tracking-tight uppercase`,
    fontFamily: theme.fontFamily
  };
}
