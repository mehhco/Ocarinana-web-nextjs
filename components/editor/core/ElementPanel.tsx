'use client';

import { memo, useCallback, useState, type ReactNode } from 'react';
import { EyeIcon, EyeOffIcon, Mic2Icon, MusicIcon, Trash2Icon } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import type { BarlineType, Duration, DynamicMark, NoteValue } from '@/lib/editor/types';

interface HelpContent {
  title: string;
  meaning: string;
  usage: string;
  preview?: ReactNode;
  summary: string;
}

type PanelDuration = Extract<Duration, '1/4' | '1/8' | '1/16' | '1/32'>;

function SegmentedHelpText({ text, className }: { text: string; className?: string }) {
  const segments = text.match(/[^，。；：、,.!?！？]+[，。；：、,.!?！？]?/g) ?? [text];

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="inline-block whitespace-nowrap align-baseline">
          {segment}
        </span>
      ))}
    </span>
  );
}

const NoteButton = memo(function NoteButton({
  display,
  onClick,
  disabled = false,
}: {
  display: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-9 items-center justify-center rounded-md border text-sm font-semibold transition-all',
        'border-slate-200 bg-white text-slate-700',
        'hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm',
        'active:scale-95 active:bg-indigo-50',
        disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-40'
      )}
    >
      {display}
    </button>
  );
});

function HelpTooltip({ help, children }: { help?: HelpContent; children: ReactNode }) {
  if (!help) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="w-[380px] max-w-[calc(100vw-2rem)] rounded-md border border-slate-200 bg-white p-3 text-slate-700 shadow-lg"
      >
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-900">{help.title}</div>
          <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-600">
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2">
              <span className="font-medium text-slate-400">说明</span>
              <SegmentedHelpText text={help.meaning} />
            </div>
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2 rounded-md bg-slate-50 py-1.5">
              <span className="pl-2 font-medium text-slate-400">用法</span>
              <SegmentedHelpText text={help.usage} className="pr-2" />
            </div>
          </div>
          {help.preview && (
            <div className="flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1">
              {help.preview}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

const ActionButton = memo(function ActionButton({
  onClick,
  children,
  active = false,
  disabled = false,
  help,
  showInlineHelp = false,
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  help?: HelpContent;
  showInlineHelp?: boolean;
  className?: string;
}) {
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-md border px-2.5 py-2 text-xs font-medium transition-all',
        'hover:shadow-sm active:scale-95',
        active
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600',
        disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-50',
        className
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="min-w-0">
      <HelpTooltip help={help}>
        <span
          className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          tabIndex={disabled ? 0 : undefined}
          aria-disabled={disabled || undefined}
        >
          {button}
        </span>
      </HelpTooltip>
      {showInlineHelp && help && (
        <div className="mt-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] leading-snug text-slate-600">
          {help.summary}
        </div>
      )}
    </div>
  );
});

function DurationPreview({ lines, symbol = '5' }: { lines: number; symbol?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-slate-900">
      <span className="text-lg font-bold leading-none">{symbol}</span>
      <span className="flex h-4 flex-col items-center gap-[3px]">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={cn('block h-0 w-7 border-t-2', level <= lines ? 'border-slate-900' : 'border-transparent')}
          />
        ))}
      </span>
    </div>
  );
}

function TextPreview({ children }: { children: ReactNode }) {
  return <div className="text-lg font-bold leading-none text-slate-900">{children}</div>;
}

function FinalBarlinePreview() {
  return (
    <div className="flex h-7 items-center justify-center">
      <span className="flex h-6 items-stretch justify-center gap-1">
        <span className="block w-px bg-slate-800" />
        <span className="block w-[3px] bg-slate-800" />
      </span>
    </div>
  );
}

function BeamPreview() {
  return (
    <div className="flex items-end gap-2 text-slate-900">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-bold leading-none">2</span>
        <span className="block h-0 w-8 border-t-2 border-slate-900" />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-bold leading-none">3</span>
        <span className="block h-0 w-8 border-t-2 border-slate-900" />
      </div>
    </div>
  );
}

