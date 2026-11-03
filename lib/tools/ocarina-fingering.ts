import { FINGERING_MAP } from '@/components/editor/lib/fingeringMap';
import { KEY_SIGNATURE_RANGES, getInstrumentLabel } from '@/components/editor/lib/constants';
import type { InstrumentType, KeySignature } from '@/lib/editor/types';
import {
  buildFingeringChart,
  type FingeringNote,
} from './fingering-chart';

export const OCARINA_FINGERING_PATH = '/tools/ocarina-fingering';

export interface OcarinaFingeringChart {
  /** 页面锚点，例如 fingering-12-hole-c */
  anchor: string;
  instrument: InstrumentType;
  instrumentLabel: string;
  keySignature: KeySignature;
  notes: FingeringNote[];
  /** 该调在编辑器里可用的最低音 */
  lowest: FingeringNote | null;
  /** 该调在编辑器里可用的最高音 */
  highest: FingeringNote | null;
}

const INSTRUMENT_ORDER: InstrumentType[] = ['12-hole', '6-hole'];
const KEY_ORDER: KeySignature[] = ['C', 'F', 'G'];

export function getOcarinaFingeringCharts(): OcarinaFingeringChart[] {
  return INSTRUMENT_ORDER.flatMap((instrument) =>
    KEY_ORDER.map((keySignature) => {
      const notes = buildFingeringChart({
        instrumentLabel: getInstrumentLabel(instrument),
        keySignature,
        map: FINGERING_MAP[instrument][keySignature],
        ranges: KEY_SIGNATURE_RANGES[instrument][keySignature],
      });

      return {
        anchor: `fingering-${instrument}-${keySignature.toLowerCase()}`,
        instrument,
        instrumentLabel: getInstrumentLabel(instrument),
        keySignature,
        notes,
        lowest: notes[0] ?? null,
        highest: notes[notes.length - 1] ?? null,
      };
    })
  );
}

export function getTotalFingeringCount(charts: OcarinaFingeringChart[]): number {
  return charts.reduce((total, chart) => total + chart.notes.length, 0);
}
