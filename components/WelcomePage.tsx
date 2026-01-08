
import React, { useState, useEffect } from 'react';

interface WelcomePageProps {
  onStart: () => void;
}

const FEATURED_BOOKS = [
  {
    title: "Duna",

    author: "Frank Herbert",
    image: "/images/duna.jpg",
    style: { top: '15%', left: '8%', width: '180px', zIndex: 10, rotate: '-8deg' },
    escape: [-1.8, -2.2, -40]
  },
  {
    title: "1984",
    author: "George Orwell",
    image: "/images/1984.jpg",
    style: { top: '60%', left: '10%', width: '150px', zIndex: 5, rotate: '12deg' },
    escape: [-2.8, 1, 50]
  },
  {
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    style: { top: '18%', right: '10%', width: '160px', zIndex: 8, rotate: '6deg' },
    escape: [2.2, -2, 30]
  },
  {
    title: "Kafka à Beira-Mar",
    author: "Haruki Murakami",
    image: "/images/kafka.jpg",
    style: { bottom: '20%', right: '12%', width: '200px', zIndex: 12, rotate: '-5deg' },
    escape: [2.8, 2.8, -30]
  },
  {
    title: "Dom Casmurro",
    author: "Machado de Assis",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    style: { bottom: '10%', left: '28%', width: '140px', zIndex: 3, rotate: '-15deg' },
    escape: [-1.2, 3.5, -60]
  }
];

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-[180vh] bg-[#FAF9F6]">

      {/* SEÇÃO HERO */}
      <section className="sticky top-0 h-[90vh] w-full flex flex-col items-center justify-center overflow-hidden px-6">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.04)_0%,_transparent_70%)] pointer-events-none"></div>

        {/* Galeria de Livros */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {FEATURED_BOOKS.map((book, idx) => {
            const translateX = scrollY * book.escape[0];
            const translateY = scrollY * book.escape[1];
            const extraRotate = (scrollY / 10) * (book.escape[2] / 10);
            const opacity = Math.max(0, 1 - scrollY / 400);
            const blur = Math.min(8, scrollY / 60);

            return (
              <div
                key={idx}
                className="absolute hidden lg:block transition-all duration-300 ease-out"
                style={{
                  top: book.style.top,
                  left: book.style.left,
                  right: book.style.right,
                  bottom: book.style.bottom,
                  width: book.style.width,
                  zIndex: book.style.zIndex,
                  opacity: opacity,
                  filter: `blur(${blur}px)`,
                  transform: `translate(${translateX}px, ${translateY}px) rotate(${parseFloat(book.style.rotate) + extraRotate}deg)`
                }}
              >
                <div
                  className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] border border-white/40 bg-stone-100 group animate-float"
                  style={{ animationDelay: `${idx * 0.8}s` }}
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-[12px] leading-tight">{book.title}</p>
                    <p className="text-amber-400 text-[9px] font-black uppercase tracking-widest">{book.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conteúdo Central Hero */}
        <div
          className="relative z-20 max-w-3xl w-full text-center space-y-8 transition-all duration-500"
          style={{
            opacity: Math.max(0, 1 - scrollY / 300),
            transform: `translateY(${-scrollY * 0.1}px)`
          }}
        >
          <header className="space-y-4 animate-slide-up">


            <h1 className="text-5xl md:text-[6.5rem] font-serif font-bold text-stone-900 leading-[0.9] tracking-tighter">
              Descubra sua <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-900 italic">próxima história</span>
            </h1>

            <p className="max-w-lg mx-auto text-stone-500 text-base md:text-lg font-light leading-relaxed">
              O Bibliotek.IA une visão computacional e paixão por livros para revelar seu próximo match ideal diretamente da sua estante ou do mundo real.
            </p>
          </header>

          <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={onStart}
              className="group relative h-16 px-12 bg-[#1A1A1A] text-white rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl overflow-hidden mb-12"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center gap-3">
                Iniciar Jornada
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1.5 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </span>
            </button>

            {/* Seção movida mais para baixo com mt-12 e pt-8 */}
            <div className="flex items-center gap-10 mt-12 pt-8 opacity-80 border-t border-stone-100/50">
              <div className="flex flex-col items-center">
                <span className="text-xl font-serif text-stone-900">20+</span>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Gêneros</span>
              </div>
              <div className="w-px h-6 bg-stone-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-serif text-stone-900">IA Real-Time</span>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Visão</span>
              </div>
              <div className="w-px h-6 bg-stone-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-serif text-stone-900">Match</span>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Algoritmo</span>
              </div>
            </div>

            <div className="animate-bounce pt-8 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DESCRITIVA */}
      <section className="relative z-30 w-full bg-white py-24 px-6 border-t border-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.4em]">A Nova Era da Leitura</h2>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                  Encontre o livro certo no <br /><span className="italic text-amber-800">mundo real</span>
                </h3>
                <p className="text-stone-500 text-base leading-relaxed max-w-lg">
                  O Bibliotek.IA é uma ferramenta inovadora para descobrir sua próxima grande história em qualquer lugar físico ou digital.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-stone-50 rounded-xl flex items-center justify-center text-stone-800 border border-stone-100 group-hover:bg-amber-700 group-hover:text-white transition-all duration-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a48.324 48.324 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-stone-800">Explore qualquer ambiente</h4>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      Capture fotos em bibliotecas físicas, casas de amigos, estantes de colegas ou até prints de websites. Basta uma imagem dos nomes dos livros.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-stone-50 rounded-xl flex items-center justify-center text-stone-800 border border-stone-100 group-hover:bg-amber-700 group-hover:text-white transition-all duration-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-stone-800">Filtragem Inteligente por Gênero</h4>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      A Bibliotek.IA filtra automaticamente os títulos da imagem, destacando apenas o seu gênero favorito. Decida sua leitura de forma instantânea.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 bg-stone-50 rounded-xl flex items-center justify-center text-stone-800 border border-stone-100 group-hover:bg-amber-700 group-hover:text-white transition-all duration-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-stone-800">Compare com sua Coleção</h4>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      Evite duplicatas ou livros que não combinam com você. Compare os livros da foto diretamente com os que você já possui em sua biblioteca pessoal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden bg-stone-100 shadow-2xl group border border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200"
                alt="Library Atmosphere"
                className="w-full h-full object-cover grayscale opacity-70 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200">
                <p className="text-stone-800 font-serif italic text-lg leading-relaxed">
                  "Uma foto diz mais que mil palavras, e o Bibliotek.IA lê todas elas para encontrar seu próximo match."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          opacity: 0;
          animation: fade-in 1.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
