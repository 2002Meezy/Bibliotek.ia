
import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { compareBooks } from "../services/aiService";

interface LibraryBookCoverProps {
  title: string;
  author: string;
  thumbnail?: string;
}

const StatusSelector = ({ status, onUpdate }: { status?: 'unread' | 'reading' | 'read', onUpdate: (s: 'unread' | 'reading' | 'read') => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const colors = {
    unread: 'bg-red-500',
    reading: 'bg-yellow-400',
    read: 'bg-green-500'
  };

  const labels = {
    unread: 'Não Lido',
    reading: 'Lendo',
    read: 'Lido'
  };

  const currentStatus = status || 'unread';

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md hover:scale-105 transition-all"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${colors[currentStatus]}`}></div>
        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">{labels[currentStatus]}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-dropdown-pop flex flex-col">
          {(['unread', 'reading', 'read'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                onUpdate(s);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 transition-colors text-left"
            >
              <div className={`w-2 h-2 rounded-full ${colors[s]}`}></div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStatus === s ? 'text-stone-900' : 'text-stone-400'}`}>
                {labels[s]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GenreSelector = ({
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

const LibraryBookCover: React.FC<LibraryBookCoverProps> = ({ title, author, thumbnail }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(thumbnail || null);
  const [loading, setLoading] = useState(!thumbnail);

  useEffect(() => {
    if (thumbnail) {
      setCoverUrl(thumbnail);
      setLoading(false);
      return;
    }

    const fetchCover = async () => {
      try {
        const query = encodeURIComponent(`intitle:${title} inauthor:${author} `);
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await response.json();

        if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
          const url = data.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
          setCoverUrl(url);
        } else {
          setCoverUrl(`https://picsum.photos/seed/${title.replace(/\s/g, '')}/300/450`);
        }
      } catch (error) {
        setCoverUrl(`https://picsum.photos/seed/${title.replace(/\s/g, '')}/300/450`);
      } finally {
        setLoading(false);
      }
    };

    fetchCover();
  }, [title, author, thumbnail]);

  return (
    <div className="w-full h-full bg-stone-100 relative">
      {loading ? (
        <div className="w-full h-full animate-pulse bg-stone-200 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <img
          src={coverUrl || ''}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
      )}
    </div>
  );
};