const HIGH_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '↑1' },
  { value: '2', display: '↑2' },
  { value: '3', display: '↑3' },
  { value: '4', display: '↑4' },
  { value: '5', display: '↑5' },
  { value: '6', display: '↑6' },
  { value: '7', display: '↑7' },
];

const BASIC_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '1' },
  { value: '2', display: '2' },
  { value: '3', display: '3' },
  { value: '4', display: '4' },
  { value: '5', display: '5' },
  { value: '6', display: '6' },
  { value: '7', display: '7' },
];

const G_BASIC_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '1' },
  { value: '2', display: '2' },
  { value: '3', display: '3' },
  { value: '4', display: '4' },
  { value: '5', display: '5' },
  { value: '6', display: '6' },
  { value: 'b7', display: '♭7' },
];


const LOW_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '↓1' },
  { value: '2', display: '↓2' },
  { value: '3', display: '↓3' },
  { value: '4', display: '↓4' },
  { value: '5', display: '↓5' },
  { value: '6', display: '↓6' },
  { value: '7', display: '↓7' },
];

const DURATION_OPTIONS: { value: PanelDuration; label: string }[] = [
  { value: '1/4', label: '1/4' },
  { value: '1/8', label: '1/8' },
  { value: '1/16', label: '1/16' },
  { value: '1/32', label: '1/32' },
];

const REST_OPTIONS: { value: Duration; label: string }[] = [
  { value: '1', label: '全休止符' },
  { value: '1/2', label: '二分休止' },
  { value: '1/4', label: '四分休止' },
  { value: '1/8', label: '八分休止' },
  { value: '1/16', label: '十六分休止' },
  { value: '1/32', label: '三十二分休止' },
];

const BARLINE_OPTIONS: { value: BarlineType; label: string }[] = [
  { value: 'single', label: '小节线' },
  { value: 'double', label: '双线' },
  { value: 'final', label: '终止线' },
  { value: 'repeat-start', label: '反复起' },
  { value: 'repeat-end', label: '反复止' },
];

const DYNAMIC_OPTIONS: DynamicMark[] = ['p', 'mp', 'mf', 'f'];

const DURATION_HELP: Record<PanelDuration, HelpContent> = {
  '1/4': {
    title: '四分音符',
    meaning: '默认时值，不在数字下方添加短横线。',
    usage: '先点击一个数字音符，再点 1/4，可移除该音符下方的时值短横线。',
    preview: <DurationPreview lines={0} />,
    summary: '恢复为默认时值。',
  },
  '1/8': {
    title: '八分音符',
    meaning: '数字下方一条短横线，表示时值比四分音符短一半。',
    usage: '先选中数字音符，再点 1/8，会在数字下方添加一条短横线。',
    preview: <DurationPreview lines={1} />,
    summary: '给音符加一条短横线。',
  },
  '1/16': {
    title: '十六分音符',
    meaning: '数字下方两条短横线，表示更短的时值。',
    usage: '先选中数字音符，再点 1/16，会在数字下方添加两条短横线。',
    preview: <DurationPreview lines={2} />,
    summary: '给音符加两条短横线。',
  },
  '1/32': {
    title: '三十二分音符',
    meaning: '数字下方三条短横线，表示当前面板中最短的音符时值。',
    usage: '先选中数字音符，再点 1/32，会在数字下方添加三条短横线。',
    preview: <DurationPreview lines={3} />,
    summary: '给音符加三条短横线。',
  },
};

