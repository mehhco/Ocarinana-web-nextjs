'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, ImageIcon, SaveIcon } from '@/components/ui/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScoreStore } from '../hooks/useScoreStore';
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

interface ToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  cloudSaveAvailable?: boolean;
  backHref?: string;
  onExportImage: () => void;
  onSave: () => void;
}

export const Toolbar = memo(function Toolbar({
  isDirty,
  isSaving,
  cloudSaveAvailable = true,
  backHref,
  onExportImage,
  onSave,
}: ToolbarProps) {
  const document = useScoreStore((state) => state.document);
  const updateTitle = useScoreStore((state) => state.updateTitle);
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
    <header className="h-12 shrink-0 border-b border-slate-200 bg-white px-3">
      <div className="flex h-full justify-center">
        <div className="flex h-full w-[80vw] min-w-[1000px] items-center">
          <div className="flex h-full w-1/3 items-center gap-2 pr-3">
            {backHref && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mr-2 gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Link href={backHref}>
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">我的乐谱</span>
                </Link>
              </Button>
            )}

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
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
                className="gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                onClick={onExportImage}
                disabled={isExporting}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isExporting ? '导出中' : '导出图片'}
                </span>
              </Button>
            </div>
          </div>

          <div className="flex h-full w-2/3 items-center gap-2">
            <div className="max-w-xs flex-1">
              <Input
                value={document.title}
                onChange={handleTitleChange}
                placeholder="输入乐谱标题"
                className="h-7 border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="mx-1.5 h-5 w-px bg-slate-200" />

            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-xs font-medium text-slate-500">调号</span>
              <Select value={document.settings.keySignature} onValueChange={handleKeySignatureChange}>
                <SelectTrigger className="h-7 w-16 border-slate-200 bg-slate-50 text-xs">
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

            <div className="hidden items-center gap-1.5 md:flex">
              <span className="text-xs font-medium text-slate-500">拍号</span>
              <Select value={document.settings.timeSignature} onValueChange={handleTimeSignatureChange}>
                <SelectTrigger className="h-7 w-14 border-slate-200 bg-slate-50 text-xs">
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

            <div className="hidden items-center gap-1.5 lg:flex">
              <label className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-600">
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
                  <span className="text-sm font-semibold leading-none text-slate-600">♩</span>
                  <Input
                    type="number"
                    min={40}
                    max={300}
                    step={1}
                    value={document.settings.tempo}
                    onChange={handleTempoChange}
                    aria-label="速度"
                    className="h-7 w-16 border-slate-200 bg-slate-50 px-2 text-center text-xs focus:border-indigo-500 focus:bg-white"
                  />
                </>
              )}
            </div>

            <div className="flex-1" />

            <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-none border-r border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-white hover:text-indigo-600 disabled:text-slate-400 disabled:opacity-50"
                disabled={!canUndo}
                onClick={undo}
                title="撤销 Ctrl+Z"
              >
                撤销
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-none px-3 text-xs font-medium text-slate-600 hover:bg-white hover:text-indigo-600 disabled:text-slate-400 disabled:opacity-50"
                disabled={!canRedo}
                onClick={redo}
                title="恢复 Ctrl+Shift+Z"
              >
                恢复
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});
