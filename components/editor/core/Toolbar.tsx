'use client';

import { useCallback, memo } from 'react';
import { Save, Download, Undo2, Redo2, Image, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Separator } from '@/components/ui/separator';
import {
  useDocumentTitle,
  useDocumentSettings,
  useCanUndo,
  useCanRedo,
  useUpdateTitle,
  useUpdateSettings,
  useUndo,
  useRedo,
} from '../hooks/useSelectors';
import { KEY_SIGNATURE_OPTIONS, TIME_SIGNATURE_OPTIONS, SKIN_OPTIONS } from '../lib/constants';
import { exportAsJson } from '../lib/exportUtils';
import type { KeySignature, TimeSignature, SkinType } from '@/lib/editor/types';

// 优化：使用 memo 避免不必要的重渲染
export const Toolbar = memo(function Toolbar() {
  // 使用细粒度 selectors，只订阅需要的数据
  const title = useDocumentTitle();
  const settings = useDocumentSettings();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // 使用细粒度 action selectors
  const updateTitle = useUpdateTitle();
  const updateSettings = useUpdateSettings();
  const undo = useUndo();
  const redo = useRedo();

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateTitle(e.target.value);
  }, [updateTitle]);

  const handleKeySignatureChange = useCallback((value: string) => {
    updateSettings({ keySignature: value as KeySignature });
  }, [updateSettings]);

  const handleTimeSignatureChange = useCallback((value: string) => {
    updateSettings({ timeSignature: value as TimeSignature });
  }, [updateSettings]);

  const handleSkinChange = useCallback((value: string) => {
    updateSettings({ skin: value as SkinType });
  }, [updateSettings]);

  // 导出 JSON
  const handleExportJson = useCallback(() => {
    // 需要获取完整文档，这里使用 store 的 getState
    import('../hooks/useScoreStore').then(({ useScoreStore }) => {
      const document = useScoreStore.getState().getDocumentSnapshot();
      exportAsJson(document);
    });
  }, []);

  // 导出图片 - 通过自定义事件通知 ScoreCanvas
  const handleExportImage = useCallback(() => {
    window.dispatchEvent(new CustomEvent('editor:export-image'));
  }, []);

  // 手动保存
  const handleSave = useCallback(() => {
    window.dispatchEvent(new CustomEvent('editor:manual-save'));
  }, []);

  return (
    <TooltipProvider>
      <header className="h-16 border-b bg-background flex items-center px-4 gap-3 shrink-0">
        {/* 保存和导出按钮组 */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSave}>
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">保存</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>保存乐谱 (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportImage}>
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">导出图片</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>导出为 PNG 图片</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportJson}>
                <FileJson className="h-4 w-4" />
                <span className="hidden sm:inline">导出 JSON</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>导出为 JSON 文件</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* 标题输入 */}
        <div className="flex-1 min-w-0 max-w-md">
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="请输入乐谱标题"
            className="h-9"
          />
        </div>

        <Separator orientation="vertical" className="h-8 hidden sm:block" />

        {/* 调号选择 */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">调号：</span>
          <Select
            value={settings.keySignature}
            onValueChange={handleKeySignatureChange}
          >
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEY_SIGNATURE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 拍号选择 */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">拍号：</span>
          <Select
            value={settings.timeSignature}
            onValueChange={handleTimeSignatureChange}
          >
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SIGNATURE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 皮肤选择 */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">皮肤：</span>
          <Select
            value={settings.skin}
            onValueChange={handleSkinChange}
          >
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SKIN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* 撤销/重做按钮 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={!canUndo}
                onClick={undo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>撤销 (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={!canRedo}
                onClick={redo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>重做 (Ctrl+Shift+Z)</p>
            </TooltipContent>
          </Tooltip>
        </div>

      </header>
    </TooltipProvider>
  );
});
