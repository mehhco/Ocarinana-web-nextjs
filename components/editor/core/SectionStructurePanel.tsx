'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ListTree, MoreHorizontal, Plus, Route } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sortSectionsByScorePosition } from '@/lib/editor/sections';
import { showError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';

export function SectionStructurePanel() {
  const document = useScoreStore((state) => state.document);
  const selectedMeasureIndex = useScoreStore((state) => state.selectedMeasureIndex);
  const selectedNoteIndex = useScoreStore((state) => state.selectedNoteIndex);
  const addSectionAtSelection = useScoreStore((state) => state.addSectionAtSelection);
  const renameSection = useScoreStore((state) => state.renameSection);
  const deleteSection = useScoreStore((state) => state.deleteSection);
  const appendPlaybackSection = useScoreStore((state) => state.appendPlaybackSection);
  const movePlaybackOrderItem = useScoreStore((state) => state.movePlaybackOrderItem);
  const duplicatePlaybackOrderItem = useScoreStore((state) => state.duplicatePlaybackOrderItem);
  const removePlaybackOrderItem = useScoreStore((state) => state.removePlaybackOrderItem);
  const clearPlaybackOrder = useScoreStore((state) => state.clearPlaybackOrder);
  const selectElement = useScoreStore((state) => state.selectElement);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedSections = useMemo(
    () => sortSectionsByScorePosition(document.sections, document.measures),
    [document.measures, document.sections]
  );
  const sectionById = useMemo(
    () => new Map(document.sections.map((section) => [section.id, section])),
    [document.sections]
  );
  const selectedElement =
    selectedMeasureIndex !== null && selectedNoteIndex !== null
      ? document.measures[selectedMeasureIndex]?.elements[selectedNoteIndex]
      : null;
  const selectedMeasure =
    selectedMeasureIndex !== null ? document.measures[selectedMeasureIndex] : null;
  const selectedSection = selectedElement && selectedMeasure
    ? document.sections.find(
        (section) =>
          section.anchor.measureId === selectedMeasure.id &&
          section.anchor.beforeElementId === selectedElement.id
      )
    : null;
  const canAddSection = !!selectedElement && !selectedSection;

  const locateSection = (sectionId: string) => {
    const section = sectionById.get(sectionId);
    if (!section) return;

    const measureIndex = document.measures.findIndex((measure) => measure.id === section.anchor.measureId);
    if (measureIndex < 0) return;

    const measure = document.measures[measureIndex];
    const noteIndex = section.anchor.beforeElementId === null
      ? measure.elements.length - 1
      : measure.elements.findIndex((element) => element.id === section.anchor.beforeElementId);
    if (noteIndex >= 0) selectElement(measureIndex, noteIndex);
  };

  const beginRename = (sectionId: string) => {
    const section = sectionById.get(sectionId);
    if (!section) return;
    setEditingSectionId(sectionId);
    setLabelDraft(section.label);
  };

  const confirmRename = () => {
    if (!editingSectionId) return;

    const label = labelDraft.trim();
    if (!label || label.length > 12) {
      showError('段落名称需为 1–12 个字符');
      return;
    }
    const duplicate = document.sections.some(
      (section) =>
        section.id !== editingSectionId &&
        section.label.toLocaleLowerCase() === label.toLocaleLowerCase()
    );
    if (duplicate) {
      showError('段落名称不能重复');
      return;
    }

    renameSection(editingSectionId, label);
    setEditingSectionId(null);
    setLabelDraft('');
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-2.5 shadow-sm transition-colors',
        isExpanded
          ? 'border-amber-200/80 bg-[linear-gradient(145deg,#fffdf7_0%,#ffffff_55%)]'
          : 'border-slate-200 bg-white'
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="flex w-full items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        aria-expanded={isExpanded}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
          <ListTree className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-700">段落结构</div>
          <div className="text-[10px] leading-4 text-slate-500">
            {document.sections.length > 0 || document.playbackOrder.length > 0
              ? `${document.sections.length} 个段落 · ${document.playbackOrder.length} 步顺序`
              : '可选：标记段落并编排演奏路线'}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200',
            isExpanded && 'rotate-180 text-amber-700'
          )}
        />
      </button>

      {isExpanded && (
        <div className="mt-2">

      <button
        type="button"
        onClick={addSectionAtSelection}
        disabled={!canAddSection}
        className={cn(
          'flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
          canAddSection
            ? 'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100'
            : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {selectedSection ? `此处已有段落 ${selectedSection.label}` : '在选中元素前新增段落'}
      </button>

      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
          <span>段落标记</span>
          <span>{sortedSections.length}</span>
        </div>
        {sortedSections.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 px-2 py-2 text-center text-[10px] leading-4 text-slate-400">
            先在谱面选中一个元素，再创建段落
          </div>
        ) : (
          <div className="max-h-32 space-y-1 overflow-y-auto pr-0.5">
            {sortedSections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1"
              >
                {editingSectionId === section.id ? (
                  <form
                    className="flex min-w-0 flex-1 items-center gap-1"
                    onSubmit={(event) => {
                      event.preventDefault();
                      confirmRename();
                    }}
                  >
                    <input
                      autoFocus
                      value={labelDraft}
                      maxLength={12}
                      onChange={(event) => setLabelDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') setEditingSectionId(null);
                      }}
                      className="h-6 min-w-0 flex-1 rounded border border-amber-300 px-1.5 text-[11px] outline-none ring-amber-200 focus:ring-2"
                      aria-label="段落名称"
                    />
                    <button type="submit" className="h-6 rounded bg-amber-600 px-1.5 text-[10px] font-medium text-white">
                      保存
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => locateSection(section.id)}
                      className="min-w-0 flex-1 truncate rounded px-1.5 py-1 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      title={`定位到段落 ${section.label}`}
                    >
                      <span className="mr-1.5 inline-flex min-w-5 justify-center rounded border border-slate-400 bg-white px-1 font-serif text-[10px] leading-4">
                        {section.label}
                      </span>
                      定位
                    </button>
                    <button
                      type="button"
                      onClick={() => appendPlaybackSection(section.id)}
                      className="flex h-6 items-center gap-0.5 rounded bg-amber-50 px-1.5 text-[10px] font-medium text-amber-800 hover:bg-amber-100"
                      title={`将 ${section.label} 加入演奏顺序`}
                    >
                      <Plus className="h-3 w-3" />顺序
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                          aria-label={`${section.label} 段落菜单`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-28">
                        <DropdownMenuItem onSelect={() => beginRename(section.id)}>重命名</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => deleteSection(section.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          删除段落
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="my-2 h-px bg-amber-100" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
          <Route className="h-3 w-3" />演奏顺序
        </div>
        {document.playbackOrder.length > 0 && (
          <button
            type="button"
            onClick={clearPlaybackOrder}
            className="text-[10px] text-slate-400 hover:text-red-600"
          >
            清空
          </button>
        )}
      </div>

      {document.playbackOrder.length === 0 ? (
        <div className="mt-1.5 rounded-md bg-slate-50 px-2 py-2 text-center text-[10px] leading-4 text-slate-400">
          点击段落右侧“＋顺序”开始编排
        </div>
      ) : (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {document.playbackOrder.map((sectionId, index) => {
            const section = sectionById.get(sectionId);
            if (!section) return null;

            return (
              <div key={`${sectionId}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span className="text-[10px] text-slate-300">→</span>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="min-w-6 rounded border border-amber-300 bg-amber-50 px-1.5 py-1 font-serif text-[10px] font-semibold leading-none text-amber-900 hover:bg-amber-100"
                      aria-label={`演奏顺序第 ${index + 1} 项：${section.label}`}
                    >
                      {section.label}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-32">
                    <DropdownMenuItem
                      disabled={index === 0}
                      onSelect={() => movePlaybackOrderItem(index, -1)}
                    >
                      向左移动
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={index === document.playbackOrder.length - 1}
                      onSelect={() => movePlaybackOrderItem(index, 1)}
                    >
                      向右移动
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => duplicatePlaybackOrderItem(index)}>
                      复制此项
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => removePlaybackOrderItem(index)}
                      className="text-red-600 focus:text-red-600"
                    >
                      从顺序中删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
