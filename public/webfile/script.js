// =========================================
// 性能优化：WebP 图片支持
// =========================================

// 检测浏览器是否支持 WebP 格式
(function() {
    'use strict';
    
    // 检测 WebP 支持
    function checkWebPSupport() {
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            // 创建一个很小的 WebP 图片并检查是否能正常解码
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }
    
    // 全局变量：标记是否支持 WebP
    window.supportsWebP = checkWebPSupport();
    
    // 性能优化日志
    console.log('🖼️ 图片格式支持:', window.supportsWebP ? 'WebP ✅' : 'PNG 📦');
    
    // 辅助函数：获取优化后的图片路径
    // 如果浏览器支持 WebP，自动将 .png 替换为 .webp
    window.getOptimizedImagePath = function(path) {
        if (window.supportsWebP && path && path.endsWith('.png')) {
            return path.replace('.png', '.webp');
        }
        return path;
    };
})();

// =========================================
// 数据模型
// =========================================

// 简单 UUID 生成（避免引入外部依赖）
function generateUuid() {
    // 仅用于前端临时标识，不保证绝对唯一
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// 读取 URL 查询参数
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// （已移除未使用的文档构造函数，以消除未使用警告）

// 数据模型
class ScoreModel {
    constructor() {
        this.title = '未命名简谱';
        this.measures = [[]];
        this.keySignature = 'C';
        this.timeSignature = '4/4';
        this.tempo = 120;
        this.ties = []; // 存储连音线信息，格式：[{start: {measureIndex, noteIndex}, end: {measureIndex, noteIndex}}]
        this.lyrics = []; // 存储歌词信息，格式：[{measureIndex, noteIndex, text}]
        this.showLyrics = false; // 是否显示歌词输入框
        this.showFingering = false; // 是否显示陶笛指法图
        this.skin = 'white'; // 默认皮肤
        this.scoreId = null; // 当前文档ID（命名空间键）
        this.ownerUserId = ''; // 由父页面提供（可选）
        
        // 新增：持久化状态标记
        this.isPersisted = false; // 是否已持久化到云端
        this.isDraft = false; // 是否是草稿状态
        
        // 历史记录系统
        this.history = []; // 存储所有历史状态
        this.historyIndex = -1; // 当前状态在历史记录中的索引
        this.maxHistorySize = 50; // 最大历史记录数量
        
        // 初始化时保存第一个状态
        this.saveState();
    }

    // 添加歌词
    addLyrics(measureIndex, noteIndex, text) {
        // 移除该位置的现有歌词
        this.lyrics = this.lyrics.filter(lyric => 
            !(lyric.measureIndex === measureIndex && lyric.noteIndex === noteIndex)
        );
        
        if (text && text.trim()) {
            this.lyrics.push({ measureIndex, noteIndex, text: text.trim() });
        }
        this.saveState();
    }

    // 获取歌词
    getLyrics(measureIndex, noteIndex) {
        const lyric = this.lyrics.find(l => 
            l.measureIndex === measureIndex && l.noteIndex === noteIndex
        );
        return lyric ? lyric.text : '';
    }

    // 清空所有歌词
    clearLyrics() {
        this.lyrics = [];
        this.saveState();
    }

    // 智能拆分文本
    splitText(text) {
        // 先按空格拆分（支持英文句子）
        const parts = text.split(/\s+/).filter(part => part.trim());
        const result = [];
        
        parts.forEach(part => {
            if (/^[a-zA-Z0-9]+$/.test(part)) {
                // 英文单词或数字作为一个单位
                result.push(part);
            } else {
                // 中文或其他，按单个字符拆分
                for (let char of part) {
                    if (char.trim()) {
                        result.push(char);
                    }
                }
            }
        });
        
        return result;
    }

    // 添加音符到当前小节
    addNote(note) {
        const currentMeasure = this.measures[this.measures.length - 1];
        currentMeasure.push(note);
        this.saveState();
        
        // 触发滚动到新音符的事件
        this.triggerScrollToNewNote();
    }
    
    // 触发滚动到新音符
    triggerScrollToNewNote() {
        // 使用自定义事件通知视图控制器
        const event = new CustomEvent('noteAdded', {
            detail: { measureIndex: this.measures.length - 1 }
        });
        document.dispatchEvent(event);
    }

    // 添加新的小节
    addMeasure() {
        this.measures.push([]);
        this.saveState();
        
        // 触发滚动到新小节的事件
        this.triggerScrollToNewNote();
    }

    // 删除音符
    deleteNote(measureIndex, noteIndex) {
        if (this.measures[measureIndex]) {
            this.measures[measureIndex].splice(noteIndex, 1);
            this.saveState();
        }
    }

    // 将当前模型转换为可持久化文档
    toDocument() {
        const now = new Date().toISOString();
        return {
            version: '1.0',
            scoreId: this.scoreId || generateUuid(),
            ownerUserId: this.ownerUserId || '',
            title: this.title,
            measures: JSON.parse(JSON.stringify(this.measures)),
            ties: JSON.parse(JSON.stringify(this.ties)),
            lyrics: JSON.parse(JSON.stringify(this.lyrics)),
            settings: {
                keySignature: this.keySignature,
                timeSignature: this.timeSignature,
                tempo: this.tempo,
                skin: this.skin,
                showLyrics: this.showLyrics
                // 注意：根据要求，不保存 showFingering（指法图显示状态），用户可在页面手动开启
            },
            // 首次创建时 createdAt 由加载逻辑或父级注入，这里仅维护 updatedAt
            createdAt: this.createdAt || now,
            updatedAt: now
        };
    }

    // 从文档加载到模型
    loadFromDocument(doc) {
        if (!doc) return;
        this.scoreId = doc.scoreId || this.scoreId || generateUuid();
        this.ownerUserId = doc.ownerUserId || this.ownerUserId || '';
        this.createdAt = doc.createdAt || new Date().toISOString();
        this.title = doc.title || '未命名简谱';
        this.measures = doc.measures || [[]];
        this.ties = doc.ties || [];
        this.lyrics = doc.lyrics || [];
        const s = doc.settings || {};
        this.keySignature = s.keySignature || 'C';
        this.timeSignature = s.timeSignature || '4/4';
        this.tempo = typeof s.tempo === 'number' ? s.tempo : 120;
        this.skin = s.skin || 'white';
        this.showLyrics = !!s.showLyrics;
        this.showFingering = !!s.showFingering;
        
        // 根据 scoreId 格式判断是否已持久化
        // 如果不是 draft- 开头，说明是从云端加载的已持久化乐谱
        if (this.scoreId && !this.scoreId.startsWith('draft-')) {
            this.isPersisted = true;
            this.isDraft = false;
        }
    }

    // 保存当前状态到历史记录
    saveState() {
        const currentState = {
            title: this.title,
            measures: JSON.parse(JSON.stringify(this.measures)),
            keySignature: this.keySignature,
            timeSignature: this.timeSignature,
            tempo: this.tempo,
            lyrics: JSON.parse(JSON.stringify(this.lyrics)),
            showLyrics: this.showLyrics,
            showFingering: this.showFingering,
            skin: this.skin,
            ties: JSON.parse(JSON.stringify(this.ties))
        };

        // 如果当前不在历史记录末尾，删除后面的记录
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // 添加新状态到历史记录
        this.history.push(currentState);
        this.historyIndex++;

        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }

        // 注意：根据最新策略，saveState 仅维护内存历史，不进行持久化或发送自动保存。
        // 持久化仅在用户手动点击“保存”或每隔 1 分钟的定时保存中进行。
    }

    // 撤销 - 回到上一步
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadStateFromHistory(this.historyIndex);
            return true;
        }
        return false;
    }

    // 恢复 - 恢复被撤销的动作
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadStateFromHistory(this.historyIndex);
            return true;
        }
        return false;
    }

    // 从历史记录加载状态
    loadStateFromHistory(index) {
        if (index >= 0 && index < this.history.length) {
            const state = this.history[index];
            this.measures = JSON.parse(JSON.stringify(state.measures));
            this.keySignature = state.keySignature;
            this.timeSignature = state.timeSignature;
            this.lyrics = JSON.parse(JSON.stringify(state.lyrics));
            this.showLyrics = state.showLyrics;
            this.showFingering = state.showFingering;
            this.skin = state.skin;
            this.ties = JSON.parse(JSON.stringify(state.ties));
        }
    }

    // 检查是否可以撤销
    canUndo() {
        return this.historyIndex > 0;
    }

    // 检查是否可以恢复
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    // 生成命名空间本地存储键
    getStorageKey() {
        const scoreId = this.scoreId || 'default';
        return `score:${scoreId}`;
    }

    // 新增：判断是否需要持久化到云端
    shouldPersist() {
        // 如果已经持久化过，后续自动保存也会更新云端
        if (this.isPersisted) {
            return true;
        }
        
        // 如果还是草稿，不管有没有内容，都不自动触发云端保存
        // 只有用户手动点击"保存"按钮时才会触发
        return false;
    }
    
    // 新增：生成乐谱的显示名称（用于确认对话框）
    getDisplayName() {
        // 如果标题不是默认值，使用标题
        if (this.title && this.title !== '未命名简谱' && this.title.trim() !== '') {
            return this.title;
        }
        
        // 如果是默认标题，生成描述性名称
        const noteCount = this.measures.reduce((count, measure) => {
            return count + measure.filter(note => note.type === 'note').length;
        }, 0);
        
        if (noteCount > 0) {
            return `未命名简谱（${noteCount}个音符）`;
        }
        
        return `未命名简谱（${this.keySignature}调 ${this.timeSignature}拍）`;
    }

    // 从本地存储加载状态（优先使用命名空间文档；回退到旧格式）
    loadStatePreferred(scoreIdFromUrl, ownerUserIdFromParent) {
        this.ownerUserId = ownerUserIdFromParent || this.ownerUserId || '';

        // 识别是否是草稿ID
        if (scoreIdFromUrl && scoreIdFromUrl.startsWith('draft-')) {
            this.isDraft = true;
            this.isPersisted = false;
            this.scoreId = scoreIdFromUrl; // 使用临时草稿ID
            // 尝试从localStorage恢复草稿
            const key = this.getStorageKey();
            const docRaw = localStorage.getItem(key);
            if (docRaw) {
                try {
                    const doc = JSON.parse(docRaw);
                    this.loadFromDocument(doc);
                } catch (e) {
                    console.warn('解析草稿文档失败:', e);
                }
            }
        } else if (scoreIdFromUrl) {
            // 真实ID，标记为已持久化
            this.isPersisted = true;
            this.isDraft = false;
            this.scoreId = scoreIdFromUrl;
            // 正常加载逻辑
            const key = this.getStorageKey();
            const docRaw = localStorage.getItem(key);
            if (docRaw) {
                try {
                    const doc = JSON.parse(docRaw);
                    this.loadFromDocument(doc);
                } catch (e) {
                    console.warn('解析命名空间文档失败，尝试回退到旧格式:', e);
                    this.loadStateLegacy();
                }
            }
        } else {
            // 无ID，生成新草稿
            this.isDraft = true;
            this.isPersisted = false;
            this.scoreId = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // 确保保存一次，以建立文档与历史记录
        this.saveState();
    }

    // 旧格式恢复逻辑（兼容早期本地 key）
    loadStateLegacy() {
        const stateStr = localStorage.getItem('scoreData');
        if (!stateStr) return;
        try {
            const state = JSON.parse(stateStr);
            this.measures = state.measures || [[]];
            this.keySignature = state.keySignature || 'C';
            this.timeSignature = state.timeSignature || '4/4';
            this.tempo = typeof state.tempo === 'number' ? state.tempo : 120;
            this.lyrics = state.lyrics || [];
            this.showLyrics = state.showLyrics || false;
            this.showFingering = state.showFingering || false;
            this.skin = state.skin || 'white';
            this.ties = state.ties || [];
            // 重建历史
            this.history = [];
            this.historyIndex = -1;
        } catch {}
    }

    // 通知父页面进行自动保存（节流）
    notifyParentAutosave(doc) {
        try {
            if (!this._autosaveScheduled) {
                this._autosaveScheduled = true;
                setTimeout(() => {
                    this._autosaveScheduled = false;
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'score:autosave', payload: doc }, '*');
                    }
                }, 300);
            }
        } catch {}
    }
}

