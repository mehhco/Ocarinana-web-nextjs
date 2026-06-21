import type { Measure, ScoreElement, ScoreSection } from './types';

export interface NormalizedSectionData {
  sections: ScoreSection[];
  playbackOrder: string[];
}

export function normalizeSectionLabel(label: string): string {
  return label.trim();
}

function numberToSpreadsheetLabel(value: number): string {
  let remaining = value;
  let label = '';

  while (remaining > 0) {
    remaining -= 1;
    label = String.fromCharCode(65 + (remaining % 26)) + label;
    remaining = Math.floor(remaining / 26);
  }

  return label;
}

export function getNextSectionLabel(labels: string[]): string {
  const usedLabels = new Set(labels.map((label) => normalizeSectionLabel(label).toLocaleUpperCase()));
  let index = 1;

  while (usedLabels.has(numberToSpreadsheetLabel(index))) {
    index += 1;
  }

  return numberToSpreadsheetLabel(index);
}

export function preserveAnchoredElementId<T extends ScoreElement>(
  existingElement: ScoreElement,
  replacementElement: T
): T {
  return {
    ...replacementElement,
    id: existingElement.id,
  };
}

function getSectionPosition(section: ScoreSection, measures: Measure[]): [number, number] {
  const measureIndex = measures.findIndex((measure) => measure.id === section.anchor.measureId);
  if (measureIndex < 0) return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

  const measure = measures[measureIndex];
  const elementIndex = section.anchor.beforeElementId === null
    ? measure.elements.length
    : measure.elements.findIndex((element) => element.id === section.anchor.beforeElementId);

  return [measureIndex, elementIndex < 0 ? Number.MAX_SAFE_INTEGER : elementIndex];
}

export function sortSectionsByScorePosition(sections: ScoreSection[], measures: Measure[]): ScoreSection[] {
  return sections
    .map((section, originalIndex) => ({ section, originalIndex, position: getSectionPosition(section, measures) }))
    .sort((left, right) => {
      const measureDifference = left.position[0] - right.position[0];
      if (measureDifference !== 0) return measureDifference;

      const elementDifference = left.position[1] - right.position[1];
      if (elementDifference !== 0) return elementDifference;

      return left.originalIndex - right.originalIndex;
    })
    .map(({ section }) => section);
}

export function normalizeSectionData(
  sectionsInput: unknown,
  playbackOrderInput: unknown,
  measures: Measure[]
): NormalizedSectionData {
  const measureById = new Map(measures.map((measure) => [measure.id, measure]));
  const usedIds = new Set<string>();
  const usedLabels = new Set<string>();
  const usedAnchors = new Set<string>();
  const sections: ScoreSection[] = [];

  if (Array.isArray(sectionsInput)) {
    sectionsInput.forEach((candidate) => {
      if (!candidate || typeof candidate !== 'object') return;

      const section = candidate as Partial<ScoreSection>;
      const id = typeof section.id === 'string' ? section.id.trim() : '';
      const label = typeof section.label === 'string' ? normalizeSectionLabel(section.label) : '';
      const anchor = section.anchor;

      if (!id || !label || label.length > 12 || !anchor || typeof anchor.measureId !== 'string') return;
      if (anchor.beforeElementId !== null && typeof anchor.beforeElementId !== 'string') return;

      const measure = measureById.get(anchor.measureId);
      if (!measure) return;
      if (
        anchor.beforeElementId !== null &&
        !measure.elements.some((element) => element.id === anchor.beforeElementId)
      ) return;

      const normalizedLabel = label.toLocaleLowerCase();
      const anchorKey = `${anchor.measureId}:${anchor.beforeElementId ?? '$end'}`;
      if (usedIds.has(id) || usedLabels.has(normalizedLabel) || usedAnchors.has(anchorKey)) return;

      usedIds.add(id);
      usedLabels.add(normalizedLabel);
      usedAnchors.add(anchorKey);
      sections.push({
        id,
        label,
        anchor: {
          measureId: anchor.measureId,
          beforeElementId: anchor.beforeElementId,
        },
      });
    });
  }

  const playbackOrder = Array.isArray(playbackOrderInput)
    ? playbackOrderInput.filter((sectionId): sectionId is string => (
        typeof sectionId === 'string' && usedIds.has(sectionId)
      ))
    : [];

  return { sections, playbackOrder };
}

export function relocateSectionsBeforeElementDelete(
  sections: ScoreSection[],
  measure: Measure,
  deleteStartIndex: number,
  deleteCount: number
): ScoreSection[] {
  const deletedElementIds = new Set(
    measure.elements
      .slice(deleteStartIndex, deleteStartIndex + deleteCount)
      .map((element) => element.id)
  );
  const nextElementId = measure.elements[deleteStartIndex + deleteCount]?.id ?? null;

  return sections.map((section) => {
    if (
      section.anchor.measureId !== measure.id ||
      section.anchor.beforeElementId === null ||
      !deletedElementIds.has(section.anchor.beforeElementId)
    ) {
      return section;
    }

    return {
      ...section,
      anchor: {
        ...section.anchor,
        beforeElementId: nextElementId,
      },
    };
  });
}
