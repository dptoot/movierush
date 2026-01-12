# Changelog

All notable changes to MovieRush will be documented in this file.

## [Unreleased]

### Added
- `/api/challenge` endpoint to fetch today's challenge (Phase 2.6)
- Test challenges in database for development (Phase 2.5)

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
