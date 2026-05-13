# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project. Route handlers and pages live in `app/`, including `app/api/` for server endpoints, public pages such as `app/home/`, and authenticated routes under `app/protected/`. Shared React UI lives in `components/`; editor-specific UI and state are grouped under `components/editor/`, while reusable primitives are in `components/ui/`. Shared TypeScript utilities, Supabase clients, validation schemas, editor types, SEO, email, and monitoring helpers live in `lib/`. Static assets are in `public/`, Supabase migrations are in `supabase/migrations/`, and maintenance scripts are in `scripts/`.

## Build, Test, and Development Commands

- `npm run dev`: starts the local Next.js dev server with Turbopack.
- `npm run build`: creates a production build and catches TypeScript/Next.js integration issues.
- `npm run start`: serves the production build locally after `npm run build`.
- `npm run lint`: runs the configured Next.js ESLint command.
- `npm run analyze`: builds with bundle analysis enabled.

Use `npm install` to sync dependencies from `package-lock.json`. Keep `env.example` updated when adding required environment variables.

## Coding Style & Naming Conventions

Use TypeScript for application code and React components. Components should use PascalCase filenames and exports, for example `ScoreCanvas.tsx`; hooks should use camelCase names beginning with `use`, for example `useScoreStore.ts`. Prefer colocating feature-specific helpers with their feature folder and placing cross-cutting helpers in `lib/`. Follow existing formatting: two-space indentation, single quotes in most TypeScript files, Tailwind utility classes for styling, and path aliases such as `@/lib/utils`.

## Testing Guidelines

No test framework is currently configured and no test files are present. For now, validate changes with `npm run build` and `npm run lint` before submitting. When adding tests, place them near the code they cover using `*.test.ts` or `*.test.tsx`, and add the matching npm script plus config in the same change.

## Commit & Pull Request Guidelines

Recent commit subjects are short Chinese summaries such as `体验优化` and `增加乐谱广场功能`. Keep commit messages concise, imperative or summary-style, and focused on one change. Pull requests should include a short description, user-visible impact, verification steps, linked issues when relevant, and screenshots or screen recordings for UI/editor changes.

## Security & Configuration Tips

Do not commit `.env.local` or secrets. Use `env.example` for documented variable names only. Keep database changes in `supabase/migrations/`, and validate request payloads through schemas in `lib/validations/` before persisting user data.
