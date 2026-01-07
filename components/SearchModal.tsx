
import React, { useState, useEffect } from 'react';
import { Book } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToLibrary: (book: Book) => void;
  isInLibrary: (title: string) => boolean;
  initialQuery?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddToLibrary, 
  isInLibrary,
  initialQuery = ""
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        handleSearch(initialQuery);
      } else {
        setQuery("");
        setResults([]);
      }
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Busca específica pelo título/termo para garantir relevância
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=12&printType=books&orderBy=relevance`
      );
      const data = await response.json();
      
      const formattedBooks: Book[] = (data.items || []).map((item: any) => {
        const info = item.volumeInfo;
        // Tenta obter a melhor resolução de imagem disponível
        const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                         info.imageLinks?.smallThumbnail?.replace('http:', 'https:');

        return {
          title: info.title,
          author: info.authors ? info.authors[0] : 'Autor Desconhecido',
          description: info.description || 'Sem descrição disponível.',
          genre: info.categories ? info.categories[0] : 'Geral',
          thumbnail: thumbnail,
          rating: 0
        };
      });
      
      setResults(formattedBooks);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200">
        <header className="p-6 sm:p-8 border-b border-stone-100 flex items-center gap-4">
          <div className="relative flex-grow">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Pesquisar por título, autor ou gênero..."
              className="w-full bg-stone-100 border-none rounded-2xl py-4 pl-12 pr-4 text-stone-800 focus:ring-2 focus:ring-amber-500 transition-all outline-none font-medium"
              autoFocus
            />
            <button 
              onClick={() => handleSearch()}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-4 hover:bg-stone-100 rounded-2xl text-stone-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6 bg-stone-50/30">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-100 border-t-amber-700"></div>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Consultando base de dados...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {results.map((book, idx) => {
                const added = isInLibrary(book.title);
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-stone-100 hover:border-amber-200 transition-all bg-white group shadow-sm hover:shadow-md">
                    <div className="w-24 h-32 bg-stone-200 rounded-lg overflow-hidden shrink-0 shadow-sm relative border border-stone-100">
                       {book.thumbnail ? (
                         <img 
                            src={book.thumbnail} 
                            alt={book.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                            </svg>
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col justify-between overflow-hidden flex-grow">
                      <div>
                        <h4 className="font-bold text-stone-900 line-clamp-1 group-hover:text-amber-700 transition-colors">{book.title}</h4>
                        <p className="text-amber-700 text-[10px] font-black uppercase tracking-wider mb-2">{book.author}</p>
                        <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">{book.description}</p>
                      </div>
                      <button 
                        onClick={() => !added && onAddToLibrary(book)}
                        disabled={added}
                        className={`mt-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          added 
                            ? 'bg-green-50 text-green-600 border border-green-100 cursor-default' 
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 shadow-sm'
                        }`}
                      >
                        {added ? 'Na Biblioteca' : '+ Adicionar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-stone-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <p className="text-lg font-serif italic text-stone-400">Pesquise por títulos ou autores específicos...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
