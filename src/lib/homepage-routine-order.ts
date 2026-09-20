import type { HomepageSectionItem } from '@/context/SettingsContext';

/** Place the personalized tool in the earlier of the two routine slots. */
export function orderRoutineSections(sections: HomepageSectionItem[]): HomepageSectionItem[] {
  const education = sections.findIndex(section => section.type === 'routineVisualizer');
  const personalized = sections.findIndex(section => section.type === 'skincareRoutineSteps');
  if (education < 0 || personalized < 0 || personalized < education) return sections;
  const ordered = [...sections];
  [ordered[education], ordered[personalized]] = [ordered[personalized], ordered[education]];
  return ordered;
}