// 陶笛指法图映射（PNG 格式，会自动转换为 WebP）
const FINGERING_MAPS = {
    'C': {
        "1": "./static/C-graph/1.png",
        "2": "./static/C-graph/2.png",
        "3": "./static/C-graph/3.png",
        "4": "./static/C-graph/4.png",
        "5": "./static/C-graph/5.png",
        "6": "./static/C-graph/6.png",
        "7": "./static/C-graph/7.png",
        "1-high": "./static/C-graph/1h.png",
        "2-high": "./static/C-graph/2h.png",
        "3-high": "./static/C-graph/3h.png",
        "4-high": "./static/C-graph/4h.png",
        "6-low": "./static/C-graph/6l.png",
        "7-low": "./static/C-graph/7l.png"
    },
    'F': {
        "1": "./static/F-graph/1.png",
        "2": "./static/F-graph/2.png",
        "3": "./static/F-graph/3.png",
        "4": "./static/F-graph/4.png",
        "5": "./static/F-graph/5.png",
        "6": "./static/F-graph/6.png",
        "7": "./static/F-graph/7.png",
        "1-high": "./static/F-graph/1h.png",
        "3-low": "./static/F-graph/3l.png",
        "4-low": "./static/F-graph/4l.png",
        "5-low": "./static/F-graph/5l.png",
        "6-low": "./static/F-graph/6l.png",
        "7-low": "./static/F-graph/7l.png"
    },
    'G': {
        "1": "./static/G-graph/1.png",
        "2": "./static/G-graph/2.png",
        "3": "./static/G-graph/3.png",
        "4": "./static/G-graph/4.png",
        "5": "./static/G-graph/5.png",
        "6": "./static/G-graph/6.png",
        "7": "./static/G-graph/7.png",
        "2-low": "./static/G-graph/2l.png",
        "3-low": "./static/G-graph/3l.png",
        "4-low": "./static/G-graph/4l.png",
        "5-low": "./static/G-graph/5l.png",
        "6-low": "./static/G-graph/6l.png",
        "7-low": "./static/G-graph/7l.png"
    }
};

// 性能优化：自动将所有图片路径转换为 WebP（如果浏览器支持）
(function() {
    'use strict';
    
    // 遍历所有调号
    Object.keys(FINGERING_MAPS).forEach(function(key) {
        const fingeringMap = FINGERING_MAPS[key];
        
        // 遍历该调号下的所有音符
        Object.keys(fingeringMap).forEach(function(note) {
            // 将 PNG 路径转换为优化后的路径（WebP 或 PNG）
            fingeringMap[note] = window.getOptimizedImagePath(fingeringMap[note]);
        });
    });
    
    // 性能优化日志
    const totalImages = Object.values(FINGERING_MAPS).reduce(function(sum, map) {
        return sum + Object.keys(map).length;
    }, 0);
    
    console.log('🎵 指法图已优化:', totalImages, '张图片', 
                window.supportsWebP ? '(使用 WebP 格式)' : '(使用 PNG 格式)');
})();

// 视图控制器
class ScoreViewController {
    constructor() {
        this.model = new ScoreModel();
        this.initializeEventListeners();
        
        // 性能优化相关属性
        this.renderQueue = []; // 渲染队列
        this.isRendering = false; // 是否正在渲染
        this.lastRenderTime = 0; // 上次渲染时间
        this.renderThrottle = 16; // 渲染节流间隔（约60fps）
        this.domCache = new Map(); // DOM节点缓存
        this.imageCache = new Map(); // 图片缓存
        this.measureElements = new Map(); // 小节元素缓存
        
        // 虚拟滚动相关属性
        this.visibleMeasures = new Set(); // 当前可见的小节
        this.measureHeight = 120; // 每个小节的预估高度
        this.containerHeight = 0; // 容器高度
        this.scrollTop = 0; // 当前滚动位置
        this.bufferSize = 3; // 缓冲区大小（上下各多渲染几个小节）
        this.maxVisibleMeasures = 20; // 最大同时可见的小节数
    }

