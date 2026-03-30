'use client';

import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileJsonIcon,
  ImageIcon,
  MusicIcon,
  Redo2Icon,
  SaveIcon,
  Undo2Icon,
} from '@/components/ui/icons';
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

export const Toolbar = memo(function Toolbar() {
  const document = useScoreStore((state) => state.document);
  const updateTitle = useScoreStore((state) => state.updateTitle);
  const updateSettings = useScoreStore((state) => state.updateSettings);
  const undo = useScoreStore((state) => state.undo);
  const redo = useScoreStore((state) => state.redo);
  const canUndo = useScoreStore((state) => state.canUndo);
  const canRedo = useScoreStore((state) => state.canRedo);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateTitle(e.target.value);
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

  const handleExportImage = useCallback(() => {
    console.log('export image');
  }, []);

  const handleExportJson = useCallback(() => {
    console.log('export json');
  }, []);

  const handleSave = useCallback(() => {
    console.log('save score');
  }, []);

  return (
    <header className="h-12 shrink-0 border-b border-slate-200 bg-white px-3">
      <div className="flex h-full items-center gap-2">
        <div className="mr-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
            <MusicIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="hidden text-sm font-semibold text-slate-800 lg:block">
            陶笛谱编辑器
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            onClick={handleSave}
          >
            <SaveIcon className="h-4 w-4" />
            <span className="hidden sm:inline">保存</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            onClick={handleExportImage}
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">导出图片</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            onClick={handleExportJson}
          >
            <FileJsonIcon className="h-4 w-4" />
            <span className="hidden sm:inline">导出 JSON</span>
          </Button>
        </div>

        <div className="mx-1.5 h-5 w-px bg-slate-200" />

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

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2Icon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
});
