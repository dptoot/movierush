# MovieRush - V1 Product Specification

## 1. Product Overview

### Concept
MovieRush is a daily movie trivia game where players race against time to name movies matching a specific criteria (actor, director, theme, etc.). Similar to Wordle, each day features a new challenge that's identical for all players globally.

### Core Value Proposition
- Daily engagement with fresh challenges
- Strategic time management (obscure movies = more time bonuses)
- Visual satisfaction (revealing movie posters)
- Shareable results for social competition

---

## 2. Game Mechanics

### 2.1 Daily Challenge
- **One challenge per day** (same for all players worldwide)
- **Challenge types** include:
  - Movies by actor (e.g., "Name Tom Hanks movies")
  - Movies by director (e.g., "Name Christopher Nolan movies")
  - Movies by genre/year/theme (future expansion)
- Challenge resets at midnight UTC

### 2.2 Gameplay Flow

**Starting the Game:**
1. Player lands on homepage
2. Sees "Today's Challenge" with a prominent "Start" button
3. Challenge prompt is hidden until player clicks "Start"
4. On clicking "Start":
   - Challenge prompt reveals (e.g., "Name Will Ferrell Movies")
   - Timer starts at 60 seconds
   - Autocomplete input field appears and focuses
   - Skeleton list of movie posters displays (chronological by release date)
5. This prevents "pre-gaming" by thinking of answers before timer starts

**During Gameplay:**
- Player types movie names in autocomplete field
- Autocomplete shows ALL TMDB movies (not filtered)
- **Correct guess:**
  - Movie poster appears in grid (newest on left)
  - Time bonus added (based on quality score)
  - Points awarded (10 base + obscurity bonus)
  - Input clears, ready for next guess
