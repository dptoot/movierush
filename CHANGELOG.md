# Changelog

All notable changes to MovieRush will be documented in this file.

## [Unreleased]

### Documentation
- **Product Spec v1.6:** Added Section 14 (Post-Phase 8: UI Enhancements) documenting the timer redesign with full implementation details

### Changed
- **Timer UI Redesign:** Replaced radial gradient with animated circular progress ring
  - SVG-based stroke that drains clockwise as time elapses
  - Smooth GPU-accelerated CSS animation (mobile-friendly)
  - Dynamic color: gold (>30s) → orange (10-30s) → coral (<10s)
  - Handles time bonuses/penalties by restarting animation seamlessly
  - Supports overflow time (>60s) with animation delay
  - Fluid responsive sizing using `clamp()` for all screen sizes
  - Respects `prefers-reduced-motion` accessibility preference

### Added
- **Phase 8.4:** Testing Infrastructure & Documentation
  - Testing framework setup:
    - Vitest for unit tests (fast, ESM-native, TypeScript support)
    - Playwright for E2E tests (real browser testing, accessibility)
    - axe-core integration for WCAG compliance testing
  - Unit tests (48 tests):
    - `lib/scoring.ts` - Quality score calculation, tier classification, points
    - `lib/timeBonus.ts` - Quality score calculation, tier classification, bonus values
    - Boundary condition tests for all tier thresholds
  - E2E tests (25+ tests):
    - Game flow: Homepage, start, autocomplete, timer, end game, results, share
    - Persistence: Game state survives refresh, replay prevention
    - Error handling: API failures (404, 500)
    - Keyboard navigation: Full game completable without mouse
    - Accessibility: WCAG 2.1 AA compliance via axe-core
    - Screen reader support: ARIA attributes verification
    - Reduced motion: Respects prefers-reduced-motion
  - GitHub Actions CI workflow:
    - Unit tests run on every push/PR
    - E2E tests run after unit tests pass
    - ESLint and TypeScript type checking
    - Playwright report artifacts uploaded
  - Testing documentation (`docs/TESTING.md`):
    - How to run tests locally
    - Test structure and organization
    - Manual testing checklist
    - Device testing matrix
    - Troubleshooting guide
  - NPM scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`, `test:e2e:ui`, `test:all`
- **Phase 8.3:** Client-Side Performance Optimization
  - React component memoization:
    - Added `React.memo()` to MovieGridItem for efficient re-renders
    - Added `useMemo()` for sorted movie arrays in Results component
    - Added `useCallback()` for all handler functions in GameBoard (handleStart, handleEndGame, handleMovieSelect, showFeedback, triggerTimerShake, handleRetry)
  - Code splitting with dynamic imports:
    - Lazy load Results component using `next/dynamic` (only loaded when game ends)
    - Loading skeleton displayed while Results component loads
  - Bundle analysis:
    - Installed and configured `@next/bundle-analyzer`
    - Documented baseline: App chunks ~19KB, Total chunks ~852KB
  - Network performance optimization:
    - Font loading: Added `display: "swap"` for faster FCP
    - Preload critical assets: Logo image preload hint
    - Preconnect to TMDB image CDN for faster poster loading
    - DNS prefetch for TMDB domain
  - Verified proper cleanup in all useEffect hooks (timer intervals, event listeners, debounce timers)
- **Phase 8.2:** Mobile-First Responsive Design Implementation
  - Safe area support for notched devices (iPhone X+, Android punch-hole cameras)
    - Added `viewportFit: "cover"` to viewport configuration
    - Created CSS utilities: `.safe-area-padding`, `.safe-area-top`, `.safe-area-bottom`
    - Applied safe area padding to all main content containers
  - Small screen optimization (<375px)
    - Reduced button min-width and padding for very small screens
    - Scaled down typography (challenge prompt, timer, headings)
    - Adjusted card padding for compact displays
  - Touch target improvements
    - Dropdown items now have `min-h-12` (48px) minimum height
    - Input fields optimized for mobile text entry
    - Autocomplete dropdown constrained to 60vh for better mobile UX
  - Landscape orientation support
    - Added CSS rules for landscape on phones (max-height: 500px)
    - Compact layout with reduced spacing in landscape mode
  - Component-level responsive improvements
    - GameBoard: Responsive padding, landscape-compact class
    - Results: Smaller logo/headings on mobile, responsive grid gaps
    - MovieGrid: Smaller gaps and max-height on very small screens
    - AutocompleteInput: Responsive text size and padding
  - Overflow protection: Added `.overflow-safe` utility class
- **Phase 8.1:** WCAG 2.1 AA Accessibility Compliance Implementation
  - Color contrast fixes: Silver color adjusted (#8B98A8 → #A8B8C8) for 4.5:1 ratio on navy
  - Skip-to-content link for keyboard navigation (WCAG 2.4.1)
  - Semantic `<main>` landmark in root layout
  - Timer component: Semantic `<time>` element with `role="timer"`, `aria-live="polite"`, `aria-label`
  - Feedback region: `role="status"`, `aria-live="assertive"` for screen reader announcements
  - Score display: Semantic `<output>` elements with aria-labels
  - MovieGrid: Semantic `<ul>/<li>` list structure with proper image alt text
  - Results sections: Proper `<section>` elements with aria-labels
  - All buttons: Descriptive `aria-label` attributes
  - Focus styles: Visible focus rings for `.btn-primary` and `.btn-secondary`
  - `prefers-reduced-motion` support:
    - Disabled animations with non-motion alternatives
    - Timer warning: wavy underline instead of pulse
    - Timer shake: color change instead of motion
    - Instant appearance for fade/pop animations
- **Phase 8: Production Readiness** - Comprehensive engineering tasks added to PRODUCT_SPEC.md
  - **8.1 WCAG 2.1 AA Compliance** - Color contrast audit, motion sensitivity, focus management, ARIA completeness, screen reader testing, semantic HTML audit
  - **8.2 Mobile-First Implementation** - CSS refactor, small screen optimization, landscape support, safe area support, touch interaction audit, device testing matrix, high-DPI optimization
  - **8.3 Client-Side Optimization** - React memoization, code splitting, bundle analysis, Lighthouse audits, runtime profiling, network performance
  - **8.4 Testing & Documentation** - Testing infrastructure setup, E2E tests, accessibility automation, visual regression testing, testing documentation

### Changed
- **Phase 5 Status:** Marked as "Core Complete" with references to Phase 8 for production hardening
- **Spec Alignment:** Updated time mechanics in PRODUCT_SPEC.md to match implementation
  - Starting time: 30s → 60s (matches `INITIAL_TIME` in GameBoard.tsx)
  - Maximum time cap: 45s → 90s (matches `MAX_TIME` in GameBoard.tsx)
  - Updated US-2 acceptance criteria and game design decisions sections

### Added
- **Phase 7.7:** Parallelized TMDB API calls for improved performance
  - Created `fetchInBatches()` utility function for batched parallel fetching
  - Refactored `getActorMovies()` to process movie details in parallel batches of 10
  - Uses `Promise.allSettled()` for graceful error handling (failed requests skipped)
  - Parallelized stats endpoints (`popular/route.ts`, `rare/route.ts`)
  - Added performance logging to measure improvement
  - Estimated 10x speedup for actors with 50+ movies (50s → 5s)
- **Phase 7.6:** Error boundary components for graceful error handling
  - `components/ErrorBoundary.tsx` - React class component for catching render errors
  - `app/error.tsx` - Next.js route-level error handler
  - `app/global-error.tsx` - Next.js root layout error handler
  - MovieRush-branded fallback UI with "Refresh" and "Try Again" buttons
  - Error details shown in development mode only
  - Prevents white screen crashes, allows users to recover
- **Phase 7.5:** API response caching for improved performance
  - Challenge API: 1-hour CDN cache (`s-maxage=3600, stale-while-revalidate`)
  - Autocomplete API: `no-store` to ensure fresh search results
  - Stats APIs: 5-minute CDN cache (`s-maxage=300, stale-while-revalidate`)
  - `getMovieDetails()`: 24-hour in-memory cache to reduce TMDB API calls
  - Added documentation comments explaining caching strategy for each endpoint

### Changed
- **Phase 7.4:** Removed unused component props to eliminate ESLint warnings
  - Removed `totalMovies` prop from `MovieGrid.tsx` (was passed but never used)
  - Removed `isRunning` prop from `Timer.tsx` (was defined but never used)
  - Eliminated final 2 `@typescript-eslint/no-unused-vars` warnings
  - ESLint now reports 0 problems (0 errors, 0 warnings)
- **Phase 7.3:** Added proper ARIA attributes to autocomplete input for accessibility compliance
  - Added `id="movie-suggestions-listbox"` to dropdown listbox element
  - Added `aria-controls` to input referencing the listbox
  - Added `id` attributes to each option for keyboard navigation
  - Added `aria-activedescendant` to track highlighted option during keyboard navigation
  - Eliminated `jsx-a11y/role-has-required-aria-props` ESLint warning
- **Phase 7.2:** Converted all `<img>` tags to Next.js `<Image />` component for automatic image optimization
  - Configured `next.config.ts` with TMDB image remote patterns
  - Updated `MovieGrid.tsx` to use optimized images with responsive `sizes` prop
  - Updated `Results.tsx` (3 locations: Your Guesses, Popular Movies, Hidden Gems)
  - Eliminated 4 `@next/next/no-img-element` ESLint warnings
  - Benefits: automatic WebP conversion, lazy loading, proper sizing for better LCP
- **Phase 7.1:** Migrated TMDB API client to `tmdb-ts` package for full TypeScript type safety
  - Created `lib/tmdb-client.ts` with typed TMDB API functions
  - Replaced all `any` types with proper TypeScript definitions
  - Eliminated 3 `@typescript-eslint/no-explicit-any` ESLint errors
  - Simplified scripts by using vote data already returned by `getActorMovies()`
  - Removed redundant `fetchMovieQuality()` calls (now included in movie details)
  - Note: Requires `TMDB_ACCESS_TOKEN` environment variable (API Read Access Token)

### Added
- Phase 7 Technical Improvements spec in `docs/PRODUCT_SPEC.md`
  - 7.1 TMDB TypeScript migration using `tmdb-ts` package
  - 7.2 Next.js Image optimization for TMDB images
  - 7.3 Accessibility improvements for autocomplete combobox
  - 7.4 Unused variable cleanup
  - 7.5 API response caching with Next.js fetch cache
  - 7.6 Error boundary with fallback UI
  - 7.7 Parallelized TMDB API calls for performance
- Vercel Analytics integration for traffic tracking (page views, visitors, popular pages)
- Comprehensive meta tags for SEO and social sharing
  - Keywords for search engines
  - Twitter card (summary_large_image)
  - Full OpenGraph config (url, siteName, locale, type, image dimensions)
  - Web manifest for PWA support
- New favicon assets (16x16, 32x32, apple-touch-icon, android-chrome)
- OG image (1200x630) for social sharing previews

### Changed
- Re-enabled autofocus on movie input when game starts

### Fixed
- Mobile responsive design improvements:
  - Timer: added text-5xl base size for small phones (was missing mobile breakpoint)
  - Challenge prompt: scaled down to text-2xl on mobile for better fit
  - Buttons: added min-h-12 (48px) tap targets for accessibility
  - Results stats cards: compact padding on mobile, prevents overflow
  - Game Over heading: responsive sizing (text-4xl on mobile)

### Added
- Loading state for Results stats section with themed gold spinner
- Themed gold color for GameBoard loading spinner (was white)

### Added
- Comprehensive error handling for GameBoard and Results components
  - Challenge fetch errors: themed error card with retry button
  - Autocomplete search errors: coral-bordered dropdown with "Unable to search. Try again." message
  - Share functionality errors: button shows "Unable to share" with helper text
  - Console logging for stats recording and fetch failures (debugging)

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
