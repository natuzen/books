export interface OpenLibraryBook {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
}

export function getCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

/**
 * Verifica si Open Library tiene una portada real para el ISBN dado.
 * Usa ?default=false para que la API devuelva HTTP 404 en lugar de la imagen
 * genérica cuando no existe portada.
 */
export async function checkOpenLibraryCoverExists(isbn: string, size: 'S' | 'M' | 'L' = 'M'): Promise<boolean> {
  try {
    const url = `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`;
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function searchBooks(query: string): Promise<OpenLibraryBook[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
    const response = await fetch(url);
    const data = await response.json() as { docs?: OpenLibraryBook[] };
    return data.docs || [];
  } catch {
    return [];
  }
}