- **Incorrect guess:**
  - 5-second time penalty
  - No visual indication saved (doesn't show wrong guesses)
  - Input clears, ready for next guess
- Player can continue guessing until:
  - Timer expires (automatic game end), OR
  - Player clicks "End Game" button (manual game end)
- "End Game" button visible during gameplay for early completion

**End of Game:**
- Shows all movie posters (guessed ones highlighted/marked)
- Displays final score breakdown:
  - Number of movies guessed (e.g., "8/15 movies")
  - Total points earned
- Shows shareable results
- Prevents replaying same day's challenge

### 2.3 Scoring System

**Base Points:**
- 10 points per correct movie

**Popularity Bonus:**
- Additional points based on how obscure the movie is
- **Formula (Finalized):** Based on quality score = vote_count × (vote_average / 10)
- Obscurity tiers:
  - Very Well-Known (3000+): +0 bonus points
  - Well-Known (1000-2999): +5 bonus points
  - Moderate (200-999): +10 bonus points
  - Obscure (<200): +20 bonus points
- Players earn maximum bonuses for knowing deep-cut films in an actor's filmography

**Total Score:**
- Sum of all (base points + popularity bonuses)

**Time:**
- Not factored into scoring
- Purely a constraint to prevent unlimited guessing time

### 2.4 Time Mechanics

**Starting Time:** 60 seconds

**Time Bonus per Correct Answer:**
- **Formula (Finalized):** Based on quality score = vote_count × (vote_average / 10)
- Obscurity tiers determine time bonuses:
  - Very Well-Known (3000+): +3 seconds
  - Well-Known (1000-2999): +5 seconds
  - Moderate (200-999): +7 seconds
  - Obscure (<200): +10 seconds
- Rewards players for knowing lesser-known films with more playtime

**Time Penalty:**
- -3 seconds per incorrect guess

**Maximum Time:**
- 90 seconds (hard cap prevents indefinite play)

---

## 3. User Stories

### US-1: Daily Challenge Discovery
**As a player**
I want to start today's unique challenge when I'm ready
So that I have a fair chance without pre-gaming

**Acceptance Criteria:**
- Landing page shows "Today's Challenge" with a "Start" button
- Challenge prompt is hidden until "Start" is clicked
- Same challenge shown to all players on the same day
- Challenge changes daily at midnight UTC
- Timer only starts after clicking "Start"

### US-2: Timed Movie Guessing
**As a player**
I want to guess movies with an autocomplete input after starting the challenge
So that I can quickly enter my answers without typos

**Acceptance Criteria:**
- After clicking "Start", challenge prompt is revealed
- Autocomplete input appears and is focused
- Autocomplete searches ALL movies from TMDB (not filtered to valid answers)
- Autocomplete displays search results as I type
- When I select a movie, the game validates if it's in the valid answer list
- Correct guesses reveal movie poster and award bonuses
- Incorrect guesses result in 3-second time penalty
- Timer starts at 60 seconds and counts down visibly
- Input clears after each guess, ready for next answer
- "End Game" button is visible and allows player to end early

**Design Rationale:** Showing all TMDB movies (not just valid answers) requires actual movie knowledge. Players can't just browse through a filtered list to find answers.

### US-3: Visual Progress Tracking
**As a player**
I want to see a list of movie posters that reveal as I guess correctly
So that I can track my progress and feel accomplished

**Acceptance Criteria:**
- Skeleton/placeholder posters shown at start (chronological order)
- Posters reveal with smooth animation on correct guess
- Can see how many remain unrevealed

### US-4: End Game Summary
**As a player**
I want to see my final score and which movies I missed
So that I can evaluate my performance and learn

**Acceptance Criteria:**
- Shows all movie posters (guessed vs. missed clearly indicated)
- Displays: X/Y movies found
- Displays: Total points earned
- Shows shareable results format

### US-5: Share Results
**As a player**
I want to share my score with friends
So that I can compete socially

**Acceptance Criteria:**
- One-click share button
- Generates shareable text/emoji format (similar to Wordle)
- Doesn't spoil answers

### US-6: One Play Per Day
**As a player**
I should only be able to play today's challenge once
So that the game maintains its daily ritual nature

**Acceptance Criteria:**
- After completing today's challenge, show "Come back tomorrow"
- Display stats/history if available
- Clear indication of when next challenge available

---

## 4. Technical Architecture

### 4.1 Tech Stack

**Framework:**
- Next.js 14+ with App Router
- React Server Components where appropriate
- TypeScript for type safety

**Styling:**
- Tailwind CSS for utility-first styling
- Consider: shadcn/ui for component primitives

**Database:**
- **Neon Postgres** (via Vercel Marketplace)
  - Why: Serverless Postgres with generous free tier, instant branching for testing
  - Seamless Vercel integration with auto-provisioned environment variables
  - Well-established and battle-tested
- Alternative: Prisma Postgres (no cold starts, newer option)

**External APIs:**
- TMDB API (The Movie Database)
- API key stored in environment variables

**Deployment:**
- Vercel (automatic deployments from GitHub)
- Environment variables managed in Vercel dashboard

### 4.2 Project Structure (Next.js App Router)

```
/app
  /layout.tsx                 # Root layout
  /page.tsx                   # Homepage (today's challenge)
  /api
    /challenge/route.ts       # Get today's challenge
    /autocomplete/route.ts    # Movie search autocomplete
    /validate/route.ts        # Validate guess
  /challenge
    /[date]/page.tsx          # View past challenge (future)
/components
  /GameBoard.tsx              # Main game interface
  /MovieGrid.tsx              # Skeleton list of posters
  /AutocompleteInput.tsx      # Search input
  /Timer.tsx                  # Countdown timer
  /Results.tsx                # End game summary
  /ShareButton.tsx            # Share results
/lib
  /tmdb.ts                    # TMDB API utilities
  /db.ts                      # Database utilities
  /scoring.ts                 # Scoring algorithm (configurable)
  /timeBonus.ts               # Time bonus calculation (configurable)
  /localStorage.ts            # Browser storage helpers
/types
  /index.ts                   # TypeScript interfaces
/scripts
  /generate-challenge.ts      # Daily challenge generation (cron job)
/docs
  /PRODUCT_SPEC.md            # This specification document
```

### 4.3 Data Models

**Challenge (Database)**
```typescript
interface Challenge {
  id: string;              // "challenge_2026_01_15_will_ferrell"
  date: string;            // YYYY-MM-DD (UTC)
  type: 'actor' | 'director' | 'genre' | 'theme';
  prompt: string;          // "Name Will Ferrell Movies"
  tmdb_person_id: number;  // TMDB person ID for actor/director challenges
  movie_ids: number[];     // Array of valid TMDB movie IDs
  created_at: timestamp;
}
```

**Note:** We store only movie IDs. Full movie data (title, poster, votes, rating) is fetched fresh from TMDB during gameplay via autocomplete.

**Game State (localStorage)**
```typescript
interface GameState {
  date: string; // YYYY-MM-DD
  challenge_id: string;
  started_at: timestamp;
  completed_at?: timestamp;
  guesses: string[]; // Movie titles guessed (correct only)
  incorrect_count: number; // For penalty tracking
  final_score?: number;
  movies_found?: number;
  time_remaining?: number;
}

interface PlayerStats {
  games_played: number;
  total_score: number;
  best_score: number;
  current_streak: number;
  last_played: string; // YYYY-MM-DD
}
```

---

## 5. API Endpoints

### 5.1 Next.js API Routes

**GET /api/challenge**
- Returns today's challenge
- Response:
```json
{
  "id": "challenge_2026_01_15_will_ferrell",
  "date": "2026-01-15",
  "prompt": "Name Will Ferrell Movies",
  "type": "actor",
  "total_movies": 87,
  "valid_movie_ids": [123, 456, 789, ...]
}
```

**Note:** Returns array of valid movie IDs. Frontend validates guesses against this list.

**GET /api/challenge/[id]/movies**
- Returns valid movies for a challenge (after game ends or for validation)
- Used for end-game reveal

**POST /api/autocomplete**
- Body: `{ query: string }`
- Returns: Movie suggestions from TMDB (unfiltered)
- **Returns ALL movies** matching search query, not just valid answers
- Frontend filters results client-side for display purposes only
- Validation happens after selection, not during search

**Design Note:** Autocomplete intentionally shows all TMDB movies to prevent players from browsing the answer list. This requires actual movie knowledge to succeed.

**POST /api/validate**
- Body: `{ movie_title: string, challenge_id: string }`
- Returns: `{ valid: boolean, movie?: Movie }`
- Validates if guess is correct

### 5.2 TMDB API Usage

**Key Endpoints:**
- `/search/movie` - Autocomplete functionality
- `/person/{person_id}/movie_credits` - Get actor's movies
- `/person/{person_id}/crew` - Get director's movies  
- `/discover/movie` - Filter by genre, year, etc.

**API Key Security:**
- Store in `.env.local` (never commit)
- Access only from Next.js API routes (server-side)
- Rate limiting: ~40 req/sec (won't be an issue initially)

---

## 6. Development Process & Workflow

### 6.1 Phase 1: Project Setup (Week 1)
**Goal: Get the foundation running**

**Tasks:**
1. Initialize Next.js project with TypeScript
   - `npx create-next-app@latest movierush --typescript --tailwind --app`
2. Set up GitHub repository
3. Connect to Vercel for auto-deployment
4. Set up Neon Postgres database via Vercel Marketplace
   - Create from Vercel dashboard → Storage → Create Database → Neon
   - Environment variables automatically injected into Vercel project
   - Copy connection strings to local `.env.local`
5. Configure TMDB API key in environment variables
6. Create basic folder structure
7. Install dependencies:
   - `@neondatabase/serverless` for database access

**Deliverable:** Empty app deployed to Vercel with Neon database connected

**Where to store things:**
- Code: GitHub repository (you'll create this)
- Environment variables: `.env.local` (local), Vercel dashboard (production)
- Database: Neon via Vercel Marketplace (managed, no local DB needed)

### 6.2 Phase 2: Data Layer (Week 1-2)
**Goal: Get challenge data flowing**

**Tasks:**
1. Set up Neon Postgres database via Vercel Marketplace
   - Create database from Vercel dashboard Storage tab
   - Copy connection strings to local `.env.local`
2. Create database schema (Challenge, Movie tables)
3. Build TMDB utility functions (`/lib/tmdb.ts`)
4. **Analyze popularity score distribution:**
   - Fetch sample actor's complete filmography (e.g., Will Ferrell)
   - Document actual popularity score ranges
   - Determine appropriate bucket thresholds
   - Design scoring/time bonus algorithms based on real data
5. Create script to generate a single challenge (`/scripts/generate-challenge.ts`)
6. Manually create 3-5 test challenges in database
7. Build `/api/challenge` endpoint to fetch today's challenge

**Deliverable:** API endpoint that returns today's challenge data with real movies from database

### 6.3 Phase 3: Core Game UI (Week 2-3)
**Goal: Build the playable game interface**

**Tasks:**
- [x] Create `GameBoard` component (main game container)
- [x] Build `Timer` component with countdown logic
- [x] Build `AutocompleteInput` with TMDB search (shows ALL movies, validates after selection)
- [x] Create `MovieGrid` component (displays guessed movies, grows left-to-right)
- [x] Implement guess validation flow
- [x] Add time bonus/penalty logic
- [x] Implement poster reveal animations (fadeIn)
- [x] Add "End Game" button for manual game completion
- [x] Add localStorage persistence for game state

**Design Decisions:**
- Autocomplete shows ALL TMDB movies (not filtered to valid answers)
- Validation happens after user selection (prevents browsing answer list)
- MovieGrid only appears after first correct guess (not empty skeletons)
- Newest guesses appear on left, grid grows rightward
- Scrollable container for many guesses

**Deliverable:** Playable game (even if rough around edges)

**Component strategy:**
- Start with basic functionality, add polish later
- Use `'use client'` directive for interactive components
- Server Components for data fetching where possible

### 6.4 Phase 4: Scoring & End Game (Week 3-4)
**Goal: Complete the game loop**

**Tasks:**
- [x] Implement scoring algorithm (`/lib/scoring.ts`)
- [x] Build `Results` component (end game summary)
- [x] Create localStorage helpers for game state
- [x] Prevent replay of same day's challenge
- [x] Build share functionality
- [x] Show guessed movies with points breakdown

**Deliverable:** Full game loop from start to shareable results

### 6.5 Phase 5: Polish & Testing (Week 4-5)
**Goal: Make it production-ready**
**Status:** ✅ Core Complete (see Phase 8 for production hardening)

**Tasks:**
- [x] Visual branding and theming (MovieRush color palette, logo, animations)
- [x] Tailwind v4 theme configuration with brand colors
- [x] Responsive design (base implementation) → see Phase 8.2 for mobile-first refinements
- [x] Loading states and error handling (themed)
- [x] Accessibility (base implementation) → see Phase 8.1 for WCAG compliance
- [x] Performance optimization (API-side) → see Phase 8.3 for client-side optimization
- [ ] User testing with friends/family → see Phase 8.4
- [x] Bug fixes (Phase 7 addressed ESLint issues and edge cases)

**Deliverable:** Production-ready MVP

**Note:** Phase 5 established the foundation. Phase 8 (Production Readiness) provides comprehensive engineering tasks for WCAG compliance, mobile-first design, and formal testing infrastructure.

### 6.6 Phase 6: Automation (Week 5-6)
**Goal: Set up daily challenge generation**

**Tasks:**
- [x] Refine challenge generation script
- [x] Add validation rules (difficulty, list size)
- [x] Set up cron job (Vercel Cron)
  - Created `/api/cron/generate-challenge` endpoint
  - Added `vercel.json` with cron schedule (6 PM UTC daily)
  - Implemented CRON_SECRET authorization
  - Created `lib/featured-actors.ts` with 100 curated actors
  - Deterministic actor selection (same date = same actor)
  - Duplicate prevention (checks before generating)
- [ ] Pre-generate 30 days of challenges
- [ ] Monitor and adjust

**Deliverable:** Self-sustaining daily challenge system

---

## 7. Best Practices for Development

### 7.1 Version Control
- **Commit frequently** with clear messages
  - Good: "Add autocomplete to game input"
  - Bad: "updates"
- **Branch strategy:**
  - `main` branch = production (auto-deploys to Vercel)
  - `dev` branch = your working branch
  - Feature branches for major features (optional for solo project)

### 7.2 Environment Variables
**Local development** (`.env.local`):
```
TMDB_ACCESS_TOKEN=your_access_token_here
DATABASE_URL=your_db_url
```

**Production** (Vercel):
- Add same variables in Vercel dashboard → Settings → Environment Variables
- Automatic on deployment

### 7.3 Testing Strategy
- Manual testing in browser (start here)
- Test on mobile devices (responsive design)
- Have friends playtest for feedback
- Future: Add automated tests if project grows

### 7.4 Database Migrations
- Use Vercel Postgres SQL editor or Drizzle ORM for schema changes
- Keep migration scripts in `/migrations` folder
- Document schema changes in git commits

### 7.5 Deployment
- Push to GitHub `main` branch → Auto-deploys to Vercel
- Preview deployments for branches (test before merging)
- Check build logs in Vercel dashboard if errors occur

---

## 8. MVP Scope (V1)

### ✅ In Scope
- Single daily challenge (same for everyone)
- Actor-based challenges only (simplest to start)
- Time-based gameplay with bonuses/penalties
- Visual poster reveal mechanic
- Scoring system with popularity bonuses
- End game summary
- Share results (text format)
- One play per day enforcement (localStorage)
- Responsive design (mobile + desktop)

### ❌ Out of Scope (Future Versions)
- User accounts and authentication
- Persistent leaderboard
- Multiple challenge types (director, genre, theme)
- Streak tracking
- Historical challenge archive
- Multiplayer/head-to-head mode
- Hints or lifelines
- Customizable time settings (UI)
- Sound effects / music

---

## 9. Success Metrics

### Launch Goals (First Month)
- Game is playable and bug-free
- New challenge every day without manual intervention
- Shareable results format working
- Mobile responsive
- Friends/family actually play daily

### Future Metrics (Post-Launch)
- Daily active players
- Average completion rate (movies found)
- Share rate (% of players who share)
- Return rate (% who come back next day)

---

## 10. Open Questions & Decisions Needed

### Technical Decisions
- [x] Database choice: Neon Postgres via Vercel Marketplace
- [x] Storage approach: Minimal (movie IDs only in INTEGER[] array)
- [x] Scoring metric: Quality-weighted (vote_count × rating) not popularity
- [x] Autocomplete behavior: Show ALL movies, validate after selection (prevents answer browsing)
- [ ] Component library (shadcn/ui vs custom components)
- [ ] Share format design (text emojis vs image)
- [ ] Movie poster quality (w185, w342, w500, or original?)

### Game Design Decisions
- [x] Autocomplete shows all TMDB movies (requires actual knowledge, prevents browsing)
- [x] Obscurity scoring uses quality score (vote_count × vote_average/10)
- [x] Time/point bonuses finalized (3000/1000/200/0 thresholds)
- [x] Maximum time cap: 90 seconds
- [ ] Movie poster quality (w185, w342, w500, or original?)
- [ ] Challenge difficulty rules (min 20 movies, min 3 obscure - finalized)
- [ ] Skeleton grid ordering (chronological by release date)

### Future Features Priority
- [ ] Which challenge types to add next?
- [ ] User accounts - when/if to add?
- [ ] Monetization strategy (if any)

---

## 11. Next Steps

1. **Review this spec** - Discuss any questions or changes
2. **Set up development environment** - Next.js project, GitHub, Vercel
3. **Start Phase 1** - Project scaffolding
4. **Get TMDB API key** - Sign up at themoviedb.org
5. **Choose database** - Recommendation: Vercel Postgres for simplicity

---

## Appendix: Helpful Resources

### Documentation
- Next.js App Router: https://nextjs.org/docs/app
- TMDB API: https://developer.themoviedb.org/reference/intro/getting-started
- Vercel Deployment: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Learning Resources
- Next.js tutorial: https://nextjs.org/learn
- TypeScript handbook: https://www.typescriptlang.org/docs/

---

---

## 12. Phase 7: Technical Improvements

### Overview
This phase addresses technical debt, ESLint errors, performance optimizations, and code quality improvements identified during a comprehensive technical review.

**Goals:**
- Fix all ESLint errors and warnings
- Improve type safety with `tmdb-ts` package
- Optimize image loading with Next.js Image component
- Add API response caching for better performance
- Improve accessibility compliance
- Add error boundary for graceful error handling

---

### 7.1 TMDB TypeScript Migration
**Priority:** High (ESLint errors)
**Status:** ✅ Complete

**Problem:**
The `lib/tmdb.ts` file uses `any` types in 3 places (lines 61, 67, 94), causing ESLint errors. Manual type definitions are incomplete and don't match TMDB API responses.

**Solution:**
Replace manual TMDB API calls with the `tmdb-ts` package which provides:
- Full TypeScript definitions for all TMDB endpoints
- Type-safe API responses
- Built-in error handling

**Tasks:**
- [x] **7.1.1** Install `tmdb-ts` package
- [x] **7.1.2** Create new `lib/tmdb-client.ts` with typed TMDB client
- [x] **7.1.3** Refactor `searchMovies()` to use tmdb-ts
- [x] **7.1.4** Refactor `getMovieDetails()` to use tmdb-ts
- [x] **7.1.5** Refactor `searchPerson()` to use tmdb-ts
- [x] **7.1.6** Refactor `getActorMovies()` to use tmdb-ts
- [x] **7.1.7** Update `types/index.ts` to use/extend tmdb-ts types
- [x] **7.1.8** Remove old `lib/tmdb.ts` after migration complete
- [x] **7.1.9** Update all imports across codebase

**Acceptance Criteria:**
- Zero `@typescript-eslint/no-explicit-any` errors
- All TMDB API calls use typed responses
- Existing functionality unchanged

**Files Affected:**
- `lib/tmdb.ts` → `lib/tmdb-client.ts` (rewrite)
- `types/index.ts` (update)
- `app/api/autocomplete/route.ts` (update imports)
- `app/api/stats/popular/route.ts` (update imports)
- `app/api/stats/rare/route.ts` (update imports)
- `scripts/generate-challenge.ts` (update imports)
- `scripts/generate-month.ts` (update imports)

---

### 7.2 Next.js Image Optimization
**Priority:** High (Performance + ESLint warnings)
**Status:** ✅ Complete

**Problem:**
Using `<img>` tags instead of Next.js `<Image />` component results in:
- Slower LCP (Largest Contentful Paint)
- Higher bandwidth usage (no automatic optimization)
- 4 ESLint warnings

**Solution:**
1. Configure Next.js to allow TMDB remote images
2. Convert all `<img>` tags to `<Image />` component

**Tasks:**
- [x] **7.2.1** Update `next.config.ts` with TMDB image domain configuration:
  ```typescript
  const nextConfig: NextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'image.tmdb.org',
          pathname: '/t/p/**',
        },
      ],
    },
  };
  ```
- [x] **7.2.2** Convert `MovieGrid.tsx` line 40 from `<img>` to `<Image />`
- [x] **7.2.3** Convert `Results.tsx` line 227 (Your Guesses thumbnails)
- [x] **7.2.4** Convert `Results.tsx` line 315 (Popular movies thumbnails)
- [x] **7.2.5** Convert `Results.tsx` line 356 (Rare movies thumbnails)
- [x] **7.2.6** Add appropriate `width`, `height`, and `sizes` props for responsive loading
- [x] **7.2.7** Test image loading across different screen sizes

**Acceptance Criteria:**
- Zero `@next/next/no-img-element` warnings
- Images load with proper optimization
- No layout shift during image loading

**Files Affected:**
- `next.config.ts`
- `components/MovieGrid.tsx`
- `components/Results.tsx`

---

### 7.3 Accessibility Improvements
**Priority:** Medium (ESLint warning)
**Status:** ✅ Complete

**Problem:**
The autocomplete input has `role="combobox"` but is missing required ARIA attributes (`aria-controls`), violating WCAG accessibility guidelines.

**Solution:**
Add proper ARIA attributes to create a fully accessible combobox pattern.

**Tasks:**
- [x] **7.3.1** Add `id` attribute to the dropdown listbox element
- [x] **7.3.2** Add `aria-controls` attribute to input, referencing the listbox id
- [x] **7.3.3** Ensure `aria-expanded` reflects dropdown visibility state
- [x] **7.3.4** Add `aria-activedescendant` for keyboard navigation
- [ ] **7.3.5** Test with screen reader (VoiceOver/NVDA)

**Acceptance Criteria:**
- Zero `jsx-a11y/role-has-required-aria-props` warnings
- Combobox is navigable via keyboard
- Screen reader announces suggestions correctly

**Files Affected:**
- `components/AutocompleteInput.tsx`

---

### 7.4 Remove Unused Variables
**Priority:** Medium (ESLint warnings)
**Status:** ✅ Complete

**Problem:**
Unused variables across multiple files cause ESLint warnings.

**Tasks:**
- [x] **7.4.1** `components/MovieGrid.tsx` - Removed unused `totalMovies` prop
- [x] **7.4.2** `components/Timer.tsx` - Removed unused `isRunning` prop
- [x] **7.4.3-7.4.6** - Already fixed during Phase 7.1 TMDB migration (lib/tmdb.ts removed, scripts refactored)

**Acceptance Criteria:**
- Zero `@typescript-eslint/no-unused-vars` warnings ✅

**Files Modified:**
- `components/MovieGrid.tsx` - Removed totalMovies from interface and props
- `components/Timer.tsx` - Removed isRunning from interface and props
- `components/GameBoard.tsx` - Removed totalMovies prop from MovieGrid usage

---

### 7.5 API Response Caching
**Priority:** Medium (Performance)
**Status:** ✅ Complete

**Problem:**
TMDB API calls have no caching strategy, resulting in:
- Repeated API calls for same data
- Slower response times
- Unnecessary TMDB API usage

**Solution:**
Use Next.js fetch caching with appropriate TTLs for different data types.

**Caching Strategy:**
| Endpoint | Data Type | TTL | Rationale |
|----------|-----------|-----|-----------|
| `/api/challenge` | Challenge data | 1 hour | Changes daily, safe to cache |
| `getMovieDetails()` | Movie metadata | 24 hours | Rarely changes |
| `searchMovies()` | Search results | No cache | User expects fresh results |
| Stats endpoints | Guess counts | 5 minutes | Balances freshness vs performance |

**Tasks:**
- [x] **7.5.1** Add `Cache-Control: s-maxage=3600` to challenge API route
- [x] **7.5.2** Add in-memory cache with 24h TTL to `getMovieDetails()`
- [x] **7.5.3** Ensure autocomplete uses `Cache-Control: no-store` for fresh results
- [x] **7.5.4** Add `Cache-Control: s-maxage=300` to stats endpoints
- [x] **7.5.5** Document caching strategy in code comments

**Acceptance Criteria:**
- Repeated requests for same movie details are served from cache
- Challenge data is cached for 1 hour
- Autocomplete results are always fresh
- No stale data issues

**Files Affected:**
- `lib/tmdb-client.ts` (new file from 7.1)
- `app/api/challenge/route.ts`
- `app/api/stats/popular/route.ts`
- `app/api/stats/rare/route.ts`

---

### 7.6 Error Boundary
**Priority:** Medium (Reliability)
**Status:** ✅ Complete

**Problem:**
No error boundary exists. If a component throws during render, the entire app crashes with a white screen.

**Solution:**
Create a simple error boundary component with a user-friendly fallback UI.

**Tasks:**
- [x] **7.6.1** Create `components/ErrorBoundary.tsx` as a class component
- [x] **7.6.2** Create `app/error.tsx` for app-level error handling (Next.js convention)
- [x] **7.6.3** Create `app/global-error.tsx` for root layout errors
- [x] **7.6.4** Design fallback UI with:
  - MovieRush branding
  - "Something went wrong" message
  - "Refresh" button to reload the page
  - Optional: "Report issue" link
- [ ] **7.6.5** Test by intentionally throwing errors

**Acceptance Criteria:**
- Errors show friendly fallback UI instead of white screen
- Users can recover by refreshing
- Error details logged to console (dev mode)

**Files Affected:**
- `components/ErrorBoundary.tsx` (new)
- `app/error.tsx` (new)
- `app/global-error.tsx` (new)

---

### 7.7 Performance: Parallelize TMDB API Calls
**Priority:** Low (Performance optimization)
**Status:** ✅ Complete

**Problem:**
`getActorMovies()` makes sequential API calls for each movie to fetch details (runtime filtering). For actors with 50+ movies, this creates 50+ sequential requests.

**Solution:**
Parallelize API calls using `Promise.all()` with batching to respect TMDB rate limits.

**Tasks:**
- [x] **7.7.1** Refactor `getActorMovies()` to use `Promise.all()` for movie detail fetches
- [x] **7.7.2** Implement batching (10 concurrent requests max) to avoid rate limits
- [x] **7.7.3** Add error handling for partial batch failures
- [x] **7.7.4** Parallelize stats endpoint movie fetches (`popular/route.ts`, `rare/route.ts`)
- [x] **7.7.5** Measure and document performance improvement

**Acceptance Criteria:**
- Challenge generation is significantly faster
- Stats endpoints respond faster
- No TMDB rate limit errors

**Files Affected:**
- `lib/tmdb-client.ts`
- `app/api/stats/popular/route.ts`
- `app/api/stats/rare/route.ts`

---

### Phase 7 Summary

| Task | Priority | Status | ESLint Impact |
|------|----------|--------|---------------|
| 7.1 TMDB TypeScript Migration | High | ✅ | Fixes 3 errors |
| 7.2 Next.js Image Optimization | High | ✅ | Fixes 4 warnings |
| 7.3 Accessibility Improvements | Medium | ✅ | Fixes 1 warning |
| 7.4 Remove Unused Variables | Medium | ✅ | Fixes 6 warnings |
| 7.5 API Response Caching | Medium | ✅ | N/A |
| 7.6 Error Boundary | Medium | ✅ | N/A |
| 7.7 Parallelize API Calls | Low | ✅ | N/A |

**Total ESLint Issues Fixed:** 3 errors, 11 warnings (all issues)

**Recommended Order:**
1. 7.1 (blocks other work, fixes errors)
2. 7.4 (quick wins, clears warnings)
3. 7.2 (requires 7.1 complete for clean types)
4. 7.3 (accessibility compliance)
5. 7.5 (performance, can be done with 7.1)
6. 7.6 (reliability)
7. 7.7 (optimization, lowest priority)

---

## 13. Phase 8: Production Readiness

### Overview
This phase addresses the remaining gaps from Phase 5 (Polish & Testing) with comprehensive engineering rigor. Rather than surface-level fixes, these tasks establish proper patterns, testing methodologies, and compliance standards for a production-quality application.

**Goals:**
- Achieve WCAG 2.1 AA accessibility compliance
- Implement true mobile-first responsive design
- Optimize client-side React performance
- Establish testing baselines and documentation
- Support user preferences (motion, color scheme)

---

### 8.1 Accessibility: WCAG 2.1 AA Compliance
**Priority:** High
**Status:** ✅ Complete

**Problem:**
Current accessibility implementation covers basic ARIA patterns but lacks formal WCAG compliance. No color contrast verification, motion sensitivity support, or screen reader testing has been performed.

**WCAG 2.1 AA Requirements to Address:**
- 1.4.3 Contrast (Minimum) - 4.5:1 for normal text, 3:1 for large text
- 1.4.11 Non-text Contrast - 3:1 for UI components
- 2.3.3 Animation from Interactions - Respect reduced motion preferences
- 2.4.7 Focus Visible - Clear focus indicators on all interactive elements
- 4.1.2 Name, Role, Value - All interactive elements properly labeled

**Tasks:**

**8.1.1 Color Contrast Audit**
- [x] Audit all color combinations using WebAIM Contrast Checker
- [x] Document current contrast ratios for each combination:
  - Cream (#F5E6D3) on Navy (#1a2650)
  - Gold (#FDB913) on Navy (#1a2650)
  - Coral (#E94F37) on Navy (#1a2650)
  - Silver (#8B98A8) on Navy (#1a2650)
  - White on Gold (button text)
  - Navy on Gold (button text alternative)
- [x] Identify and fix any combinations below 4.5:1 (normal text) or 3:1 (large text/UI)
- [x] Create contrast-safe color token variants if needed

**8.1.2 Motion Sensitivity Support**
- [x] Add `prefers-reduced-motion` media query to `globals.css`
- [x] Audit all animations and transitions:
  - `animate-pulse-slow` (timer)
  - `animate-shake` (penalty feedback)
  - `animate-pop` (correct guess)
  - `animate-fade-in` (poster reveal)
  - `animate-feedback-pop` (score popup)
  - Button hover/active transitions
  - Timer warning pulse
- [x] Create reduced-motion alternatives:
  - Replace motion with opacity/color changes where appropriate
  - Disable non-essential animations entirely
  - Preserve essential feedback (correct/incorrect) via non-motion cues
- [x] Test with system reduced-motion setting enabled

**8.1.3 Focus Management**
- [x] Audit all interactive elements for visible focus indicators
- [x] Add explicit focus styles to:
  - All buttons (Start, End Game, Share, Copy)
  - Dropdown options in autocomplete
  - Any clickable cards or links
- [x] Implement focus trap in autocomplete dropdown when open
- [x] Ensure focus returns to input after dropdown selection
- [x] Add skip-to-content link for keyboard navigation
- [x] Test complete keyboard-only navigation flow

**8.1.4 ARIA Completeness**
- [x] Add descriptive `aria-label` to all buttons:
  - "Start today's challenge"
  - "End game early"
  - "Share your results"
  - "Copy movie list to clipboard"
  - "Play again tomorrow" (if applicable)
- [x] Add `role="timer"` and `aria-live="polite"` to Timer component
- [x] Add `aria-live="polite"` to score/feedback announcements
- [x] Add `aria-describedby` linking inputs to helper text
- [x] Ensure all form controls have associated labels

**8.1.5 Screen Reader Testing**
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Document screen reader announcement flow:
  - Game start state
  - Timer countdown (should not spam announcements)
  - Correct guess feedback
  - Incorrect guess feedback
  - Game end summary
- [ ] Fix any confusing or missing announcements
- [ ] Verify autocomplete suggestions are announced correctly

**8.1.6 Semantic HTML Audit**
- [x] Verify heading hierarchy (h1 → h2 → h3, no skipped levels)
- [x] Ensure landmark regions are properly defined (main, nav, footer)
- [x] Replace any `<div>` click handlers with proper `<button>` elements
- [x] Add `<time>` element for timer display with datetime attribute
- [x] Use `<output>` element for score display

**Acceptance Criteria:**
- Lighthouse Accessibility score ≥ 95
- All color combinations meet WCAG AA contrast requirements
- Full keyboard navigation without mouse
- Screen reader users can complete game successfully
- Animations respect user motion preferences

**Files Affected:**
- `app/globals.css`
- `components/AutocompleteInput.tsx`
- `components/Timer.tsx`
- `components/GameBoard.tsx`
- `components/Results.tsx`
- `app/layout.tsx`

---

### 8.2 Responsive Design: Mobile-First Implementation
**Priority:** High
**Status:** ✅ Complete

**Problem:**
Current responsive implementation uses mobile breakpoints but follows a desktop-first approach. Edge cases (ultra-small screens, landscape orientation, notched devices) are not handled. No documented device testing.

**Design Principles:**
- Start with smallest viewport, progressively enhance
- Test on real devices, not just browser resize
- Account for safe areas (notches, rounded corners)
- Support both portrait and landscape orientations

**Tasks:**

**8.2.1 Mobile-First CSS Refactor**
- [x] Audit all Tailwind classes for desktop-first patterns
- [x] Refactor to mobile-first (base styles for mobile, `sm:` `md:` `lg:` for larger)
- [x] Document breakpoint strategy:
  - Base: 0-639px (mobile portrait)
  - `sm`: 640-767px (mobile landscape / small tablet)
  - `md`: 768-1023px (tablet)
  - `lg`: 1024-1279px (laptop)
  - `xl`: 1280px+ (desktop)
- [x] Remove any hardcoded pixel widths that break on small screens
- [x] Ensure no horizontal scroll on any viewport width

**8.2.2 Small Screen Optimization (< 375px)**
- [x] Test on iPhone SE (375px) and smaller (320px)
- [x] Adjust typography scale for readability:
  - Challenge prompt minimum readable size
  - Timer digits visible without truncation
  - Button text doesn't wrap awkwardly
- [x] Ensure touch targets remain ≥ 44px (iOS) / 48px (Android)
- [x] Verify autocomplete dropdown fits within viewport
- [x] Movie grid columns appropriate for screen width

**8.2.3 Landscape Orientation Support**
- [x] Test all views in landscape mode
- [x] Adjust layouts for short/wide viewports:
  - Game board may need horizontal layout
  - Timer and input side-by-side consideration
  - Movie grid columns for landscape
- [x] Prevent layout shift on orientation change
- [x] Maintain playability without requiring portrait mode

**8.2.4 Safe Area Support (Notched Devices)**
- [x] Add `viewport-fit=cover` to viewport meta tag
- [x] Use `env(safe-area-inset-*)` for:
  - Bottom padding (home indicator area)
  - Top padding (notch/dynamic island)
  - Side padding (curved screen edges)
- [x] Test on iPhone with notch/dynamic island
- [x] Test on Android devices with punch-hole cameras

**8.2.5 Touch Interaction Audit**
- [x] Verify all touch targets ≥ 48px
- [x] Add adequate spacing between touch targets (≥ 8px)
- [x] Remove hover-only interactions (ensure touch alternatives)
- [x] Test autocomplete selection on touch devices
- [x] Verify scrolling behavior in movie grid
- [x] Test pull-to-refresh doesn't interfere with gameplay

**8.2.6 Device Testing Matrix**
- [ ] Create device testing checklist
- [ ] Test on physical devices:
  - iPhone SE (small iOS)
  - iPhone 14 Pro (notch/dynamic island)
  - iPad (tablet)
  - Android phone (various sizes)
  - Android tablet
- [ ] Document any device-specific issues
- [ ] Test with browser DevTools device emulation for coverage

**8.2.7 High-DPI Display Optimization**
- [ ] Verify images are sharp on retina displays
- [ ] Ensure 2x/3x assets served where needed
- [ ] Check that borders/shadows render crisply
- [ ] Test on high-DPI monitors (4K, 5K)

**Acceptance Criteria:**
- No horizontal scrolling on any device
- Full gameplay possible on 320px width screen
- Landscape mode fully functional
- No content obscured by notches or safe areas
- Documented testing on ≥ 5 physical devices

**Files Affected:**
- `app/globals.css`
- `app/layout.tsx` (viewport meta)
- `components/GameBoard.tsx`
- `components/MovieGrid.tsx`
- `components/AutocompleteInput.tsx`
- `components/Timer.tsx`
- `components/Results.tsx`

---

### 8.3 Performance: Client-Side Optimization
**Priority:** Medium
**Status:** ✅ Complete

**Problem:**
API-side performance is optimized (Phase 7), but client-side React performance has not been addressed. No memoization, code splitting, or bundle analysis performed.

**Tasks:**

**8.3.1 React Component Memoization**
- [x] Identify expensive render operations:
  - Movie grid sorting/filtering
  - Results calculations
  - Feedback animations
- [x] Add `React.memo()` to pure presentational components:
  - MovieGrid item components
  - Timer display (if separated)
  - Individual result cards
- [x] Add `useMemo()` for expensive calculations:
  - Sorted movie arrays in Results
  - Filtered/grouped movie lists
  - Score calculations
- [x] Add `useCallback()` for handler functions passed as props
- [ ] Verify improvements with React DevTools Profiler

**8.3.2 Code Splitting & Lazy Loading**
- [x] Implement dynamic imports for heavy components:
  ```typescript
  const Results = dynamic(() => import('@/components/Results'), {
    loading: () => <ResultsSkeleton />
  })
  ```
- [x] Lazy load Results component (not needed until game ends)
- [ ] Evaluate ShareButton for lazy loading (uses clipboard API)
- [x] Add Suspense boundaries with appropriate fallbacks
- [ ] Measure bundle size reduction

**8.3.3 Bundle Analysis**
- [x] Install and configure `@next/bundle-analyzer`
- [x] Generate initial bundle analysis report
- [x] Identify largest dependencies
- [ ] Evaluate alternatives for heavy dependencies
- [x] Document bundle size baseline and targets:
  - First Load JS target: < 100KB
  - Largest chunk target: < 50KB
  - **Baseline (Jan 2026):** App chunks: ~19KB, Total chunks: ~852KB (includes framework/polyfills)
- [ ] Set up CI check for bundle size regression

**8.3.4 Lighthouse Performance Audit**
- [ ] Run Lighthouse performance audit
- [ ] Document baseline scores:
  - Performance
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Time to Interactive (TTI)
  - Cumulative Layout Shift (CLS)
  - Total Blocking Time (TBT)
- [ ] Address any critical performance issues
- [ ] Set performance budget thresholds
- [ ] Target: Performance score ≥ 90

**8.3.5 Runtime Performance Profiling**
- [ ] Profile with React DevTools during gameplay
- [ ] Identify unnecessary re-renders
- [ ] Check for memory leaks (especially timer intervals)
- [ ] Verify cleanup in useEffect hooks
- [ ] Test performance with large movie grids (50+ guesses)

**8.3.6 Network Performance**
- [x] Verify efficient resource loading order
- [ ] Check for render-blocking resources
- [x] Optimize font loading strategy (font-display: swap)
- [x] Preload critical assets (logo, fonts)
- [x] Preconnect to TMDB image CDN
- [x] Verify API calls are not duplicated

**Acceptance Criteria:**
- Lighthouse Performance score ≥ 90
- No unnecessary re-renders during gameplay
- Bundle size within defined limits
- No memory leaks after extended play sessions
- Documented performance baseline

**Files Affected:**
- `components/*.tsx` (memoization)
- `app/page.tsx` (dynamic imports)
- `next.config.ts` (bundle analyzer)
- `package.json` (new dev dependency)

---

### 8.4 Testing & Documentation
**Priority:** Medium
**Status:** 🔲 Not Started

**Problem:**
No formal testing infrastructure or documentation of testing procedures. Testing is ad-hoc and undocumented.

**Tasks:**

**8.4.1 Testing Infrastructure Setup**
- [ ] Evaluate testing framework options:
  - Playwright (E2E, accessibility)
  - Vitest (unit tests)
  - Testing Library (component tests)
- [ ] Install and configure chosen framework(s)
- [ ] Set up test directory structure
- [ ] Configure CI to run tests on PR

**8.4.2 Critical Path E2E Tests**
- [ ] Test complete game flow:
  - Load homepage
  - Click Start
  - Enter correct guess
  - Enter incorrect guess
  - Let timer run out / click End Game
  - View results
  - Share results
- [ ] Test localStorage persistence:
  - Game state survives refresh
  - Completed game prevents replay
- [ ] Test error scenarios:
  - Network failure during search
  - Challenge API failure

**8.4.3 Accessibility Automated Tests**
- [ ] Configure axe-core with Playwright
- [ ] Add accessibility assertions to E2E tests
- [ ] Test keyboard navigation flow
- [ ] Verify ARIA attributes programmatically

**8.4.4 Visual Regression Testing**
- [ ] Evaluate visual testing options (Percy, Chromatic, Playwright screenshots)
- [ ] Capture baseline screenshots:
  - Homepage (before start)
  - Active game state
  - Results screen
  - Error states
  - Mobile viewport
- [ ] Configure CI to detect visual regressions

**8.4.5 Testing Documentation**
- [ ] Create `docs/TESTING.md` with:
  - How to run tests locally
  - Test coverage expectations
  - Manual testing checklist
  - Device testing matrix
  - Accessibility testing procedure
- [ ] Document browser/device support matrix

**Acceptance Criteria:**
- Automated tests for critical game flow
- Accessibility tests passing
- Testing documentation complete
- CI runs tests on every PR

**Files Affected:**
- `package.json` (test dependencies)
- `playwright.config.ts` or `vitest.config.ts` (new)
- `tests/` directory (new)
- `docs/TESTING.md` (new)
- `.github/workflows/` (CI configuration)

---

### 8.5 User Preferences: Dark/Light Mode
**Priority:** Low
**Status:** 🔲 Not Started

**Problem:**
Application has a fixed dark theme. Some users prefer light mode or system-matched themes.

**Tasks:**

**8.5.1 Theme Architecture**
- [ ] Design light theme color palette:
  - Light background alternative
  - Adjusted text colors for contrast
  - Button/accent colors that work on light
- [ ] Implement CSS custom properties for theme values
- [ ] Create theme toggle mechanism

**8.5.2 System Preference Detection**
- [ ] Implement `prefers-color-scheme` media query
- [ ] Default to system preference
- [ ] Allow manual override stored in localStorage
- [ ] Sync with system changes in real-time

**8.5.3 Theme Toggle UI**
- [ ] Add theme toggle to UI (location TBD)
- [ ] Design toggle component (icon button or dropdown)
- [ ] Implement smooth theme transition animation
- [ ] Persist user preference across sessions

**8.5.4 Theme Testing**
- [ ] Verify all components in both themes
- [ ] Check contrast ratios in light mode
- [ ] Test theme switching during gameplay
- [ ] Ensure no flash of wrong theme on load

**Acceptance Criteria:**
- Both dark and light themes fully functional
- System preference respected by default
- User can override and preference persists
- No accessibility regressions in either theme

**Files Affected:**
- `app/globals.css`
- `app/layout.tsx`
- `components/ThemeToggle.tsx` (new)
- `lib/theme.ts` (new)

---

### Phase 8 Summary

| Task | Priority | Status | Category |
|------|----------|--------|----------|
| 8.1 WCAG 2.1 AA Compliance | High | ✅ | Accessibility |
| 8.2 Mobile-First Implementation | High | ✅ | Responsive |
| 8.3 Client-Side Optimization | Medium | ✅ | Performance |
| 8.4 Testing & Documentation | Medium | 🔲 | Quality |
| 8.5 Dark/Light Mode | Low | 🔲 | User Preferences |

**Recommended Order:**
1. 8.1 (accessibility is a launch blocker for many organizations)
2. 8.2 (mobile users are primary audience for casual games)
3. 8.4 (establish testing before more changes)
4. 8.3 (optimization based on real usage patterns)
5. 8.5 (nice-to-have, not critical for MVP)

**Dependencies:**
- 8.1.1 (Color Contrast) should inform 8.5 (Theme) color choices
- 8.4 (Testing) should be established before major 8.2/8.3 refactors
- 8.3.4 (Lighthouse) provides data for prioritizing 8.3 tasks

---

**Version:** 1.5
**Last Updated:** January 25, 2026
**Status:** Phase 8 Planning Complete