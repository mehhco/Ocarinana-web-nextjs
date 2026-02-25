/**
 * 乐谱编辑器状态管理
 * 使用 Zustand + Immer 实现
 * 
 * 功能：
 * - 文档状态管理
 * - 历史记录（撤销/重做）
 * - 选中状态管理
 * - 连音线工具状态
 */

'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { 
  ScoreDocument, 
  ScoreSettings, 
  Note, 
  Rest, 
  Measure,
  Tie,
  Duration,
  NoteValue,
  History,
  HistoryState,
  ScoreElement
} from '@/lib/editor/types';
import { DEFAULT_SETTINGS, DEFAULT_TITLE, HISTORY_CONFIG } from '../lib/constants';

// ============ 状态接口 ============

interface ScoreStoreState {
  // 文档状态
  document: ScoreDocument;
  
  // 选中状态
  selectedMeasureIndex: number | null;
  selectedNoteIndex: number | null;
  
  // UI 状态
  isDirty: boolean;
  isExporting: boolean;
  isSaving: boolean;
  
  // 连音线工具状态
  isTieMode: boolean;
  tieStartPosition: { measureIndex: number; noteIndex: number } | null;
  
  // 历史记录
  history: History;
  canUndo: boolean;
  canRedo: boolean;
}

interface ScoreStoreActions {
  // 初始化
  initialize: (doc?: Partial<ScoreDocument>) => void;
  setDocument: (doc: ScoreDocument) => void;
  
  // 文档元数据
  updateTitle: (title: string) => void;
  updateSettings: (settings: Partial<ScoreSettings>) => void;
  
  // 音符操作
  addNote: (noteValue: NoteValue, duration?: Duration) => void;
  addRest: (duration: Duration) => void;
  replaceSelectedNote: (noteValue: NoteValue) => void;
  updateNoteDuration: (duration: Duration) => void;
  toggleHighDot: () => void;
  toggleLowDot: () => void;
  addExtension: () => void;
  deleteSelectedElement: () => void;
  
  // 小节操作
  addMeasure: () => void;
  deleteMeasure: (index: number) => void;
  
  // 选择操作
  selectElement: (measureIndex: number, noteIndex: number) => void;
  selectNextElement: () => void;
  selectPrevElement: () => void;
  clearSelection: () => void;
  
  // 连音线操作
  toggleTieMode: () => void;
  startTie: (measureIndex: number, noteIndex: number) => void;
  endTie: (measureIndex: number, noteIndex: number) => void;
  deleteTie: (tieId: string) => void;
  cancelTieMode: () => void;
  
  // 歌词操作
  updateLyrics: (measureIndex: number, noteIndex: number, text: string) => void;
  clearAllLyrics: () => void;
  
  // 历史记录
  undo: () => void;
  redo: () => void;
  
  // 导出
  setExporting: (exporting: boolean) => void;
  setSaving: (saving: boolean) => void;
  markAsSaved: () => void;
  
  // 获取当前状态快照
  getDocumentSnapshot: () => ScoreDocument;
}

type ScoreStore = ScoreStoreState & ScoreStoreActions;

// ============ 辅助函数 ============

/**
 * 创建初始文档
 */
function createInitialDocument(override?: Partial<ScoreDocument>): ScoreDocument {
  return {
    version: '1.0',
    scoreId: override?.scoreId || `draft-${Date.now()}-${nanoid(8)}`,
    ownerUserId: override?.ownerUserId,
    title: override?.title || DEFAULT_TITLE,
    measures: override?.measures?.map(m => ({
      id: m.id || nanoid(),
      elements: m.elements || []
    })) || [{ id: nanoid(), elements: [] }],
    ties: override?.ties || [],
    lyrics: override?.lyrics || [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...override?.settings,
    },
    createdAt: override?.createdAt || new Date().toISOString(),
    updatedAt: override?.updatedAt || new Date().toISOString(),
  };
}

/**
 * 创建历史记录快照
 */
function createHistoryState(state: ScoreStoreState): HistoryState {
  return {
    document: JSON.parse(JSON.stringify(state.document)),
    selectedMeasureIndex: state.selectedMeasureIndex,
    selectedNoteIndex: state.selectedNoteIndex,
  };
}

/**
 * 保存到历史记录
 */
function saveToHistory(state: ScoreStoreState) {
  const historyState = createHistoryState(state);
  
  // 如果当前不在历史记录末尾，删除后面的记录
  if (state.history.currentIndex < state.history.states.length - 1) {
    state.history.states = state.history.states.slice(0, state.history.currentIndex + 1);
  }
  
  // 添加新状态
  state.history.states.push(historyState);
  state.history.currentIndex++;
  
  // 限制历史记录大小
  if (state.history.states.length > state.history.maxSize) {
    state.history.states.shift();
    state.history.currentIndex--;
  }
  
  // 更新 canUndo/canRedo
  state.canUndo = state.history.currentIndex > 0;
  state.canRedo = state.history.currentIndex < state.history.states.length - 1;
}

