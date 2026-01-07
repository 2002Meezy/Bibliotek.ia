
export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  genre?: string;
  recommendationReason?: string;
  rating?: number;
  status?: 'unread' | 'reading' | 'read';
  thumbnail?: string;
  publicationYear?: string;
}

export interface RecommendationResponse {
  identifiedBooks: Book[];
  recommendations: Book[];
  userProfileSummary: string;
  noMatchesFound: boolean;
}

export const GENRES = [
  'Todos',
  'Ciência',
  'Computação',
  'Mangá/Anime',
  'Ficção Científica',
  'Fantasia',
  'Mistério/Suspense',
  'Terror',
  'Romance',
  'Histórico',
  'Biografia',
  'Autoajuda',
  'Filosofia',
  'Clássicos',
  'Poesia',
  'Não-ficção',
  'Distopia',
  'Infantojuvenil',
  'Negócios',
  'Aventura'
];
