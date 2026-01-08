
import React, { useState, useRef, useEffect } from 'react';

const LibraryGenreFilter = ({
    genres,
    selectedGenre,
    onSelect
}: {
    genres: string[],
    selectedGenre: string,
    onSelect: (genre: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-40" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border border-stone-200 text-stone-700 text-sm font-bold uppercase tracking-wider rounded-2xl px-5 py-3 shadow-sm hover:border-amber-300 hover:shadow-md hover:bg-amber-50/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-200/50 active:scale-95 min-w-[180px] justify-between"
            >
                <span className="truncate">{selectedGenre === 'Todos' ? 'Todos Gêneros' : selectedGenre}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-stone-100 overflow-hidden animate-dropdown-pop origin-top-right">
                    <div className="max-h-[300px] overflow-y-auto py-2 custom-scrollbar">
                        <button
                            onClick={() => {
                                onSelect('Todos');
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between group
                ${selectedGenre === 'Todos' ? 'bg-amber-50 text-amber-700' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}
                        >
                            Todos Gêneros
                            {selectedGenre === 'Todos' && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-600">
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .207 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        <div className="h-px bg-stone-100 mx-4 my-1"></div>
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => {
                                    onSelect(genre);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between group
                  ${selectedGenre === genre ? 'bg-amber-50 text-amber-700' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`}
                            >
                                {genre}
                                {selectedGenre === genre && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-600">
                                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .207 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryGenreFilter;
