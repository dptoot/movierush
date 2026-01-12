# MovieRush - Claude Code Project Configuration

## Project Overview
Daily movie trivia game where players race against time to name movies. Built with Next.js, Neon Postgres, and TMDB API.

## Documentation Structure
- **Product Spec:** `docs/PRODUCT_SPEC.md`
- **Changelog:** `CHANGELOG.md` (root level)
- **Technical Specs:** In conversation artifacts, referenced as needed

## Development Methodology
- **Approach:** Spec-driven development
- **Phase System:** Work organized into phases (Phase 1, Phase 2, etc.)
- **Task Format:** Phase X.Y for individual tasks
- **Status Markers:** 
  - ✅ Complete
  - ⏳ In Progress  
  - 🔲 Not Started

## Commit Conventions
- **Format:** `<type>(phase-X): <description>`
- **Scope:** Use `phase-X` where X is the phase number (e.g., `phase-2`)
- **Types:** feat, fix, docs, refactor, test, chore
- **Always update:**
  1. Mark task as ✅ in `docs/PRODUCT_SPEC.md`
  2. Add entry to `CHANGELOG.md`
  3. Document decisions in spec if applicable

## Technology Stack
- **Framework:** Next.js 14+ with App Router, TypeScript
- **Database:** Neon Postgres (via Vercel Marketplace)
- **External API:** TMDB (The Movie Database)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Database
- **Connection:** Via `lib/db.ts`
- **Schema:** Minimal storage with PostgreSQL arrays
- **Tables:** `challenges` with `movie_ids INTEGER[]`

## File Structure
```
/app              - Next.js app router pages & API routes
/components       - React components
/lib              - Utility functions (tmdb.ts, db.ts, etc.)
/scripts          - One-off scripts (challenge generation, etc.)
/docs             - Documentation (PRODUCT_SPEC.md, etc.)
/types            - TypeScript type definitions
.claude/          - Claude Code configuration
```

## Workflow Preferences
- When completing tasks, always update the product spec
- Use emojis in logs for clarity (🎬, ✅, ❌, ⏳, etc.)
- Prefer TypeScript for type safety
- Keep functions focused and single-purpose

## Testing
- Manual testing in browser for now
- Run dev server: `npm run dev`
- Test API routes: `http://localhost:3000/api/...`