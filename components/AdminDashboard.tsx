import React, { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Stats {
    total_users: number;
    total_admins: number;
    active_now: number;
}


interface AdminDashboardProps {
    onLogout: () => void;
    onBack: () => void;
    user: { name: string; email: string; role?: string };
}

interface BookStats {
    topGenres: { genre: string | null; _count: { id: number } }[];
    topAuthors: { author: string; _count: { id: number } }[];
    topBooks?: { title: string; _count: { id: number } }[];
    booksByYear: { publicationYear: string | null; _count: { id: number } }[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBack, user }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'books' | 'ai'>('general');
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [bookStats, setBookStats] = useState<BookStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGeneralData();
    }, []);

    useEffect(() => {
        if (activeTab === 'books' && !bookStats) {
            fetchBookStats();
        }
    }, [activeTab]);

    const fetchGeneralData = async () => {
        setLoading(true);
        try {
            const [usersRes, statsRes] = await Promise.all([
                fetch('http://localhost:3001/api/admin/users'),
                fetch('http://localhost:3001/api/admin/stats')
            ]);

            if (usersRes.ok && statsRes.ok) {
                const usersData = await usersRes.json();
                const statsData = await statsRes.json();
                setUsers(usersData);
                setStats(statsData);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookStats = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/admin/book-stats');
            if (res.ok) {
                const data = await res.json();
                setBookStats(data);
            }
        } catch (error) {
            console.error("Error fetching book stats:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] text-[#2c1810]">
            {/* Header Admin */}
            <header className="bg-white border-b border-[#e5e5e5] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-[#8c7b75] hover:text-[#2c1810] transition-colors">
                            ← Voltar
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${activeTab === 'general'
                                ? 'bg-[#2c1810] text-white shadow-md'
                                : 'text-[#8c7b75] hover:bg-stone-100 hover:text-[#2c1810]'
                                }`}
                        >
                            Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('books')}
                            className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${activeTab === 'books'
                                ? 'bg-[#2c1810] text-white shadow-md'
                                : 'text-[#8c7b75] hover:bg-stone-100 hover:text-[#2c1810]'
                                }`}
                        >
                            Dados de livros
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${activeTab === 'ai'
                                ? 'bg-[#2c1810] text-white shadow-md'
                                : 'text-[#8c7b75] hover:bg-stone-100 hover:text-[#2c1810]'
                                }`}
                        >
                            IA de entendimento do usuario
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-[#8c7b75]">
                        Olá, Admin {user.name}
                    </span>
                    <button
                        onClick={onLogout}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8">
                {activeTab === 'general' && (
                    <div className="animate-fade-in space-y-10">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e5e5]">
                                <h3 className="text-[#8c7b75] text-sm uppercase tracking-wider font-medium mb-2">Total de Usuários</h3>
                                <p className="text-4xl font-serif text-[#d35400] font-bold">{loading ? '...' : stats?.total_users}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e5e5]">
                                <h3 className="text-[#8c7b75] text-sm uppercase tracking-wider font-medium mb-2">Administradores</h3>
                                <p className="text-4xl font-serif text-[#2c1810] font-bold">{loading ? '...' : stats?.total_admins}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e5e5]">
                                <h3 className="text-[#8c7b75] text-sm uppercase tracking-wider font-medium mb-2">Status do Sistema</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-lg font-serif text-[#2c1810]">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] overflow-hidden">
                            <div className="px-8 py-6 border-b border-[#e5e5e5] flex justify-between items-center">
                                <h2 className="text-xl font-serif font-bold text-[#2c1810]">Usuários Registrados</h2>
                                <button
                                    onClick={fetchGeneralData}
                                    className="text-sm text-[#d35400] hover:text-[#a04000] font-medium"
                                >
                                    Atualizar Lista
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[#faf9f6] text-[#8c7b75] text-xs uppercase tracking-wider">
                                            <th className="px-8 py-4 font-medium">ID</th>
                                            <th className="px-8 py-4 font-medium">Nome</th>
                                            <th className="px-8 py-4 font-medium">Email</th>
                                            <th className="px-8 py-4 font-medium">Função (Role)</th>
                                            <th className="px-8 py-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e5e5]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-8 text-center text-[#8c7b75]">Carregando...</td>
                                            </tr>
                                        ) : users.map((u) => (
                                            <tr key={u.id} className="hover:bg-[#faf9f6] transition-colors">
                                                <td className="px-8 py-4 text-[#8c7b75] font-mono text-sm">#{u.id}</td>
                                                <td className="px-8 py-4 font-medium text-[#2c1810]">{u.name}</td>
                                                <td className="px-8 py-4 text-[#5d4037]">{u.email}</td>
                                                <td className="px-8 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin'
                                                        ? 'bg-[#2c1810] text-white'
                                                        : 'bg-[#e5e5e5] text-[#5d4037]'
                                                        }`}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="inline-flex items-center text-green-600 text-xs font-bold">
                                                        ● Ativo
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="animate-fade-in space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Top Genres */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e5e5]">
                                <h3 className="text-lg font-serif font-bold text-[#2c1810] mb-6">Gêneros Mais Lidos</h3>
                                {bookStats && bookStats.topGenres.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookStats.topGenres.map((g, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-[#5d4037] font-medium">{g.genre || 'Não especificado'}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-600 rounded-full"
                                                            style={{ width: `${(g._count.id / Math.max(...bookStats.topGenres.map(x => x._count.id))) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-[#2c1810]">{g._count.id}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-stone-400 italic">Sem dados suficientes ainda.</p>
                                )}
                            </div>

                            {/* Top Authors */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e5e5]">
                                <h3 className="text-lg font-serif font-bold text-[#2c1810] mb-6">Autores Favoritos</h3>
                                {bookStats && bookStats.topAuthors.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookStats.topAuthors.map((a, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-[#5d4037] font-medium">{a.author}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-[#f5f5f4] rounded-lg text-xs font-bold text-[#2c1810]">
                                                        {a._count.id} livros
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-stone-400 italic">Sem dados suficientes ainda.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Books (Titulos mais presentes) */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e5e5]">
                            <h3 className="text-lg font-serif font-bold text-[#2c1810] mb-6">Livros Mais Populares (Mais presentes nas bibliotecas)</h3>
                            {bookStats && bookStats.topBooks && bookStats.topBooks.length > 0 ? (
                                <div className="space-y-4">
                                    {bookStats.topBooks.map((b, idx) => (
                                        <div key={idx} className="relative mb-4">
                                            <div className="flex items-center justify-between z-10 relative mb-1">
                                                <span className="text-[#2c1810] font-bold text-md">{b.title}</span>
                                                <span className="text-xs font-black bg-[#2c1810] text-white px-2 py-1 rounded-md">{b._count.id} Cópias</span>
                                            </div>
                                            <div className="w-full h-3 bg-[#f0f0f0] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-800 rounded-full"
                                                    style={{ width: `${(b._count.id / Math.max(...bookStats.topBooks!.map(x => x._count.id))) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-400 italic">Sem dados suficientes ainda.</p>
                            )}
                        </div>

                        {/* Publication Years */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e5e5]">
                            <h3 className="text-lg font-serif font-bold text-[#2c1810] mb-6">Eras Literárias (Ano de Publicação)</h3>
                            {bookStats && bookStats.booksByYear.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {bookStats.booksByYear.map((y, idx) => (
                                        <div key={idx} className="bg-[#faf9f6] p-4 rounded-xl text-center border border-[#e5e5e5]">
                                            <p className="text-2xl font-black text-[#d35400]">{y.publicationYear || 'N/A'}</p>
                                            <p className="text-xs uppercase tracking-wide text-[#8c7b75] mt-1">{y._count.id} Livros</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-400 italic">Sem dados suficientes ainda.</p>
                            )}
                        </div>
                    </div>
                )
                }

                {
                    activeTab === 'ai' && (
                        <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-stone-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-[#2c1810] mb-2">IA de Entendimento em Breve</h2>
                            <p className="text-stone-500 max-w-md">Em breve, utilizaremos modelos avançados para gerar insights profundos sobre o comportamento de leitura de todos os usuários da plataforma.</p>
                        </div>
                    )
                }

            </main >
        </div >
    );
};

export default AdminDashboard;
