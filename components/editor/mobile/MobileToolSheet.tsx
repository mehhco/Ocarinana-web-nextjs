'use client';

import { ElementPanel } from '../core/ElementPanel';
import { MobileSheet } from './MobileSheet';

interface MobileToolSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileToolSheet({ open, onClose }: MobileToolSheetProps) {
  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title="编辑工具"
      description="选择音符、时值、歌词、结构和演奏记号"
    >
      <div className="mobile-editor-tools h-full">
        <ElementPanel />
      </div>
    </MobileSheet>
  );
}

