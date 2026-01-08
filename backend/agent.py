from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import List, Optional
import json
import base64

import os

# Configuration
LM_STUDIO_BASE_URL = os.getenv("LM_STUDIO_BASE_URL", "http://localhost:1234/v1")
LM_STUDIO_Model = os.getenv("LM_STUDIO_MODEL", "qwen/qwen3-vl-4b")

def get_llm():
    """Configures and returns the LangChain ChatOpenAI client for LM Studio."""
    return ChatOpenAI(
        base_url=LM_STUDIO_BASE_URL,
        api_key="lm-studio",
        model=LM_STUDIO_Model,
        temperature=0.3, # Lower temperature for better JSON adherence
        max_tokens=2048  # Defined limit to prevent allocation errors
    )

async def analyze_bookshelf(image_data: str, genres: List[str], feeling_lucky: bool = False) -> dict:
    """
    Router function that dispatches to the appropriate agent based on the mode.
    """
    if feeling_lucky:
        print("[Backend] Routing to DISCOVERY Agent...")
        return await _discovery_agent(image_data, genres)
    else:
        print("[Backend] Routing to STRICT Agent...")
        return await _strict_agent(image_data, genres)

async def _strict_agent(image_data: str, genres: List[str]) -> dict:
    """
    Strict Agent: focus purely on identifying books PRESENT in the image.
    """
    # Clean base64 string
    if "," in image_data:
        image_data = image_data.split(",")[1]

    is_all_selected = "Todos" in genres
    genre_instruction = (
        "O usuário selecionou 'Todos'. IMPORTANTE: Não aplique NENHUM filtro. "
        "TODOS os livros que você conseguir identificar na foto devem ser incluídos."
        if is_all_selected else 
        f"O usuário busca livros nestes gêneros: {', '.join(genres)}. "
        "Examine os livros da foto e inclua em 'recommendations' APENAS aqueles que pertencem a esses gêneros."
    )
    
    system_prompt = f"""Você é um especialista bibliotecário e "vision user". Sua tarefa é ler títulos de livros em imagens e filtrar leituras.

REGRA DE OURO (CRÍTICA):
NUNCA, sob hipótese alguma, invente ou sugira livros que não estão visíveis na imagem. 
Sua função é APENAS filtrar o que você está vendo. Se você não vê o livro na foto, NÃO o recomende.

REGRAS:
1. IDENTIFICAÇÃO: Liste TODOS os livros legíveis em 'identifiedBooks'.
2. FILTRAGEM DE RECOMENDAÇÃO: {genre_instruction}
   - Se o usuário escolheu um gênero, verifique quais dos livros IDENTIFICADOS pertencem a esse gênero.
   - Coloque em 'recommendations' APENAS os livros da lista 'identifiedBooks' que derem match.
   - NUNCA adicione livros externos.
3. RETORNO: Apenas JSON puro.
""".strip()

    user_prompt = """Analise esta imagem da minha estante.
    
Responda com este schema JSON EXATO:
{
  "identifiedBooks": [{ "title": "...", "author": "..." }],
  "userProfileSummary": "Breve análise do gosto do usuário baseado nos livros",
  "noMatchesFound": false,
  "recommendations": [{
    "title": "...",
    "author": "...",
    "description": "...",
    "genre": "...",
    "recommendationReason": "..."
  }]
}
SE NENHUM LIVRO FOR IDENTIFICADO OU SE NENHUM DER MATCH COM O GÊNERO:
Retorne { "noMatchesFound": true }
"""
    return await _call_vlm(image_data, system_prompt, user_prompt)

