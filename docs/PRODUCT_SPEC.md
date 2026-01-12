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
- **Correct guess:**
  - Movie poster reveals in skeleton list
  - Time bonus added (based on popularity algorithm)
  - Input clears, ready for next guess
- **Incorrect guess:**
  - 5-second time penalty
  - No visual indication saved (doesn't show wrong guesses)
  - Input clears, ready for next guess
- Can continue until timer expires or player manually ends game

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
- **TBD:** Final formula to be determined after analyzing real movie data distribution
- Tentative approach using popularity buckets:
  - Very Popular (200+): +0 bonus points
  - Popular (100-199): +5 bonus points
  - Moderate (50-99): +10 bonus points
  - Obscure (<50): +20 bonus points
- Will be refined in Phase 2 after analyzing actual filmography data

**Total Score:**
- Sum of all (base points + popularity bonuses)

**Time:**
- Not factored into scoring
- Purely a constraint to prevent unlimited guessing time

### 2.4 Time Mechanics

**Starting Time:** 60 seconds

**Time Bonus per Correct Answer:**
- Algorithm based on TMDB popularity score (unbounded, typically 0-800+)
- **TBD:** Final formula to be determined after analyzing real movie data distribution
- Tentative approach using popularity buckets:
  - Very Popular (200+): +3 seconds
  - Popular (100-199): +8 seconds  
  - Moderate (50-99): +15 seconds
  - Obscure (<50): +20 seconds
- Will be refined in Phase 2 after analyzing actual filmography data

**Time Penalty:**
- -5 seconds per incorrect guess

**Maximum Time:**
- TBD (configurable for future adjustment)
- Initial implementation: No hard cap

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
- Autocomplete suggests valid movies as I type
- Timer starts at 60 seconds and counts down visibly
- Correct guesses reveal movie poster
- Time bonuses added for correct guesses
- Time penalties applied for wrong guesses

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
  id: string;
  date: string; // YYYY-MM-DD (UTC)
  type: 'actor' | 'director' | 'genre' | 'theme';
  prompt: string; // Display text: "Name Will Ferrell Movies"
  tmdb_filter: {
    person_id?: number; // For actor/director challenges
    genre_id?: number;  // For genre challenges
    // Other filters as needed
  };
  valid_movies: Movie[];
  created_at: timestamp;
}

interface Movie {
  tmdb_id: number;
  title: string;
  release_date: string;
  poster_path: string;
  popularity: number; // TMDB popularity score
  backdrop_path?: string;
}
```

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
  "id": "challenge_2024_01_15",
  "date": "2024-01-15",
  "prompt": "Name Will Ferrell Movies",
  "type": "actor",
  "total_movies": 15
}
```

**GET /api/challenge/[id]/movies**
- Returns valid movies for a challenge (after game ends or for validation)
- Used for end-game reveal

**POST /api/autocomplete**
- Body: `{ query: string, challenge_id: string }`
- Returns: Filtered movie suggestions from TMDB
- Filters results to only valid movies for today's challenge

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
- [x] Set up Neon Postgres database via Vercel Marketplace
   - Create database from Vercel dashboard Storage tab
   - Copy connection strings to local `.env.local`
- [x] Create database schema (Challenge, Movie tables)
- [x] Build TMDB utility functions (`/lib/tmdb.ts`)
- [x] Analyze popularity score distribution
   - Fetch sample actor's complete filmography (e.g., Will Ferrell)
   - Document actual popularity score ranges
   - Determine appropriate bucket thresholds
   - Design scoring/time bonus algorithms based on real data
- [x] Create script to generate a single challenge (`/scripts/generate-challenge.ts`)
- [ ] Manually create 3-5 test challenges in database
- [ ] Build `/api/challenge` endpoint to fetch today's challenge

**Deliverable:** API endpoint that returns today's challenge data with real movies from database

### 6.3 Phase 3: Core Game UI (Week 2-3)
**Goal: Build the playable game interface**

**Tasks:**
1. Create `GameBoard` component (main game container)
2. Build `Timer` component with countdown logic
3. Build `AutocompleteInput` with TMDB search
4. Create `MovieGrid` skeleton list
5. Implement guess validation flow
6. Add time bonus/penalty logic
7. Implement poster reveal animations

**Deliverable:** Playable game (even if rough around edges)

**Component strategy:**
- Start with basic functionality, add polish later
- Use `'use client'` directive for interactive components
- Server Components for data fetching where possible

### 6.4 Phase 4: Scoring & End Game (Week 3-4)
**Goal: Complete the game loop**

**Tasks:**
1. Implement scoring algorithm (`/lib/scoring.ts`)
2. Build `Results` component (end game summary)
3. Create localStorage helpers for game state
4. Prevent replay of same day's challenge
5. Build share functionality
6. Show all movies (guessed vs. missed)

**Deliverable:** Full game loop from start to shareable results

### 6.5 Phase 5: Polish & Testing (Week 4-5)
**Goal: Make it production-ready**

**Tasks:**
1. Responsive design (mobile-first)
2. Loading states and error handling
3. Accessibility improvements
4. Performance optimization
5. User testing with friends/family
6. Bug fixes

**Deliverable:** Production-ready MVP

### 6.6 Phase 6: Automation (Week 5-6)
**Goal: Set up daily challenge generation**

**Tasks:**
1. Refine challenge generation script
2. Add validation rules (difficulty, list size)
3. Set up cron job (Vercel Cron or GitHub Actions)
4. Pre-generate 30 days of challenges
5. Monitor and adjust

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
TMDB_API_KEY=your_key_here
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
- [ ] Exact database choice (Vercel Postgres vs Supabase)
- [ ] Component library (shadcn/ui vs custom components)
- [ ] Share format design (text emojis vs image)

### Game Design Decisions
- [ ] Maximum time cap (yes/no, what value?)
- [ ] Exact autocomplete behavior (show all movies or just valid ones?)
- [ ] Movie poster quality (w185, w342, w500, or original?)
- [ ] Challenge difficulty rules (min/max movies, popularity ranges)

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

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Phase 1 Complete - Ready for Phase 2