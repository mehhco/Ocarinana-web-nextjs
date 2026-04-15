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
  Beam,
  Lyric,
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
  
  // 时值线连接工具状态
  isBeamMode: boolean;
  beamStartPosition: { measureIndex: number; noteIndex: number } | null;
  
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
  addNote: (noteValue: NoteValue, duration?: Duration, options?: { hasHighDot?: boolean; hasLowDot?: boolean }) => void;
  addRest: (duration: Duration) => void;
  replaceSelectedNote: (noteValue: NoteValue) => void;
  updateNoteDuration: (duration: Duration) => void;
  toggleHighDot: () => void;
  toggleLowDot: () => void;
  toggleAugmentationDot: () => void;
  addExtension: () => void;
  addBarline: () => void;
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
  
  // 时值线连接操作
  toggleBeamMode: () => void;
  startBeam: (measureIndex: number, noteIndex: number) => void;
  endBeam: (measureIndex: number, noteIndex: number) => void;
  deleteBeam: (beamId: string) => void;
  cancelBeamMode: () => void;
  
  // 歌词操作
  updateLyrics: (measureIndex: number, noteIndex: number, text: string) => void;
  updateLyricsBatch: (entries: Lyric[]) => void;
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
 * 生成稳定ID（用于SSR和客户端一致性）
 */
let idCounter = 0;
function generateStableId(): string {
  idCounter += 1;
  return `id-${idCounter}`;
}

/**
 * 创建初始文档（使用稳定ID避免hydration错误）
 */
