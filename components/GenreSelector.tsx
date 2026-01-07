
import React from 'react';
import { GENRES } from '../types';

interface GenreSelectorProps {
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedGenres, onToggleGenre }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-stone-700 mb-4">Quais gêneros você mais gosta?</h3>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => onToggleGenre(genre)}
              className={`px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${
                isSelected
                  ? 'bg-amber-700 text-white border-amber-800 shadow-md transform scale-105'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:bg-stone-50'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GenreSelector;
