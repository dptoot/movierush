// lib/featured-actors.ts

/**
 * Featured actors for daily challenges
 * Deterministic selection based on day of year ensures same date = same actor
 */

export interface FeaturedActor {
  name: string;
  tmdb_id: number;
}

export const FEATURED_ACTORS: FeaturedActor[] = [
  { name: "Will Ferrell", tmdb_id: 23659 },
  { name: "Adam Sandler", tmdb_id: 19292 },
  { name: "Jim Carrey", tmdb_id: 206 },
  { name: "Steve Carell", tmdb_id: 4495 },
  { name: "Ben Stiller", tmdb_id: 7399 },
  { name: "Owen Wilson", tmdb_id: 887 },
  { name: "Seth Rogen", tmdb_id: 19274 },
  { name: "Melissa McCarthy", tmdb_id: 55536 },
  { name: "Vince Vaughn", tmdb_id: 4937 },
  { name: "Jack Black", tmdb_id: 70851 },
  { name: "Mike Myers", tmdb_id: 12073 },
  { name: "Chris Rock", tmdb_id: 2178 },
  { name: "Kevin James", tmdb_id: 56322 },
  { name: "Jonah Hill", tmdb_id: 21007 },
  { name: "Tom Cruise", tmdb_id: 500 },
  { name: "Dwayne Johnson", tmdb_id: 18918 },
  { name: "Keanu Reeves", tmdb_id: 6384 },
  { name: "Jason Statham", tmdb_id: 976 },
  { name: "Bruce Willis", tmdb_id: 62 },
  { name: "Arnold Schwarzenegger", tmdb_id: 1100 },
  { name: "Sylvester Stallone", tmdb_id: 16483 },
  { name: "Charlize Theron", tmdb_id: 6885 },
  { name: "Vin Diesel", tmdb_id: 12835 },
  { name: "Jason Momoa", tmdb_id: 117642 },
  { name: "Idris Elba", tmdb_id: 25937 },
  { name: "Jackie Chan", tmdb_id: 18897 },
  { name: "Tom Hanks", tmdb_id: 31 },
  { name: "Denzel Washington", tmdb_id: 5292 },
  { name: "Leonardo DiCaprio", tmdb_id: 6193 },
  { name: "Brad Pitt", tmdb_id: 287 },
  { name: "Morgan Freeman", tmdb_id: 192 },
  { name: "Robert De Niro", tmdb_id: 380 },
  { name: "Al Pacino", tmdb_id: 1158 },
  { name: "Meryl Streep", tmdb_id: 5064 },
  { name: "Cate Blanchett", tmdb_id: 112 },
  { name: "Natalie Portman", tmdb_id: 524 },
  { name: "Philip Seymour Hoffman", tmdb_id: 1233 },
  { name: "Daniel Day-Lewis", tmdb_id: 11856 },
  { name: "Samuel L. Jackson", tmdb_id: 2231 },
  { name: "Nicolas Cage", tmdb_id: 2963 },
  { name: "Johnny Depp", tmdb_id: 85 },
  { name: "Harrison Ford", tmdb_id: 3 },
  { name: "Michael Caine", tmdb_id: 3895 },
  { name: "Gary Oldman", tmdb_id: 64 },
  { name: "Anthony Hopkins", tmdb_id: 4173 },
  { name: "Ian McKellen", tmdb_id: 1327 },
  { name: "Christopher Walken", tmdb_id: 4690 },
  { name: "Jeff Bridges", tmdb_id: 1229 },
  { name: "Chris Pratt", tmdb_id: 73457 },
  { name: "Ryan Reynolds", tmdb_id: 10859 },
  { name: "Scarlett Johansson", tmdb_id: 1245 },
  { name: "Chris Evans", tmdb_id: 16828 },
  { name: "Robert Downey Jr.", tmdb_id: 3223 },
  { name: "Jennifer Lawrence", tmdb_id: 72129 },
  { name: "Emma Stone", tmdb_id: 54693 },
  { name: "Ryan Gosling", tmdb_id: 30614 },
  { name: "Margot Robbie", tmdb_id: 234352 },
  { name: "Zendaya", tmdb_id: 505710 },
  { name: "Timothée Chalamet", tmdb_id: 1190668 },
  { name: "Florence Pugh", tmdb_id: 1373737 },
  { name: "Eddie Murphy", tmdb_id: 776 },
  { name: "Robin Williams", tmdb_id: 2157 },
  { name: "Bill Murray", tmdb_id: 1532 },
  { name: "Matt Damon", tmdb_id: 1892 },
  { name: "George Clooney", tmdb_id: 1461 },
  { name: "Julia Roberts", tmdb_id: 1204 },
  { name: "Sandra Bullock", tmdb_id: 18277 },
  { name: "Reese Witherspoon", tmdb_id: 368 },
  { name: "Anne Hathaway", tmdb_id: 1813 },
  { name: "Matthew McConaughey", tmdb_id: 10297 },
  { name: "Liam Neeson", tmdb_id: 3896 },
  { name: "Clint Eastwood", tmdb_id: 190 },
  { name: "Kevin Costner", tmdb_id: 1269 },
  { name: "Sigourney Weaver", tmdb_id: 10205 },
  { name: "Mel Gibson", tmdb_id: 2461 },
  { name: "John Travolta", tmdb_id: 8891 },
  { name: "Kurt Russell", tmdb_id: 16869 },
  { name: "Michelle Pfeiffer", tmdb_id: 1160 },
  { name: "Mark Wahlberg", tmdb_id: 13240 },
  { name: "Channing Tatum", tmdb_id: 38673 },
  { name: "Chris Hemsworth", tmdb_id: 74568 },
  { name: "Jake Gyllenhaal", tmdb_id: 2219 },
  { name: "Christian Bale", tmdb_id: 3894 },
  { name: "Hugh Jackman", tmdb_id: 6968 },
  { name: "Joaquin Phoenix", tmdb_id: 73421 },
  { name: "Ethan Hawke", tmdb_id: 1037 },
  { name: "Edward Norton", tmdb_id: 819 },
  { name: "Jude Law", tmdb_id: 3392 },
  { name: "Colin Firth", tmdb_id: 5472 },
  { name: "Ralph Fiennes", tmdb_id: 5469 },
  { name: "Javier Bardem", tmdb_id: 3810 },
  { name: "Michael Fassbender", tmdb_id: 20999 },
  { name: "Benedict Cumberbatch", tmdb_id: 71580 },
  { name: "Tom Hardy", tmdb_id: 2524 },
  { name: "Oscar Isaac", tmdb_id: 204 },
  { name: "John Goodman", tmdb_id: 1230 },
  { name: "Steve Buscemi", tmdb_id: 884 },
  { name: "Willem Dafoe", tmdb_id: 5293 },
  { name: "Stanley Tucci", tmdb_id: 2283 },
  { name: "Tommy Lee Jones", tmdb_id: 2176 },
];

/**
 * Calculate day of year from a date string (YYYY-MM-DD)
 * Returns a number from 1 to 365/366
 */
export function getDayOfYear(dateString: string): number {
  const date = new Date(dateString + 'T00:00:00Z');
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1; // 1-indexed (Jan 1 = 1)
}

/**
 * Select an actor for a given date (deterministic)
 * Same date always returns the same actor
 */
export function selectActorForDate(date: string): FeaturedActor {
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % FEATURED_ACTORS.length;
  return FEATURED_ACTORS[index];
}
