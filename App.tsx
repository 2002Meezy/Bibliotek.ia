
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import RecommendationList from './components/RecommendationList';
import LibraryPage from './components/LibraryPage';
import WelcomePage from './components/WelcomePage';
import SearchModal from './components/SearchModal';
import GenreModal from './components/GenreModal';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import { analyzeBookshelf } from './services/aiService';
import { RecommendationResponse, Book } from './types';

interface UserProfile {
  name: string;
  email: string;
  photoUrl: string | null;
  role?: string; // "admin" | "user"
}

const App: React.FC = () => {
  const [view, setView] = useState<'intro' | 'home' | 'library' | 'about' | 'login' | 'profile' | 'admin'>('intro');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [isAuthRequiredOpen, setIsAuthRequiredOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownTimeoutRef = useRef<number | null>(null);

  // Estado do Usuário
  const [user, setUser] = useState<UserProfile | null>(null);
  const [library, setLibrary] = useState<Book[]>([]);

  // Helper functions defined before effects
  const fetchLibrary = async (email: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/books?email=${email}`);
      if (res.ok) {
        const books = await res.json();
        setLibrary(books);
      }
    } catch (error) {
      console.error('Error fetching library:', error);
    }
  };

  const fetchLastAnalysis = async (email: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/user/analysis?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setResult(data);
        } else {
          setResult(null);
        }
      }
    } catch (error) {
      console.error('Error fetching last analysis:', error);
    }
  };

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('bibliotekIAUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Data fetching will be triggered by the user dependency effect below
    }
  }, []);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('bibliotekIAUser', JSON.stringify(user));
      fetchLibrary(user.email);
      fetchLastAnalysis(user.email);
    } else {
      localStorage.removeItem('bibliotekIAUser');
      setLibrary([]);
      setResult(null);
    }
  }, [user]);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  }, []);

  const handleImageCaptured = useCallback((base64: string) => {
    setImageData(base64);
    setResult(null);
    setError(null);
  }, []);

  const addToLibrary = async (book: Book) => {
    if (!user) {
      setIsAuthRequiredOpen(true);
      return;
    }

    // Check if already exists locally to avoid duplicates visually, though DB handles IDs.
    // Ideally we check by ID or title match.
    if (!library.some(b => b.title.toLowerCase() === book.title.toLowerCase())) {
      try {
        const res = await fetch('http://localhost:3001/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, book })
        });

        if (res.ok) {
          const newBook = await res.json();
          setLibrary(prev => [newBook, ...prev]);
        }
      } catch (error) {
        console.error('Error adding book:', error);
      }
    }
  };

  const removeFromLibrary = async (bookOrTitle: string | Book) => {
    // Handle legacy calls passing just title (string) vs new logic might pass object. 
    // Assuming current usage passes title string based on previous code.
    // We need to find the book in our state to get its ID.
    const title = typeof bookOrTitle === 'string' ? bookOrTitle : bookOrTitle.title;
    const bookToDelete = library.find(b => b.title === title);

    if (bookToDelete && bookToDelete.id) {
      try {
        await fetch(`http://localhost:3001/api/books/${bookToDelete.id}`, {
          method: 'DELETE'
        });
        setLibrary(prev => prev.filter(b => b.id !== bookToDelete.id)); // Optimistic update or wait?
      } catch (error) {
        console.error('Delete error', error);
      }
    }
  };

  const updateBookRating = async (title: string, rating: number) => {
    const bookToUpdate = library.find(b => b.title === title);
    if (bookToUpdate && bookToUpdate.id) {
      try {
        await fetch(`http://localhost:3001/api/books/${bookToUpdate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating })
        });
        setLibrary(prev => prev.map(book =>
          book.id === bookToUpdate.id ? { ...book, rating } : book
        ));
      } catch (error) {
        console.error('Update error', error);
      }
    }
  };

  const updateBookStatus = async (title: string, status: 'unread' | 'reading' | 'read') => {
    const bookToUpdate = library.find(b => b.title === title);
    if (!bookToUpdate || !bookToUpdate.id) return;

    // Optimistic update
    const updatedBook = { ...bookToUpdate, status };
    setLibrary(prev => prev.map(b => b.title === title ? updatedBook : b));

    // API update
    try {
      await fetch(`http://localhost:3001/api/books/${bookToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Update status error', error);
      // Revert if error? For now keeping it simple
    }
  };

  const generateRecommendations = async () => {
    // Verificação de autenticação obrigatória para usar a IA
    if (!user) {
      setIsAuthRequiredOpen(true);
      return;
    }

    if (!imageData) {
      setError("Por favor, tire uma foto da sua estante para analisarmos.");
      return;
    }
    if (selectedGenres.length === 0) {
      setError("Por favor, selecione pelo menos um gênero para ajudar na escolha.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeBookshelf(imageData, selectedGenres);
      setResult(data);
      if (user) {
        // Save to DB
        fetch('http://localhost:3001/api/user/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, analysis: data })
        }).catch(err => console.error("Failed to save analysis", err));
      }
    } catch (err: any) {
      setError(err?.message || "Erro desconhecido ao analisar imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData: UserProfile) => {
    setUser(userData);
    setView('home');
    setIsAuthRequiredOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setResult(null); // Clear search result on logout
    setView('intro');
    setShowUserDropdown(false);
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) window.clearTimeout(dropdownTimeoutRef.current);
    setShowUserDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setShowUserDropdown(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddToLibrary={addToLibrary}
        isInLibrary={(title) => library.some(b => b.title.toLowerCase() === title.toLowerCase())}
      />

      <GenreModal
        isOpen={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
        selectedGenres={selectedGenres}
        onToggleGenre={toggleGenre}
      />

      {/* MODAL DE AUTENTICAÇÃO OBRIGATÓRIA */}
      {isAuthRequiredOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center space-y-8 animate-dropdown-pop border border-stone-200">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mx-auto shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-bold text-stone-900 leading-tight">Membros Apenas</h3>
              <p className="text-stone-500 text-sm px-4">
                Para escanear sua estante e receber recomendações via IA, você precisa fazer parte da comunidade Bibliotek.IA.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setView('login'); setIsAuthRequiredOpen(false); }}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-[0.98]"
              >
                Entrar ou Registrar
              </button>
              <button
                onClick={() => setIsAuthRequiredOpen(false)}
                className="w-full py-4 text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-stone-600 transition-colors"
              >
                Talvez mais tarde
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setView('intro')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center text-white shadow-inner group-hover:bg-amber-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 tracking-tight hidden sm:block">
              Bibliotek.IA
            </h1>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setView('about')}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${view === 'about' ? 'bg-amber-700 text-white shadow-md' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                }`}
            >
              <span className="font-serif font-bold text-xl leading-none mb-0.5">?</span>
            </button>

            <button
              onClick={() => setView('home')}
              className={`flex items-center h-10 px-3 rounded-full transition-all duration-500 group overflow-hidden ${view === 'home' ? 'bg-amber-50 text-amber-700' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100/50'
                }`}
            >
              <div className="shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <span className={`max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden ${view === 'home' ? 'max-w-[120px] opacity-100 ml-3' : ''}`}>
                Explorar
              </span>
            </button>

            <button
              onClick={() => setView('library')}
              className={`flex items-center h-10 px-3 rounded-full transition-all duration-500 group overflow-hidden ${view === 'library' ? 'bg-amber-50 text-amber-700' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100/50'
                }`}
            >
              <div className="shrink-0 relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                </svg>
                {library.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-700 text-white w-2 h-2 rounded-full border border-white"></span>
                )}
              </div>
              <span className={`max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden ${view === 'library' ? 'max-w-[150px] opacity-100 ml-3' : ''}`}>
                Biblioteca
              </span>
            </button>

            <div
              className="relative ml-4 sm:ml-8"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setView(user ? 'profile' : 'login')}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all border-2 overflow-hidden ${(view === 'login' || view === 'profile') ? 'border-amber-700 bg-amber-50 text-amber-700' : 'border-stone-100 text-stone-400 hover:border-stone-200'
                  }`}
              >
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-100 overflow-hidden z-[60] animate-dropdown-pop">
                  {user ? (
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-3 pb-3 border-b border-stone-50">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-stone-100 shrink-0">
                          {user.photoUrl ? (
                            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-stone-900 truncate">
                            {user.name}
                            <span className="text-[10px] text-stone-400 font-normal ml-1">({user.role})</span>
                          </p>
                          <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => { setView('profile'); setShowUserDropdown(false); }}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-600 text-xs font-bold transition-colors flex items-center gap-3"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-stone-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          Configurações
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 text-xs font-bold transition-colors flex items-center gap-3"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                          </svg>
                          Sair da Conta
                        </button>
                      </div>

                      {/* BOTÃO ADMIN - SÓ APARECE SE FOR ADMIN */}
                      {user.role === 'admin' && (
                        <div className="pt-2 border-t border-stone-50">
                          <button
                            onClick={() => { setView('admin'); setShowUserDropdown(false); }}
                            className="w-full text-left px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#2c1810] to-[#4a3b32] text-white text-[10px] uppercase font-bold tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                            Dashboard
                          </button>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center text-center gap-5">
                      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-stone-900">Olá! Faça seu login.</p>
                        <p className="text-[10px] text-stone-400 leading-relaxed px-4">Sincronize sua biblioteca e receba recomendações em qualquer lugar.</p>
                      </div>
                      <button
                        onClick={() => { setView('login'); setShowUserDropdown(false); }}
                        className="w-full py-3 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-[0.98]"
                      >
                        Entrar ou Criar Conta
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'intro' && <WelcomePage onStart={() => setView('home')} />}

        {view === 'home' && (
          <>
            <section className="max-w-4xl mx-auto px-4 pt-12 pb-8 animate-fade-in">
              <h2 className="text-4xl sm:text-5xl font-serif text-stone-900 mb-4 text-center leading-tight">
                {user ? `Olá, ${user.name.split(' ')[0]}! ` : ''}O que você vai <span className="text-amber-700 italic">ler agora?</span>
              </h2>
              <p className="text-stone-500 text-lg text-center max-w-2xl mx-auto mb-12">
                Selecione o que quer ler e tire uma foto da sua estante. O Bibliotek.IA encontrará o livro certo para você entre os seus próprios volumes.
              </p>

              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-100">
                <div className="mb-8">
                  <button
                    onClick={() => setIsGenreModalOpen(true)}
                    className="w-full group flex items-center justify-between p-6 bg-stone-50 border border-stone-200 rounded-2xl hover:border-amber-300 transition-all hover:bg-amber-50/30"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-stone-800 mb-1">Quais gêneros você mais gosta?</h3>
                      <p className="text-stone-500 text-sm">
                        {selectedGenres.length > 0
                          ? `${selectedGenres.length} gêneros selecionados: ${selectedGenres.slice(0, 3).join(', ')}${selectedGenres.length > 3 ? '...' : ''}`
                          : 'Selecione seus favoritos para recomendações precisas'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                      </svg>
                    </div>
                  </button>
                </div>

                <ImageUploader
                  onImageCaptured={handleImageCaptured}
                  isLoading={loading}
                />

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={generateRecommendations}
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${loading
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-amber-700 text-white hover:bg-amber-800 hover:shadow-amber-200/50 hover:scale-[1.01]'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-stone-400 border-t-amber-700"></div>
                      Escaneando sua estante física...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                      </svg>
                      Buscar matches na estante
                    </>
                  )}
                </button>
              </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 mt-12">
              {result && (
                <RecommendationList
                  identified={result.identifiedBooks || []}
                  recommendations={result.recommendations || []}
                  library={library}
                  userProfileSummary={result.userProfileSummary || ''}
                  noMatchesFound={result.noMatchesFound || false}
                  onMarkAsReading={addToLibrary}
                  isInLibrary={(title) => library.some(b => b.title.toLowerCase() === title.toLowerCase())}
                />
              )}
            </div>
          </>
        )}

        {view === 'library' && (
          <LibraryPage
            library={library}
            onRemove={removeFromLibrary}
            onUpdateBookRating={updateBookRating}
            onUpdateBookStatus={updateBookStatus}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {view === 'about' && <AboutPage />}
        {view === 'login' && <LoginPage onLogin={handleLoginSuccess} />}
        {view === 'profile' && user && (
          <ProfilePage
            user={user}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {view === 'admin' && user && user.role === 'admin' && (
          <AdminDashboard
            onLogout={handleLogout}
            onBack={() => setView('home')}
            user={user}
          />
        )}
      </main>

      <footer className="w-full py-12 text-center text-stone-400 text-[10px] tracking-[0.3em] uppercase font-bold border-t border-stone-100 bg-white/50">
        <p>© 2024 Bibliotek.IA • Criado por Luiz Santiago • Inteligência Literária Pessoal</p>
      </footer>

      <style>{`
        @keyframes dropdown-pop {
          0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown-pop {
          animation: dropdown-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top right;
        }
      `}</style>
    </div>
  );
};

export default App;
