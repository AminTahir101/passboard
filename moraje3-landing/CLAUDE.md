# Moraje3 landing page

Marketing landing page for Moraje3, a private-access AI prep platform for medical licensing exams (SMLE, SDLE, SPLE, USMLE, PLAB).

## Stack
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4 — design tokens live in `app/globals.css` under `@theme` (no tailwind.config file)
- Fonts via `next/font/google`: Newsreader (display serif), IBM Plex Sans (body), IBM Plex Mono (labels), IBM Plex Sans Arabic (all Arabic text)

## Structure
- `app/[lang]/` — `en` and `ar` routes, statically generated. `/` redirects to `/en` (next.config.mjs).
- `lib/dictionaries.ts` — ALL user-facing copy, English and Arabic. `ar` is typed as `Dictionary`, so adding a key to `en` forces the Arabic translation.
- `lib/site.ts` — outbound URLs (request access, login, legal). Placeholders marked TODO.
- `components/` — one file per page section, all server components.

## Conventions
- Never hard-code copy in components; add it to both locales in `lib/dictionaries.ts`.
- Sample product UI (exam questions, topic scores) stays in English in both locales — the exams are in English.
- RTL: use logical utilities (`ps-`, `pe-`, `start-`, `end-`, `rtl:`). The hero orbit composition is forced `dir="ltr"` because it is absolutely positioned.
- Palette: warm paper neutrals + gold/amber accent. Gold (`bg-gold`) is for fills with dark text only; use `text-amber` for accent text (gold text fails contrast).
- Keep touch targets ≥ 44px and text contrast ≥ 4.5:1.

## Commands
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` — production build (must pass before committing)
