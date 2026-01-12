# Changelog

All notable changes to MovieRush will be documented in this file.

## [Unreleased]

### Added
- `AutocompleteInput` component with debounced TMDB search (Phase 3.3)
- `/api/autocomplete` endpoint - searches all TMDB movies (validation on selection)
- Guess validation flow - correct guesses update counter, incorrect apply 5s penalty
- `Timer` component with visual states: normal, warning (<10s), critical (<5s) (Phase 3.2)
- `GameBoard` component - main game container with state management (Phase 3.1)
- TypeScript types for Challenge, Movie, GameState, GamePhase (`types/index.ts`)
- Game flow: idle state with Start button, playing state with timer countdown, ended state
- UX improvements backlog (`docs/IMPROVEMENTS.md`)
- `/api/challenge` endpoint to fetch today's challenge (Phase 2.6)
- Test challenges in database for development (Phase 2.5)

### Changed
- Updated home page to use GameBoard component
- Updated app metadata for MovieRush branding

## [0.2.0] - 2026-01-12

### Added
- Challenge generation script (`scripts/generate-challenge.ts`)
- Database schema with `challenges` table using PostgreSQL arrays
- TMDB utility functions (`lib/tmdb.ts`)
- Database utility (`lib/db.ts`)
- Popularity score analysis and tier system

## [0.1.0] - 2026-01-11

### Added
- Initial Next.js project setup with TypeScript and Tailwind CSS
- Neon Postgres database connection via Vercel Marketplace
- TMDB API integration
- Basic project structure
