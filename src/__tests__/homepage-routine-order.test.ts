import { describe, expect, it } from 'vitest';
import { orderRoutineSections } from '@/lib/homepage-routine-order';
import type { HomepageSectionItem } from '@/context/SettingsContext';

describe('homepage routine positions', () => {
  const sections = [
    { id: 'best', type: 'bestSellers', visible: true },
    { id: 'education', type: 'routineVisualizer', visible: true },
    { id: 'brands', type: 'featuredIngredient', visible: true },
    { id: 'tool', type: 'skincareRoutineSteps', visible: true },
    { id: 'ingredients', type: 'activeIngredients', visible: true },
  ] as HomepageSectionItem[];
  it('swaps only the two routine slots without mutating saved content', () => {
    const result = orderRoutineSections(sections);
    expect(result.map(section => section.id)).toEqual(['best', 'tool', 'brands', 'education', 'ingredients']);
    expect(result[1]).toBe(sections[3]);
    expect(sections[1].id).toBe('education');
    expect(orderRoutineSections(result)).toBe(result);
  });
  it('leaves pages with a missing routine section unchanged', () => {
    const partial = sections.filter(section => section.type !== 'skincareRoutineSteps');
    expect(orderRoutineSections(partial)).toBe(partial);
  });
});
