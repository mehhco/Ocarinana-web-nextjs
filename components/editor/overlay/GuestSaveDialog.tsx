'use client';

import { useEffect, useId } from 'react';
import { Button } from '@/components/ui/button';
import { useEditorT } from '../i18n/editor-locale';

interface GuestSaveDialogProps {
  open: boolean;
  draftSavedToDevice: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignUp: () => void;
}

export function GuestSaveDialog({
  open,
  draftSavedToDevice,
  onClose,
  onLogin,
  onSignUp,
}: GuestSaveDialogProps) {
  const t = useEditorT();
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t('关闭提示', 'Close dialog')}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {t('保存到云端需要登录', 'Sign in to save to the cloud')}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {draftSavedToDevice
            ? t(
                '你编辑的乐谱已经自动保存在这台设备上。登录或注册后会自动恢复并继续保存，不会丢失。',
                'Your score is already saved on this device. After you sign in or sign up we restore it automatically and save it to the cloud — nothing is lost.'
              )
            : t(
                '当前浏览器无法保存本机草稿（可能处于无痕模式或禁用了本地存储）。建议先点工具栏的「导出图片」保存一份，再登录。',
                'This browser cannot keep a local draft (private mode or storage disabled). Use “Export PNG” in the toolbar first, then sign in.'
              )}
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {t(
            '登录只用于把乐谱保存到你的账号，编辑本身一直免费，不需要注册。',
            'An account only stores scores in the cloud. Editing itself stays free and never requires signing up.'
          )}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Button type="button" className="w-full" onClick={onLogin}>
            {t('登录并保存', 'Sign in and save')}
          </Button>
          <Button type="button" className="w-full" variant="secondary" onClick={onSignUp}>
            {t('注册新账号', 'Create an account')}
          </Button>
          <Button type="button" className="w-full" variant="ghost" onClick={onClose}>
            {t('继续编辑，稍后登录', 'Keep editing')}
          </Button>
        </div>
      </section>
    </div>
  );
}