async def _discovery_agent(image_data: str, genres: List[str]) -> dict:
    """
    Discovery Agent: Identifies books to exclude them, then generates NOVEL recommendations.
    """
    # Step 1: VLM Check - Quick scan to know what NOT to recommend
    # We reuse strict agent logic but we only care about 'identifiedBooks'
    print("[Discovery Agent] Step 1: Scanning shelf to build blocklist...")
    strict_result = await _strict_agent(image_data, ["Todos"]) # Scan everything
    
    identified_books = strict_result.get("identifiedBooks", [])
    blocklist_titles = [b.get("title") for b in identified_books]
    print(f"[Discovery Agent] Blocklist created: {len(blocklist_titles)} books found.")

    # Step 2: Generative Agent - Suggest NEW books
    print("[Discovery Agent] Step 2: Generating novel recommendations...")
    
    llm = get_llm()
    
    prompt = f"""Você é um Curador Literário Especialista em descobertas.
O usuário gosta dos gêneros: {', '.join(genres)}.

O usuário JÁ POSSUI estes livros (NÃO RECOMENDE ELES):
{', '.join(blocklist_titles)}

Sua missão:
Recomende 5 livros INCRÍVEIS que combinem com o gosto do usuário mas que sejam NOVIDADES para ele.
Foque em livros com 'vibe' similar mas que NÃO estejam na lista acima.

Retorne APENAS um JSON:
{{
  "identifiedBooks": {json.dumps(identified_books)}, 
  "userProfileSummary": "Baseado na sua estante, você parece gostar de...",
  "recommendations": [
    {{
      "title": "...",
      "author": "...",
      "description": "...",
      "genre": "...",
      "recommendationReason": "..."
    }}
  ]
}}"""

    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        content = response.content
        
        # Cleanup JSON
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1:
            json_str = content[start:end+1]
            parsed_result = json.loads(json_str)

            # --- HARD FILTERING ---
            # Verify that the LLM actually obeyed the blocklist
            generated_recs = parsed_result.get("recommendations", [])
            
            # Helper to normalize
            def normalize(s): return s.lower().strip() if s else ""
            
            blocklist_norm = [normalize(t) for t in blocklist_titles]
            
            final_recs = []
            for rec in generated_recs:
                rec_title = normalize(rec.get("title"))
                # Check for exact or fuzzy match in blocklist
                is_blocked = False
                for blocked in blocklist_norm:
                    if rec_title == blocked or (len(rec_title) > 5 and rec_title in blocked) or (len(blocked) > 5 and blocked in rec_title):
                        is_blocked = True
                        print(f"[Discovery Agent] Blocked duplicate: {rec.get('title')}")
                        break
                
                if not is_blocked:
                    final_recs.append(rec)
            
            # --- FALLBACK ---
            if not final_recs:
                print("[Discovery Agent] All AI suggestions were blocked. Using Genre Fallback.")
                final_recs = await suggest_books_by_genre(genres)
            
            parsed_result["recommendations"] = final_recs
            # Ensure identifiedBooks is passed through so frontend knows what we saw
            parsed_result["identifiedBooks"] = identified_books 
            
            return parsed_result
        
        # Fallback if JSON fails
        return strict_result 
    except Exception as e:
        print(f"[Discovery Agent] Error: {e}")
        return strict_result

async def _call_vlm(image_data: str, system_prompt: str, user_prompt: str) -> dict:
    """Helper to call VLM with common error handling"""
    image_url = f"data:image/jpeg;base64,{image_data}"
    llm = get_llm()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=[
            {"type": "text", "text": user_prompt},
            {"type": "image_url", "image_url": {"url": image_url}},
        ])
    ]

    print(f"[Backend] Sending request to LM Studio ({LM_STUDIO_Model})...")
    try:
        response = await llm.ainvoke(messages)
        content = response.content
    except Exception as e:
        print(f"[Backend] LLM Connection Error: {e}")
        return {
            "noMatchesFound": True,
            "error": f"Failed to connect to AI server (LM Studio): {str(e)}",
            "raw_content": ""
        }
    
    print(f"[Backend] Received response length: {len(content)}")
    
    # Parse JSON (Robust cleanup)
    try:
        clean_text = content.replace("```json", "").replace("```", "").strip()
        # Find the first { and last } to extract JSON if there's extra text
        start_idx = clean_text.find("{")
        end_idx = clean_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            clean_text = clean_text[start_idx:end_idx+1]
            
        parsed_result = json.loads(clean_text)
        return parsed_result
    except json.JSONDecodeError as e:
        print(f"[Backend] JSON Parse Error: {e}")
        print(f"[Backend] Raw Content: {content}")
        return {
            "noMatchesFound": True,
            "error": "Failed to parse AI response. Check server logs for raw output.",
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

async def suggest_books_by_genre(genres: List[str]) -> List[dict]:
    """
    Fallback function: Generates book recommendations based ONLY on genres.
    Used when visual analysis fails to provide unique suggestions.
    """
    llm = get_llm()
    
    prompt = f"""Você é um livreiro experiente.
O usuário gosta dos gêneros: {', '.join(genres)}.

Recomende 5 livros EXCELENTES e VARIADOS desses gêneros.
Foque em clássicos modernos ou best-sellers aclamados pela crítica.
NÃO recomende livros muito obscuros.

Retorne APENAS um JSON array puro como este:
[
  {{
    "title": "Título",
    "author": "Autor",
    "description": "Breve sinopse...",
    "genre": "Gênero principal",
    "recommendationReason": "Por que é um clássico do gênero..."
  }}
]"""

    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        content = response.content
        
        # Cleanup JSON
        start = content.find('[')
        end = content.rfind(']')
        if start != -1 and end != -1:
            json_str = content[start:end+1]
            return json.loads(json_str)
        return []
    except Exception as e:
        print(f"[Backend] Fallback Error: {e}")
        return []
