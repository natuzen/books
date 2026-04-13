export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    isbn?: string;
  };
}

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
    const response = await fetch(url);
    const data = await response.json() as { items?: GoogleBook[] };
    return data.items || [];
  } catch {
    return [];
  }
}

/** Extrae y normaliza la URL de thumbnail de Google Books (fuerza HTTPS y zoom=2). */
function normalizeThumbnail(thumbnail: string): string {
  const secureUrl = thumbnail.replace('http://', 'https://');
  try {
    const parsed = new URL(secureUrl);
    parsed.searchParams.set('zoom', '2');
    return parsed.toString();
  } catch {
    return secureUrl;
  }
}

/**
 * Obtiene la URL de portada de un libro desde Google Books API usando el ISBN.
 * No requiere clave de API para uso básico (cuota gratuita: ~1000 solicitudes/día).
 * Para mayor cuota, añadir el parámetro `&key=TU_API_KEY` a la URL.
 */
export async function getGoogleBooksCoverUrl(isbn: string): Promise<string | null> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&maxResults=1`;
    const response = await fetch(url);
    const data = await response.json() as { items?: GoogleBook[] };
    const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    return thumbnail ? normalizeThumbnail(thumbnail) : null;
  } catch {
    return null;
  }
}

/**
 * Obtiene la URL de portada de un libro desde Google Books API usando título y/o autor.
 * Útil como segundo nivel de fallback cuando la búsqueda por ISBN no devuelve resultados.
 */
export async function getGoogleBooksCoverUrlByQuery(titulo: string, autor?: string): Promise<string | null> {
  try {
    let q = `intitle:${encodeURIComponent(titulo)}`;
    if (autor) q += `+inauthor:${encodeURIComponent(autor)}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`;
    const response = await fetch(url);
    const data = await response.json() as { items?: GoogleBook[] };
    const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    return thumbnail ? normalizeThumbnail(thumbnail) : null;
  } catch {
    return null;
  }
}
