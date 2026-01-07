import React, { useState } from 'react';

interface RegisterPageProps {
    onBack: () => void;
    onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Validação em tempo real
    const hasMinLength = formData.password.length >= 5;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    const isPasswordValid = hasMinLength && hasSpecialChar;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordValid) {
            setError("A senha não atende aos requisitos de segurança.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: "user" // Default role
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || data.detail || 'Erro ao registrar');
            }

            onRegisterSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 animate-fade-in">
            <div className="bg-white w-full max-w-md p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-stone-100 relative overflow-hidden">

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <button onClick={onBack} className="absolute top-8 left-8 text-stone-400 hover:text-stone-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                </button>

                <div className="text-center mb-10 mt-6">
                    <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-2xl font-serif italic">
                        B.
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-stone-900">Crie sua conta</h2>
                    <p className="text-stone-500 mt-2 text-sm">Junte-se ao Bibliotek.IA</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 outline-none focus:border-amber-400 focus:bg-white transition-all text-stone-800 font-medium"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 outline-none focus:border-amber-400 focus:bg-white transition-all text-stone-800 font-medium"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Senha</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 outline-none focus:border-amber-400 focus:bg-white transition-all text-stone-800 font-medium"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {/* Password Strength Indicator */}
                        <div className="px-4 pt-2 space-y-1">
                            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${hasMinLength ? 'text-green-600' : 'text-stone-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-stone-300'}`}></div>
                                Mínimo 5 caracteres
                            </div>
                            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${hasSpecialChar ? 'text-green-600' : 'text-stone-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${hasSpecialChar ? 'bg-green-500' : 'bg-stone-300'}`}></div>
                                Pelo menos 1 caractere especial (!@#$...)
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isPasswordValid}
                        className="w-full bg-[#1A1A1A] text-white font-bold py-5 rounded-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-stone-200 mt-4"
                    >
                        {loading ? 'Criando conta...' : 'Registrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
