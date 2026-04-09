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
