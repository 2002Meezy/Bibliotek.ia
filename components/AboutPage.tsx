
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
        <div className="md:col-span-7 space-y-12">
          <header className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-700">O Criador</span>
            <h2 className="text-6xl md:text-7xl font-serif font-bold text-stone-900 leading-[0.9]">
              Luiz <br />
              <span className="italic text-amber-800">Santiago</span>
            </h2>
          </header>

          <div className="prose prose-stone prose-lg">
            <p className="text-stone-600 leading-relaxed text-xl font-light">
              Apaixonado por como a tecnologia pode amplificar a experiência humana, Luiz Santiago concebeu o <strong>Bibliotek.IA</strong> como uma ponte entre o físico e o digital.
            </p>
            <p className="text-stone-500 leading-relaxed">
              Com background em engenharia e um amor profundo pela literatura clássica e contemporânea, Luiz percebeu que muitas vezes o maior obstáculo para uma nova leitura não é a falta de livros, mas a abundância de opções.
            </p>
            <div className="py-6 border-y border-stone-100 my-10">
              <blockquote className="text-stone-800 font-serif italic text-2xl leading-tight">
                "Acredito que cada estante conta uma história única sobre quem somos. Minha missão é ajudar você a ler cada capítulo dessa jornada."
              </blockquote>
            </div>
            <p className="text-stone-500 leading-relaxed">
              O projeto nasceu da vontade de aplicar Inteligência Artificial para resolver um problema romântico: decidir qual universo habitar na próxima noite de leitura. Através do Bibliotek.IA, Luiz une visão computacional e curadoria inteligente para transformar qualquer biblioteca em uma experiência personalizada.
            </p>
          </div>

          <div className="flex items-center gap-6 pt-8">
            <a href="https://github.com/2002Meezy" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-amber-700 hover:border-amber-700 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/luiz-santiago-43153b30b/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-amber-700 hover:border-amber-700 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H3.337v7.225h1.606zm-1.56-8.122c.56 0 .902-.372.902-.837 0-.475-.342-.838-.882-.838-.54 0-.902.363-.902.838 0 .465.342.837.863.837h.019zM13.474 13.394v-4.13c0-2.212-1.181-3.242-2.755-3.242-1.27 0-1.84.699-2.158 1.192v-1.026H6.963c.021.452 0 7.225 0 7.225h1.603V9.562c0-.204.015-.407.074-.554.164-.407.537-.828 1.164-.828.821 0 1.149.625 1.149 1.543v3.671h1.603z" />
              </svg>
            </a>
            <a href="https://huggingface.co/2hunna" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-amber-700 hover:border-amber-700 transition-all">
              <span className="text-xl">🤗</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-stone-100 shadow-2xl group border border-stone-100">
            <div className="absolute inset-0 bg-stone-200 animate-pulse" />
            <img
              src="/images/luiz_santiago.jpg"
              alt="Luiz Santiago"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent z-20" />
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Desenvolvendo Novas Features</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
