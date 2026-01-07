# Configuração do LM Studio com LangChain - Bibliotek.IA

## 📋 Pré-requisitos

1. **LM Studio** instalado e rodando
2. Modelo de visão **Qwen VL** (qwen/qwen3-vl-4b) baixado
3. Servidor local do LM Studio ativado na porta **1234**

## 🔧 Configuração do LM Studio

### 1. Baixar o Modelo
- Abra o LM Studio
- Vá em "Discover" ou "Search"
- Procure por: `qwen3-vl-4b` ou `qwen/qwen3-vl-4b`
- Baixe o modelo (pode levar alguns minutos dependendo da conexão)

### 2. Carregar o Modelo
- Na aba "Models", selecione o modelo `qwen/qwen3-vl-4b`
- Clique em "Load Model"
- **IMPORTANTE**: Verifique se o adaptador de visão (`mmproj`) está ativado
  - Deve aparecer uma indicação visual de que a visão está habilitada

### 3. Iniciar o Servidor Local
- Vá na aba "Local Server"
- Clique em "Start Server"
- Confirme que está rodando na porta **1234**
- O status deve ficar **verde** indicando que está online

## 🚀 Arquitetura LangChain

A aplicação agora usa **LangChain** para se comunicar com o LM Studio:

### Componentes Principais

1. **ChatOpenAI**: Cliente LangChain configurado para o endpoint local
   - Base URL: `/v1` (via proxy do Vite)
   - Modelo: `qwen/qwen3-vl-4b`
   
2. **HumanMessage**: Estrutura de mensagens com suporte a visão
   - Texto: Prompt de curadoria literária
   - Imagem: Base64 da foto processada
   
3. **Proxy Vite**: Redirecionamento de `/v1` para `localhost:1234`
   - Resolve problemas de CORS
   - Transparente para o navegador

### Fluxo de Execução

```
[Browser] → [Vite Dev Server:3000] → [Proxy /v1] → [LM Studio:1234]
    ↑                                                       ↓
    └─────────────── [LangChain Response] ──────────────────┘
```

## 📸 Como Usar

1. Acesse `http://localhost:3000`
2. Selecione os gêneros que gosta
3. **Tire uma foto da sua estante** (pelo navegador)
4. Clique em "Buscar matches na estante"
5. Aguarde o processamento (pode levar 10-30 segundos)

**Nota**: A foto é enviada pelo navegador, *não* diretamente no LM Studio.

## 🐛 Troubleshooting

### "Failed to fetch"
- Verifique se o LM Studio está rodando
- Confirme que o servidor local está verde
- Reinicie o servidor Vite: `npm run dev`

###" messages field is required"
- Verifique se o modelo está carregado corretamente
- Confirme que o `mmproj` está ativo
- Tente recarregar o modelo no LM Studio

### Resposta lenta
- Normal! Modelos locais demoram mais que APIs em nuvem
- GPU acelera, mas CPU funciona (mais lento)
- Imagens grandes tomam mais tempo

## 📦 Dependências Instaladas

```json
{
  "langchain": "^0.x.x",
  "@langchain/core": "^0.x.x",
  "@langchain/community": "^0.x.x"
}
```

## 🔍 Logs de Debug

O console do navegador mostrará logs do LangChain:
- `[LangChain] Initializing ChatOpenAI model...`
- `[LangChain] Creating vision message...`
- `[LangChain] Invoking model...`
- `[LangChain] Success!`

Monitore esses logs para identificar problemas.