const REST_HELP: Record<Duration, HelpContent> = {
  '1': {
    title: '全休止符',
    meaning: '表示整小节或较长时间不发声。',
    usage: '点击后在当前乐谱末尾插入一组四分休止符，用于表示完整休止。',
    preview: <TextPreview>0 0 0 0</TextPreview>,
    summary: '插入一组完整休止。',
  },
  '1/2': {
    title: '二分休止',
    meaning: '表示休止两拍。',
    usage: '点击后插入两个四分休止符，适合表示二分长度的停顿。',
    preview: <TextPreview>0 0</TextPreview>,
    summary: '插入两拍休止。',
  },
  '1/4': {
    title: '四分休止',
    meaning: '表示休止一拍。',
    usage: '点击后插入一个休止符 0。',
    preview: <TextPreview>0</TextPreview>,
    summary: '插入一拍休止。',
  },
  '1/8': {
    title: '八分休止',
    meaning: '表示较短的半拍休止。',
    usage: '点击后插入一个八分休止符。',
    preview: <DurationPreview lines={1} symbol="0" />,
    summary: '插入半拍休止。',
  },
  '1/16': {
    title: '十六分休止',
    meaning: '表示比八分休止更短的停顿。',
    usage: '点击后插入一个十六分休止符，会在 0 下方显示两条短横线。',
    preview: <DurationPreview lines={2} symbol="0" />,
    summary: '插入十六分休止。',
  },
  '1/32': {
    title: '三十二分休止',
    meaning: '表示当前面板中最短的休止时值。',
    usage: '点击后插入一个三十二分休止符，会在 0 下方显示三条短横线。',
    preview: <DurationPreview lines={3} symbol="0" />,
    summary: '插入三十二分休止。',
  },
};

const MODIFIER_HELP = {
  replaceMode: {
    title: '替换模式',
    meaning: '选中音符后点击数字，会改写当前选中位置。',
    usage: '适合修正写错的音符；未选中时继续添加到乐谱末尾。',
    summary: '点击音符会替换选中位置。',
  },
  insertMode: {
    title: '插入模式',
    meaning: '选中一个元素后，点击数字或休止符会插入到它后方。',
    usage: '适合补漏音：先选中漏音前一个位置，再点要补的音符；新音符会保持选中，方便连续插入。',
    summary: '点击音符会插入到选中元素后方。',
  },
  dot: {
    title: '附点',
    meaning: '写在数字右下角，表示音符时值延长一半。',
    usage: '先选中一个数字音符，再点附点；再次点击可取消。',
    preview: <TextPreview>5·</TextPreview>,
    summary: '让选中音符延长一半。',
  },
  extension: {
    title: '延长线',
    meaning: '用横线表示前一个音继续延长。',
    usage: '选中元素后点击，会在其后方插入延长线；未选中时插入到乐谱末尾。',
    preview: <TextPreview>5 -</TextPreview>,
    summary: '在音符后延长发声。',
  },
  tie: {
    title: '连音线',
    meaning: '连接相邻或相近音符，表示连贯演奏。',
    usage: '点连音线后，依次点击同一小节内从左到右的两个音符。',
    preview: <TextPreview>1 ︵ 2</TextPreview>,
    summary: '点击两个音符生成连线。',
  },
  beam: {
    title: '合并时值线',
    meaning: '把相邻短时值音符下方同一水平线连接起来。',
    usage: '先点击合并时值线，再点起始音符和结束音符，最后确认合并。',
    preview: <BeamPreview />,
    summary: '连接相邻音符的短横线。',
  },
};

