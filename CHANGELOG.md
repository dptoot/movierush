# Changelog

All notable changes to MovieRush will be documented in this file.

## [Unreleased]

### Added
- Social stats feature showing popular and rare movie guesses
  - `guess_stats` database table tracking guess counts per challenge
  - `/api/stats/record-guess` - records guesses (fire-and-forget, doesn't slow gameplay)
  - `/api/stats/popular` - returns most guessed movies with TMDB details
  - `/api/stats/rare` - returns least guessed "hidden gems" with TMDB details
  - Results page shows "Today's Stats" section after game ends
  - Most Popular list (gold rank numbers) and Hidden Gems list (coral rank numbers)
  - Stats section hidden for first player or on fetch errors (graceful degradation)

### Fixed
- Page now scrolls to top when transitioning between game phases (splash, gameplay, results)
- Mobile viewport now uses standard responsive settings (device-width, initialScale)
- Added interactiveWidget viewport setting for better mobile keyboard handling

### Changed
- Removed auto-focus on game input to prevent keyboard from opening automatically on mobile
- Autocomplete results now sorted by popularity (most popular movies first)
- Rebalanced time mechanics for more relaxed gameplay:
  - Starting time: 60s (was 30s)
  - Maximum time cap: 90s (was 45s)
  - Wrong guess penalty: -3s
  - Time bonuses: +3s/+5s/+7s/+10s

### Added
- Copy movie list button on Results page next to "Your Guesses" heading
  - Copies just the movie names (one per line) to clipboard
  - Shows clipboard icon with "✓ Copied" feedback on click

### Changed
- Splash screen tagline reformatted with line breaks for better readability
- Dev reset button now hidden by default, only visible with `?dev=true` URL param
- Visual feedback for guesses during gameplay:
  - Correct guess: green "+Xs" text showing time bonus
  - Wrong guess: red "-5s" text with timer shake animation
  - Repeat correct: yellow "Already guessed! ✓" message
  - Repeat wrong: gray "Already tried that one" message
- Repeated guess handling: no time penalty for re-guessing movies
- `feedback-pop` animation keyframes and `timer-shake` utility class

### Changed
- Removed "X/Y movies found" counter during gameplay for cleaner UI
- Logo: optimized with Next.js Image component and resized WebP (1.6MB → 52KB, 97% reduction)
- Homepage UX: moved "Start The Rush" button above date, removed date box styling for cleaner look
- Relaxed challenge validation: removed obscure movie requirement
  - Now only requires 20+ movies (was 20+ movies AND 3+ obscure)
  - Enables A-list actors like DiCaprio and Vin Diesel

### Fixed
- Autocomplete dropdown not displaying on mobile when deployed
  - Removed `backdrop-blur` from autocomplete container in GameBoard
  - `backdrop-filter` creates a stacking context that isolates z-index

### Added
- Batch challenge generation script (`scripts/generate-month.ts`)
  - Generate challenges for multiple days at once (default 31 days)
  - Skips dates that already have challenges
  - Progress reporting with summary stats
- Automated daily challenge generation via Vercel Cron (Phase 6)
  - `lib/featured-actors.ts` - 100 curated actors with TMDB IDs
  - Deterministic actor selection (same date = same actor)
  - `/api/cron/generate-challenge` endpoint with CRON_SECRET auth
  - `vercel.json` cron configuration (runs 6 PM UTC daily)
  - `scripts/trigger-cron.ts` for local testing
  - Duplicate prevention (checks if challenge exists before generating)

### Changed
- UX improvements from backlog (Phase 5)
  - Splash screen: human-friendly date format, new tagline explaining gameplay
  - Splash screen: "Start The Rush" button copy
  - Game UI: removed movie posters from autocomplete (prevents cast hints)
  - Game UI: timer and movie counter on same line, fixed timer width
  - Game UI: removed redundant "X movies remaining" from grid
  - Game UI: moved "End Game" button above movie list
  - Results: side-by-side cards for movies found and points
  - Results: navy/coral colors for better readability
  - Results: moved "Come back tomorrow" below heading

### Added
- MovieRush branding and visual theme (Phase 5)
  - Custom color palette: navy, gold, coral, cream, silver, blue
  - Tailwind v4 CSS-based theme configuration
  - Brand logo on splash and results screens
  - Chunky button and card styles with shadows
  - Timer warning animations (pulse when < 10s)
  - Pop animation on Game Over heading
- Logo assets: `movie-rush.png`, `movie-rush-trans.png`

### Changed
- Converted Tailwind config from v3 JS to v4 CSS `@theme` syntax
- Timer component simplified to use themed CSS classes
- Updated metadata with MovieRush branding, favicon, OpenGraph
- GameBoard now controls full-screen layout (removed page wrapper)

### Previously Added
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
