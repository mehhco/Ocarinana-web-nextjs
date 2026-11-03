/**
 * 指法表的纯数据构造逻辑。
 *
 * 编辑器使用的指法映射（components/editor/lib/fingeringMap.ts）是唯一的指法来源，
 * 这里只负责把「音域配置 + 指法映射」整理成按音高从低到高排序的列表，
 * 方便页面渲染和单元测试复用。
 */

export type FingeringRegister = 'low' | 'basic' | 'high';

export interface NoteRangeSource {
  low: string[];
  basic: string[];
  high: string[];
}

export interface FingeringChartSource {
  instrumentLabel: string;
  keySignature: string;
  map: Partial<Record<string, string>>;
  ranges: NoteRangeSource;
}

export interface FingeringNote {
  /** 指法映射中的键，例如 1、1-high、6-low、b7 */
  key: string;
  /** 页面展示用的数字，例如 1、♭7（不带高低音点） */
  degree: string;
  /** 纯文本写法，例如 1、1̇、6̣、♭7（用于导出文本与测试） */
  label: string;
  /** 唱名，例如 do、高音 do、降 si */
  solfege: string;
  register: FingeringRegister;
  image: string;
  alt: string;
}

const HIGH_DOT = '\u0307';
const LOW_DOT = '\u0323';

const SOLFEGE: Record<string, string> = {
  '1': 'do',
  '2': 're',
  '3': 'mi',
  '4': 'fa',
  '5': 'sol',
  '6': 'la',
  '7': 'si',
  'b7': '降 si',
  '#6': '升 la',
};

const PITCH_NAME: Record<string, string> = {
  b7: '\u266D7',
  '#6': '\u266F6',
};

const REGISTER_PREFIX: Record<FingeringRegister, string> = {
  low: '低音',
  basic: '',
  high: '高音',
};

const REGISTER_DOT: Record<FingeringRegister, string> = {
  low: LOW_DOT,
  basic: '',
  high: HIGH_DOT,
};

export function getNoteLabel(note: string, register: FingeringRegister): string {
  return `${PITCH_NAME[note] ?? note}${REGISTER_DOT[register]}`;
}

export function getNoteSolfege(note: string, register: FingeringRegister): string {
  const solfege = SOLFEGE[note] ?? note;
  const prefix = REGISTER_PREFIX[register];

  return prefix ? `${prefix} ${solfege}` : solfege;
}

export function buildFingeringChart({
  instrumentLabel,
  keySignature,
  map,
  ranges,
}: FingeringChartSource): FingeringNote[] {
  const orderedRegisters: Array<[FingeringRegister, string[]]> = [
    ['low', ranges.low],
    ['basic', ranges.basic],
    ['high', ranges.high],
  ];

  return orderedRegisters.flatMap(([register, notes]) =>
    notes.flatMap((note) => {
      const key =
        register === 'high' ? `${note}-high` : register === 'low' ? `${note}-low` : note;
      const image = map[key];

      if (!image) {
        return [];
      }

      const label = getNoteLabel(note, register);
      const solfege = getNoteSolfege(note, register);
      const degree = PITCH_NAME[note] ?? note;

      return [
        {
          key,
          degree,
          label,
          solfege,
          register,
          image,
          alt: `${instrumentLabel} ${keySignature} 调 ${solfege} 的陶笛指法图`,
        },
      ];
    })
  );
}