interface LibraryPageProps {
  library: Book[];
  onRemove: (title: string) => void;
  onUpdateBookRating: (title: string, rating: number) => void;
  onUpdateBookStatus: (title: string, status: 'unread' | 'reading' | 'read') => void;
  onOpenSearch: () => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ library, onRemove, onUpdateBookRating, onUpdateBookStatus, onOpenSearch }) => {
  const [ratingMenuBook, setRatingMenuBook] = useState<string | null>(null);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('Todos');

  // Estados para Comparação dentro da Biblioteca
  const [comparingBook, setComparingBook] = useState<Book | null>(null);
  const [showLibrarySelector, setShowLibrarySelector] = useState(false);
  const [selectedLibraryBook, setSelectedLibraryBook] = useState<Book | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const genresInLibrary = Array.from(new Set(library.map(b => b.genre || 'Outros')));
  const filteredLibrary = selectedGenreFilter === 'Todos'
    ? library
    : library.filter(b => (b.genre || 'Outros') === selectedGenreFilter);

  // Group filtered books by genre effectively
  const displayedGenres = selectedGenreFilter === 'Todos' ? genresInLibrary : [selectedGenreFilter];

  const handleSetRating = (title: string, rating: number) => {
    onUpdateBookRating(title, rating);
    setRatingMenuBook(null);
  };

  const handleStartComparison = (book: Book) => {
    setComparingBook(book);
    setShowLibrarySelector(true);
    setComparisonResult(null);
    setSelectedLibraryBook(null);
  };

  const handleSelectSecondBook = async (book: Book) => {
    setSelectedLibraryBook(book);
    setShowLibrarySelector(false);
    setIsComparing(true);

    if (comparingBook) {
      try {
        const result = await compareBooks(comparingBook, book);
        setComparisonResult(result);
      } catch (err) {
        setComparisonResult("Erro ao gerar comparação. Tente novamente.");
      } finally {
        setIsComparing(false);
      }
    }
  };

  const closeModals = () => {
    setComparingBook(null);
    setShowLibrarySelector(false);
    setSelectedLibraryBook(null);
    setComparisonResult(null);
  };

  const SearchBarTrigger = () => (
    <div className="mb-10 group">
      <div
        onClick={onOpenSearch}
        className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <span className="text-stone-400 font-medium">pesquisar</span>
      </div>
    </div>
  );

  if (library.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-fade-in">
        <SearchBarTrigger />
        <div className="text-center">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
            <svg xmlns="http://www.w3.org/2000/center" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif text-stone-900 mb-2">Sua biblioteca está vazia</h2>
          <p className="text-stone-500">Analise sua estante ou pesquise acima para adicionar livros lidos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <header className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-serif text-stone-900 mb-2">Minha Biblioteca</h2>
            <p className="text-stone-500 font-medium text-lg">Sua jornada de leitura organizada.</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto relative">
            <div className="flex-grow sm:flex-grow-0 sm:w-64 order-2 sm:order-1">
              <SearchBarTrigger />
            </div>
            <div className="order-1 sm:order-2">
              <GenreSelector
                genres={genresInLibrary}
                selectedGenre={selectedGenreFilter}
                onSelect={setSelectedGenreFilter}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-16">
        {displayedGenres.map(genre => (
          <section key={genre} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B45309] bg-[#FFFBEB] px-4 py-2 rounded-lg border border-[#FEF3C7] shadow-sm">
                {genre}
              </h3>
              <div className="h-px bg-stone-200 flex-grow"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
              {filteredLibrary
                .filter(b => (b.genre || 'Outros') === genre)
                .map((book, idx) => (
                  <div key={idx} className="group relative flex flex-col transition-all hover:translate-y-[-4px]">
                    <div
                      onClick={() => setRatingMenuBook(ratingMenuBook === book.title ? null : book.title)}
                      className="aspect-[2/3] w-full bg-stone-100 rounded-[1.25rem] overflow-hidden mb-4 relative shadow-lg border border-stone-100 cursor-pointer"
                    >
                      <LibraryBookCover title={book.title} author={book.author} thumbnail={book.thumbnail} />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        {/* Status Selector */}
                        <div className="absolute top-2 left-2 z-20">
                          <StatusSelector
                            status={book.status}
                            onUpdate={(s) => onUpdateBookStatus(book.title, s)}
                          />
                        </div>

                        {/* Botão Comparar Central */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartComparison(book);
                          }}
                          className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-stone-800 shadow-xl hover:scale-110 active:scale-95 transition-all"
                          title="Comparar com outro livro da biblioteca"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                          </svg>
                        </button>

                        <div className={`bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter shadow-xl ${book.rating ? 'text-stone-800' : 'text-stone-400'}`}>
                          {book.rating ? `${book.rating} Estrelas` : 'Sem Nota'}
                        </div>
                      </div>

                      {/* Botão Remover Superior */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(book.title);
                        }}
                        className="absolute top-2 right-2 bg-white/95 backdrop-blur-md p-2 rounded-full text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90 z-20"
                        title="Remover da lista"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Menu de Avaliação (Stars) */}
                      {ratingMenuBook === book.title && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white shadow-2xl rounded-2xl p-3 border border-stone-200 flex flex-col items-center gap-2 animate-bounce-in" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleSetRating(book.title, star)}
                                className={`transition-all hover:scale-125 ${star <= (book.rating || 0) ? 'text-amber-500' : 'text-stone-200'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase">Sua nota</p>
                        </div>
                      )}
                    </div>
                    <div className="px-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-stone-900 text-[15px] leading-tight line-clamp-2 group-hover:text-amber-700 transition-colors flex-grow">{book.title}</h4>
                        {book.rating ? (
                          <div className="flex items-center gap-0.5 text-amber-500 ml-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[11px] font-black">{book.rating}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-100 text-stone-300 ml-2 border border-stone-200">
                            <span className="text-[9px] font-bold">0</span>
                          </div>
                        )}
                      </div>
                      <p className="text-stone-400 text-xs font-semibold truncate uppercase tracking-wider">{book.author}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* MODAL: SELETOR DE SEGUNDO LIVRO DA BIBLIOTECA */}
      {showLibrarySelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200">
            <header className="p-8 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-900 leading-none mb-1">Comparar com...</h3>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-widest line-clamp-1">Base: "{comparingBook?.title}"</p>
              </div>
              <button onClick={closeModals} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex-grow overflow-y-auto p-8 space-y-12 bg-stone-50/30">
              {genresInLibrary.map(genre => {
                const booksInGenre = library.filter(b => (b.genre || 'Outros') === genre && b.title !== comparingBook?.title);
                if (booksInGenre.length === 0) return null;

                return (
                  <div key={genre}>
                    <div className="flex items-center gap-4 mb-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700 bg-white px-3 py-1.5 rounded-md border border-stone-200 shadow-sm">{genre}</h4>
                      <div className="h-px bg-stone-200 flex-grow"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {booksInGenre.map((book, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSecondBook(book)}
                          className="group text-left space-y-3 hover:translate-y-[-4px] transition-all"
                        >
                          <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-md border border-stone-100 group-hover:shadow-xl group-hover:border-amber-200 transition-all bg-white">
                            <LibraryBookCover title={book.title} author={book.author} thumbnail={book.thumbnail} />
                          </div>
                          <div className="px-1">
                            <p className="text-[12px] font-bold text-stone-800 line-clamp-1 group-hover:text-amber-700 transition-colors">{book.title}</p>
                            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{book.author}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESULTADO DA COMPARAÇÃO */}
      {(isComparing || comparisonResult) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200">
            <header className="px-10 pt-10 pb-6 flex items-center justify-between">
              <h3 className="text-4xl font-serif font-bold tracking-tight text-stone-900">Cruzamento de Vibes</h3>
              <button onClick={closeModals} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex-grow overflow-y-auto px-10 pb-12">
              <div className="flex items-center justify-center gap-8 mb-10 py-6 bg-stone-50 rounded-[2.5rem] border border-stone-100 shadow-inner">
                <div className="w-24 text-center">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3 border-2 border-white">
                    <LibraryBookCover title={comparingBook?.title || ''} author={comparingBook?.author || ''} thumbnail={comparingBook?.thumbnail} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-amber-700 line-clamp-1 tracking-wider px-2">{comparingBook?.title}</p>
                </div>
                <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center font-black text-xs shadow-xl shrink-0 z-10 border-4 border-white">X</div>
                <div className="w-24 text-center">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3 border-2 border-white">
                    <LibraryBookCover title={selectedLibraryBook?.title || ''} author={selectedLibraryBook?.author || ''} thumbnail={selectedLibraryBook?.thumbnail} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-stone-400 line-clamp-1 tracking-wider px-2">{selectedLibraryBook?.title}</p>
                </div>
              </div>

              {isComparing ? (
                <div className="py-20 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-stone-100 border-t-amber-700"></div>
                  </div>
                  <p className="text-stone-500 font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Cruzando dados da biblioteca...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm relative">
                    <div className="prose prose-stone prose-sm max-w-none text-stone-700 leading-relaxed text-[17px]">
                      {comparisonResult?.split('\n').map((line, i) => {
                        if (!line.trim()) return null;
                        return (
                          <p key={i} className="mb-4">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={closeModals}
                    className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm shadow-2xl hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest"
                  >
                    Fechar Comparação
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: translate(-50%, 10px) scale(0.9); }
          60% { opacity: 1; transform: translate(-50%, -5px) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default LibraryPage;
