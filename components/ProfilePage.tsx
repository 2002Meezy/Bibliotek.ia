
import React, { useState, useRef } from 'react';

interface UserProfile {
  name: string;
  email: string;
  photoUrl: string | null;
}

interface ProfilePageProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: UserProfile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [name, setName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      onUpdateProfile({ ...user, name });
      setIsSaving(false);
      setMessage("Perfil atualizado com sucesso!");
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ ...user, photoUrl: reader.result as string });
        setMessage("Foto atualizada!");
        setTimeout(() => setMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-20 animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-amber-700 to-amber-900"></div>
        
        <div className="px-10 pb-12 -mt-16">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stone-200">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-stone-100 text-stone-600 hover:text-amber-700 transition-colors active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a48.324 48.324 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                </svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <div className="mt-6 space-y-1">
              <h3 className="text-3xl font-serif font-bold text-stone-900">{user.name}</h3>
              <p className="text-stone-400 font-medium text-sm">{user.email}</p>
            </div>

            {message && (
              <div className="mt-6 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold animate-bounce-in">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="w-full mt-10 space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  type="submit"
                  disabled={isSaving || name === user.name}
                  className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                    name === user.name || isSaving
                      ? 'bg-stone-100 text-stone-300 cursor-default'
                      : 'bg-stone-900 text-white hover:bg-black active:scale-[0.98]'
                  }`}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                
                <button 
                  type="button"
                  onClick={onLogout}
                  className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all active:scale-[0.98]"
                >
                  Encerrar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">Membro desde Dezembro 2024</p>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
