# Changelog

All notable changes to MovieRush will be documented in this file.

## [Unreleased]

### Added
- `Results` component with score display, movie grid, and share functionality (Phase 4)
- `lib/scoring.ts` - point calculation with obscurity-based bonuses
- Replay prevention - completed games saved to localStorage, prevents replaying same day
- Share button with native share API fallback to clipboard
- "End Game" button for manual game completion (Phase 3)
- Time bonus logic for correct guesses based on movie obscurity (Phase 3)
  - Quality score = vote_count × (vote_average / 10)
  - Very Well-Known (3000+): +3s, Well-Known (1000-2999): +8s, Moderate (200-999): +15s, Obscure (<200): +20s
- `lib/timeBonus.ts` - time bonus calculation utility
- localStorage persistence for game state - survives page refreshes
- `MovieGrid` component with responsive poster grid and fadeIn animation (Phase 3.4)

### Added (continued)
- `GuessedMovie` type for tracking guessed movies with poster data
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
- MovieGrid now only appears after first correct guess (no empty placeholder)
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
