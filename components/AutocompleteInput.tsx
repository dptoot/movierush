'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface MovieSuggestion {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_count: number;
  vote_average: number;
}

interface AutocompleteInputProps {
  onSelect: (movie: MovieSuggestion) => void;
  disabled?: boolean;
}

export default function AutocompleteInput({
  onSelect,
  disabled = false,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on mount
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Debounced search function - searches ALL TMDB movies
  const searchMovies = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSuggestions(data.results || []);
      setShowDropdown(data.results?.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer (300ms)
    debounceRef.current = setTimeout(() => {
      searchMovies(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSelect = (movie: MovieSuggestion) => {
    onSelect(movie);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Get year from release date
  const getYear = (releaseDate: string) => {
    return releaseDate ? releaseDate.split('-')[0] : '';
  };

  return (
    <div className="relative mx-auto max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Type a movie name..."
          disabled={disabled}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-10 text-lg outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          autoComplete="off"
          aria-label="Search for movies"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
          </div>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
          role="listbox"
        >
          {suggestions.map((movie, index) => (
            <button
              key={movie.id}
              onClick={() => handleSelect(movie)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {/* Movie poster thumbnail */}
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt=""
                  className="h-12 w-8 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-8 items-center justify-center rounded bg-zinc-200 dark:bg-zinc-600">
                  <span className="text-xs text-zinc-400">🎬</span>
                </div>
              )}

              {/* Movie title and year */}
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {movie.title}
                </p>
                <p className="text-sm text-zinc-500">
                  {getYear(movie.release_date)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && query.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-200 bg-white p-4 text-center text-sm text-zinc-500 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          No matching movies found
        </div>
      )}
    </div>
  );
}
