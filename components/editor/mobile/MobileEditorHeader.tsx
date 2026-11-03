'use client';

import { ArrowLeftIcon, ImageIcon, Redo2Icon, SaveIcon, Undo2Icon } from '@/components/ui/icons';
import { useScoreStore } from '../hooks/useScoreStore';
import { useEditorT } from '../i18n/editor-locale';

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
  const t = useEditorT();

  const saveLabel = isSaving
    ? t('保存中', 'Saving')
    : isDirty
      ? t('保存乐谱', 'Save score')
      : t('已保存', 'Saved');

  return (
    <header className="editor-safe-top flex shrink-0 items-center gap-1 border-b border-slate-200 bg-white/95 px-2 pb-1.5 shadow-sm backdrop-blur lg:hidden">
      {backHref && (
        <button type="button" className={ICON_BUTTON} onClick={onBack} disabled={isSaving} aria-label={t('返回我的乐谱', 'Back to my scores')}>
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      )}

      <button
        type="button"
        onClick={onOpenSettings}
        className="mx-1 min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left active:bg-slate-50"
        aria-label={t('编辑乐谱设置', 'Edit score settings')}
      >
        <span className="block truncate text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-[11px] text-slate-500">
          {isSaving
            ? t('正在同步到云端', 'Syncing to the cloud')
            : isDirty
              ? t('有未保存修改', 'Unsaved changes')
              : t('点击编辑乐谱信息', 'Edit score info')}
        </span>
      </button>

      <button type="button" className={ICON_BUTTON} onClick={undo} disabled={!canUndo} aria-label={t('撤销', 'Undo')}>
        <Undo2Icon className="h-5 w-5" />
      </button>
      <button type="button" className={ICON_BUTTON} onClick={redo} disabled={!canRedo} aria-label={t('恢复', 'Redo')}>
        <Redo2Icon className="h-5 w-5" />
      </button>
      <button type="button" className={ICON_BUTTON} onClick={onSave} disabled={isSaving} aria-label={saveLabel}>
        <SaveIcon className="h-5 w-5" />
      </button>
      <button type="button" className={ICON_BUTTON} onClick={onExport} disabled={isExporting} aria-label={t('导出图片', 'Export PNG')}>
        <ImageIcon className="h-5 w-5" />
      </button>
    </header>
  );
}