/**
 * 从历史记录恢复
 */
function restoreFromHistory(state: ScoreStoreState, historyState: HistoryState) {
  state.document = JSON.parse(JSON.stringify(historyState.document));
  state.selectedMeasureIndex = historyState.selectedMeasureIndex;
  state.selectedNoteIndex = historyState.selectedNoteIndex;
  state.isDirty = true;
}

// ============ Store 创建 ============

export const useScoreStore = create<ScoreStore>()(
  immer((set, get) => ({
  // ============ 初始状态 ============
  document: createInitialDocument(),
  selectedMeasureIndex: null,
  selectedNoteIndex: null,
  isDirty: false,
  isExporting: false,
  isSaving: false,
  isTieMode: false,
  tieStartPosition: null,
  history: {
    states: [],
    currentIndex: -1,
    maxSize: HISTORY_CONFIG.MAX_SIZE,
  },
  canUndo: false,
  canRedo: false,

  // ============ 初始化 ============
  initialize: (doc) => {
    set((state) => {
      state.document = createInitialDocument(doc);
      state.selectedMeasureIndex = null;
      state.selectedNoteIndex = null;
      state.isDirty = false;
      state.isTieMode = false;
      state.tieStartPosition = null;
      state.history = {
        states: [],
        currentIndex: -1,
        maxSize: HISTORY_CONFIG.MAX_SIZE,
      };
      state.canUndo = false;
      state.canRedo = false;
      
      // 初始化时保存第一个状态
      saveToHistory(state);
    });
  },

  setDocument: (doc) => {
    set((state) => {
      state.document = doc;
      state.isDirty = true;
    });
  },

  // ============ 文档元数据 ============
  updateTitle: (title) => {
    set((state) => {
      state.document.title = title;
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
    });
  },

  updateSettings: (settings) => {
    set((state) => {
      state.document.settings = { ...state.document.settings, ...settings };
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  // ============ 音符操作 ============
  addNote: (noteValue, duration = '1/4') => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      const newNote: Note = {
        id: nanoid(),
        type: 'note',
        value: noteValue,
        duration,
      };
      
      // 如果有选中的元素，替换它
      if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
        const measure = document.measures[selectedMeasureIndex];
        const element = measure.elements[selectedNoteIndex];
        
        if (element) {
          if (element.type === 'note') {
            // 保留其他属性，只替换音符值
            measure.elements[selectedNoteIndex] = {
              ...element,
              value: noteValue,
            };
          } else {
            // 替换为新的音符
            measure.elements[selectedNoteIndex] = newNote;
          }
        }
      } else {
        // 添加到当前最后一个小节
        const lastMeasure = document.measures[document.measures.length - 1];
        lastMeasure.elements.push(newNote);
        
        // 不再自动选中新添加的音符，避免影响下一次添加
        // 用户需要手动点击音符才能选中
      }
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  addRest: (duration) => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      // 处理全休止符和二分休止符的特殊情况
      if (duration === '1') {
        // 全休止符：添加 4 个四分休止符
        const lastMeasure = document.measures[document.measures.length - 1];
        for (let i = 0; i < 4; i++) {
          lastMeasure.elements.push({
            id: nanoid(),
            type: 'rest',
            value: '0',
            duration: '1/4',
            restGroup: 'full',
          });
        }
      } else if (duration === '1/2') {
        // 二分休止符：添加 2 个四分休止符
        const lastMeasure = document.measures[document.measures.length - 1];
        for (let i = 0; i < 2; i++) {
          lastMeasure.elements.push({
            id: nanoid(),
            type: 'rest',
            value: '0',
            duration: '1/4',
            restGroup: 'half',
          });
        }
      } else {
        // 普通休止符
        const newRest: Rest = {
          id: nanoid(),
          type: 'rest',
          value: '0',
          duration,
        };
        
        if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
          const measure = document.measures[selectedMeasureIndex];
          measure.elements[selectedNoteIndex] = newRest;
        } else {
          const lastMeasure = document.measures[document.measures.length - 1];
          lastMeasure.elements.push(newRest);
        }
      }
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  replaceSelectedNote: (noteValue) => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      const measure = document.measures[selectedMeasureIndex];
      const element = measure.elements[selectedNoteIndex];
      
      if (!element) return;
      
      if (element.type === 'note') {
        element.value = noteValue;
      } else {
        // 替换为新的音符
        measure.elements[selectedNoteIndex] = {
          id: nanoid(),
          type: 'note',
          value: noteValue,
          duration: element.type === 'rest' 
            ? element.duration 
            : '1/4',
        };
      }
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  updateNoteDuration: (duration) => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      const measure = document.measures[selectedMeasureIndex];
      const element = measure.elements[selectedNoteIndex];
      
      if (!element || (element.type !== 'note' && element.type !== 'rest')) return;
      
      element.duration = duration;
      
      // 处理全音符和二分音符的特殊情况：添加延长线
      if (duration === '1') {
        // 全音符：添加 3 个延长线
        for (let i = 0; i < 3; i++) {
          measure.elements.splice(selectedNoteIndex + 1 + i, 0, {
            id: nanoid(),
            type: 'extension',
            value: '-',
            duration: '1/4',
          });
        }
      } else if (duration === '1/2') {
        // 二分音符：添加 1 个延长线
        measure.elements.splice(selectedNoteIndex + 1, 0, {
          id: nanoid(),
          type: 'extension',
          value: '-',
          duration: '1/4',
        });
      }
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  toggleHighDot: () => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      const measure = document.measures[selectedMeasureIndex];
      const element = measure.elements[selectedNoteIndex];
      
      if (!element || element.type !== 'note') return;
      
      element.hasHighDot = !element.hasHighDot;
      if (element.hasHighDot) {
        element.hasLowDot = false;
      }
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  toggleLowDot: () => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      const measure = document.measures[selectedMeasureIndex];
      const element = measure.elements[selectedNoteIndex];
      
      if (!element || element.type !== 'note') return;
      
      element.hasLowDot = !element.hasLowDot;
      if (element.hasLowDot) {
        element.hasHighDot = false;
      }
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  addExtension: () => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      const measure = document.measures[selectedMeasureIndex];
      
      // 在选中音符后添加延长线
      const extension: ScoreElement = {
        id: nanoid(),
        type: 'extension',
        value: '-',
        duration: '1/4',
      };
      
      measure.elements.splice(selectedNoteIndex + 1, 0, extension);
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  deleteSelectedElement: () => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      const measure = document.measures[selectedMeasureIndex];
      const element = measure.elements[selectedNoteIndex];
      
      if (!element) return;
      
      // 如果是音符或休止符，删除它及其相关的延长线
      if (element.type === 'note' || element.type === 'rest') {
        let deleteCount = 1;
        
        // 检查并删除后面的延长线
        for (let i = selectedNoteIndex + 1; i < measure.elements.length; i++) {
          const nextItem = measure.elements[i];
          if (nextItem && nextItem.type === 'extension') {
            deleteCount++;
          } else {
            break;
          }
        }
        
        measure.elements.splice(selectedNoteIndex, deleteCount);
      } else {
        // 其他类型直接删除
        measure.elements.splice(selectedNoteIndex, 1);
      }
      
      // 删除相关的连音线
      document.ties = document.ties.filter(
        tie => !(tie.startMeasureIndex === selectedMeasureIndex && tie.startNoteIndex === selectedNoteIndex) &&
               !(tie.endMeasureIndex === selectedMeasureIndex && tie.endNoteIndex === selectedNoteIndex)
      );
      
      // 更新选中的索引
      if (selectedNoteIndex >= measure.elements.length) {
        state.selectedNoteIndex = measure.elements.length > 0 ? measure.elements.length - 1 : null;
      }
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  // ============ 小节操作 ============
  addMeasure: () => {
    set((state) => {
      const newMeasure: Measure = {
        id: nanoid(),
        elements: [],
      };
      
      state.document.measures.push(newMeasure);
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  deleteMeasure: (index) => {
    set((state) => {
      if (state.document.measures.length <= 1) return; // 至少保留一个小节
      
      state.document.measures.splice(index, 1);
      
      // 删除相关的连音线
      state.document.ties = state.document.ties.filter(
        tie => tie.startMeasureIndex !== index && tie.endMeasureIndex !== index
      );
      
      // 更新选中状态
      if (state.selectedMeasureIndex === index) {
        state.selectedMeasureIndex = null;
        state.selectedNoteIndex = null;
      }
      
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  // ============ 选择操作 ============
  selectElement: (measureIndex, noteIndex) => {
    set((state) => {
      state.selectedMeasureIndex = measureIndex;
      state.selectedNoteIndex = noteIndex;
    });
  },

  selectNextElement: () => {
    set((state) => {
      const { selectedMeasureIndex, selectedNoteIndex, document } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) {
        // 如果没有选中，选中第一个
        if (document.measures[0]?.elements.length > 0) {
          state.selectedMeasureIndex = 0;
          state.selectedNoteIndex = 0;
        }
        return;
      }
      
      const measure = document.measures[selectedMeasureIndex];
      
      if (selectedNoteIndex < measure.elements.length - 1) {
        // 移动到下一个音符
        state.selectedNoteIndex = selectedNoteIndex + 1;
      } else if (selectedMeasureIndex < document.measures.length - 1) {
        // 移动到下一小节的第一个音符
        state.selectedMeasureIndex = selectedMeasureIndex + 1;
        state.selectedNoteIndex = 0;
      }
    });
  },

  selectPrevElement: () => {
    set((state) => {
      const { selectedMeasureIndex, selectedNoteIndex } = state;
      
      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;
      
      if (selectedNoteIndex > 0) {
        // 移动到上一个音符
        state.selectedNoteIndex = selectedNoteIndex - 1;
      } else if (selectedMeasureIndex > 0) {
        // 移动到上一小节的最后一个音符
        const prevMeasure = state.document.measures[selectedMeasureIndex - 1];
        state.selectedMeasureIndex = selectedMeasureIndex - 1;
        state.selectedNoteIndex = Math.max(0, prevMeasure.elements.length - 1);
      }
    });
  },

  clearSelection: () => {
    set((state) => {
      state.selectedMeasureIndex = null;
      state.selectedNoteIndex = null;
    });
  },

  // ============ 连音线操作 ============
  toggleTieMode: () => {
    set((state) => {
      state.isTieMode = !state.isTieMode;
      if (!state.isTieMode) {
        state.tieStartPosition = null;
      }
    });
  },

  startTie: (measureIndex, noteIndex) => {
    set((state) => {
      state.tieStartPosition = { measureIndex, noteIndex };
    });
  },

  endTie: (measureIndex, noteIndex) => {
    set((state) => {
      const { tieStartPosition } = state;
      
      if (!tieStartPosition) return;
      
      // 不能连接同一个音符
      if (tieStartPosition.measureIndex === measureIndex && 
          tieStartPosition.noteIndex === noteIndex) {
        state.tieStartPosition = null;
        state.isTieMode = false;
        return;
      }
      
      // 创建连音线
      const newTie: Tie = {
        id: nanoid(),
        startMeasureIndex: tieStartPosition.measureIndex,
        startNoteIndex: tieStartPosition.noteIndex,
        endMeasureIndex: measureIndex,
        endNoteIndex: noteIndex,
      };
      
      state.document.ties.push(newTie);
      state.tieStartPosition = null;
      state.isTieMode = false;
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  deleteTie: (tieId) => {
    set((state) => {
      state.document.ties = state.document.ties.filter(tie => tie.id !== tieId);
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  cancelTieMode: () => {
    set((state) => {
      state.isTieMode = false;
      state.tieStartPosition = null;
    });
  },

  // ============ 歌词操作 ============
  updateLyrics: (measureIndex, noteIndex, text) => {
    set((state) => {
      const { lyrics } = state.document;
      const trimmedText = text.trim();
      
      // 移除该位置的现有歌词
      const filteredLyrics = lyrics.filter(
        l => !(l.measureIndex === measureIndex && l.noteIndex === noteIndex)
      );
      
      // 如果有新歌词，添加它
      if (trimmedText) {
        filteredLyrics.push({
          measureIndex,
          noteIndex,
          text: trimmedText,
        });
      }
      
      state.document.lyrics = filteredLyrics;
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      // 歌词更新不保存历史记录（太频繁）
    });
  },

  clearAllLyrics: () => {
    set((state) => {
      state.document.lyrics = [];
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  // ============ 历史记录 ============
  undo: () => {
    set((state) => {
      if (state.history.currentIndex <= 0) return;
      
      state.history.currentIndex--;
      const historyState = state.history.states[state.history.currentIndex];
      restoreFromHistory(state, historyState);
      
      state.canUndo = state.history.currentIndex > 0;
      state.canRedo = state.history.currentIndex < state.history.states.length - 1;
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.currentIndex >= state.history.states.length - 1) return;
      
      state.history.currentIndex++;
      const historyState = state.history.states[state.history.currentIndex];
      restoreFromHistory(state, historyState);
      
      state.canUndo = state.history.currentIndex > 0;
      state.canRedo = state.history.currentIndex < state.history.states.length - 1;
    });
  },

  // ============ 导出与保存 ============
  setExporting: (exporting) => {
    set((state) => {
      state.isExporting = exporting;
    });
  },

  setSaving: (saving) => {
    set((state) => {
      state.isSaving = saving;
    });
  },

  markAsSaved: () => {
    set((state) => {
      state.isDirty = false;
    });
  },

  getDocumentSnapshot: () => {
    return JSON.parse(JSON.stringify(get().document));
  },
}))
);
