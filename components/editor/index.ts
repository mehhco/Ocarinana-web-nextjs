/**
 * 编辑器组件统一导出
 */

export { ScoreEditor } from './core/ScoreEditor';
export { Toolbar } from './core/Toolbar';
export { ElementPanel } from './core/ElementPanel';
export { ScoreCanvas } from './core/ScoreCanvas';

export { useScoreStore } from './hooks/useScoreStore';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export * from './lib/constants';
export * from './lib/fingeringMap';
export * from './lib/exportUtils';

export { TieLayer } from './overlay/TieLayer';
export { LyricsInput } from './overlay/LyricsInput';
