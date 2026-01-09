# 📚 Bibliotek.IA – Seu curador pessoal de livros com Inteligência Artificial

![Bibliotek.IA Logo](assets/bibliotek-logo.jpg)

![GitHub stars](https://img.shields.io/github/stars/2002Meezy/Bibliotek.ia?style=social)
![GitHub license](https://img.shields.io/github/license/2002Meezy/Bibliotek.ia)
![Status](https://img.shields.io/badge/status-stable-green)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Next.js](https://img.shields.io/badge/next.js-16-black)

> **O seu curador literário pessoal movido por Inteligência Artificial.**

---

## 📋 Tabela de Conteúdos

- [Visão Geral](#-visão-geral)
- [Funcionalidades e UX](#-demo--experiência-do-usuário)
- [Como funciona: O Pipeline Técnico](#-como-funciona-o-pipeline-técnico)
- [Exemplo de Uso](#-exemplo-de-uso)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Instalação e Execução](#-como-executar-o-projeto)
- [Roadmap](#-roadmap--próximos-passos)
- [Contribuição](#-contribuindo)

---

## 🧠 Visão Geral

**Bibliotek.IA** é uma aplicação web multimodal que revoluciona a forma como interagimos com nossas estantes. Ao unir **Visão Computacional** e **Large Language Models (LLMs)**, o sistema identifica instantaneamente os livros que você possui e age como um livreiro experiente, sugerindo novas leituras que complementam sua coleção ou descobrindo universos inteiramente novos.

O projeto foca em privacidade (rodando modelos localmente), personalização e uma experiência de usuário fluida e moderna.

---

## 🎞️ Demo & Experiência do Usuário

### 1. Login & Autenticação
![Login](assets/login.gif)
> **A Experiência**: O acesso é simples e seguro. Ao entrar, o "bibliotecário digital" carrega instantaneamente seu perfil, recuperando seu histórico literário e preferências, para que cada sessão pareça uma continuação natural da sua jornada de leitura.

### 2. Painel Administrativo
![Painel Admin](assets/painel-admin.gif)
> **A Experiência**: O controle total nas mãos do administrador. Com um design limpo e métricas visuais, é possível monitorar o crescimento da comunidade de leitores e gerenciar o acesso ao sistema, garantindo um ambiente saudável e organizado.

### 3. Biblioteca Pessoal
![Biblioteca](assets/biblioteca.gif)
> **A Experiência**: Sua estante digital, organizada sem esforço. Visualize sua coleção com capas vibrantes, mova livros de "Quero Ler" para "Lidos" com um clique e mantenha o controle de suas metas literárias em um ambiente visualmente rico e livre de planilhas chatas.

### 4. Fluxo de Identificação (Modo Estrito)
![Main Flow](assets/main.gif)
> **A Experiência**: A magia da visão computacional. Basta uma foto da sua estante bagunçada, e em segundos o sistema lista tudo o que você tem. No Modo Estrito, ele atua como um curador da sua própria coleção, dizendo: *"Com base no que você já tem aqui, este é o próximo livro da sua prateleira que você deveria pegar."*

### 5. Modo "Estou Sentindo Sorte" (Descoberta)
![Descobrir](assets/descobrir.gif)
> **A Experiência**: A quebra da bolha. O sistema analisa o que você tem não para recomendar o mesmo, mas para entender quem você é — e então te surpreender. Ele ignora o que já está na estante para buscar, no vasto mundo da literatura, aquele livro inédito que é a peça que faltava no seu quebra-cabeça literário.

### 6. Cruzamento de Vibes
![Cruzando Vibe](assets/cruzando-vibe.gif)
> **A Experiência**: Conexões inesperadas. Escolha `Dom Casmurro` e `Neuromancer`, e veja a IA traçar paralelos fascinantes sobre narradores não confiáveis e realidades simuladas. É uma ferramenta para expandir sua visão crítica e encontrar beleza nas intersecções entre gêneros.

---

## 🔬 Como funciona: O Pipeline Técnico

Para quem gosta de saber o que acontece "debaixo do capô", o Bibliotek.IA utiliza um pipeline modular sofisticado:

1.  **Entrada Multimodal**: A imagem da estante é capturada e convertida em base64.
2.  **Vision-Language Model (VLM)**: Utilizamos o modelo `qwen/qwen3-vl-4b` via LM Studio. Este modelo é capaz de "ler" a imagem, identificando texto nas lombadas e capas, mesmo em ângulos difíceis.
3.  **Processamento Semântico (LangChain)**:
    *   **Identificação**: O output cru do VLM é normalizado em uma lista estruturada de JSON (título, autor).
    *   **Filtragem de Gênero**: Se o usuário selecionou "Terror", filtramos apenas os livros identificados que correspondem a esse embedding semântico.
4.  **Generative Recommendation Engine**:
    *   No **Modo Descoberta**, criamos uma "Blocklist" com os livros identificados.
    *   O Prompt enviado ao LLM instrui explicitamente: *"Recomende livros com alta similaridade vetorial ao gosto do usuário, mas com Distância de Levenshtein = 0 para a Blocklist"* (ou seja, nada repetido).
5.  **Resposta Estruturada**: O backend Python retorna um payload JSON limpo para o frontend React renderizar.

---

## 💻 Exemplo de Uso

Para entender o output do sistema sem precisar rodar:

**Entrada (Foto da Estante):**
*Contém: "O Senhor dos Anéis", "O Hobbit", "Duna"*

**Processamento & Saída (JSON):**
```json
{
  "identifiedBooks": [
    { "title": "O Senhor dos Anéis", "author": "J.R.R. Tolkien" },
    { "title": "Duna", "author": "Frank Herbert" }
  ],
  "userProfileSummary": "Fã de construção de mundos densos e épicos de ficção especulativa.",
  "recommendations": [
    {
      "title": "A Roda do Tempo",
      "author": "Robert Jordan",
      "description": "Uma saga épica com scope similar a Tolkien, perfeita para quem ama mundos vastos.",
      "recommendationReason": "Baseado no seu amor por Tolkien, mas expandindo para sistemas de magia mais complexos."
    }
  ]
}
```

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna e robusta:

### Frontend (Aplicação Web)
-   **[Next.js 16](https://nextjs.org/)**: Framework React para produção (App Router).
-   **[React 19](https://react.dev/)**: Biblioteca para construção de interfaces.
-   **[TypeScript](https://www.typescriptlang.org/)**: Superset JavaScript com tipagem estática.
-   **[Tailwind CSS](https://tailwindcss.com/)**: Framework de estilização utility-first.
-   **[Prisma ORM](https://www.prisma.io/)**: ORM moderno para Node.js e TypeScript.
-   **[Lucide React](https://lucide.dev/)**: Ícones leves e consistentes.

### Backend (Microsserviço de IA)
-   **[Python 3.10+](https://www.python.org/)**: Linguagem de programação do backend.
-   **[FastAPI](https://fastapi.tiangolo.com/)**: Framework web moderno e de alta performance.
-   **[LangChain](https://www.langchain.com/)**: Framework para orquestração de LLMs.
-   **[Pydantic](https://docs.pydantic.dev/)**: Validação de dados robusta.

### Infraestrutura AI
-   **LM Studio**: Inferência local (Custo zero, Privacidade total).
-   **Model**: `qwen/qwen3-vl-4b` (State-of-the-art em modelos de visão open-source pequenos).

---

## 🚀 Como Executar o Projeto

Siga este guia passo a passo para rodar o Bibliotek.IA na sua máquina.

### Pré-requisitos
1.  **Node.js** (v18+)
2.  **Python** (v3.10+)
3.  **LM Studio** instalado e rodando na porta 1234.

### Passo 1: Configurar a IA Local
1.  No LM Studio, carregue o modelo `qwen/qwen3-vl-4b`.
2.  Inicie o servidor local na porta **1234**.

### Passo 2: Rodar a Aplicação
Você precisará de **3 terminais abertos**:

**Terminal 1 (Interface - Vite):**
```bash
npm install && npm run dev
```

**Terminal 2 (API & Auth - Next.js):**
```bash
npx next dev -p 3001
```

**Terminal 3 (Cérebro AI - Python):**
```bash
cd backend
python -m venv .venv
# Ativar venv...
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## 📊 Roadmap / Próximos Passos

- [ ] **Integração com Goodreads**: Importar bibliotecas existentes.
- [ ] **App Mobile**: Versão React Native para facilitar tirar fotos.
- [ ] **Fine-tuning**: Treinar um adaptador LoRA específico para capas de livros brasileiros.
- [ ] **Deploy Cloud**: Containerização com Docker para deploy na AWS/Vercel.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você tem uma ideia para melhorar o algoritmo de recomendação ou a UI:

1.  Faça um **Fork** do projeto.
2.  Crie uma Branch (`git checkout -b feature/MinhaFeature`).
3.  Commit suas mudanças (`git commit -m 'Adiciona funcionalidade X'`).
4.  Push para a Branch (`git push origin feature/MinhaFeature`).
5.  Abra um **Pull Request**.

---

**Autor**: Luiz Santiago (Estudante de IA Aplicada)
*Criado com ❤️ e muito código.*
    
