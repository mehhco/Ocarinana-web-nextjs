'use client';

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';

export type EditorLocale = 'zh' | 'en';

const EditorLocaleContext = createContext<EditorLocale>('zh');

export function EditorLocaleProvider({
  locale,
  children,
}: {
  locale: EditorLocale;
  children: ReactNode;
}) {
  return (
    <EditorLocaleContext.Provider value={locale}>
      {children}
    </EditorLocaleContext.Provider>
  );
}

export function useEditorLocale(): EditorLocale {
  return useContext(EditorLocaleContext);
}

/**
 * 编辑器内的轻量双语辅助：t('保存', 'Save')。
 *
 * 编辑器文案量大且分散，用内联双语比维护一套 key 字典更直观，
 * 也不会因为漏 key 而回退成空白。
 */
export function useEditorT() {
  const locale = useEditorLocale();

  return useCallback(
    (zh: string, en: string) => (locale === 'en' ? en : zh),
    [locale]
  );
}