const BARLINE_HELP: Record<BarlineType, HelpContent> = {
  single: {
    title: '小节线',
    meaning: '分隔乐谱中的小节。',
    usage: '点击后在选中元素后方插入；未选中时插入到乐谱末尾。',
    preview: <TextPreview>|</TextPreview>,
    summary: '分隔小节。',
  },
  double: {
    title: '双线',
    meaning: '常用于段落或乐句结束。',
    usage: '点击后插入双小节线。',
    preview: <TextPreview>||</TextPreview>,
    summary: '标记段落结束。',
  },
  final: {
    title: '终止线',
    meaning: '表示整首曲子或大段落结束。',
    usage: '点击后插入左细右粗的终止线。',
    preview: <FinalBarlinePreview />,
    summary: '标记乐曲结束。',
  },
  'repeat-start': {
    title: '反复起',
    meaning: '表示反复演奏的起点。',
    usage: '和反复止配合使用，标记需要重复演奏的范围。',
    preview: <TextPreview>||:</TextPreview>,
    summary: '标记重复开始。',
  },
  'repeat-end': {
    title: '反复止',
    meaning: '表示反复演奏的终点。',
    usage: '演奏到这里时回到反复起位置再演奏一遍。',
    preview: <TextPreview>:||</TextPreview>,
    summary: '标记重复结束。',
  },
};

const DYNAMIC_HELP: Record<DynamicMark, HelpContent> = {
  p: {
    title: 'p 弱',
    meaning: 'p 是 piano，表示弱奏。',
    usage: '先选中音符，再点 p；再次点同一个力度可取消。',
    preview: <TextPreview>p = 弱</TextPreview>,
    summary: '标记弱奏。',
  },
  mp: {
    title: 'mp 中弱',
    meaning: 'mp 是 mezzo piano，表示中弱。',
    usage: '先选中音符，再点 mp；同一音符只保留一个力度记号。',
    preview: <TextPreview>mp = 中弱</TextPreview>,
    summary: '标记中弱。',
  },
  mf: {
    title: 'mf 中强',
    meaning: 'mf 是 mezzo forte，表示中强。',
    usage: '先选中音符，再点 mf；会显示在音符下方。',
    preview: <TextPreview>mf = 中强</TextPreview>,
    summary: '标记中强。',
  },
  f: {
    title: 'f 强',
    meaning: 'f 是 forte，表示强奏。',
    usage: '先选中音符，再点 f；再次点同一个力度可取消。',
    preview: <TextPreview>f = 强</TextPreview>,
    summary: '标记强奏。',
  },
};

const UTILITY_HELP = {
  fingering: {
    title: '指法图显示',
    meaning: '控制乐谱上方的陶笛指法图片是否显示。',
    usage: '隐藏后，指法图区域会收起，乐谱更紧凑；再次点击可恢复。',
    preview: <TextPreview>图 / 谱</TextPreview>,
    summary: '显示或收起指法图。',
  },
  lyrics: {
    title: '歌词显示',
    meaning: '控制数字音符下方的歌词输入区域是否显示。',
    usage: '开启后可点击音符下方输入歌词；每个音符可输入一个汉字或英文单词。',
    preview: <TextPreview>5 春</TextPreview>,
    summary: '显示或隐藏歌词输入。',
  },
  clearLyrics: {
    title: '清空歌词',
    meaning: '删除当前乐谱中的所有歌词。',
    usage: '点击垃圾桶按钮会清空歌词内容，但不会删除音符。',
    preview: <TextPreview>春 → 空</TextPreview>,
    summary: '删除全部歌词。',
  },
};

function getAvailableNotes(keySignature: string): { high: string[]; basic: string[]; low: string[] } {
  const ranges: Record<string, { high: string[]; basic: string[]; low: string[] }> = {
    C: {
      high: ['1', '2', '3', '4'],
      basic: ['1', '2', '3', '4', '5', '6', '7'],
      low: ['6', '7'],
    },
    F: {
      high: ['1'],
      basic: ['1', '2', '3', '4', '5', '6', '7'],
      low: ['3', '4', '5', '6', '7'],
    },
    G: {
      high: [],
      basic: ['1', '2', '3', '4', '5', '6', 'b7'],
      low: ['2', '3', '4', '5', '6', '7'],
    },
  };

  return ranges[keySignature] || ranges.C;
}

function getBeamDurationLevel(duration: Duration): number {
  switch (duration) {
    case '1/8':
      return 1;
    case '1/16':
      return 2;
    case '1/32':
      return 3;
    default:
      return 0;
  }
}

