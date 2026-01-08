import { Book, RecommendationResponse } from "../types";

const API_BASE_URL = 'http://localhost:3001/api/ai';

export const analyzeBookshelf = async (
  base64Image: string,
  selectedGenres: string[],
  feelingLucky: boolean = false
): Promise<RecommendationResponse> => {
  try {
    console.log("[GeminiService] Sending request to Python Backend...");

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64Image,
        genres: selectedGenres,
        feelingLucky,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GeminiService] Backend Error:", errorText);
      throw new Error(`Erro no backend: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[GeminiService] Received data:", data);
    return data;

  } catch (error: any) {
    console.error("[GeminiService] Error:", error);
    throw new Error(error?.message || "Erro de conexão com o servidor Python.");
  }
};

export const compareBooks = async (bookA: Book, bookB: Book): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookA,
        bookB,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao comparar livros");
    }

    const data = await response.json();
    return data.comparison;
  } catch (error) {
    console.error("[GeminiService] Comparison error:", error);
    return "Não foi possível gerar a comparação no momento.";
  }
};
