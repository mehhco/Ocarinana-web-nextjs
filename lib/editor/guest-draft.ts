import type { InstrumentType, ScoreDocument } from './types';

export const GUEST_DRAFT_STORAGE_KEY = 'ocarinana:guest-draft:v1';
export const GUEST_DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface GuestDraft {
  document: ScoreDocument;
  instrumentType: InstrumentType;
  savedAt: number;
  pendingCloudSave: boolean;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isInstrumentType(value: unknown): value is InstrumentType {
  return value === '12-hole' || value === '6-hole';
}

function isScoreDocument(value: unknown): value is ScoreDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ScoreDocument>;

  return (
    Array.isArray(candidate.measures) &&
    Boolean(candidate.settings) &&
    typeof candidate.settings?.instrumentType === 'string'
  );
}

export interface ScoreContentCandidate {
  measures?: ReadonlyArray<unknown> | null;
  lyricist?: string | null;
  composer?: string | null;
  additionalInfo?: string | null;
}

/**
 * 判断文档里是否已经有用户真正投入过劳动的内容。
 * 只有默认标题、空小节的新建文档不算内容，避免把空白草稿当成待恢复作品。
 */
export function hasScoreContent(document: ScoreContentCandidate | null | undefined): boolean {
  if (!document) {
    return false;
  }

  const measures = Array.isArray(document.measures) ? document.measures : [];
  const hasElements = measures.some((measure) => {
    if (Array.isArray(measure)) {
      return measure.length > 0;
    }

    if (!measure || typeof measure !== 'object') {
      return false;
    }

    const elements = (measure as { elements?: unknown }).elements;

    return Array.isArray(elements) && elements.length > 0;
  });

  if (hasElements) {
    return true;
  }

  return Boolean(
    document.lyricist?.trim() ||
      document.composer?.trim() ||
      document.additionalInfo?.trim()
  );
}

export function readGuestDraft(): GuestDraft | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(GUEST_DRAFT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<GuestDraft> | null;
    const savedAt = typeof parsed?.savedAt === 'number' ? parsed.savedAt : 0;

    if (!isScoreDocument(parsed?.document) || !savedAt) {
      clearGuestDraft();
      return null;
    }

    if (Date.now() - savedAt > GUEST_DRAFT_MAX_AGE_MS) {
      clearGuestDraft();
      return null;
    }

    const instrumentType = isInstrumentType(parsed?.document.settings.instrumentType)
      ? parsed.document.settings.instrumentType
      : isInstrumentType(parsed?.instrumentType)
        ? parsed.instrumentType
        : '12-hole';

    return {
      document: parsed.document,
      instrumentType,
      savedAt,
      pendingCloudSave: Boolean(parsed?.pendingCloudSave),
    };
  } catch {
    return null;
  }
}

export function writeGuestDraft(
  document: ScoreDocument,
  options: { pendingCloudSave?: boolean } = {}
): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const draft: GuestDraft = {
      document,
      instrumentType: document.settings.instrumentType,
      savedAt: Date.now(),
      pendingCloudSave: Boolean(options.pendingCloudSave),
    };

    window.localStorage.setItem(GUEST_DRAFT_STORAGE_KEY, JSON.stringify(draft));

    return true;
  } catch {
    return false;
  }
}

/** 记录“用户在未登录时点过保存”，等登录回跳后自动把草稿存进账号。 */
export function markGuestDraftPendingCloudSave(): void {
  const draft = readGuestDraft();

  if (!draft) {
    return;
  }

  writeGuestDraft(draft.document, { pendingCloudSave: true });
}

export function clearGuestDraft(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(GUEST_DRAFT_STORAGE_KEY);
  } catch {
    // 清理失败不影响主流程
  }
}

export function isGuestDraftStorageAvailable(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const probeKey = `${GUEST_DRAFT_STORAGE_KEY}:probe`;
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);

    return true;
  } catch {
    return false;
  }
}