function isBeamableElement(element: unknown): element is { type: 'note' | 'rest'; duration: Duration } {
  return (
    !!element &&
    typeof element === 'object' &&
    'type' in element &&
    'duration' in element &&
    ((element as { type?: string }).type === 'note' || (element as { type?: string }).type === 'rest') &&
    getBeamDurationLevel((element as { duration: Duration }).duration) > 0
  );
}

export const ElementPanel = memo(function ElementPanel() {
  const [showHelp, setShowHelp] = useState(false);
  const addNote = useScoreStore((state) => state.addNote);
  const addRest = useScoreStore((state) => state.addRest);
  const addExtension = useScoreStore((state) => state.addExtension);
  const addBarline = useScoreStore((state) => state.addBarline);
  const updateNoteDuration = useScoreStore((state) => state.updateNoteDuration);
  const toggleAugmentationDot = useScoreStore((state) => state.toggleAugmentationDot);
  const toggleInsertMode = useScoreStore((state) => state.toggleInsertMode);
  const toggleTieMode = useScoreStore((state) => state.toggleTieMode);
  const toggleBeamMode = useScoreStore((state) => state.toggleBeamMode);
  const endBeam = useScoreStore((state) => state.endBeam);
  const cancelBeamMode = useScoreStore((state) => state.cancelBeamMode);
  const clearAllLyrics = useScoreStore((state) => state.clearAllLyrics);
  const clearSelection = useScoreStore((state) => state.clearSelection);
  const toggleExpression = useScoreStore((state) => state.toggleExpression);
  const isTieMode = useScoreStore((state) => state.isTieMode);
  const isInsertMode = useScoreStore((state) => state.isInsertMode);
  const isBeamMode = useScoreStore((state) => state.isBeamMode);
  const beamStartPosition = useScoreStore((state) => state.beamStartPosition);
  const selectedMeasureIndex = useScoreStore((state) => state.selectedMeasureIndex);
  const selectedNoteIndex = useScoreStore((state) => state.selectedNoteIndex);
  const document = useScoreStore((state) => state.document);
  const selectedElement = useScoreStore((state) => {
    if (state.selectedMeasureIndex === null || state.selectedNoteIndex === null) {
      return null;
    }

    return state.document.measures[state.selectedMeasureIndex]?.elements[state.selectedNoteIndex] ?? null;
  });
  const settings = useScoreStore((state) => state.document.settings);
  const updateSettings = useScoreStore((state) => state.updateSettings);

  const availableNotes = getAvailableNotes(settings.keySignature);
  const basicNotes = settings.keySignature === 'G' ? G_BASIC_NOTES : BASIC_NOTES;
  const hasSelection = selectedMeasureIndex !== null && selectedNoteIndex !== null;
  const selectedDuration =
    selectedElement && (selectedElement.type === 'note' || selectedElement.type === 'rest')
      ? selectedElement.duration
      : null;
  const hasAugmentationDot = selectedElement?.type === 'note' ? !!selectedElement.hasAugmentationDot : false;
  const selectedExpression =
    selectedMeasureIndex !== null && selectedNoteIndex !== null
      ? document.expressions?.find(
          (expression) =>
            expression.measureIndex === selectedMeasureIndex &&
            expression.noteIndex === selectedNoteIndex &&
            expression.type === 'dynamic'
        )?.value ?? null
      : null;

  const canConfirmBeam = (() => {
    if (
      !isBeamMode ||
      !beamStartPosition ||
      selectedMeasureIndex === null ||
      selectedNoteIndex === null ||
      beamStartPosition.measureIndex !== selectedMeasureIndex ||
      selectedNoteIndex <= beamStartPosition.noteIndex
    ) {
      return false;
    }

    const measure = document.measures[selectedMeasureIndex];
    const rangeElements = measure?.elements.slice(beamStartPosition.noteIndex, selectedNoteIndex + 1) ?? [];

    return (
      rangeElements.length >= 2 &&
      rangeElements.every(isBeamableElement)
    );
  })();

  const handleHighNoteClick = useCallback(
    (noteValue: NoteValue) => {
      addNote(noteValue, '1/4', { hasHighDot: true });
      if (hasSelection && !isInsertMode) {
        clearSelection();
      }
    },
    [addNote, clearSelection, hasSelection, isInsertMode]
  );

  const handleBasicNoteClick = useCallback(
    (noteValue: NoteValue) => {
      addNote(noteValue, '1/4');
      if (hasSelection && !isInsertMode) {
        clearSelection();
      }
    },
    [addNote, clearSelection, hasSelection, isInsertMode]
  );

  const handleLowNoteClick = useCallback(
    (noteValue: NoteValue) => {
      addNote(noteValue, '1/4', { hasLowDot: true });
      if (hasSelection && !isInsertMode) {
        clearSelection();
      }
    },
    [addNote, clearSelection, hasSelection, isInsertMode]
  );

  const handleRestClick = useCallback(
    (duration: Duration) => {
      addRest(duration);
      if (hasSelection && !isInsertMode) {
        clearSelection();
      }
    },
    [addRest, clearSelection, hasSelection, isInsertMode]
  );

  const handleReplaceModeClick = useCallback(() => {
    if (isInsertMode) {
      toggleInsertMode();
    }
  }, [isInsertMode, toggleInsertMode]);

  const handleInsertModeClick = useCallback(() => {
    if (!isInsertMode) {
      toggleInsertMode();
    }
  }, [isInsertMode, toggleInsertMode]);

  const toggleFingering = useCallback(() => {
    updateSettings({ showFingering: !settings.showFingering });
  }, [settings.showFingering, updateSettings]);

  const toggleLyrics = useCallback(() => {
    updateSettings({ showLyrics: !settings.showLyrics });
  }, [settings.showLyrics, updateSettings]);

  const handleBeamAction = useCallback(() => {
    if (!isBeamMode) {
      toggleBeamMode();
      return;
    }

    if (canConfirmBeam && selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      endBeam(selectedMeasureIndex, selectedNoteIndex);
      return;
    }

    cancelBeamMode();
  }, [
    cancelBeamMode,
    canConfirmBeam,
    endBeam,
    isBeamMode,
    selectedMeasureIndex,
    selectedNoteIndex,
    toggleBeamMode,
  ]);

  return (
    <TooltipProvider delayDuration={250}>
      <aside className="h-full w-full overflow-y-auto bg-slate-50/50">
        <div className="space-y-3 p-3">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-slate-700">使用帮助</div>
                <div className="mt-0.5 text-[11px] text-slate-500">悬停按钮可查看说明</div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp((value) => !value)}
                className={cn(
                  'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all',
                  showHelp
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                )}
              >
                {showHelp ? '隐藏帮助' : '帮助'}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
                <MusicIcon className="h-3 w-3 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">指法图</span>
            </div>
            <ActionButton
              onClick={toggleFingering}
              active={settings.showFingering}
              help={UTILITY_HELP.fingering}
              showInlineHelp={showHelp}
              className={cn(
                'flex items-center justify-center gap-1.5',
                settings.showFingering
                  ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {settings.showFingering ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
              {settings.showFingering ? '隐藏指法图' : '显示指法图'}
            </ActionButton>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">编辑方式</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <ActionButton
                onClick={handleReplaceModeClick}
                active={!isInsertMode}
                help={MODIFIER_HELP.replaceMode}
                showInlineHelp={showHelp}
              >
                替换
              </ActionButton>
              <ActionButton
                onClick={handleInsertModeClick}
                active={isInsertMode}
                help={MODIFIER_HELP.insertMode}
                showInlineHelp={showHelp}
                className={cn(
                  isInsertMode && 'border-emerald-600 bg-emerald-50 text-emerald-700 hover:border-emerald-600 hover:text-emerald-700'
                )}
              >
                插入
              </ActionButton>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
                <Mic2Icon className="h-3 w-3 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">歌词</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <ActionButton
                onClick={toggleLyrics}
                active={settings.showLyrics}
                help={UTILITY_HELP.lyrics}
                showInlineHelp={showHelp}
                className={cn(
                  settings.showLyrics
                    ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {settings.showLyrics ? '隐藏歌词' : '显示歌词'}
              </ActionButton>
              <ActionButton
                onClick={clearAllLyrics}
                help={UTILITY_HELP.clearLyrics}
                showInlineHelp={showHelp}
                className="flex h-full items-center justify-center bg-slate-100 px-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2Icon className="mx-auto h-3 w-3" />
              </ActionButton>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-slate-500">高音</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {HIGH_NOTES.map((note) => (
                  <NoteButton
                    key={`high-${note.value}`}
                    display={note.display}
                    onClick={() => handleHighNoteClick(note.value)}
                    disabled={!availableNotes.high.includes(note.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-slate-500">中音</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {basicNotes.map((note) => (
                  <NoteButton
                    key={`basic-${note.value}`}
                    display={note.display}
                    onClick={() => handleBasicNoteClick(note.value)}
                    disabled={!availableNotes.basic.includes(note.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-slate-500">低音</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {LOW_NOTES.map((note) => (
                  <NoteButton
                    key={`low-${note.value}`}
                    display={note.display}
                    onClick={() => handleLowNoteClick(note.value)}
                    disabled={!availableNotes.low.includes(note.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">时值</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATION_OPTIONS.map((option) => (
                <ActionButton
                  key={option.value}
                  onClick={() => updateNoteDuration(option.value)}
                  active={selectedDuration === option.value}
                  help={DURATION_HELP[option.value]}
                  showInlineHelp={showHelp}
                >
                  {option.label}
                </ActionButton>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">休止符</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {REST_OPTIONS.map((option) => (
                <ActionButton
                  key={option.value}
                  onClick={() => handleRestClick(option.value)}
                  help={REST_HELP[option.value]}
                  showInlineHelp={showHelp}
                >
                  {option.label}
                </ActionButton>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">音符修饰</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <ActionButton
                onClick={toggleAugmentationDot}
                active={hasAugmentationDot}
                help={MODIFIER_HELP.dot}
                showInlineHelp={showHelp}
              >
                附点
              </ActionButton>
              <ActionButton onClick={addExtension} help={MODIFIER_HELP.extension} showInlineHelp={showHelp}>
                延长线
              </ActionButton>
              <ActionButton
                onClick={toggleTieMode}
                active={isTieMode}
                help={MODIFIER_HELP.tie}
                showInlineHelp={showHelp}
              >
                {isTieMode ? '取消连音线' : '连音线'}
              </ActionButton>
              <ActionButton
                onClick={handleBeamAction}
                active={isBeamMode}
                help={MODIFIER_HELP.beam}
                showInlineHelp={showHelp}
              >
                {!isBeamMode ? '合并时值线' : canConfirmBeam ? '确认合并' : '取消合并'}
              </ActionButton>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">小节/反复</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {BARLINE_OPTIONS.map((option) => (
                <ActionButton
                  key={option.value}
                  onClick={() => addBarline(option.value)}
                  help={BARLINE_HELP[option.value]}
                  showInlineHelp={showHelp}
                >
                  {option.label}
                </ActionButton>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">演奏表达</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {DYNAMIC_OPTIONS.map((value) => (
                <ActionButton
                  key={value}
                  onClick={() => toggleExpression(value)}
                  active={selectedExpression === value}
                  disabled={selectedElement?.type !== 'note'}
                  help={DYNAMIC_HELP[value]}
                  showInlineHelp={showHelp}
                >
                  <span className="font-serif text-sm italic">{value}</span>
                </ActionButton>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
});
