
import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { compareBooks } from "../services/aiService";

interface BookCoverProps {
  title: string;
  author: string;
  genre?: string;
  size?: 'normal' | 'small';
}

const BookCover: React.FC<BookCoverProps> = ({ title, author, genre, size = 'normal' }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [title, author]);

  const containerClasses = size === 'normal'
    ? "w-full md:w-64 h-96 md:h-auto shrink-0 relative overflow-hidden bg-stone-200 rounded-2xl md:rounded-none"
    : "w-full aspect-[2/3] shrink-0 relative overflow-hidden bg-stone-100 rounded-lg";

  return (
    <div className={containerClasses}>
      {loading ? (
        <div className="w-full h-full animate-pulse bg-stone-300 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-stone-400 border-t-stone-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <img
            src={coverUrl || ''}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          {genre && size === 'normal' && (
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1.5 bg-[#B45309] text-white text-[10px] uppercase tracking-wider font-bold rounded-md shadow-lg">
                {genre}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface RecommendationListProps {
  identified: Book[];
  recommendations: Book[];
  library: Book[];
  userProfileSummary?: string;
  noMatchesFound?: boolean;
  onMarkAsReading: (book: Book) => void;
  isInLibrary: (title: string) => boolean;
}

const RecommendationList: React.FC<RecommendationListProps> = ({
  identified,
  recommendations,
  library,
  userProfileSummary,
  noMatchesFound,
  onMarkAsReading,
  isInLibrary
}) => {
  const [comparingBook, setComparingBook] = useState<Book | null>(null);
  const [showLibrarySelector, setShowLibrarySelector] = useState(false);
  const [selectedLibraryBook, setSelectedLibraryBook] = useState<Book | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const [isRecommendationsExpanded, setIsRecommendationsExpanded] = useState(true);
  const [isIdentifiedExpanded, setIsIdentifiedExpanded] = useState(true);

  const genresInLibrary = Array.from(new Set(library.map(b => b.genre || 'Outros')));

  const handleStartComparison = (book: Book) => {
    setComparingBook(book);
    setShowLibrarySelector(true);
    setComparisonResult(null);
    setSelectedLibraryBook(null);
  };

  const handleSelectFromLibrary = async (book: Book) => {
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

  const ToggleButton = ({ isExpanded, onClick, label }: { isExpanded: boolean, onClick: () => void, label: string }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] rounded-full transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider shadow-sm border border-[#E5E7EB]"
    >
      {isExpanded ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      )}
      {isExpanded ? 'Recolher' : 'Ver'} {label}
    </button>
  );

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* SEÇÃO: ANÁLISE DA COLEÇÃO (BREVE RESUMO) */}
      {userProfileSummary && (
        <section className="bg-amber-50/40 p-6 rounded-3xl border border-amber-100">
          <p className="text-amber-900 text-sm leading-relaxed italic font-medium">"{userProfileSummary}"</p>
        </section>
      )}

      {/* SEÇÃO: RECOMENDAÇÕES */}
      <section className="transition-all duration-300">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-serif text-stone-900 leading-none mb-1">Sua Próxima Leitura</h2>
              <p className="text-stone-400 text-xs font-medium">Curadoria exclusiva baseada na sua estante.</p>
            </div>
          </div>
          <ToggleButton
            isExpanded={isRecommendationsExpanded}
            onClick={() => setIsRecommendationsExpanded(!isRecommendationsExpanded)}
            label="Recomendações"
          />
        </div>

        <div className={`transition-all duration-500 overflow-hidden ${isRecommendationsExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {noMatchesFound ? (
            <div className="bg-white p-16 text-center rounded-[2.5rem] border border-stone-100 shadow-sm">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008h-.008v-.008Z" />
                </svg>
              </div>
              <h3 className="text-stone-900 font-bold text-2xl mb-2">Nenhum match encontrado</h3>
              <p className="text-stone-500 max-w-sm mx-auto">Não encontramos livros na sua estante que correspondam aos filtros selecionados. Tente mudar os gêneros ou limpar a busca.</p>
            </div>
          ) : (
            <div className="space-y-8 px-1">
              {recommendations.map((book, idx) => {
                const saved = isInLibrary(book.title);
                return (
                  <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-stone-100 flex flex-col md:flex-row animate-slide-up group" style={{ animationDelay: `${idx * 150}ms` }}>
                    <BookCover title={book.title} author={book.author} genre={book.genre} />

                    <div className="p-8 md:p-10 flex flex-col flex-grow">
                      <div className="mb-6">
                        <h3 className="text-4xl font-bold text-stone-900 leading-none mb-2">{book.title}</h3>
                        <p className="text-[#B45309] font-medium text-xl">{book.author}</p>
                      </div>

                      <div className="space-y-6 flex-grow">
                        <div>
                          <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400 mb-3">POR QUE TIRAR DA ESTANTE HOJE:</h4>
                          <div className="bg-[#FFFBEB] p-6 rounded-2xl border-l-[6px] border-[#F59E0B] shadow-sm relative overflow-hidden">
                            <p className="text-stone-800 italic text-[16px] leading-relaxed relative z-10">
                              {book.recommendationReason}
                            </p>
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-12 h-12 text-amber-500">
                                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V5C14.017 3.34315 15.3602 2 17.017 2H19.017C20.6739 2 22.017 3.34315 22.017 5V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM2.01693 21L2.01693 18C2.01693 16.8954 2.91236 16 4.01693 16H7.01693C7.56921 16 8.01693 15.5523 8.01693 15V9C8.01693 8.44772 7.56921 8 7.01693 8H4.01693C2.91236 8 2.01693 7.10457 2.01693 6V5C2.01693 3.34315 3.36008 2 5.01693 2H7.01693C8.67378 2 10.0169 3.34315 10.0169 5V15C10.0169 18.3137 7.33064 21 4.01693 21H2.01693Z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <p className="text-stone-500 text-[16px] leading-relaxed">
                          {book.description}
                        </p>
                      </div>

                      <div className="mt-10 pt-8 border-t border-stone-100 flex items-center justify-between gap-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => onMarkAsReading(book)}
                            disabled={saved}
                            className={`px-8 py-4 rounded-full text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 ${saved
                              ? 'bg-stone-100 text-stone-400 cursor-default'
                              : 'bg-[#171717] text-white hover:bg-black'
                              }`}
                          >
                            {saved ? 'Lendo Agora' : 'Marcar como Lendo'}
                          </button>

                          <button
                            onClick={() => handleStartComparison(book)}
                            className="px-8 py-4 rounded-full text-xs font-bold transition-all border-2 border-stone-900 text-stone-900 hover:bg-stone-50 active:scale-95 flex items-center gap-2 shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                            Comparar
                          </button>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-stone-300 uppercase tracking-[0.2em] mb-1">Status</span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded">ENCONTRADO NA SUA FOTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SEÇÃO: LIVROS DETECTADOS */}
      {identified.length > 0 && (
        <section className="pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
              Inventário Visual Detectado
            </h2>
            <ToggleButton
              isExpanded={isIdentifiedExpanded}
              onClick={() => setIsIdentifiedExpanded(!isIdentifiedExpanded)}
              label="Inventário"
            />
          </div>

          <div className={`transition-all duration-300 overflow-hidden ${isIdentifiedExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {identified.map((book, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-colors">
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-stone-800 truncate">{book.title}</p>
                    <p className="text-[10px] text-stone-400 font-medium truncate uppercase tracking-wider">{book.author}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:text-amber-500 transition-colors shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MODAL: SELETOR DE LIVROS DA BIBLIOTECA */}
      {showLibrarySelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200">
            <header className="p-8 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-900 leading-none mb-1">Escolha um livro</h3>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Comparar com "{comparingBook?.title}"</p>
              </div>
              <button onClick={closeModals} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex-grow overflow-y-auto p-8 space-y-12">
              {library.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-stone-400 font-medium italic text-lg">Sua biblioteca está vazia no momento.</p>
                  <button onClick={closeModals} className="mt-4 text-amber-700 font-bold hover:underline">Adicionar alguns livros</button>
                </div>
              ) : (
                genresInLibrary.map(genre => (
                  <div key={genre}>
                    <div className="flex items-center gap-4 mb-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">{genre}</h4>
                      <div className="h-px bg-stone-100 flex-grow"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {library.filter(b => (b.genre || 'Outros') === genre).map((book, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectFromLibrary(book)}
                          className="group text-left space-y-3 hover:translate-y-[-4px] transition-all"
                        >
                          <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-md border border-stone-100 group-hover:shadow-xl group-hover:border-amber-200 transition-all">
                            <BookCover title={book.title} author={book.author} size="small" />
                          </div>
                          <div className="px-1">
                            <p className="text-[12px] font-bold text-stone-800 line-clamp-1 group-hover:text-amber-700 transition-colors">{book.title}</p>
                            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{book.author}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
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
                    <BookCover title={comparingBook?.title || ''} author={comparingBook?.author || ''} size="small" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-amber-700 line-clamp-1 tracking-wider px-2">{comparingBook?.title}</p>
                </div>
                <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center font-black text-xs shadow-xl shrink-0 z-10 border-4 border-white">X</div>
                <div className="w-24 text-center">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3 border-2 border-white">
                    <BookCover title={selectedLibraryBook?.title || ''} author={selectedLibraryBook?.author || ''} size="small" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-stone-400 line-clamp-1 tracking-wider px-2">{selectedLibraryBook?.title}</p>
                </div>
              </div>

              {isComparing ? (
                <div className="py-20 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-stone-100 border-t-amber-700"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-amber-700 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <p className="text-stone-500 font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Sincronizando universos...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm relative">
                    <div className="prose prose-stone prose-sm max-w-none text-stone-700 leading-relaxed text-[17px]">
                      {comparisonResult?.split('\n').map((line, i) => {
                        if (!line.trim()) return null;
                        return (
                          <p key={i} className={`mb-4 ${line.startsWith('-') || line.startsWith('•') ? 'pl-6 relative' : ''}`}>
                            {line.startsWith('-') || line.startsWith('•') ? (
                              <span className="absolute left-0 top-0 text-amber-600 font-black">•</span>
                            ) : null}
                            {line.replace(/^[-•]\s*/, '')}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={closeModals}
                    className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm shadow-2xl hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest"
                  >
                    Entendi a conexão!
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default RecommendationList;
