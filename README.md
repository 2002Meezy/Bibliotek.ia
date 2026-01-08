# 📚 Bibliotek.IA

![Bibliotek.IA Logo](assets/bibliotek-logo.jpg)

> **O seu curador literário pessoal movido por Inteligência Artificial.**

O **Bibliotek.IA** é uma aplicação web inovadora que utiliza Visão Computacional e LLMs (Large Language Models) para analisar fotos da sua estante de livros real e fornecer recomendações personalizadas, insights e gestão de leitura.

---

## ✨ Funcionalidades Principais

-   📷 **Análise Visual de Estante**: Tire uma foto dos seus livros e a IA identificará automaticamente os títulos e autores.
-   🔍 **Recomendações Inteligentes**:
    -   **Modo Estrito (OFF)**: Sugere leituras baseadas *apenas* nos livros que você já tem na estante (redescubra sua coleção).
    -   **Modo Descoberta (ON)**: Analisa seu gosto e sugere livros **novos** e inéditos que combinam com sua "vibe", garantindo que você não receba recomendações repetidas.
-   🆚 **Cruzamento de Vibes (Comparação)**: Selecione dois livros para ver como eles se conectam tematicamente.
-   📚 **Biblioteca Pessoal**: Gerencie seus livros (Lidos, Lendo, Quero Ler), filtre por gêneros e veja estatísticas.
-   🔐 **Sistema de Contas**: Login, Registro e Perfil de Usuário com persistência de dados.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna e robusta:

### Frontend (Aplicação Web)
-   **[Next.js 16](https://nextjs.org/)**: Framework React para produção (App Router).
-   **[React 19](https://react.dev/)**: Biblioteca para construção de interfaces.
-   **[TypeScript](https://www.typescriptlang.org/)**: Superset JavaScript com tipagem estática.
-   **[Tailwind CSS](https://tailwindcss.com/)**: Framework de estilização utility-first.
-   **[Prisma ORM](https://www.prisma.io/)**: ORM moderno para Node.js e TypeScript.
-   **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**: Biblioteca para hashing seguro de senhas.
-   **[Lucide React](https://lucide.dev/)**: Ícones leves e consistentes.

### Backend (Microsserviço de IA)
-   **[Python 3.10+](https://www.python.org/)**: Linguagem de programação do backend.
-   **[FastAPI](https://fastapi.tiangolo.com/)**: Framework web moderno e de alta performance.
-   **[LangChain](https://www.langchain.com/)**: Framework para orquestração de LLMs.
-   **[Pydantic](https://docs.pydantic.dev/)**: Validação de dados robusta.

### Inteligência Artificial & Infraestrutura
-   **[LM Studio](https://lmstudio.ai/)**: Servidor de inferência local (OpenAI-compatible).
-   **Modelo de Visão**: `qwen/qwen3-vl-4b` (Recomendado para análise visual).
-   **Banco de Dados**: SQLite (Integrado via Prisma).

---

## 🚀 Como Executar o Projeto

Siga este guia passo a passo para rodar o Bibliotek.IA na sua máquina.

### Pré-requisitos

1.  **Node.js** (v18 ou superior) instalado.
2.  **Python** (v3.10 ou superior) instalado.
3.  **LM Studio** instalado e configurado (Instruções abaixo).

---

### Passo 1: Configurar a IA Local (LM Studio)

1.  Baixe e instale o [LM Studio](https://lmstudio.ai/).
2.  Abra o LM Studio e baixe um modelo de visão (Vision Model).
    -   *Recomendado*: **`qwen/qwen3-vl-4b`** (ou verifique o arquivo `backend/agent.py` para ver o modelo configurado).
3.  Vá para a aba de **Server** (ícone de "<->").
4.  Inicie o servidor local na porta **1234**.
    -   Certifique-se que a URL é `http://localhost:1234`.
    -   Mantenha esta janela aberta.

### Passo 2: Instalar o Frontend (Next.js)

1.  Abra um terminal na pasta raiz do projeto.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Gere o cliente do banco de dados:
    ```bash
    npx prisma generate
    ```
4.  Crie o banco de dados local:
    ```bash
    npx prisma db push
    ```

### Passo 3: Instalar o Backend (Python)

1.  Abra um **segundo terminal** e entre na pasta `backend`:
    ```bash
    cd backend
    ```
2.  Crie um ambiente virtual (recomendado):
    ```bash
    python -m venv .venv
    ```
3.  Ative o ambiente virtual:
    -   Windows: `.venv\Scripts\activate`
    -   Mac/Linux: `source .venv/bin/activate`
4.  Instale as dependências Python:
    ```bash
    pip install -r requirements.txt
    ```
    *(Nota: Se não houver `requirements.txt`, instale manualmente: `pip install fastapi uvicorn langchain-openai python-multipart`)*

### Passo 4: Configuração de Ambiente (Opcional)

O projeto vem configurado com valores padrão (localhost), mas você pode criar arquivos `.env` para personalizar.

**No Backend (`backend/.env`):**
```env
LM_STUDIO_BASE_URL="http://localhost:1234/v1"
LM_STUDIO_MODEL="qwen/qwen3-vl-4b"
```

**No Frontend (`.env.local`):**
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

### Passo 5: Rodar a Aplicação

Este projeto utiliza uma arquitetura de 3 partes. Você precisará de **3 terminais abertos**:

**Terminal 1 (Interface - Vite):**
```bash
npm run dev
```
> O Frontend rodará em: `http://localhost:5173` (ou 3000)

**Terminal 2 (API & Auth - Next.js):**
```bash
npx next dev -p 3001
```
> A API de autenticação rodará em: `http://localhost:3001`

**Terminal 3 (Cérebro AI - Python):**
*(Dentro da pasta backend e com venv ativado)*
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
> O Backend Python rodará em: `http://localhost:8000`

---

## 🎮 Como Usar

1.  Acesse `http://localhost:3000` no seu navegador.
2.  Crie uma conta em "Entrar ou Criar Conta" > "Registre-se".
3.  Faça login.
4.  Na tela inicial, escolha seus gêneros favoritos.
5.  Tire uma foto (ou faça upload) da sua estante.
6.  Clique em **"Buscar matches na estante"**.
    -   Use o botão **"Descoberta" (Toggle)** para alternar entre recomendações da estante ou novos livros.

---

## 🆘 Solução de Problemas Comuns

-   **Erro "Connection Refused" na análise**:
    -   Verifique se o *backend Python* está rodando no terminal 2.
    -   Verifique se o *LM Studio* está rodando o servidor na porta 1234.
-   **"Failed to fetch" no Login**:
    -   Verifique se o *Next.js* está rodando no terminal 1.
-   **IA não reconhece livros**:
    -   Certifique-se de usar um modelo de **Visão** (VL) no LM Studio. Modelos apenas de texto não conseguem "ver" a imagem.
