'use client';

import { memo, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  ArrowLeftIcon,
  ImageIcon,
  SaveIcon,
} from '@/components/ui/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { ScoreScaleControl } from './ScoreScaleControl';
import type { KeySignature, TimeSignature } from '@/lib/editor/types';

const KEY_SIGNATURE_OPTIONS: { value: KeySignature; label: string }[] = [
  { value: 'C', label: '1=C' },
  { value: 'F', label: '1=F' },
  { value: 'G', label: '1=G' },
];

const TIME_SIGNATURE_OPTIONS: { value: TimeSignature; label: string }[] = [
  { value: '2/4', label: '2/4' },
  { value: '3/4', label: '3/4' },
  { value: '4/4', label: '4/4' },
  { value: '6/8', label: '6/8' },
];

const TOOL_BUTTON_CLASS =
  'h-8 gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-indigo-600';
const HISTORY_BUTTON_CLASS =
  'h-8 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-50';
const TITLE_INPUT_CLASS =
  'h-8 w-[300px] flex-none rounded-full border-slate-200 bg-slate-50 px-3 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:bg-white';
const INFO_INPUT_CLASS =
  'h-8 rounded-md border-slate-200 bg-white px-2.5 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:bg-white';
const SELECT_TRIGGER_CLASS =
  'h-8 rounded-full border-slate-200 bg-slate-50 text-xs shadow-sm';

interface ToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  cloudSaveAvailable?: boolean;
  backHref?: string;
  displayScale: number;
  onExportImage: () => void;
  onSave: () => void;
  onDisplayScaleChange: (value: number) => void;
}

function ToolbarField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="text-[11px] font-medium leading-none text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function IconHistoryButton({
  label,
  shortcut,
  disabled,
  onClick,
}: {
  label: string;
  shortcut: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={HISTORY_BUTTON_CLASS}
          disabled={disabled}
          onClick={onClick}
          aria-label={`${label} ${shortcut}`}
        >
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {label} {shortcut}
      </TooltipContent>
    </Tooltip>
  );
}

