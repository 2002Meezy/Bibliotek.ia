import React, { useState } from 'react';
import RegisterPage from './RegisterPage';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; photoUrl: string | null; role: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.detail || 'Erro ao entrar');
      }

      const userData = await response.json();
      onLogin({
        name: userData.name,
        email: userData.email,
        photoUrl: null,
        role: userData.role // "user" or "admin"
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return (
      <RegisterPage
        onBack={() => setShowRegister(false)}
        onRegisterSuccess={() => {
          setShowRegister(false);
          setError("Conta criada com sucesso! Faça login abaixo.");
        }}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 p-10 space-y-8 relative overflow-hidden">

          <header className="text-center space-y-2 relative z-10">
            <h2 className="text-4xl font-serif font-bold text-stone-900">
              Boas-vindas
            </h2>
            <p className="text-stone-500 text-sm">
              Entre para acessar sua biblioteca sincronizada.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-amber-500 focus:bg-white transition-all outline-none"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-amber-500 focus:bg-white transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={`px-4 py-3 rounded-xl text-xs font-bold ${error.includes('sucesso') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          <footer className="text-center pt-4 relative z-10">
            <button
              onClick={() => setShowRegister(true)}
              className="text-stone-400 text-xs hover:text-amber-700 transition-colors font-medium"
            >
              Ainda não tem conta? <span className="underline decoration-amber-500/30 underline-offset-4">Registre-se</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