    initializeEventListeners() {
        // 使用事件委托优化音符按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.matches('.element-btn[data-note]')) {
                const note = {
                    type: 'note',
                    value: e.target.dataset.note,
                    duration: '1/4' // 默认为四分音符
                };
                this.model.addNote(note);
                this.safeRender();
                this.updateUndoRedoButtons();
            }
        });

        // 使用事件委托优化时值按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.matches('.element-btn[data-duration]')) {
                const selectedNote = document.querySelector('.score-note.selected');
                if (selectedNote) {
                    const measureIndex = parseInt(selectedNote.dataset.measureIndex);
                    const noteIndex = parseInt(selectedNote.dataset.noteIndex);
                    const duration = e.target.dataset.duration;
                    const note = this.model.measures[measureIndex][noteIndex];

                    // 更新选中符号的时值
                    note.duration = duration;

                    // 处理全音符和二分音符的特殊情况
                    // 音符和休止符都需要添加延长线以实现相同的视觉效果
                    if (duration === '1') {
                        // 全音符：在符号后添加三个延长线
                        for (let i = 0; i < 3; i++) {
                            this.model.measures[measureIndex].splice(noteIndex + 1 + i, 0, {
                                type: 'extension',
                                value: '-',
                                duration: '1/4'
                            });
                        }
                    } else if (duration === '1/2') {
                        // 二分音符：在符号后添加一个延长线
                        this.model.measures[measureIndex].splice(noteIndex + 1, 0, {
                            type: 'extension',
                            value: '-',
                            duration: '1/4'
                        });
                    }

                    this.model.saveState();
                    this.safeRender();
                    this.updateUndoRedoButtons();
                }
            }
        });

        // 使用事件委托优化休止符按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.matches('.element-btn[data-rest]')) {
                const duration = e.target.dataset.rest;
                
                // 根据用户需求优化全休止符和二分休止符
                if (duration === '1') {
                    // 全休止符：生成4个0，每个0占据一个位格
                    for (let i = 0; i < 4; i++) {
                        const rest = {
                            type: 'rest',
                            value: '0',
                            duration: '1/4', // 每个0都是四分休止符
                            restGroup: 'full' // 标记为全休止符组
                        };
                        this.model.addNote(rest);
                    }
                } else if (duration === '1/2') {
                    // 二分休止符：生成2个0，每个0占据一个位格
                    for (let i = 0; i < 2; i++) {
                        const rest = {
                            type: 'rest',
                            value: '0',
                            duration: '1/4', // 每个0都是四分休止符
                            restGroup: 'half' // 标记为二分休止符组
                        };
                        this.model.addNote(rest);
                    }
                } else {
                    // 其他休止符保持原有实现
                    const rest = {
                        type: 'rest',
                        value: '0',
                        duration: duration
                    };
                    this.model.addNote(rest);
                }
                this.safeRender();
                this.updateUndoRedoButtons();
            }
        });

        // 修饰符号按钮事件
        document.querySelectorAll('.element-btn[data-modifier]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedNote = document.querySelector('.score-note.selected');
                if (selectedNote) {
                    const measureIndex = parseInt(selectedNote.dataset.measureIndex);
                    const noteIndex = parseInt(selectedNote.dataset.noteIndex);
                    const note = this.model.measures[measureIndex][noteIndex];
                    
                    if (!note.modifiers) {
                        note.modifiers = [];
                    }
                    
                    const modifier = e.target.dataset.modifier;
                    if (!note.modifiers.includes(modifier)) {
                        // 移除冲突的修饰符（如果有升号，就移除降号和还原号）
                        if (modifier === 'sharp') {
                            note.modifiers = note.modifiers.filter(m => m !== 'flat' && m !== 'natural');
                        } else if (modifier === 'flat') {
                            note.modifiers = note.modifiers.filter(m => m !== 'sharp' && m !== 'natural');
                        } else if (modifier === 'natural') {
                            note.modifiers = note.modifiers.filter(m => m !== 'sharp' && m !== 'flat');
                        }
                        note.modifiers.push(modifier);
                    }
                    
                    this.model.saveState();
                    this.safeRender();
                    this.updateUndoRedoButtons();
                }
            });
        });

        // 高音点和低音点按钮事件
        document.querySelectorAll('.element-btn[data-octave]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedNote = document.querySelector('.score-note.selected');
                if (selectedNote && selectedNote.dataset.type === 'note') {
                    const measureIndex = parseInt(selectedNote.dataset.measureIndex);
                    const noteIndex = parseInt(selectedNote.dataset.noteIndex);
                    const note = this.model.measures[measureIndex][noteIndex];
                    
                    const octave = e.target.dataset.octave;
                    
                    // 如果点击的是相同的高音点或低音点，则移除它
                    if (note.octave === octave) {
                        delete note.octave;
                    } else {
                        // 否则设置新的高音点或低音点
                        note.octave = octave;
                    }
                    
                    this.model.saveState();
                    this.safeRender();
                    this.updateUndoRedoButtons();
                } else {
                    alert('请先选择一个音符');
                }
            });
        });

        // 特殊符号按钮事件
        document.querySelectorAll('.element-btn[data-special]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const specialType = e.target.dataset.special;
                if (specialType === 'tie') {
                    this.handleTieClick();
                } else {
                    const special = {
                        type: 'special',
                        value: specialType
                    };
                    this.model.addNote(special);
                    this.safeRender();
                    this.updateUndoRedoButtons();
                }
            });
        });

        // 调号选择事件
        document.getElementById('keySignature').addEventListener('change', (e) => {
            console.log('调号选择事件触发:', e.target.value);
            this.model.keySignature = e.target.value;
            this.model.saveState();
            this.render();
            this.updateUndoRedoButtons();
        });

        // 拍号选择事件
        document.getElementById('timeSignature').addEventListener('change', (e) => {
            console.log('拍号选择事件触发:', e.target.value);
            this.model.timeSignature = e.target.value;
            this.model.saveState();
            this.render();
            this.updateUndoRedoButtons();
        });

        // 皮肤选择事件
        document.getElementById('scoreSkin').addEventListener('change', (e) => {
            this.model.skin = e.target.value;
            this.model.saveState();
            this.render();
            this.applySkin();
            this.updateUndoRedoButtons();
        });

        // 标题输入事件
        document.getElementById('scoreTitle').addEventListener('input', (e) => {
            console.log('标题输入事件触发:', e.target.value);
            this.model.title = e.target.value;
            this.model.saveState();
            this.render();
            this.updateUndoRedoButtons();
        });

        // 撤销事件
        document.getElementById('undoBtn').addEventListener('click', () => {
            if (this.model.undo()) {
                this.render();
                this.updateUndoRedoButtons();
            }
        });

        // 恢复事件
        document.getElementById('redoBtn').addEventListener('click', () => {
            if (this.model.redo()) {
                this.render();
                this.updateUndoRedoButtons();
            }
        });



        // 导出事件
        document.getElementById('exportImage').addEventListener('click', () => {
            this.exportAsImage();
        });

        // 手动保存事件
        const saveBtn = document.getElementById('saveScore');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.persistNow('manual');
            });
        }

        // 歌词功能事件
        document.getElementById('toggleLyrics').addEventListener('click', () => {
            this.toggleLyricsDisplay();
        });

        document.getElementById('clearLyrics').addEventListener('click', () => {
            this.clearAllLyrics();
        });

        // 指法图功能事件
        document.getElementById('toggleFingering').addEventListener('click', () => {
            this.toggleFingeringDisplay();
        });

        // 统一的事件委托处理器 - 处理音符点击和歌词输入
        this.setupEventDelegation();
        
        // 设置虚拟滚动
        this.setupVirtualScrolling();
        
        // 监听音符添加事件，自动滚动到新音符
        document.addEventListener('noteAdded', (e) => {
            this.scrollToNewNote(e.detail.measureIndex);
        });
        
        // 启动每分钟自动保存
        this.startAutoPersist();
    }

    // 设置事件委托
    setupEventDelegation() {
        const container = document.getElementById('score-container');
        
        // 音符点击事件委托
        container.addEventListener('click', (e) => {
            if (e.target.matches('.score-note') || e.target.closest('.score-note')) {
                const noteElement = e.target.matches('.score-note') ? e.target : e.target.closest('.score-note');
                this.selectNote(noteElement);
            }
        });

        // 歌词输入事件委托
        container.addEventListener('input', (e) => {
            if (e.target.matches('.lyrics-input')) {
                // 记录输入过程中的临时值，兼容中文输入法组合态
                try {
                    e.target.setAttribute('data-pending-value', e.target.value || '');
                } catch {}
                this.handleLyricsInputEvent(e);
            }
        });

        // 歌词键盘事件委托
        container.addEventListener('keydown', (e) => {
            if (e.target.matches('.lyrics-input')) {
                const measureIndex = parseInt(e.target.dataset.measureIndex);
                const noteIndex = parseInt(e.target.dataset.noteIndex);
                this.handleLyricsKeydown(e, measureIndex, noteIndex);
            }
        });

        // 输入法事件委托
        container.addEventListener('compositionstart', (e) => {
            if (e.target.matches('.lyrics-input')) {
                e.target.setAttribute('data-composing', 'true');
                try { e.target.setAttribute('data-pending-value', e.target.value || ''); } catch {}
            }
        });

        container.addEventListener('compositionupdate', (e) => {
            if (e.target.matches('.lyrics-input')) {
                e.target.setAttribute('data-composing', 'true');
                try { e.target.setAttribute('data-pending-value', e.target.value || ''); } catch {}
            }
        });

        container.addEventListener('compositionend', (e) => {
            if (e.target.matches('.lyrics-input')) {
                e.target.removeAttribute('data-composing');
                try { e.target.setAttribute('data-pending-value', e.target.value || ''); } catch {}
            }
        });
    }

    // 处理歌词输入事件
    handleLyricsInputEvent(e) {
        const input = e.target;
        const value = input.value;
        const measureIndex = parseInt(input.dataset.measureIndex);
        const noteIndex = parseInt(input.dataset.noteIndex);
        
        // 如果 IME 正在组合，跳过处理
        if (e.isComposing) {
            return;
        }
        
        // 直接保存输入的完整内容，不再自动拆分
        // 每个输入框可以容纳一个完整的中文字符或英文单词
        this.model.addLyrics(measureIndex, noteIndex, value);
    }

    // 设置虚拟滚动
    setupVirtualScrolling() {
        const editor = document.querySelector('.score-editor');
        
        // 监听滚动事件
        editor.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.updateContainerDimensions();
        });
        
        // 初始化容器尺寸
        this.updateContainerDimensions();
    }

    // 更新容器尺寸
    updateContainerDimensions() {
        const editor = document.querySelector('.score-editor');
        this.containerHeight = editor.clientHeight;
    }

    // 处理滚动事件
    handleScroll() {
        const editor = document.querySelector('.score-editor');
        this.scrollTop = editor.scrollTop;
        
        // 节流滚动处理
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        this.scrollTimeout = setTimeout(() => {
            this.updateVisibleMeasures();
        }, 16); // 约60fps
    }

    // 更新可见小节
    updateVisibleMeasures() {
        const startIndex = Math.floor(this.scrollTop / this.measureHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(this.containerHeight / this.measureHeight) + this.bufferSize,
            this.model.measures.length - 1
        );
        
        const newVisibleMeasures = new Set();
        for (let i = Math.max(0, startIndex - this.bufferSize); i <= endIndex; i++) {
            newVisibleMeasures.add(i);
        }
        
        // 检查是否需要重新渲染
        if (!this.setsEqual(this.visibleMeasures, newVisibleMeasures)) {
            this.visibleMeasures = newVisibleMeasures;
            this.renderVisibleMeasures();
        }
        
        // 更新容器高度以适应新的音符数量
        this.updateContainerHeight();
    }
    
    // 更新容器高度
    updateContainerHeight() {
        const container = document.getElementById('score-container');
        const totalHeight = this.model.measures.length * this.measureHeight;
        container.style.minHeight = totalHeight + 'px';
    }
    
    // 更新传统渲染模式下的容器高度
    updateContainerHeightForTraditional() {
        const container = document.getElementById('score-container');
        // 让容器自然扩展，但确保最小高度
        container.style.height = 'auto';
        container.style.minHeight = Math.max(500, this.model.measures.length * 120) + 'px';
    }
    
    // 检查是否需要切换渲染模式
    checkRenderModeSwitch() {
        const shouldUseVirtualScrolling = this.model.measures.length > this.maxVisibleMeasures;
        const currentlyUsingVirtual = this.visibleMeasures.size > 0;
        
        // 如果渲染模式需要切换，强制重新渲染
        if (shouldUseVirtualScrolling !== currentlyUsingVirtual) {
            console.log('检测到渲染模式切换，重新渲染...');
            this.render(true); // 强制全量渲染
        }
    }

    // 比较两个Set是否相等
    setsEqual(set1, set2) {
        if (set1.size !== set2.size) return false;
        for (let item of set1) {
            if (!set2.has(item)) return false;
        }
        return true;
    }

    // 渲染可见的小节
    renderVisibleMeasures() {
        
        // 移除不可见的小节
        this.measureElements.forEach((element, index) => {
            if (!this.visibleMeasures.has(index)) {
                element.remove();
                this.measureElements.delete(index);
            }
        });
        
        // 渲染可见的小节
        this.visibleMeasures.forEach(measureIndex => {
            if (!this.measureElements.has(measureIndex)) {
                const measureElement = this.createMeasureElement(measureIndex);
                this.measureElements.set(measureIndex, measureElement);
                
                // 插入到正确的位置
                this.insertMeasureAtPosition(measureElement, measureIndex);
            }
        });
    }

    // 创建小节元素
    createMeasureElement(measureIndex) {
        const measure = this.model.measures[measureIndex];
        const measureElement = document.createElement('div');
        measureElement.className = 'score-measure';
        measureElement.dataset.measureIndex = measureIndex;
        
        // 设置虚拟高度
        measureElement.style.minHeight = this.measureHeight + 'px';
        
        // 批量创建音符元素
        const noteFragment = document.createDocumentFragment();
        measure.forEach((note, noteIndex) => {
            const noteElement = this.createNoteElement(note, measureIndex, noteIndex);
            noteFragment.appendChild(noteElement);
        });
        
        measureElement.appendChild(noteFragment);
        return measureElement;
    }

    // 在正确位置插入小节
    insertMeasureAtPosition(measureElement, measureIndex) {
        const container = document.getElementById('score-container');
        const existingMeasures = Array.from(container.querySelectorAll('.score-measure'));
        
        // 找到插入位置
        let insertBefore = null;
        for (let existing of existingMeasures) {
            const existingIndex = parseInt(existing.dataset.measureIndex);
            if (existingIndex > measureIndex) {
                insertBefore = existing;
                break;
            }
        }
        
        if (insertBefore) {
            container.insertBefore(measureElement, insertBefore);
        } else {
            container.appendChild(measureElement);
        }
    }

    // 滚动到新添加的音符
    scrollToNewNote(measureIndex) {
        // 延迟执行，确保DOM已更新
        setTimeout(() => {
            const editor = document.querySelector('.score-editor');
            
            if (this.model.measures.length <= this.maxVisibleMeasures) {
                // 少量音符时，滚动到容器底部
                editor.scrollTop = editor.scrollHeight;
            } else {
                // 大量音符时，滚动到指定小节
                const targetY = measureIndex * this.measureHeight;
                editor.scrollTop = Math.max(0, targetY - this.containerHeight / 2);
            }
        }, 100);
    }

    // 优化的渲染方法 - 使用增量渲染和DOM复用
    render(forceFullRender = false) {
        const now = Date.now();
        
        // 渲染节流 - 避免过于频繁的渲染
        if (!forceFullRender && now - this.lastRenderTime < this.renderThrottle) {
            this.scheduleRender();
            return;
        }
        
        this.lastRenderTime = now;
        
        const container = document.getElementById('score-container');
        
        // 应用当前皮肤
        this.applySkin();
        
        // 重置连音线状态
        if (this.tieInProgress) {
            this.tieInProgress = false;
            document.querySelectorAll('.tie-source, .tie-target').forEach(el => {
                el.classList.remove('tie-source', 'tie-target');
            });
        }

        // 如果是强制全量渲染或首次渲染，清空容器
        if (forceFullRender || container.children.length === 0) {
            container.innerHTML = '';
            this.domCache.clear();
            this.measureElements.clear();
            this.visibleMeasures.clear();
        }

        // 更新乐谱标题（每次渲染都更新）
        let titleHeader = container.querySelector('.score-title');
        if (!titleHeader) {
            titleHeader = this.getOrCreateElement('h1', 'score-title');
            container.insertBefore(titleHeader, container.firstChild);
        }
        titleHeader.textContent = this.model.title;

        // 更新调号和拍号（每次渲染都更新）
        let header = container.querySelector('.score-header');
        if (!header) {
            header = this.getOrCreateElement('div', 'score-header');
            container.insertBefore(header, titleHeader.nextSibling);
        }
        header.textContent = `${this.model.keySignature} ${this.model.timeSignature}`;

        // 如果是强制全量渲染或首次渲染，设置虚拟滚动
        if (forceFullRender || container.children.length === 2) {
            this.setupVirtualScrollContainer();
        }

        // 根据音符数量决定渲染策略
        const shouldUseVirtualScrolling = this.model.measures.length > this.maxVisibleMeasures;
        
        if (shouldUseVirtualScrolling) {
            // 大量音符时使用虚拟滚动
            this.setupVirtualScrollContainer();
            this.updateVisibleMeasures();
        } else {
            // 少量音符时使用传统渲染，允许动态扩展
            container.style.height = 'auto';
            container.style.minHeight = '500px';
            this.renderAllMeasures(container);
            // 确保容器高度适应内容
            this.updateContainerHeightForTraditional();
        }
        
        // 记录当前渲染模式，用于调试
        console.log(`渲染模式: ${shouldUseVirtualScrolling ? '虚拟滚动' : '传统渲染'}, 小节数: ${this.model.measures.length}`);

        // 检查是否需要切换渲染模式
        this.checkRenderModeSwitch();

        // 异步渲染连音线，避免阻塞主线程
        requestAnimationFrame(() => {
            this.renderTies(container);
        });

        // 确保歌词显示状态与CSS类同步
        this.syncLyricsDisplayState();
    }

    // 安全渲染方法：渲染前先同步歌词内容
    safeRender() {
        // 在重新渲染前，先同步所有歌词输入框的当前值到数据模型
        this.syncLyricsFromInputs();
        this.render();
    }

    // 设置虚拟滚动容器
    setupVirtualScrollContainer() {
        const container = document.getElementById('score-container');
        const totalHeight = this.model.measures.length * this.measureHeight;
        
        // 设置容器的总高度，但允许动态扩展
        container.style.minHeight = totalHeight + 'px';
        container.style.height = 'auto'; // 允许自动扩展
        container.style.position = 'relative';
    }

    // 渲染所有小节（传统方式）
    renderAllMeasures(container) {
        // 使用DocumentFragment进行批量DOM操作
        const fragment = document.createDocumentFragment();
        
        // 渲染小节 - 使用增量渲染
        this.model.measures.forEach((measure, measureIndex) => {
            const measureElement = this.getOrCreateMeasureElement(measureIndex);
            
            // 清空现有音符
            measureElement.innerHTML = '';
            
            // 批量创建音符元素
            const noteFragment = document.createDocumentFragment();
            measure.forEach((note, noteIndex) => {
                const noteElement = this.createNoteElement(note, measureIndex, noteIndex);
                noteFragment.appendChild(noteElement);
            });
            
            measureElement.appendChild(noteFragment);
            fragment.appendChild(measureElement);
        });

        // 批量添加到容器
        if (fragment.children.length > 0) {
            container.appendChild(fragment);
        }
    }

    // 调度渲染 - 防抖处理
    scheduleRender() {
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        this.renderTimeout = setTimeout(() => {
            this.render(true);
        }, this.renderThrottle);
    }

    // 获取或创建DOM元素（缓存机制）
    getOrCreateElement(tagName, className) {
        const cacheKey = `${tagName}.${className}`;
        if (this.domCache.has(cacheKey)) {
            return this.domCache.get(cacheKey).cloneNode(true);
        }
        
        const element = document.createElement(tagName);
        element.className = className;
        this.domCache.set(cacheKey, element);
        return element;
    }

    // 获取或创建小节元素
    getOrCreateMeasureElement(measureIndex) {
        if (this.measureElements.has(measureIndex)) {
            return this.measureElements.get(measureIndex);
        }
        
            const measureElement = document.createElement('div');
            measureElement.className = 'score-measure';
        measureElement.dataset.measureIndex = measureIndex;
        this.measureElements.set(measureIndex, measureElement);
        return measureElement;
    }
            
    // 创建音符元素 - 优化版本
    createNoteElement(note, measureIndex, noteIndex) {
                const noteElement = document.createElement('span');
                noteElement.className = 'score-note';
        noteElement.dataset.measureIndex = measureIndex;
        noteElement.dataset.noteIndex = noteIndex;
        noteElement.dataset.type = note.type;
        
        // 使用事件委托，不在这里添加事件监听器
        // 事件监听器将在容器级别统一处理
                
                // 根据不同类型的符号来渲染
                switch (note.type) {
                    case 'extension':
                        noteElement.className = 'score-note extension-mark';
                noteElement.setAttribute('data-content', '_');
                        break;
                
                    case 'note':
                this.renderNoteElement(noteElement, note);
                break;
                
            case 'rest':
                this.renderRestElement(noteElement, note);
                break;
                
            case 'special':
                this.renderSpecialElement(noteElement, note);
                break;
        }
        
        // 添加歌词输入框（如果启用且是音符或休止符）
        if (this.model.showLyrics && (note.type === 'note' || note.type === 'rest')) {
            this.addLyricsInput(noteElement, measureIndex, noteIndex);
        }
        
        return noteElement;
    }

    // 渲染音符元素
    renderNoteElement(noteElement, note) {
                        // 创建主音符元素
                        const mainNote = document.createElement('span');
                        mainNote.className = 'main-note';
                        mainNote.textContent = note.value;
                        noteElement.appendChild(mainNote);

                        // 添加修饰符
                        if (note.modifiers && note.modifiers.length > 0) {
                            note.modifiers.forEach(modifier => {
                                const modifierElement = document.createElement('span');
                                modifierElement.className = `modifier ${modifier}`;
                                switch (modifier) {
                                    case 'sharp':
                                        modifierElement.textContent = '♯';
                                        break;
                                    case 'flat':
                                        modifierElement.textContent = '♭';
                                        break;
                                    case 'natural':
                                        modifierElement.textContent = '♮';
                                        break;
                                    case 'dot':
                                        modifierElement.textContent = '·';
                                        break;
                                }
                                noteElement.appendChild(modifierElement);
                            });
                        }

                        // 添加时值标记
        this.addDurationMark(noteElement, note.duration);

        // 添加高音点或低音点
                        if (note.octave === 'high') {
                            const highDot = document.createElement('span');
                            highDot.className = 'high-dot';
                            highDot.textContent = '·';
                            noteElement.appendChild(highDot);
                        } else if (note.octave === 'low') {
                            const lowDot = document.createElement('span');
                            lowDot.className = 'low-dot';
                            lowDot.textContent = '·';
                            noteElement.appendChild(lowDot);
                        }

                        // 添加陶笛指法图（如果启用）
                        if (this.model.showFingering) {
            this.addFingeringImage(noteElement, note);
        }
    }

    // 渲染休止符元素
    renderRestElement(noteElement, note) {
                        const mainRest = document.createElement('span');
                        mainRest.className = 'main-rest';
                        mainRest.textContent = note.value;
                        noteElement.appendChild(mainRest);

                        // 添加修饰符
                        if (note.modifiers && note.modifiers.length > 0) {
                            note.modifiers.forEach(modifier => {
                                const modifierElement = document.createElement('span');
                                modifierElement.className = `modifier ${modifier}`;
                                switch (modifier) {
                                    case 'sharp':
                                        modifierElement.textContent = '♯';
                                        break;
                                    case 'flat':
                                        modifierElement.textContent = '♭';
                                        break;
                                    case 'natural':
                                        modifierElement.textContent = '♮';
                                        break;
                                    case 'dot':
                                        modifierElement.textContent = '·';
                                        break;
                                }
                                noteElement.appendChild(modifierElement);
                            });
                        }

                        // 添加时值标记
        this.addDurationMark(noteElement, note.duration);
    }

    // 渲染特殊符号元素
    renderSpecialElement(noteElement, note) {
                        noteElement.dataset.special = note.value;
                        switch (note.value) {
                            case 'bar':
                                // 小节线使用 border-right 样式实现
                                break;
                            case 'repeat-start':
                                noteElement.textContent = ':|';
                                break;
                            case 'repeat-end':
                                noteElement.textContent = '|:';
                                break;
                            case 'tie':
                                // 连音线特殊处理已移至单独的渲染方法
                                break;
                        }
    }

    // 添加时值标记
    addDurationMark(noteElement, duration) {
        const durationMark = document.createElement('span');
        switch (duration) {
            case '1/8':
                durationMark.className = 'duration-mark eighth-note';
                noteElement.appendChild(durationMark);
                break;
            case '1/16':
                durationMark.className = 'duration-mark sixteenth-note';
                noteElement.appendChild(durationMark);
                break;
            case '1/32':
                durationMark.className = 'duration-mark thirty-second-note';
                const thirdLine = document.createElement('span');
                durationMark.appendChild(thirdLine);
                noteElement.appendChild(durationMark);
                        break;
        }
    }

    // 优化的指法图添加方法
    addFingeringImage(noteElement, note) {
        const fingeringUrl = this.getFingeringUrl(note);
        if (!fingeringUrl) return;

        // 检查图片缓存
        if (this.imageCache.has(fingeringUrl)) {
            const cachedImg = this.imageCache.get(fingeringUrl).cloneNode(true);
            const container = document.createElement('div');
            container.className = 'fingering-container';
            container.appendChild(cachedImg);
            noteElement.appendChild(container);
            return;
        }
                        
        // 创建图片容器
        const fingeringContainer = document.createElement('div');
        fingeringContainer.className = 'fingering-container';
        
        // 创建图片元素
        const fingeringImg = new Image();
        fingeringImg.className = 'fingering-image';
        fingeringImg.alt = `指法图 ${note.value}`;
        
        // 设置图片加载事件监听器
        fingeringImg.onload = () => {
            fingeringImg.style.display = 'block';
            fingeringImg.style.visibility = 'visible';
            fingeringImg.classList.add('loaded');
            
            // 缓存已加载的图片
            const cachedImg = fingeringImg.cloneNode(true);
            this.imageCache.set(fingeringUrl, cachedImg);
        };
        
        fingeringImg.onerror = () => {
            // 图片加载失败时，直接移除容器，不显示任何错误信息
            if (fingeringContainer.parentNode) {
                fingeringContainer.parentNode.removeChild(fingeringContainer);
            }
        };
        
        fingeringContainer.appendChild(fingeringImg);
        noteElement.appendChild(fingeringContainer);
        
        // 立即设置src以触发加载
        fingeringImg.src = fingeringUrl;
    }

    // 添加歌词输入框
    addLyricsInput(noteElement, measureIndex, noteIndex) {
        const lyricsInput = document.createElement('input');
        lyricsInput.type = 'text';
        lyricsInput.className = 'lyrics-input';
        lyricsInput.value = this.model.getLyrics(measureIndex, noteIndex);
        lyricsInput.dataset.measureIndex = measureIndex;
        lyricsInput.dataset.noteIndex = noteIndex;
        // 移除 maxLength 限制，允许输入完整的中文字符或英文单词
        
        // 使用事件委托，不在这里添加事件监听器
        noteElement.appendChild(lyricsInput);
        noteElement.classList.add('has-lyrics-input');
    }

    selectNote(noteElement) {
        if (this.tieInProgress) {
            // 如果正在创建连音线，这是第二个音符
            const endMeasureIndex = parseInt(noteElement.dataset.measureIndex);
            const endNoteIndex = parseInt(noteElement.dataset.noteIndex);
            
            // 检查是否是有效的连音线终点（必须是音符，不能是休止符或特殊符号）
            if (noteElement.dataset.type === 'note') {
                // 添加新的连音线
                const newTie = {
                    start: this.tieStartNote,
                    end: { measureIndex: endMeasureIndex, noteIndex: endNoteIndex }
                };
                
                console.log('Adding new tie:', newTie);
                this.model.ties.push(newTie);
                
                // 清除连音线创建状态
                this.tieInProgress = false;
                document.querySelectorAll('.tie-target').forEach(el => {
                    el.classList.remove('tie-target');
                });
                document.querySelectorAll('.tie-source').forEach(el => {
                    el.classList.remove('tie-source');
                });
                
                this.model.saveState();
                this.render();
                
                // 确保连音线被渲染
                const container = document.getElementById('score-container');
                this.renderTies(container);
            }
        } else {
            // 移除其他音符的选中状态
            document.querySelectorAll('.score-note.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 添加选中状态
            noteElement.classList.add('selected');
        }
    }

    handleTieClick() {
        const selectedNote = document.querySelector('.score-note.selected');
        if (selectedNote && selectedNote.dataset.type === 'note') {
            this.tieInProgress = true;
            this.tieStartNote = {
                measureIndex: parseInt(selectedNote.dataset.measureIndex),
                noteIndex: parseInt(selectedNote.dataset.noteIndex)
            };
            
            // 添加视觉提示，表明正在创建连音线
            selectedNote.classList.add('tie-source');
            document.querySelectorAll('.score-note[data-type="note"]').forEach(note => {
                if (note !== selectedNote) {
                    note.classList.add('tie-target');
                }
            });
        } else {
            alert('请先选择一个音符作为连音线的起点');
        }
    }

    // 渲染连音线
    renderTies(container) {
        // 移除现有的连音线
        container.querySelectorAll('.tie-line').forEach(el => el.remove());
        
        // 等待DOM更新完成后再渲染连音线
        setTimeout(() => {
            // 渲染每个连音线
            this.model.ties.forEach(tie => {
                const startNote = container.querySelector(
                    `.score-note[data-measure-index="${tie.start.measureIndex}"][data-note-index="${tie.start.noteIndex}"]`
                );
                const endNote = container.querySelector(
                    `.score-note[data-measure-index="${tie.end.measureIndex}"][data-note-index="${tie.end.noteIndex}"]`
                );
                
                if (startNote && endNote) {
                    const tieLine = document.createElement('div');
                    tieLine.className = 'tie-line';
                    
                    // 获取音符位置
                    const startRect = startNote.getBoundingClientRect();
                    const endRect = endNote.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    
                    // 确定实际的起点和终点（根据音符的相对位置）
                    let leftPoint, rightPoint;
                    if (endRect.left < startRect.left) {
                        // 如果终点在起点左侧
                        leftPoint = {
                            x: endRect.left - containerRect.left + endRect.width / 2,
                            element: endNote
                        };
                        rightPoint = {
                            x: startRect.left - containerRect.left + startRect.width / 2,
                            element: startNote
                        };
                        tieLine.classList.add('reverse'); // 添加反向类，用于调整弧度方向
                    } else {
                        // 如果终点在起点右侧
                        leftPoint = {
                            x: startRect.left - containerRect.left + startRect.width / 2,
                            element: startNote
                        };
                        rightPoint = {
                            x: endRect.left - containerRect.left + endRect.width / 2,
                            element: endNote
                        };
                    }
                    
                    // 计算连音线位置和大小
                    const width = Math.max(Math.abs(rightPoint.x - leftPoint.x), 20); // 确保最小宽度
                    
                    // 设置连音线样式
                    tieLine.style.left = leftPoint.x + 'px';
                    tieLine.style.width = width + 'px';
                    
                    // 将连音线放置在音符上方
                    const leftRect = leftPoint.element.getBoundingClientRect();
                    const rightRect = rightPoint.element.getBoundingClientRect();
                    const avgTop = (leftRect.top + rightRect.top) / 2;
                    // 将连音线放在音符上方更近的位置
                    tieLine.style.top = (avgTop - containerRect.top - 8) + 'px';
                    
                    container.appendChild(tieLine);
                    
                    // 添加调试信息
                    console.log('Rendered tie line:', {
                        left: leftPoint.x,
                        width: width,
                        isReverse: endRect.left < startRect.left,
                        startNote: tie.start,
                        endNote: tie.end
                    });
                }
            });
        }, 0);
    }



    exportAsImage() {
        const container = document.getElementById('score-container');
        
        // 添加导出模式类
        container.classList.add('export-mode');
        
        // 优化html2canvas配置，避免渲染问题
        const options = {
            backgroundColor: '#ffffff', // 确保背景是纯白色
            scale: 2, // 提高分辨率
            useCORS: true, // 允许跨域图片
            allowTaint: false, // 不允许污染画布
            foreignObjectRendering: false, // 禁用外部对象渲染
            removeContainer: true, // 移除临时容器
            logging: false, // 关闭日志
            width: undefined, // 自动宽度
            height: undefined, // 自动高度
            scrollX: 0, // 固定滚动位置
            scrollY: 0, // 固定滚动位置
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        };
        
        html2canvas(container, options).then(canvas => {
            const link = document.createElement('a');
            link.download = 'score.png';
            link.href = canvas.toDataURL('image/png', 1.0); // 确保最高质量
            link.click();
            
            // 导出完成后移除导出模式类
            container.classList.remove('export-mode');
        }).catch(error => {
            console.error('导出图片失败:', error);
            alert('导出图片失败，请重试');
            
            // 即使失败也要移除导出模式类
            container.classList.remove('export-mode');
        });
    }


    exportAsJson() {
        const data = {
            title: this.model.title,
            measures: this.model.measures,
            keySignature: this.model.keySignature,
            timeSignature: this.model.timeSignature,
            tempo: this.model.tempo,
            lyrics: this.model.lyrics
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'score.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 歌词相关方法
    toggleLyricsDisplay() {
        this.model.showLyrics = !this.model.showLyrics;
        const toggleBtn = document.getElementById('toggleLyrics');
        
        if (this.model.showLyrics) {
            toggleBtn.textContent = '隐藏歌词';
        } else {
            toggleBtn.textContent = '显示歌词';
        }
        
        // 只更新显示状态，不重新渲染，避免丢失未保存的歌词输入
        this.syncLyricsDisplayState();
    }

    // 同步歌词显示状态与CSS类
    syncLyricsDisplayState() {
        const container = document.querySelector('.score-container');
        if (container) {
            if (this.model.showLyrics) {
                container.classList.add('lyrics-mode');
                // 确保所有音符都有歌词输入框
                this.ensureLyricsInputsExist();
            } else {
                container.classList.remove('lyrics-mode');
                // 移除所有音符的 has-lyrics-input 类，确保底部空间完全收回
                const noteElements = container.querySelectorAll('.score-note.has-lyrics-input');
                noteElements.forEach(noteElement => {
                    noteElement.classList.remove('has-lyrics-input');
                });
            }
        }
    }

    // 确保所有音符都有歌词输入框
    ensureLyricsInputsExist() {
        const measures = this.model.measures;
        measures.forEach((measure, measureIndex) => {
            measure.forEach((note, noteIndex) => {
                if (note.type === 'note' || note.type === 'rest') {
                    // 查找对应的音符元素
                    const noteElement = document.querySelector(
                        `.score-note[data-measure-index="${measureIndex}"][data-note-index="${noteIndex}"]`
                    );
                    
                    if (noteElement) {
                        // 检查是否已有歌词输入框
                        const existingInput = noteElement.querySelector('.lyrics-input');
                        if (!existingInput) {
                            // 如果没有，则创建
                            this.addLyricsInput(noteElement, measureIndex, noteIndex);
                        }
                        // 确保音符元素有 has-lyrics-input 类
                        noteElement.classList.add('has-lyrics-input');
                    }
                }
            });
        });
    }

    // 指法图相关方法
    toggleFingeringDisplay() {
        this.model.showFingering = !this.model.showFingering;
        const toggleBtn = document.getElementById('toggleFingering');
        
        console.log('切换指法图显示:', this.model.showFingering);
        
        if (this.model.showFingering) {
            toggleBtn.textContent = '隐藏指法图';
            document.querySelector('.score-container').classList.add('fingering-mode');
            console.log('已启用指法图模式');
        } else {
            toggleBtn.textContent = '显示指法图';
            document.querySelector('.score-container').classList.remove('fingering-mode');
            console.log('已禁用指法图模式');
        }
        
        this.render();
    }

    // 获取音符对应的指法图URL
    getFingeringUrl(note) {
        if (note.type !== 'note') {
            console.log('getFingeringUrl: 不是音符类型', note.type);
            return null;
        }

        const keySignature = this.model.keySignature;
        const fingeringMap = FINGERING_MAPS[keySignature];
        
        console.log('getFingeringUrl: 调号', keySignature, '音符', note.value, '八度', note.octave);
        
        if (!fingeringMap) {
            console.log('getFingeringUrl: 未找到调号映射', keySignature);
            return null;
        }

        let noteKey = note.value;
        
        // 处理高音点和低音点
        if (note.octave === 'high') {
            noteKey = `${note.value}-high`;
        } else if (note.octave === 'low') {
            noteKey = `${note.value}-low`;
        }

        console.log('getFingeringUrl: 查找键', noteKey, '在映射中:', Object.keys(fingeringMap));
        
        const result = fingeringMap[noteKey] || null;
        console.log('getFingeringUrl: 结果', result);
        
        return result;
    }


    clearAllLyrics() {
        if (confirm('确定要清空所有歌词吗？')) {
            this.model.clearLyrics();
            this.safeRender();
        }
    }

    // 应用皮肤样式
    applySkin() {
        const container = document.getElementById('score-container');
        const scoreSkin = document.getElementById('scoreSkin');
        
        // 移除所有现有的皮肤类
        container.classList.remove('skin-white', 'skin-light-beige', 'skin-light-blue');
        
        // 根据选择的皮肤添加对应的类
        const selectedSkin = scoreSkin.value;
        let skinClass = 'skin-white'; // 默认白色皮肤
        
        switch (selectedSkin) {
            case 'white':
                skinClass = 'skin-white';
                break;
            case 'light-beige':
                skinClass = 'skin-light-beige';
                break;
            case 'light-blue':
                skinClass = 'skin-light-blue';
                break;
        }
        
        container.classList.add(skinClass);
        
        // 更新皮肤选择器的值
        scoreSkin.value = selectedSkin;
    }

    // 处理歌词输入
    handleLyricsInput(e, measureIndex, noteIndex) {
        const input = e.target;
        const value = input.value;
        
        console.log('歌词输入事件:', { measureIndex, noteIndex, value, isComposing: input.isComposing, hasComposingAttr: input.hasAttribute('data-composing') });
        
        // 检查是否正在使用输入法（IME）- 只有当明确标记为正在输入时才跳过
        if (input.hasAttribute('data-composing')) {
            console.log('正在使用输入法，跳过处理');
            return; // 如果正在输入法状态，不处理
        }
        
        // 如果输入的是多个字符，进行智能拆分
        if (value.length > 1) {
            console.log('检测到多个字符输入:', value);
            const splitText = this.model.splitText(value);
            console.log('拆分后的文本:', splitText);
            
            // 保存第一个字符到当前输入框
            const firstChar = splitText[0] || '';
            input.value = firstChar;
            this.model.addLyrics(measureIndex, noteIndex, firstChar);
            console.log('已保存第一个字符:', firstChar);
            
            // 将剩余的字符填充到后面的输入框
            const remainingTexts = splitText.slice(1);
            console.log('准备填充剩余字符:', remainingTexts);
            this.fillNextLyricsInputs(measureIndex, noteIndex, remainingTexts);
        } else {
            // 单个字符直接保存
            console.log('单个字符输入:', value);
            this.model.addLyrics(measureIndex, noteIndex, value);
        }
    }

    // 处理歌词键盘事件
    handleLyricsKeydown(e, measureIndex, noteIndex) {
        const input = e.target;
        
        // 如果按下空格键，自动跳转到下一个输入框
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            this.focusNextLyricsInput(measureIndex, noteIndex);
        }
        
        // 如果按下回车键，也跳转到下一个输入框
        if (e.key === 'Enter') {
            e.preventDefault();
            this.focusNextLyricsInput(measureIndex, noteIndex);
        }
        
        // 如果按下退格键且当前输入框为空，跳转到上一个输入框
        if (e.key === 'Backspace' && input.value === '') {
            e.preventDefault();
            this.focusPrevLyricsInput(measureIndex, noteIndex);
        }
    }

    // 填充后续的歌词输入框
    fillNextLyricsInputs(startMeasureIndex, startNoteIndex, texts) {
        console.log('开始填充歌词:', { startMeasureIndex, startNoteIndex, texts });
        
        let currentMeasureIndex = startMeasureIndex;
        let currentNoteIndex = startNoteIndex;
        
        for (let i = 0; i < texts.length; i++) {
            console.log(`处理第 ${i + 1} 个字符: "${texts[i]}"`);
            
            // 获取下一个输入框的位置
            const nextPosition = this.getNextLyricsInputPosition(currentMeasureIndex, currentNoteIndex);
            console.log('下一个位置:', nextPosition);
            
            if (nextPosition) {
                currentMeasureIndex = nextPosition.measureIndex;
                currentNoteIndex = nextPosition.noteIndex;
                
                console.log(`保存歌词到位置: ${currentMeasureIndex}-${currentNoteIndex}, 内容: "${texts[i]}"`);
                
                // 保存歌词
                this.model.addLyrics(currentMeasureIndex, currentNoteIndex, texts[i]);
                
                // 更新输入框的值
                const nextInput = document.querySelector(
                    `.lyrics-input[data-measure-index="${currentMeasureIndex}"][data-note-index="${currentNoteIndex}"]`
                );
                console.log('找到的输入框:', nextInput);
                
                if (nextInput) {
                    nextInput.value = texts[i];
                    console.log(`已设置输入框值: "${texts[i]}"`);
                } else {
                    console.log('未找到对应的输入框');
                }
            } else {
                console.log('没有更多输入框位置，停止填充');
                // 如果没有更多输入框，停止填充
                break;
            }
        }
    }

    // 获取下一个歌词输入框的位置
    getNextLyricsInputPosition(measureIndex, noteIndex) {
        const measures = this.model.measures;
        
        // 先尝试在当前小节中找下一个音符或休止符
        for (let i = noteIndex + 1; i < measures[measureIndex].length; i++) {
            const note = measures[measureIndex][i];
            if (note.type === 'note' || note.type === 'rest') {
                return { measureIndex, noteIndex: i };
            }
        }
        
        // 如果当前小节没有更多音符，尝试下一个小节
        for (let m = measureIndex + 1; m < measures.length; m++) {
            for (let i = 0; i < measures[m].length; i++) {
                const note = measures[m][i];
                if (note.type === 'note' || note.type === 'rest') {
                    return { measureIndex: m, noteIndex: i };
                }
            }
        }
        
        return null;
    }

    // 获取上一个歌词输入框的位置
    getPrevLyricsInputPosition(measureIndex, noteIndex) {
        const measures = this.model.measures;
        
        // 先尝试在当前小节中找上一个音符或休止符
        for (let i = noteIndex - 1; i >= 0; i--) {
            const note = measures[measureIndex][i];
            if (note.type === 'note' || note.type === 'rest') {
                return { measureIndex, noteIndex: i };
            }
        }
        
        // 如果当前小节没有更多音符，尝试上一个小节
        for (let m = measureIndex - 1; m >= 0; m--) {
            for (let i = measures[m].length - 1; i >= 0; i--) {
                const note = measures[m][i];
                if (note.type === 'note' || note.type === 'rest') {
                    return { measureIndex: m, noteIndex: i };
                }
            }
        }
        
        return null;
    }

    // 聚焦下一个歌词输入框
    focusNextLyricsInput(measureIndex, noteIndex) {
        const nextPosition = this.getNextLyricsInputPosition(measureIndex, noteIndex);
        if (nextPosition) {
            const nextInput = document.querySelector(
                `.lyrics-input[data-measure-index="${nextPosition.measureIndex}"][data-note-index="${nextPosition.noteIndex}"]`
            );
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    // 聚焦上一个歌词输入框
    focusPrevLyricsInput(measureIndex, noteIndex) {
        const prevPosition = this.getPrevLyricsInputPosition(measureIndex, noteIndex);
        if (prevPosition) {
            const prevInput = document.querySelector(
                `.lyrics-input[data-measure-index="${prevPosition.measureIndex}"][data-note-index="${prevPosition.noteIndex}"]`
            );
            if (prevInput) {
                prevInput.focus();
            }
        }
    }

    // 更新撤销和恢复按钮的状态
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (this.model.canUndo()) {
            undoBtn.disabled = false;
            undoBtn.textContent = '撤销';
        } else {
            undoBtn.disabled = true;
            undoBtn.textContent = '撤销 (无历史)';
        }

        if (this.model.canRedo()) {
            redoBtn.disabled = false;
            redoBtn.textContent = '恢复';
        } else {
            redoBtn.disabled = true;
            redoBtn.textContent = '恢复 (无历史)';
        }
    }

    // 性能监控和清理
    getPerformanceStats() {
        return {
            totalMeasures: this.model.measures.length,
            visibleMeasures: this.visibleMeasures.size,
            domCacheSize: this.domCache.size,
            imageCacheSize: this.imageCache.size,
            measureElementsSize: this.measureElements.size
        };
    }

    // 清理缓存
    clearCaches() {
        this.domCache.clear();
        this.imageCache.clear();
        this.measureElements.clear();
        this.visibleMeasures.clear();
        
        // 清理定时器
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
    }

    // 销毁实例时的清理
    destroy() {
        this.clearCaches();
        
        // 移除事件监听器
        const container = document.getElementById('score-container');
        if (container) {
            container.removeEventListener('click', this.handleClick);
            container.removeEventListener('input', this.handleInput);
            container.removeEventListener('keydown', this.handleKeydown);
        }
    }

    // 简易轻提示
    showToast(message, variant = 'manual') {
        const existing = document.getElementById('toast-tip');
        if (existing) existing.remove();
        
        const tip = document.createElement('div');
        tip.id = 'toast-tip';
        tip.textContent = message;
        tip.style.position = 'fixed';
        tip.style.top = '18px';
        tip.style.left = '50%';
        tip.style.transform = 'translateX(-50%)';
        tip.style.padding = '10px 14px';
        tip.style.borderRadius = '10px';
        tip.style.fontSize = '13px';
        tip.style.lineHeight = '1';
        tip.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        tip.style.zIndex = '99999';
        tip.style.color = '#fff';
        
        // 根据不同类型设置背景色
        switch (variant) {
            case 'auto':
                tip.style.background = 'rgba(24,144,255,0.95)'; // 蓝色
                break;
            case 'manual':
                tip.style.background = 'rgba(0,160,80,0.95)'; // 绿色
                break;
            case 'draft':
                tip.style.background = 'rgba(150,150,150,0.95)'; // 灰色
                break;
            case 'loading':
                tip.style.background = 'rgba(255,165,0,0.95)'; // 橙色
                break;
            case 'error':
                tip.style.background = 'rgba(245,34,45,0.95)'; // 红色
                break;
            default:
                tip.style.background = 'rgba(0,160,80,0.95)';
        }
        
        document.body.appendChild(tip);
        
        // loading状态不自动消失
        if (variant !== 'loading') {
            setTimeout(() => tip.remove(), 1600);
        }
    }

    // 立即持久化当前文档（本地 + 通知父页面）
    async persistNow(kind = 'manual') {
        // 若存在正在进行的中文输入（IME 组合态），先尝试提交
        const hasComposing = this.commitActiveCompositions();
        
        // 给浏览器一次微任务/帧机会完成值同步
        setTimeout(async () => {
            // 在保存前同步所有歌词输入框的当前值到数据模型
            this.syncLyricsFromInputs();
            
            // 生成文档
            const doc = this.model.toDocument();
            
            // 始终保存到localStorage（草稿兜底）
            try {
                localStorage.setItem(this.model.getStorageKey(), JSON.stringify(doc));
                if (this.model.ownerUserId) {
                    localStorage.setItem(`lastOpenedScoreId:${this.model.ownerUserId}`, doc.scoreId);
                } else {
                    localStorage.setItem(`lastOpenedScoreId`, doc.scoreId);
                }
            } catch {}
            
            // ========== 关键修改：只有手动保存才考虑云端持久化 ==========
            
            // 如果是自动保存，仅本地保存，不触发云端
            if (kind === 'auto') {
                // 区分提示信息
                if (this.model.isPersisted) {
                    // 已持久化的乐谱，自动保存会更新云端
                    await this.saveToCloud(doc);
                    this.showToast('已自动保存到云端', 'auto');
                } else {
                    // 草稿状态，自动保存只保存到本地
                    this.showToast('草稿已自动保存到本地', 'draft');
                }
                return;
            }
            
            // 手动保存：判断是否需要首次持久化
            if (!this.model.isPersisted && this.model.isDraft) {
                // 首次手动保存，弹出确认对话框
                const displayName = this.model.getDisplayName();
                const confirmed = confirm(`是否确认创建乐谱「${displayName}」？\n\n创建后将保存到云端，可在所有设备访问。`);
                
                if (!confirmed) {
                    // 用户取消，仅本地保存
                    this.showToast('已保存到本地（未同步云端）', 'draft');
                    return;
                }
                
                // 用户确认，创建云端记录
                const success = await this.createCloudScore(doc);
                
                if (success) {
                    this.showToast('已创建并保存到云端', 'manual');
                } else {
                    this.showToast('创建失败，已保存到本地', 'error');
                }
            } else if (this.model.isPersisted) {
                // 已持久化的乐谱，直接更新云端
                await this.saveToCloud(doc);
                this.showToast('已保存到云端', 'manual');
            }
            
        }, hasComposing ? 120 : 0);
    }

    // 新增：保存到云端（已持久化的乐谱）
    async saveToCloud(doc) {
        try {
            if (window.parent && window.parent !== window && this.model.isPersisted) {
                window.parent.postMessage({ 
                    type: 'score:autosave', 
                    payload: doc 
                }, '*');
                return true;
            }
        } catch (e) {
            console.warn('保存到云端失败:', e);
            return false;
        }
    }

    // 新增：首次创建云端记录（添加更详细的错误处理）
    async createCloudScore(doc) {
        try {
            // 显示加载提示
            this.showToast('正在创建乐谱...', 'loading');
            
            // 通知父页面创建新记录
            window.parent.postMessage({ 
                type: 'score:create', 
                payload: doc 
            }, '*');
            
            // 等待父页面返回真实scoreId（超时5秒）
            const realScoreId = await this.waitForRealScoreId();
            
            if (realScoreId) {
                // 更新为真实ID
                const oldId = this.model.scoreId;
                this.model.scoreId = realScoreId;
                this.model.isPersisted = true;
                this.model.isDraft = false;
                
                // 保存更新后的状态到localStorage
                const updatedDoc = this.model.toDocument();
                try {
                    localStorage.setItem(this.model.getStorageKey(), JSON.stringify(updatedDoc));
                    // 清理旧的草稿
                    if (oldId !== realScoreId) {
                        localStorage.removeItem(`score:${oldId}`);
                    }
                } catch {}
                
                // 更新URL（不刷新页面）
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ 
                        type: 'score:updateUrl', 
                        payload: { scoreId: realScoreId } 
                    }, '*');
                }
                
                return true;
            } else {
                // 超时或失败
                console.warn('创建云端记录超时');
                return false;
            }
        } catch (e) {
            console.error('创建云端记录失败:', e);
            return false;
        }
    }

    // 新增：等待父页面返回真实scoreId
    waitForRealScoreId() {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn('等待scoreId超时');
                resolve(null);
            }, 5000); // 5秒超时
            
            const handler = (event) => {
                if (event.data?.type === 'score:created') {
                    clearTimeout(timeout);
                    window.removeEventListener('message', handler);
                    
                    if (event.data.success && event.data.scoreId) {
                        resolve(event.data.scoreId);
                    } else {
                        resolve(null);
                    }
                }
            };
            
            window.addEventListener('message', handler);
        });
    }

    // 每分钟定时持久化
    startAutoPersist() {
        if (this._autoPersistTimer) clearInterval(this._autoPersistTimer);
        this._autoPersistTimer = setInterval(() => {
            this.persistNow('auto');
        }, 60 * 1000);
    }

    // 将页面上所有歌词输入框的值同步到模型（用于保存前兜底）
    syncLyricsFromInputs() {
        try {
            const inputs = document.querySelectorAll('.lyrics-input');
            inputs.forEach((input) => {
                const el = input;
                const measureIndex = parseInt(el.getAttribute('data-measure-index'));
                const noteIndex = parseInt(el.getAttribute('data-note-index'));
                // 优先使用 pending 值（IME 组合中/刚结束时更可靠）
                const pending = el.getAttribute('data-pending-value');
                const value = (pending !== null ? pending : el.value) || '';
                // 与事件流保持一致的更新方式
                this.model.addLyrics(measureIndex, noteIndex, value);
            });
        } catch {}
    }

    // 提交当前所有处于 IME 组合态的输入，返回是否存在组合态
    commitActiveCompositions() {
        let found = false;
        const inputs = document.querySelectorAll('.lyrics-input[data-composing]');
        inputs.forEach((el) => {
            found = true;
            try {
                // 通过失焦触发组合提交
                el.blur();
            } catch {}
        });
        return found;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const scoreViewController = new ScoreViewController();

    // 从 URL 读取 scoreId 与可选 ownerUserId
    const scoreIdFromUrl = getQueryParam('scoreId');
    const ownerFromUrl = getQueryParam('ownerUserId');

    // 加载优先策略：URL -> lastOpened -> 旧格式
    scoreViewController.model.loadStatePreferred(scoreIdFromUrl, ownerFromUrl);

    scoreViewController.render();

    // 设置皮肤选择器的默认值
    const scoreSkin = document.getElementById('scoreSkin');
    if (scoreSkin) {
        scoreSkin.value = scoreViewController.model.skin;
    }

    // 设置标题输入框的默认值
    const scoreTitle = document.getElementById('scoreTitle');
    if (scoreTitle) {
        scoreTitle.value = scoreViewController.model.title;
    }

    // 设置调号选择器的默认值
    const keySignature = document.getElementById('keySignature');
    if (keySignature) {
        keySignature.value = scoreViewController.model.keySignature;
    }

    // 设置拍号选择器的默认值
    const timeSignature = document.getElementById('timeSignature');
    if (timeSignature) {
        timeSignature.value = scoreViewController.model.timeSignature;
    }

    // 监听父页面消息（下发完整文档进行恢复）
    window.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;
        if (msg.type === 'score:load' && msg.payload) {
            scoreViewController.model.loadFromDocument(msg.payload);
            scoreViewController.model.saveState();
            scoreViewController.render(true);
            scoreViewController.updateUndoRedoButtons();
        }
    });

    // 更新按钮状态
    scoreViewController.updateUndoRedoButtons();
});
