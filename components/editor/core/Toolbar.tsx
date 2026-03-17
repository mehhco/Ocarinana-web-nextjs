'use client';

import { useCallback, memo } from 'react';
import { Save, Image, FileJson, Undo2, Redo2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  { value: 'G', label: '1=G' },
  { value: 'D', label: '1=D' },
  { value: 'A', label: '1=A' },
  { value: 'E', label: '1=E' },
  { value: 'F', label: '1=F' },
  { value: 'Bb', label: '1=降B' },
  { value: 'Eb', label: '1=降E' },
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

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateTitle(e.target.value);
  }, [updateTitle]);

  const handleKeySignatureChange = useCallback((value: string) => {
    updateSettings({ keySignature: value as KeySignature });
  }, [updateSettings]);

  const handleTimeSignatureChange = useCallback((value: string) => {
    updateSettings({ timeSignature: value as TimeSignature });
  }, [updateSettings]);

  const handleExport = useCallback(() => {
    console.log('导出乐谱');
  }, []);

  const handleSave = useCallback(() => {
    console.log('保存乐谱');
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Music className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-slate-800 hidden lg:block">陶笛谱编辑器</span>
      </div>

      {/* 操作按钮组 */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50" 
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">保存</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50" 
          onClick={handleExport}
        >
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">导出图片</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50" 
          onClick={handleExport}
        >
          <FileJson className="h-4 w-4" />
          <span className="hidden sm:inline">导出 JSON</span>
        </Button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-2" />

      {/* 标题输入 */}
      <div className="flex-1 max-w-xs">
        <Input
          value={document.title}
          onChange={handleTitleChange}
          placeholder="请输入乐谱标题"
          className="h-8 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500"
        />
      </div>

      <div className="w-px h-6 bg-slate-200 mx-2" />

      {/* 调号选择 */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-xs text-slate-500 font-medium">调号</span>
        <Select
          value={document.settings.keySignature}
          onValueChange={handleKeySignatureChange}
        >
          <SelectTrigger className="w-16 h-8 text-xs bg-slate-50 border-slate-200">
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

      {/* 拍号选择 */}
      <div className="hidden md:flex items-center gap-1.5">
        <span className="text-xs text-slate-500 font-medium">拍号</span>
        <Select
          value={document.settings.timeSignature}
          onValueChange={handleTimeSignatureChange}
        >
          <SelectTrigger className="w-14 h-8 text-xs bg-slate-50 border-slate-200">
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

      {/* 撤销/重做按钮 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
});
