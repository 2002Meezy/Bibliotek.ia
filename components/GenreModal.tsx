
import React, { useState, useMemo } from 'react';
import { GENRES } from '../types';

interface GenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
}

const GenreModal: React.FC<GenreModalProps> = ({ isOpen, onClose, selectedGenres, onToggleGenre }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGenres = useMemo(() => {
    return GENRES.filter(genre => 
      genre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200">
        <header className="p-8 border-b border-stone-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-serif font-bold text-stone-900">Seus Gêneros Favoritos</h3>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-stone-400 text-xs mb-6 font-medium leading-relaxed">
            Selecione "Todos" para analisar todos os livros da foto ou escolha gêneros específicos.
          </p>
          <div className="relative">
            <input 
              type="text"
              placeholder="Pesquisar gênero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-100 border-none rounded-2xl py-3 pl-11 pr-4 text-stone-800 focus:ring-2 focus:ring-amber-500 transition-all outline-none text-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-8 pt-2">
          <div className="space-y-2">
            {filteredGenres.length > 0 ? (
              filteredGenres.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                const isAll = genre === 'Todos';
                
                return (
                  <label 
                    key={genre}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected 
                        ? 'bg-amber-50 border-amber-200 shadow-sm' 
                        : 'bg-white border-stone-100 hover:border-stone-200 hover:bg-stone-50'
                    } ${isAll ? 'border-amber-300 bg-amber-50/20' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-amber-700 border-amber-700' : 'border-stone-300'
                      }`}>
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-3 h-3 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-medium transition-colors ${
                        isSelected ? 'text-amber-900' : 'text-stone-600'
                      } ${isAll ? 'font-black uppercase tracking-tight text-amber-800' : ''}`}>
                        {genre}
                      </span>
                    </div>
                    <input 
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => onToggleGenre(genre)}
                    />
                    {isAll && (
                      <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-md uppercase tracking-wider">Ver Tudo</span>
                    )}
                  </label>
                );
              })
            ) : (
              <div className="py-10 text-center text-stone-400 text-sm italic">
                Nenhum gênero encontrado para "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        <footer className="p-8 border-t border-stone-100 bg-stone-50/50">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all active:scale-[0.98]"
          >
            Confirmar Seleção ({selectedGenres.length})
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GenreModal;
