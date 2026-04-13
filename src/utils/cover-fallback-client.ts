import { normalizeThumbnail } from './google-books';

/**
 * Fallback de portada para componentes cliente (Preact).
 *
 * Orden de resolución:
 *   1. Open Library (URL en el prop `portada` — ya en el src de la imagen)
 *   2. Google Books por ISBN
 *   3. Google Books por título/autor
 *   4. Si no hay portada: llama a `onFallback()` si se proporcionó, o muestra 📚 por defecto
 */
export async function handleCoverError(
  e: Event,
  isbn?: string,
  titulo?: string,
  autor?: string,
  onFallback?: () => void
): Promise<void> {
  const img = e.currentTarget as HTMLImageElement;

  // 1. Intentar Google Books por ISBN
  if (isbn) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
      );
      const data = (await res.json()) as {
        items?: Array<{ volumeInfo?: { imageLinks?: { thumbnail?: string } } }>;
      };
      const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (thumb) { img.src = normalizeThumbnail(thumb); return; }
    } catch { /* continuar con el siguiente fallback */ }
  }

  // 2. Intentar Google Books por título/autor
  if (titulo) {
    try {
      let q = `intitle:${encodeURIComponent(titulo)}`;
      if (autor) q += `+inauthor:${encodeURIComponent(autor)}`;
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`
      );
      const data = (await res.json()) as {
        items?: Array<{ volumeInfo?: { imageLinks?: { thumbnail?: string } } }>;
      };
      const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (thumb) { img.src = normalizeThumbnail(thumb); return; }
    } catch { /* continuar con el placeholder */ }
  }

  // 3. Mostrar placeholder
  if (onFallback) {
    onFallback();
  } else {
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'w-full h-full flex items-center justify-center';
      placeholder.innerHTML = '<span class="text-4xl">📚</span>';
      parent.appendChild(placeholder);
    }
  }
}