function createInitialDocument(override?: Partial<ScoreDocument>): ScoreDocument {
  return {
    version: '1.0',
    scoreId: override?.scoreId || 'draft-new',
    ownerUserId: override?.ownerUserId,
    title: override?.title || DEFAULT_TITLE,
    measures: override?.measures?.map(m => ({
      id: m.id || generateStableId(),
      elements: (m.elements || []).map(e => ({
        ...e,
        id: e.id || generateStableId()
      }))
    })) || [{ id: 'measure-1', elements: [] }],
    ties: override?.ties || [],
    beams: override?.beams || [],
    lyrics: override?.lyrics || [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...override?.settings,
    },
    createdAt: override?.createdAt || '2024-01-01T00:00:00.000Z',
    updatedAt: override?.updatedAt || '2024-01-01T00:00:00.000Z',
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

function getDurationLevel(duration: Duration): number {
  switch (duration) {
    case '1/8': return 1;
    case '1/16': return 2;
    case '1/32': return 3;
    default: return 0;
  }
}

function beamTouchesPosition(beam: Beam, measureIndex: number, noteIndex: number): boolean {
  if (beam.startMeasureIndex !== measureIndex || beam.endMeasureIndex !== measureIndex) {
    return false;
  }

  return beam.startNoteIndex <= noteIndex && noteIndex <= beam.endNoteIndex;
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
  isBeamMode: false,
  beamStartPosition: null,
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
      const initialDoc = createInitialDocument(doc);
      
      // 如果是新文档，生成真实的随机ID
      if (!doc?.scoreId) {
        initialDoc.scoreId = `draft-${Date.now()}-${nanoid(8)}`;
        initialDoc.createdAt = new Date().toISOString();
        initialDoc.updatedAt = new Date().toISOString();
      }
      
      state.document = initialDoc;
      state.selectedMeasureIndex = null;
      state.selectedNoteIndex = null;
      state.isDirty = false;
      state.isTieMode = false;
      state.tieStartPosition = null;
      state.isBeamMode = false;
      state.beamStartPosition = null;
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
  addNote: (noteValue, duration = '1/4', options = {}) => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      const newNote: Note = {
        id: nanoid(),
        type: 'note',
        value: noteValue,
        duration,
        hasHighDot: options.hasHighDot || false,
        hasLowDot: options.hasLowDot || false,
        hasAugmentationDot: false,
      };
      
      // 如果有选中的元素，替换它
      if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
        const measure = document.measures[selectedMeasureIndex];
        const element = measure.elements[selectedNoteIndex];
        
        if (element) {
          if (element.type === 'note') {
            // 保留其他属性，只替换音符值和音高点设置
            measure.elements[selectedNoteIndex] = {
              ...element,
              value: noteValue,
              hasHighDot: options.hasHighDot || false,
              hasLowDot: options.hasLowDot || false,
            };
          } else {
            // 替换为新的音符
            measure.elements[selectedNoteIndex] = newNote;
          }
        }
      } else {
        // 添加到当前最后一个小节
        // 注意：不再限制小节内音符数量，依靠 flex-wrap 自动换行显示
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
            // 不再限制小节内音符数量，依靠 flex-wrap 自动换行显示
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
      
      // 只更新时值，减时线通过渲染逻辑自动显示
      element.duration = duration;

      if (document.beams) {
        document.beams = document.beams.filter(
          beam => !beamTouchesPosition(beam, selectedMeasureIndex, selectedNoteIndex)
        );
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

  toggleAugmentationDot: () => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;

      if (selectedMeasureIndex === null || selectedNoteIndex === null) return;

      const measure = document.measures[selectedMeasureIndex];
      const element = measure.elements[selectedNoteIndex];

      if (!element || element.type !== 'note') return;

      element.hasAugmentationDot = !element.hasAugmentationDot;

      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  addExtension: () => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      let targetMeasureIndex: number;
      let insertIndex: number;
      
      if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
        // 如果有选中元素，在选中元素后添加
        targetMeasureIndex = selectedMeasureIndex;
        insertIndex = selectedNoteIndex + 1;
      } else {
        // 如果没有选中，添加到最后一个小节的末尾
        targetMeasureIndex = document.measures.length - 1;
        insertIndex = document.measures[targetMeasureIndex].elements.length;
      }
      
      const measure = document.measures[targetMeasureIndex];
      
      // 在指定位置添加延长线
      const extension: ScoreElement = {
        id: nanoid(),
        type: 'extension',
        value: '-',
        duration: '1/4',
      };
      
      measure.elements.splice(insertIndex, 0, extension);
      
      // 选中新添加的延长线，方便连续添加
      state.selectedMeasureIndex = targetMeasureIndex;
      state.selectedNoteIndex = insertIndex;
      
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  addBarline: () => {
    set((state) => {
      const { document, selectedMeasureIndex, selectedNoteIndex } = state;
      
      let targetMeasureIndex: number;
      let insertIndex: number;
      
      if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
        // 如果有选中元素，在选中元素后添加
        targetMeasureIndex = selectedMeasureIndex;
        insertIndex = selectedNoteIndex + 1;
      } else {
        // 如果没有选中，添加到最后一个小节的末尾
        targetMeasureIndex = document.measures.length - 1;
        insertIndex = document.measures[targetMeasureIndex].elements.length;
      }
      
      const measure = document.measures[targetMeasureIndex];
      
      // 在指定位置添加小节线
      const barline: ScoreElement = {
        id: nanoid(),
        type: 'barline',
        value: '|',
      };
      
      measure.elements.splice(insertIndex, 0, barline);
      
      // 选中新添加的小节线，方便连续添加
      state.selectedMeasureIndex = targetMeasureIndex;
      state.selectedNoteIndex = insertIndex;
      
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
      document.ties = document.ties?.filter(
        tie => !(tie.startMeasureIndex === selectedMeasureIndex && tie.startNoteIndex === selectedNoteIndex) &&
               !(tie.endMeasureIndex === selectedMeasureIndex && tie.endNoteIndex === selectedNoteIndex)
      );
      
      // 删除相关的时值线连接
      if (document.beams) {
        document.beams = document.beams.filter(
          beam => !beamTouchesPosition(beam, selectedMeasureIndex, selectedNoteIndex)
        );
      }
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
      state.document.ties = state.document.ties?.filter(
        tie => tie.startMeasureIndex !== index && tie.endMeasureIndex !== index
      );
      
      // 删除相关的时值线连接
      if (state.document.beams) {
        state.document.beams = state.document.beams.filter(
          beam => beam.startMeasureIndex !== index && beam.endMeasureIndex !== index
        );
      }
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
      
      state.document.ties = [...(state.document.ties || []), newTie];
      state.tieStartPosition = null;
      state.isTieMode = false;
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },

  deleteTie: (tieId) => {
    set((state) => {
      state.document.ties = state.document.ties?.filter(tie => tie.id !== tieId);
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
  
  // ============ 时值线连接操作 ============
  toggleBeamMode: () => {
    set((state) => {
      state.isBeamMode = !state.isBeamMode;
      if (!state.isBeamMode) {
        state.beamStartPosition = null;
      }
    });
  },
  
  startBeam: (measureIndex, noteIndex) => {
    set((state) => {
      state.beamStartPosition = { measureIndex, noteIndex };
    });
  },
  
  endBeam: (measureIndex, noteIndex) => {
    set((state) => {
      const { beamStartPosition, document } = state;
      
      if (!beamStartPosition) return;

      const resetBeamMode = () => {
        state.beamStartPosition = null;
        state.isBeamMode = false;
      };
      
      // 不能连接同一个音符
      if (beamStartPosition.measureIndex === measureIndex && 
          beamStartPosition.noteIndex === noteIndex) {
        resetBeamMode();
        return;
      }

      // 只支持同一小节内从左到右选择连续音符
      if (beamStartPosition.measureIndex !== measureIndex || beamStartPosition.noteIndex >= noteIndex) {
        resetBeamMode();
        return;
      }
      
      // 获取起始和结束位置的音符
      const startMeasure = document.measures[beamStartPosition.measureIndex];
      const endMeasure = document.measures[measureIndex];
      
      if (!startMeasure || !endMeasure) {
        resetBeamMode();
        return;
      }

      const rangeStart = beamStartPosition.noteIndex;
      const rangeEnd = noteIndex;
      const rangeElements = startMeasure.elements.slice(rangeStart, rangeEnd + 1);

      if (rangeElements.length < 2) {
        resetBeamMode();
        return;
      }

      const durationLevels = rangeElements.map(element => {
        if (!element || element.type !== 'note') return 0;
        return getDurationLevel(element.duration);
      });

      if (durationLevels.some(level => level === 0)) {
        resetBeamMode();
        return;
      }
      
      // 计算 level：取所有参与音符的最小时值层级
      // 1/8 = 1, 1/16 = 2, 1/32 = 3
      const level = Math.min(...durationLevels);
      
      // 创建 Beam 对象
      const newBeam: Beam = {
        id: nanoid(),
        startMeasureIndex: beamStartPosition.measureIndex,
        startNoteIndex: rangeStart,
        endMeasureIndex: measureIndex,
        endNoteIndex: rangeEnd,
        level,
      };
      
      // 确保 document.beams 数组存在
      if (!document.beams) {
        document.beams = [];
      }

      document.beams = document.beams.filter(
        beam => beam.startMeasureIndex !== measureIndex ||
          beam.endMeasureIndex !== measureIndex ||
          beam.endNoteIndex < rangeStart ||
          beam.startNoteIndex > rangeEnd
      );
      
      document.beams.push(newBeam);
      resetBeamMode();
      document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },
  
  deleteBeam: (beamId) => {
    set((state) => {
      if (state.document.beams) {
        state.document.beams = state.document.beams.filter(beam => beam.id !== beamId);
      }
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
      saveToHistory(state);
    });
  },
  
  cancelBeamMode: () => {
    set((state) => {
      state.isBeamMode = false;
      state.beamStartPosition = null;
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

  updateLyricsBatch: (entries) => {
    set((state) => {
      if (entries.length === 0) return;

      const touchedKeys = new Set(entries.map((entry) => `${entry.measureIndex}:${entry.noteIndex}`));
      const filteredLyrics = state.document.lyrics.filter(
        (lyric) => !touchedKeys.has(`${lyric.measureIndex}:${lyric.noteIndex}`)
      );
      const nextEntries = entries
        .map((entry) => ({
          measureIndex: entry.measureIndex,
          noteIndex: entry.noteIndex,
          text: entry.text.trim(),
        }))
        .filter((entry) => entry.text);

      state.document.lyrics = [...filteredLyrics, ...nextEntries];
      state.document.updatedAt = new Date().toISOString();
      state.isDirty = true;
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
