from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from typing import List, Optional
import json
import base64

# Configuration
LM_STUDIO_BASE_URL = "http://localhost:1234/v1"
LM_STUDIO_Model = "qwen/qwen3-vl-4b"

def get_llm():
    """Configures and returns the LangChain ChatOpenAI client for LM Studio."""
    return ChatOpenAI(
        base_url=LM_STUDIO_BASE_URL,
        api_key="lm-studio",  # Dummy key
        model=LM_STUDIO_Model,
        temperature=0.7,
        max_tokens=-1
    )

async def analyze_bookshelf(image_data: str, genres: List[str]) -> dict:
    """
    Analyzes a bookshelf image using the local LLM.
    image_data: base64 string
    genres: list of selected genres
    """
    
    # Clean base64 string if header is present
    if "," in image_data:
        image_data = image_data.split(",")[1]
        
    # Construct prompt
    is_all_selected = "Todos" in genres
    genre_instruction = (
        "O usuário selecionou 'Todos'. IMPORTANTE: Não aplique NENHUM filtro. "
        "TODOS os livros que você conseguir identificar na foto devem ser incluídos."
        if is_all_selected else 
        f"O usuário busca livros nestes gêneros: {', '.join(genres)}. "
        "Examine os livros da foto e inclua em 'recommendations' APENAS aqueles que pertencem a esses gêneros."
    )
    
    prompt_text = f"""Aja como um curador literário pessoal de elite. Sua tarefa é analisar a foto da estante enviada pelo usuário.

REGRAS OBRIGATÓRIAS:
1. IDENTIFICAÇÃO: Liste em 'identifiedBooks' todos os títulos e autores legíveis.
2. RECOMENDAÇÃO: A seção 'recommendations' deve conter EXCLUSIVAMENTE livros visíveis na foto.
3. FILTRO: {genre_instruction}
4. DETALHAMENTO: Para cada recomendação, inclua descrição, gênero e um motivo ('recommendationReason').
5. ERRO: Se não identificar nada, defina 'noMatchesFound' como true.

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown ou explicações.

Schema JSON esperado:
{{
  "identifiedBooks": [{{ "title": "string", "author": "string" }}],
  "userProfileSummary": "string",
  "noMatchesFound": boolean,
  "recommendations": [{{
    "title": "string",
    "author": "string",
    "description": "string",
    "genre": "string",
    "recommendationReason": "string"
  }}]
}}"""

    # Image URL format for OpenAI compatible vision models
    image_url = f"data:image/jpeg;base64,{image_data}"

    llm = get_llm()
    
    message = HumanMessage(
        content=[
            {"type": "text", "text": prompt_text},
            {"type": "image_url", "image_url": {"url": image_url}},
        ]
    )

    print(f"[Backend] Sending request to LM Studio ({LM_STUDIO_Model})...")
    try:
        response = await llm.ainvoke([message])
        content = response.content
    except Exception as e:
        print(f"[Backend] LLM Connection Error: {e}")
        return {
            "noMatchesFound": True,
            "error": f"Failed to connect to AI server (LM Studio): {str(e)}",
            "raw_content": ""
        }
    
    print(f"[Backend] Received response length: {len(content)}")
    
    # Parse JSON
    try:
        clean_text = content.replace("```json", "").replace("```", "").strip()
        parsed_result = json.loads(clean_text)
        return parsed_result
    except json.JSONDecodeError as e:
        print(f"[Backend] JSON Parse Error: {e}")
        print(f"[Backend] Raw Content: {content}")
        return {
            "noMatchesFound": True,
            "error": "Failed to parse AI response",
            "raw_content": content
        }

async def compare_books(book_a: dict, book_b: dict) -> str:
    prompt_text = (
        f"Compare o livro \"{book_a.get('title')}\" ({book_a.get('author')}) "
        f"com \"{book_b.get('title')}\" ({book_b.get('author')}). "
        "Explique as conexões temáticas e por que quem gostou de um provavelmente apreciará o outro."
    )
    
    llm = get_llm()
    response = await llm.ainvoke([HumanMessage(content=prompt_text)])
    return response.content
