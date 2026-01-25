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
  const [searchError, setSearchError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);


  // Debounced search function - searches ALL TMDB movies
  const searchMovies = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

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
      setSearchError('Unable to search. Try again.');
      setShowDropdown(true);
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

  // Focus input on mount (when game starts)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get year from release date
  const getYear = (releaseDate: string) => {
    return releaseDate ? releaseDate.split('-')[0] : '';
  };

  return (
    <div className="relative mx-auto max-w-md w-full">
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
          className="w-full bg-white text-movierush-navy border-4 border-movierush-gold rounded-lg px-4 md:px-6 py-4 text-lg md:text-xl outline-none transition-all focus:ring-4 focus:ring-movierush-gold/50 placeholder:text-movierush-silver disabled:cursor-not-allowed disabled:opacity-50"
          autoComplete="off"
          aria-label="Search for movies"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="movie-suggestions-listbox"
          aria-activedescendant={selectedIndex >= 0 ? `movie-option-${selectedIndex}` : undefined}
          role="combobox"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-movierush-navy border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="movie-suggestions-listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden bg-white border-4 border-movierush-navy rounded-xl shadow-chunky-lg max-h-[60vh] overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((movie, index) => (
            <button
              key={movie.id}
              id={`movie-option-${index}`}
              onClick={() => handleSelect(movie)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex w-full items-center gap-3 px-4 py-3 min-h-12 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-movierush-gold text-movierush-navy'
                  : 'hover:bg-movierush-gold/20'
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {/* Movie title and year */}
              <div className="flex-1 overflow-hidden">
                <p className={`truncate font-semibold ${index === selectedIndex ? 'text-movierush-navy' : 'text-movierush-navy'}`}>
                  {movie.title}
                </p>
                <p className={`text-sm ${index === selectedIndex ? 'text-movierush-navy/70' : 'text-movierush-silver'}`}>
                  {getYear(movie.release_date)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {showDropdown && searchError && (
        <div className="absolute z-50 mt-2 w-full bg-white border-4 border-movierush-coral rounded-xl p-4 text-center shadow-chunky-lg">
          <span className="text-movierush-coral">{searchError}</span>
        </div>
      )}

      {/* No results message */}
      {showDropdown && query.length >= 2 && !isLoading && !searchError && suggestions.length === 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border-4 border-movierush-navy rounded-xl p-4 text-center shadow-chunky-lg">
          <span className="text-movierush-silver italic">No matching movies found</span>
        </div>
      )}
    </div>
  );
}
