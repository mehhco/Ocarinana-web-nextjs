'use client';

import { ArrowLeftIcon, ImageIcon, Redo2Icon, SaveIcon, Undo2Icon } from '@/components/ui/icons';
import { useScoreStore } from '../hooks/useScoreStore';

interface MobileEditorHeaderProps {
  isDirty: boolean;
  isSaving: boolean;
  isExporting: boolean;
  backHref?: string;
  onBack?: () => void;
  onSave: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
}

const ICON_BUTTON =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors active:bg-slate-100 disabled:opacity-35';

export function MobileEditorHeader({
  isDirty,
  isSaving,
  isExporting,
  backHref,
  onBack,
  onSave,
  onExport,
  onOpenSettings,
}: MobileEditorHeaderProps) {
  const title = useScoreStore((state) => state.document.title);
  const undo = useScoreStore((state) => state.undo);
  const redo = useScoreStore((state) => state.redo);
  const canUndo = useScoreStore((state) => state.canUndo);
  const canRedo = useScoreStore((state) => state.canRedo);

  const saveLabel = isSaving ? '保存中' : isDirty ? '保存乐谱' : '已保存';

  return (
    <header className="editor-safe-top flex shrink-0 items-center gap-1 border-b border-slate-200 bg-white/95 px-2 pb-1.5 shadow-sm backdrop-blur lg:hidden">
      {backHref && (
        <button type="button" className={ICON_BUTTON} onClick={onBack} disabled={isSaving} aria-label="返回我的乐谱">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      )}

      <button
        type="button"
        onClick={onOpenSettings}
        className="mx-1 min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left active:bg-slate-50"
        aria-label="编辑乐谱设置"
      >
        <span className="block truncate text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-[11px] text-slate-500">{isSaving ? '正在同步到云端' : isDirty ? '有未保存修改' : '点击编辑乐谱信息'}</span>
      </button>

      <button type="button" className={ICON_BUTTON} onClick={undo} disabled={!canUndo} aria-label="撤销">
        <Undo2Icon className="h-5 w-5" />
      </button>
      <button type="button" className={ICON_BUTTON} onClick={redo} disabled={!canRedo} aria-label="恢复">
        <Redo2Icon className="h-5 w-5" />
      </button>
      <button type="button" className={ICON_BUTTON} onClick={onSave} disabled={isSaving} aria-label={saveLabel}>
        <SaveIcon className="h-5 w-5" />
      </button>
      <button type="button" className={ICON_BUTTON} onClick={onExport} disabled={isExporting} aria-label="导出图片">
        <ImageIcon className="h-5 w-5" />
      </button>
    </header>
  );
}

