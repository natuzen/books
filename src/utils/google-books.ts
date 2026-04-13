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
    if (thumbnail) {
      // Forzar HTTPS y solicitar imagen de mayor tamaño (zoom=2)
      const secureUrl = thumbnail.replace('http://', 'https://');
      try {
        const parsed = new URL(secureUrl);
        parsed.searchParams.set('zoom', '2');
        return parsed.toString();
      } catch {
        return secureUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}
