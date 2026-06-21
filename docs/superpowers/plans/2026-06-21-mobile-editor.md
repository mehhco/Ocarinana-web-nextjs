# Mobile Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portrait-first mobile editing workspace while preserving the existing desktop editor and shared score state.

**Architecture:** Keep `ScoreEditor` as the orchestration boundary and render responsive desktop/mobile shells with CSS breakpoints. Mobile controls use focused components backed by existing Zustand actions; pure mobile note-range helpers are covered by the repository's Node test runner.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Zustand, Node test runner

---

### Task 1: Mobile note input model

**Files:**
- Create: `components/editor/lib/mobileEditor.ts`
- Create: `components/editor/lib/mobileEditor.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write failing tests for mobile pitch rows**

Test that C tuning exposes `1–7`, G tuning exposes its altered middle row, and unavailable notes remain disabled according to `getAvailableNoteRange`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test components/editor/lib/mobileEditor.test.ts`
Expected: FAIL because `mobileEditor.ts` does not exist.

- [ ] **Step 3: Implement the pure view model**

Export `MobilePitchRegister`, `MobileNoteOption`, and `getMobileNoteOptions(register, instrumentType, keySignature)`. Derive display text and availability from existing constants without duplicating instrument ranges.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2 and expect all cases to pass.

### Task 2: Mobile editor controls

**Files:**
- Create: `components/editor/mobile/MobileEditorHeader.tsx`
- Create: `components/editor/mobile/MobileNoteBar.tsx`
- Create: `components/editor/mobile/MobileToolSheet.tsx`
- Create: `components/editor/mobile/ScoreSettingsSheet.tsx`

- [ ] **Step 1: Implement the compact header**

Provide back, title/settings, undo, redo, save, and export actions. Use 44px targets, Chinese accessible labels, and visible save state.

- [ ] **Step 2: Implement the persistent note bar**

Render pitch-register switching, seven stable note positions, rest, delete, and tool-sheet entry. Use the pure view model from Task 1 and existing store actions.

- [ ] **Step 3: Implement the tool sheet**

Provide insert/replace, durations, dot, extension, rests, fingering, lyrics, second lyric line, tie, beam, and barline actions. Use a fixed dialog with safe-area padding and internal scrolling.

- [ ] **Step 4: Implement score settings**

Provide title, key, time, tempo, visibility, producer, lyricist, composer, and additional information fields with 16px input text.

### Task 3: Responsive workspace integration

**Files:**
- Modify: `components/editor/core/ScoreEditor.tsx`
- Modify: `components/editor/core/Toolbar.tsx`
- Modify: `components/protected-shell.tsx`
- Modify: `app/editor/page.tsx`

- [ ] **Step 1: Preserve desktop workspace at `lg`**

Hide the existing toolbar and split panel below `1024px`; keep their current layout at and above `lg`.

- [ ] **Step 2: Add mobile workspace below `lg`**

Compose `MobileEditorHeader`, `ScoreCanvas`, and `MobileNoteBar`. The canvas receives remaining dynamic viewport height and mobile sheets overlay within the editor.

- [ ] **Step 3: Apply viewport and safe-area behavior**

Replace immersive `h-screen` usage with `h-dvh` plus fallback classes and ensure mobile browser bars do not clip controls.

### Task 4: Score touch and lyric ergonomics

**Files:**
- Modify: `components/editor/core/ScoreCanvas.tsx`
- Modify: `components/editor/overlay/LyricsInput.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add mobile editor context styling**

Use an editor-specific class to apply overscroll containment, touch manipulation, hidden horizontal overflow, and reduced-motion behavior without affecting exported score layout.

- [ ] **Step 2: Expand interactive hit areas**

Add transparent minimum-size hit targets to notes, barlines, and section markers while retaining their visual widths and wrapping behavior.

- [ ] **Step 3: Improve lyrics input**

Use 16px mobile text, a larger focused touch area, `enterKeyHint="next"`, and retain existing composition and paste handlers.

### Task 5: Runtime performance

**Files:**
- Modify: `components/editor/core/ScoreCanvas.tsx`
- Modify: `components/editor/lib/exportUtils.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Narrow score-store subscriptions**

Replace the whole-store `useScoreStore()` subscription with individual selectors so unrelated save/export state changes do not invalidate the entire component unnecessarily.

- [ ] **Step 2: Load html2canvas on demand**

Remove the global CDN script from root layout. In `exportAsImage`, load the script once on first export, reuse the shared promise, and surface a Chinese error if loading fails.

### Task 6: Verification

**Files:**
- Modify only files required by failures found during verification.

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: all editor tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: exit 0, or report the repository's existing script incompatibility without hiding it.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: exit 0 with no TypeScript or Next.js integration errors.

- [ ] **Step 4: Review implementation against the design spec**

Confirm responsive shell, 44px primary targets, settings/tool sheets, touch-safe score, dynamic export loading, desktop preservation, and no server/Git operations.