export const Toolbar = memo(function Toolbar({
  isDirty,
  isSaving,
  cloudSaveAvailable = true,
  backHref,
  displayScale,
  onExportImage,
  onSave,
  onDisplayScaleChange,
}: ToolbarProps) {
  const document = useScoreStore((state) => state.document);
  const updateTitle = useScoreStore((state) => state.updateTitle);
  const updateScoreInfo = useScoreStore((state) => state.updateScoreInfo);
  const updateSettings = useScoreStore((state) => state.updateSettings);
  const undo = useScoreStore((state) => state.undo);
  const redo = useScoreStore((state) => state.redo);
  const canUndo = useScoreStore((state) => state.canUndo);
  const canRedo = useScoreStore((state) => state.canRedo);
  const isExporting = useScoreStore((state) => state.isExporting);

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateTitle(event.target.value);
    },
    [updateTitle]
  );

  const handleProducerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateScoreInfo({ producer: event.target.value });
    },
    [updateScoreInfo]
  );

  const handleLyricistChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateScoreInfo({ lyricist: event.target.value });
    },
    [updateScoreInfo]
  );

  const handleComposerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateScoreInfo({ composer: event.target.value });
    },
    [updateScoreInfo]
  );

  const handleAdditionalInfoChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateScoreInfo({ additionalInfo: event.target.value });
    },
    [updateScoreInfo]
  );

  const handleKeySignatureChange = useCallback(
    (value: string) => {
      updateSettings({ keySignature: value as KeySignature });
    },
    [updateSettings]
  );

  const handleTimeSignatureChange = useCallback(
    (value: string) => {
      updateSettings({ timeSignature: value as TimeSignature });
    },
    [updateSettings]
  );

  const handleTempoChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextTempo = Number.parseInt(event.target.value, 10);

      if (!Number.isFinite(nextTempo)) {
        return;
      }

      updateSettings({ tempo: Math.min(300, Math.max(40, nextTempo)) });
    },
    [updateSettings]
  );

  const handleShowTempoChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      updateSettings({ showTempo: checked === true });
    },
    [updateSettings]
  );

  const handleSave = useCallback(() => {
    onSave();
  }, [onSave]);

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white px-3 py-2">
      <TooltipProvider delayDuration={200}>
        <div className="mx-auto flex w-[80vw] min-w-[1000px] flex-col gap-2">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex items-center gap-1.5">
              {backHref && (
                <Button asChild variant="ghost" size="sm" className={TOOL_BUTTON_CLASS}>
                  <Link href={backHref} prefetch={false}>
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">我的乐谱</span>
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className={TOOL_BUTTON_CLASS}
                onClick={handleSave}
                disabled={isSaving}
              >
                <SaveIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {!cloudSaveAvailable ? '登录保存' : isSaving ? '保存中' : isDirty ? '保存' : '已保存'}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={TOOL_BUTTON_CLASS}
                onClick={onExportImage}
                disabled={isExporting}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{isExporting ? '导出中' : '导出图片'}</span>
              </Button>
            </div>

            <div className="flex min-w-0 items-center justify-center gap-2">
              <Input
                value={document.title}
                onChange={handleTitleChange}
                placeholder="输入乐谱标题"
                className={TITLE_INPUT_CLASS}
              />

              <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
                <span className="text-[11px] font-medium text-slate-500">调号</span>
                <Select value={document.settings.keySignature} onValueChange={handleKeySignatureChange}>
                  <SelectTrigger className={cn(SELECT_TRIGGER_CLASS, 'w-16')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KEY_SIGNATURE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden shrink-0 items-center gap-1.5 xl:flex">
                <span className="text-[11px] font-medium text-slate-500">拍号</span>
                <Select value={document.settings.timeSignature} onValueChange={handleTimeSignatureChange}>
                  <SelectTrigger className={cn(SELECT_TRIGGER_CLASS, 'w-16')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SIGNATURE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden shrink-0 items-center gap-1.5 2xl:flex">
                <label className="flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-medium text-slate-600 shadow-sm">
                  <Checkbox
                    checked={document.settings.showTempo !== false}
                    onCheckedChange={handleShowTempoChange}
                    aria-label="显示速度"
                    className="h-3.5 w-3.5 border-slate-300 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                  />
                  <span>速度</span>
                </label>
                {document.settings.showTempo !== false && (
                  <>
                    <span className="text-sm font-semibold leading-none text-slate-500">♩</span>
                    <Input
                      type="number"
                      min={40}
                      max={300}
                      step={1}
                      value={document.settings.tempo}
                      onChange={handleTempoChange}
                      aria-label="速度"
                      className="h-8 w-16 rounded-full border-slate-200 bg-slate-50 px-2 text-center text-xs shadow-sm focus:border-indigo-500 focus:bg-white"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1">
              <IconHistoryButton label="撤销" shortcut="Ctrl+Z" disabled={!canUndo} onClick={undo} />
              <IconHistoryButton label="恢复" shortcut="Ctrl+Shift+Z" disabled={!canRedo} onClick={redo} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-end gap-2">
              <ToolbarField label="制谱" className="w-56 flex-none">
                <Input
                  value={document.producer}
                  onChange={handleProducerChange}
                  placeholder="www.ocarinana.com"
                  aria-label="制谱"
                  className={INFO_INPUT_CLASS}
                />
              </ToolbarField>

              <ToolbarField label="作词" className="w-36 flex-none">
                <Input
                  value={document.lyricist || ''}
                  onChange={handleLyricistChange}
                  placeholder="选填"
                  aria-label="作词"
                  className={INFO_INPUT_CLASS}
                />
              </ToolbarField>

              <ToolbarField label="作曲" className="w-36 flex-none">
                <Input
                  value={document.composer || ''}
                  onChange={handleComposerChange}
                  placeholder="选填"
                  aria-label="作曲"
                  className={INFO_INPUT_CLASS}
                />
              </ToolbarField>

              <ToolbarField label="其他信息" className="mr-auto w-56 flex-none">
                <Input
                  value={document.additionalInfo || ''}
                  onChange={handleAdditionalInfoChange}
                  placeholder="选填，会显示在标题正下方"
                  aria-label="其他信息"
                  className={INFO_INPUT_CLASS}
                />
              </ToolbarField>

              <ScoreScaleControl value={displayScale} onChange={onDisplayScaleChange} className="h-8 shrink-0 self-end bg-white" />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </header>
  );
});
