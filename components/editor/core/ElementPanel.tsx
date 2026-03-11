'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic2, Hand, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { HIGH_NOTES, BASIC_NOTES_ROWS, LOW_NOTES, KEY_SIGNATURE_RANGES, DURATION_OPTIONS, REST_OPTIONS } from '../lib/constants';
import type { Duration, NoteValue, Note } from '@/lib/editor/types';

export function ElementPanel() {
  const {
    document,
    selectedMeasureIndex,
    selectedNoteIndex,
    addNote,
    addRest,
    addMeasure,
    toggleHighDot,
    toggleLowDot,
    addExtension,
    addBarline,
    updateNoteDuration,
    updateSettings,
    updateLyrics,
    clearAllLyrics,
    clearSelection,
    selectElement,
    isBeamMode,
    beamStartPosition,
    toggleBeamMode,
    startBeam,
    endBeam,
    cancelBeamMode,
  } = useScoreStore();
  const [selectedDuration, setSelectedDuration] = useState<Duration>('1/4');
  
  // 用于跟踪时值线连接模式中最后处理的位置
  const lastProcessedPosition = useRef<{ measureIndex: number; noteIndex: number } | null>(null);

  // 当选择不同音符时，同步 selectedDuration 到该音符的实际时值
  useEffect(() => {
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      const measure = document.measures[selectedMeasureIndex];
      const element = measure?.elements[selectedNoteIndex];
      if (element && (element.type === 'note' || element.type === 'rest')) {
        setSelectedDuration(element.duration);
      }
    }
  }, [selectedMeasureIndex, selectedNoteIndex, document.measures]);
  
  // 处理时值线连接模式
  useEffect(() => {
    if (!isBeamMode) {
      // 退出模式时重置
      lastProcessedPosition.current = null;
      return;
    }
    
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      // 检查是否已经处理过这个位置
      if (lastProcessedPosition.current &&
          lastProcessedPosition.current.measureIndex === selectedMeasureIndex &&
          lastProcessedPosition.current.noteIndex === selectedNoteIndex) {
        return;
      }
      
      const measure = document.measures[selectedMeasureIndex];
      const element = measure?.elements[selectedNoteIndex];
      
      // 只能连接音符
      if (!element || element.type !== 'note') {
        return;
      }
      
      // 记录已处理的位置
      lastProcessedPosition.current = { measureIndex: selectedMeasureIndex, noteIndex: selectedNoteIndex };
      
      if (beamStartPosition === null) {
        // 第一次选择，记录起始位置
        startBeam(selectedMeasureIndex, selectedNoteIndex);
      } else {
        // 第二次选择，完成连接
        // 检查是否是同一个音符
        if (beamStartPosition.measureIndex === selectedMeasureIndex && 
            beamStartPosition.noteIndex === selectedNoteIndex) {
          // 取消选择
          cancelBeamMode();
        } else {
          endBeam(selectedMeasureIndex, selectedNoteIndex);
        }
      }
    }
  }, [isBeamMode, selectedMeasureIndex, selectedNoteIndex, beamStartPosition, startBeam, endBeam, cancelBeamMode]);


  const handleNoteClick = (noteValue: string, hasHighDot: boolean = false, hasLowDot: boolean = false) => {
    clearSelection();
    setTimeout(() => {
      addNote(noteValue as NoteValue, selectedDuration, { hasHighDot, hasLowDot });
    }, 0);
  };

  const handleRestClick = (duration: string) => {
    clearSelection();
    setTimeout(() => {
      addRest(duration as Duration);
    }, 0);
  };

  const handleDurationSelect = (duration: Duration) => {
    setSelectedDuration(duration);
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      updateNoteDuration(duration);
    }
  };

  const handleToggleLyrics = () => {
    updateSettings({ showLyrics: !document.settings.showLyrics });
  };

  const handleToggleFingering = () => {
    updateSettings({ showFingering: !document.settings.showFingering });
  };

  // 获取当前选中音符的歌词
  const getCurrentLyrics = () => {
    if (selectedMeasureIndex === null || selectedNoteIndex === null) return '';
    // 从 document.lyrics 数组中查找对应位置的歌词
    const lyric = document.lyrics.find(
      l => l.measureIndex === selectedMeasureIndex && l.noteIndex === selectedNoteIndex
    );
    return lyric?.text || '';
  };

  const handleLyricsChange = (text: string) => {
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      updateLyrics(selectedMeasureIndex, selectedNoteIndex, text);
    }
  };
  // 处理歌词输入的键盘事件 - 支持连续输入
  const handleLyricsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      const measure = document.measures[selectedMeasureIndex];
      if (!measure) return;
      
      // 找到下一个音符（跳过休止符和延长线）
      let nextNoteIndex = selectedNoteIndex + 1;
      while (nextNoteIndex < measure.elements.length) {
        const element = measure.elements[nextNoteIndex];
        if (element.type === 'note') {
          selectElement(selectedMeasureIndex, nextNoteIndex);
          setTimeout(() => {
            const input = window.document.querySelector('input[placeholder*="Tab或Enter"]') as HTMLInputElement;
            if (input) {
              input.focus();
              input.select();
            }
          }, 50);
          return;
        }
        nextNoteIndex++;
      }
      
      // 如果当前小节没有更多音符，尝试跳到下一小节
      if (selectedMeasureIndex < document.measures.length - 1) {
        const nextMeasure = document.measures[selectedMeasureIndex + 1];
        for (let i = 0; i < nextMeasure.elements.length; i++) {
          if (nextMeasure.elements[i].type === 'note') {
            selectElement(selectedMeasureIndex + 1, i);
            setTimeout(() => {
              const input = window.document.querySelector('input[placeholder*="Tab或Enter"]') as HTMLInputElement;
              if (input) {
                input.focus();
                input.select();
              }
            }, 50);
            return;
          }
        }
      }
    }
  };

  const currentLyrics = getCurrentLyrics();
  const hasSelection = selectedMeasureIndex !== null && selectedNoteIndex !== null;

  return (
    <TooltipProvider>
      <aside className="w-72 border-r bg-background overflow-y-auto shrink-0">
        <div className="p-4 space-y-6">
          {/* 特色功能区域 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full" />
              特色功能
            </h3>
            
            {/* 陶笛指法图 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hand className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">陶笛指法图</span>
                </div>
                <Toggle
                  pressed={document.settings.showFingering}
                  onPressedChange={handleToggleFingering}
                  className="h-7 px-2 text-xs data-[state=on]:bg-amber-500 data-[state=on]:text-white"
                >
                  {document.settings.showFingering ? '显示中' : '已隐藏'}
                </Toggle>
              </div>
              <p className="text-xs text-muted-foreground">
                开启后自动显示当前调号下每个音符的陶笛指法
              </p>
            </div>

            {/* 歌词功能 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mic2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">歌词编辑</span>
                </div>
                <Toggle
                  pressed={document.settings.showLyrics}
                  onPressedChange={handleToggleLyrics}
                  className="h-7 px-2 text-xs data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                >
                  {document.settings.showLyrics ? '显示中' : '已隐藏'}
                </Toggle>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={clearAllLyrics}
                >
                  清空歌词
                </Button>
              </div>
              {/* 歌词输入框 - 仅当选中音符时显示 */}
              {hasSelection && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={currentLyrics}
                    onChange={(e) => handleLyricsChange(e.target.value)}
                    onKeyDown={handleLyricsKeyDown}
                    placeholder="输入歌词，按Tab或Enter跳到下一个"
                    className="w-full h-8 px-2 text-sm border border-blue-200 dark:border-blue-700 rounded bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-blue-600/70 mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-blue-400" />
                    按 Tab 或 Enter 跳转到下一个音符
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 音符按钮 - 三排动态显示 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">音符</h3>
            
            {/* 高音行 */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground px-1">高音</div>
              <div className="grid grid-cols-7 gap-1">
                {HIGH_NOTES.map((note) => {
                  const isAvailable = KEY_SIGNATURE_RANGES[document.settings.keySignature]?.high.includes(note.value);
                  return (
                    <Tooltip key={`high-${note.value}`}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={!isAvailable}
                          className={cn(
                            "h-12 flex flex-col items-center justify-center gap-0.5 transition-colors",
                            isAvailable 
                              ? "hover:bg-primary/10 hover:border-primary/50" 
                              : "opacity-40 cursor-not-allowed bg-muted"
                          )}
                          onClick={() => isAvailable && handleNoteClick(note.value, true, false)}
                        >
                          <span className="text-lg font-bold">{note.display}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{note.name} ({note.solfege}){!isAvailable && ' - 当前调号不可用'}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* 基础音行 */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground px-1">基础</div>
              <div className="grid grid-cols-7 gap-1">
                {BASIC_NOTES_ROWS.map((note) => (
                  <Tooltip key={`basic-${note.value}`}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 flex flex-col items-center justify-center gap-0.5 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                        onClick={() => handleNoteClick(note.value, false, false)}
                      >
                        <span className="text-lg font-bold">{note.display}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{note.name} ({note.solfege})</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* 低音行 */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground px-1">低音</div>
              <div className="grid grid-cols-7 gap-1">
                {LOW_NOTES.map((note) => {
                  const isAvailable = KEY_SIGNATURE_RANGES[document.settings.keySignature]?.low.includes(note.value);
                  return (
                    <Tooltip key={`low-${note.value}`}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={!isAvailable}
                          className={cn(
                            "h-12 flex flex-col items-center justify-center gap-0.5 transition-colors",
                            isAvailable 
                              ? "hover:bg-primary/10 hover:border-primary/50" 
                              : "opacity-40 cursor-not-allowed bg-muted"
                          )}
                          onClick={() => isAvailable && handleNoteClick(note.value, false, true)}
                        >
                          <span className="text-lg font-bold">{note.display}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{note.name} ({note.solfege}){!isAvailable && ' - 当前调号不可用'}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* 装饰音 - 移除高音点/低音点按钮 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">装饰音</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="h-10"
                onClick={addExtension}
              >
                <span className="text-lg font-bold mr-2">-</span>
                <span className="text-sm">延长线</span>
              </Button>
              <Button
                variant="outline"
                className="h-10"
                onClick={addBarline}
              >
                <span className="text-lg font-bold mr-2">|</span>
                <span className="text-sm">小节线</span>
              </Button>
              <Button
                variant={isBeamMode ? 'default' : 'outline'}
                className={cn("h-10", isBeamMode && "ring-2 ring-primary ring-offset-2")}
                onClick={toggleBeamMode}
                disabled={!hasSelection}
              >
                <span className="text-lg font-bold mr-2">≡</span>
                <span className="text-sm">{isBeamMode ? '连接中...' : '连接时值线'}</span>
              </Button>
            </div>
          </div>
          <Separator />

          {/* 音符时值 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">音符时值</h3>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedDuration === option.value ? 'default' : 'outline'}
                  className={cn(
                    "h-10 justify-start gap-2",
                    selectedDuration === option.value && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => handleDurationSelect(option.value as Duration)}
                >
                  <span className="text-lg">{option.symbol}</span>
                  <span className="text-sm">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 休止符 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">休止符</h3>
            <div className="grid grid-cols-2 gap-2">
              {REST_OPTIONS.map((option) => (
                <Tooltip key={option.value}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                      onClick={() => handleRestClick(option.value)}
                    >
                      <span className="text-lg font-bold">0</span>
                      <span className="text-[10px] text-muted-foreground">{option.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{option.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <Separator />

          {/* 小节操作 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">小节操作</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 gap-2"
                onClick={addMeasure}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">添加小节</span>
              </Button>
            </div>
          </div>

          {/* 键盘快捷键提示 */}
          <div className="mt-8 p-3 bg-muted rounded-lg">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">快捷键</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>1-7</span>
                <span>输入音符</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+Z</span>
                <span>撤销</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+Shift+Z</span>
                <span>重做</span>
              </div>
              <div className="flex justify-between">
                <span>← →</span>
                <span>移动选中</span>
              </div>
              <div className="flex justify-between">
                <span>Delete</span>
                <span>删除</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
