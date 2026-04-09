export interface SEOMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'book';
}

export function generateBookSchema(book: {
  titulo: string;
  autor: string;
  anio: number;
  isbn: string;
  sinopsis: string;
  portada?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.titulo,
    author: {
      '@type': 'Person',
      name: book.autor,
    },
    datePublished: String(book.anio),
    isbn: book.isbn,
    description: book.sinopsis,
    image: book.portada,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://epocayrosa.com${item.url}`,
    })),
  };
}
