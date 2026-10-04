# Moraje3 — landing page

The redesigned Moraje3 landing page, built with Next.js 15 + Tailwind CSS v4, in English (`/en`) and Arabic (`/ar`, right-to-left).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Continue in Claude Code

```bash
cd moraje3-landing
claude
```

`CLAUDE.md` gives Claude Code the project conventions (where copy lives, RTL rules, colour tokens).

## Before launch
- [ ] Set real links in `lib/site.ts` (request access, login, privacy, terms)
- [ ] Confirm the three testimonials in `lib/dictionaries.ts` are from real students who agreed to be quoted
- [ ] Confirm the stats (4,823 questions, 12 disciplines, +27% accuracy) are current
- [ ] Have a native speaker review the Arabic copy
- [ ] Add a favicon / OG image to `public/`

## Deploy
Works on Vercel as-is (import the repo, no settings needed), or any host that runs `next build && next start`.
