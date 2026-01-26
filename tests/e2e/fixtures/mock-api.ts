import { Page } from '@playwright/test';

/**
 * Mock data for e2e tests
 * These mocks allow tests to run without a real database connection
 */

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Mock challenge data - Christmas movies theme
export const mockChallenge = {
  id: 1,
  date: getTodayDate(),
  prompt: 'Christmas Movies',
  type: 'theme',
  total_movies: 5,
  valid_movie_ids: [771, 772, 773, 774, 775], // Fake IDs for testing
};

// Mock autocomplete results for different queries
export const mockAutocompleteResults: Record<string, typeof mockMovies> = {
  'the matrix': [
    {
      id: 603,
      title: 'The Matrix',
      release_date: '1999-03-30',
      poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      vote_count: 24000,
      vote_average: 8.2,
      popularity: 80.5,
    },
    {
      id: 604,
      title: 'The Matrix Reloaded',
      release_date: '2003-05-15',
      poster_path: '/aA5qHS0FbSXO8PxcxUIHbDrJyuh.jpg',
      vote_count: 12000,
      vote_average: 7.0,
      popularity: 45.2,
    },
    {
      id: 605,
      title: 'The Matrix Revolutions',
      release_date: '2003-11-05',
      poster_path: '/t1wm4PgOQ8e4z1C6tk1yDNrps4T.jpg',
      vote_count: 9000,
      vote_average: 6.7,
      popularity: 38.1,
    },
  ],
  'star wars': [
    {
      id: 11,
      title: 'Star Wars',
      release_date: '1977-05-25',
      poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
      vote_count: 19000,
      vote_average: 8.2,
      popularity: 95.3,
    },
    {
      id: 1891,
      title: 'The Empire Strikes Back',
      release_date: '1980-05-20',
      poster_path: '/2l05cFWJacyIsTpsEhAf7Mh9Y67.jpg',
      vote_count: 15000,
      vote_average: 8.4,
      popularity: 72.1,
    },
    {
      id: 1892,
      title: 'Return of the Jedi',
      release_date: '1983-05-25',
      poster_path: '/mDCBQNhR6R0PVFucJAEzW1bb5hh.jpg',
      vote_count: 12000,
      vote_average: 8.0,
      popularity: 60.4,
    },
  ],
  avatar: [
    {
      id: 19995,
      title: 'Avatar',
      release_date: '2009-12-15',
      poster_path: '/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg',
      vote_count: 28000,
      vote_average: 7.6,
      popularity: 120.5,
    },
    {
      id: 76600,
      title: 'Avatar: The Way of Water',
      release_date: '2022-12-14',
      poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      vote_count: 10000,
      vote_average: 7.7,
      popularity: 200.3,
    },
  ],
  elf: [
    {
      id: 771,
      title: 'Elf',
      release_date: '2003-11-07',
      poster_path: '/oOleziEempUPu96bkYHl3i4X7tR.jpg',
      vote_count: 5000,
      vote_average: 7.0,
      popularity: 45.2,
    },
  ],
};

// Default mock movies for any query
const mockMovies = [
  {
    id: 550,
    title: 'Fight Club',
    release_date: '1999-10-15',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    vote_count: 26000,
    vote_average: 8.4,
    popularity: 85.5,
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    release_date: '1994-09-10',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    vote_count: 25000,
    vote_average: 8.5,
    popularity: 90.2,
  },
];

/**
 * Sets up all API mocks for e2e tests
 * Call this before navigating to any page
 */
export async function setupApiMocks(page: Page) {
  // Mock the challenge API
  await page.route('**/api/challenge**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockChallenge),
    });
  });

  // Mock the autocomplete API
  await page.route('**/api/autocomplete', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: mockMovies }),
    });
  });

  // Mock the stats recording API (fire and forget)
  await page.route('**/api/stats/record-guess', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Sets up API mocks with custom autocomplete behavior based on query
 * Useful for tests that need specific movie results
 */
export async function setupApiMocksWithSearch(page: Page) {
  // Mock the challenge API
  await page.route('**/api/challenge**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockChallenge),
    });
  });

  // Mock the autocomplete API with query-based responses
  await page.route('**/api/autocomplete', async (route) => {
    const request = route.request();
    let results = mockMovies;

    try {
      const postData = request.postDataJSON();
      if (postData?.query) {
        const query = postData.query.toLowerCase();
        // Find matching mock results
        for (const [key, value] of Object.entries(mockAutocompleteResults)) {
          if (query.includes(key) || key.includes(query)) {
            results = value;
            break;
          }
        }
      }
    } catch {
      // Use default results if parsing fails
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results }),
    });
  });

  // Mock the stats recording API
  await page.route('**/api/stats/record-guess', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}
