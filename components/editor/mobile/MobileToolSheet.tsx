'use client';

import { ElementPanel } from '../core/ElementPanel';
import { MobileSheet } from './MobileSheet';
import { useEditorT } from '../i18n/editor-locale';

interface MobileToolSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileToolSheet({ open, onClose }: MobileToolSheetProps) {
  const t = useEditorT();

  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title={t('编辑工具', 'Edit tools')}
      description={t('选择音符、时值、歌词、结构和演奏记号', 'Notes, note lengths, lyrics, structure and expression marks')}
    >
      <div className="mobile-editor-tools h-full">
        <ElementPanel />
      </div>
    </MobileSheet>
  );
}
