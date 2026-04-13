import { useState, useMemo } from 'preact/hooks';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  anio: number;
  slug: string;
  sinopsis: string;
  tropos: string[];
  intensidad: number;
  categoria: string;
  isbn: string;
  paginas: number;
  editorial: string;
  portada?: string;
}

interface Props {
  libros: Libro[];
}

interface CoverProps {
  portada?: string;
  isbn: string;
  titulo: string;
}

function BookCoverImage({ portada, isbn, titulo }: CoverProps) {
  const [src, setSrc] = useState<string | null>(portada ?? null);
  const [fallbackTried, setFallbackTried] = useState(false);

  const handleError = () => {
    if (!fallbackTried) {
      setFallbackTried(true);
      fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&maxResults=1`)
        .then(r => r.json())
        .then((data: { items?: Array<{ volumeInfo?: { imageLinks?: { thumbnail?: string } } }> }) => {
          const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
          setSrc(thumbnail ? thumbnail.replace('http://', 'https://') : null);
        })
        .catch(() => setSrc(null));
    } else {
      setSrc(null);
    }
  };

  return src ? (
    <img
      src={src}
      alt={titulo}
      class="w-full h-full object-cover"
      loading="lazy"
      decoding="async"
      width="150"
      height="225"
      onError={handleError}
    />
  ) : (
    <div class="w-full h-full flex items-center justify-center text-4xl">📚</div>
  );
}

export default function SearchEngine({ libros }: Props) {
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tropo, setTropo] = useState('');

  const allTropos = useMemo(() => {
    const set = new Set<string>();
    libros.forEach(l => l.tropos.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [libros]);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    libros.forEach(l => set.add(l.categoria));
    return Array.from(set).sort();
  }, [libros]);

  const categoriaLabels: Record<string, string> = {
    'historica': 'Romance histórico',
    'romance-contemporaneo': 'Romance contemporáneo',
    'romance-juvenil': 'Romance juvenil',
    'fantasia': 'Fantasía romántica',
  };

  const filtered = useMemo(() => {
    return libros.filter(l => {
      if (query && !l.titulo.toLowerCase().includes(query.toLowerCase()) && !l.autor.toLowerCase().includes(query.toLowerCase())) return false;
      if (categoria && l.categoria !== categoria) return false;
      if (tropo && !l.tropos.includes(tropo)) return false;
      return true;
    });
  }, [libros, query, categoria, tropo]);

  return (
    <div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          type="search"
          placeholder="Buscar por título o autor..."
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          class="col-span-1 md:col-span-2 px-4 py-2 border border-epoca-violeta-claro rounded-lg focus:outline-none focus:border-epoca-rosa bg-white"
        />
        <select value={categoria} onChange={(e) => setCategoria((e.target as HTMLSelectElement).value)}
          class="px-4 py-2 border border-epoca-violeta-claro rounded-lg focus:outline-none focus:border-epoca-rosa bg-white">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option value={c}>{categoriaLabels[c] || c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={tropo} onChange={(e) => setTropo((e.target as HTMLSelectElement).value)}
          class="px-4 py-2 border border-epoca-violeta-claro rounded-lg focus:outline-none focus:border-epoca-rosa bg-white">
          <option value="">Todos los tropos</option>
          {allTropos.map(t => <option value={t}>{t}</option>)}
        </select>
      </div>

      <p class="text-sm text-epoca-marron-medio mb-4">{filtered.length} libro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(libro => (
          <article key={libro.id} class="bg-white border border-epoca-violeta-claro rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
            <a href={`/libro/${libro.slug}`} class="block">
              <div class="aspect-[2/3] bg-epoca-crema rounded-lg mb-2 overflow-hidden">
                <BookCoverImage portada={libro.portada} isbn={libro.isbn} titulo={libro.titulo} />
              </div>
              <h3 class="font-semibold text-sm text-epoca-marron line-clamp-2">{libro.titulo}</h3>
              <p class="text-xs text-epoca-marron-medio mt-1">{libro.autor}</p>
              <p class="text-xs text-epoca-rosa mt-1">{'♥'.repeat(libro.intensidad)}{'♡'.repeat(5-libro.intensidad)}</p>
            </a>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div class="text-center py-12">
          <p class="text-epoca-marron-medio text-lg">No se encontraron libros con esos filtros.</p>
          <button onClick={() => { setQuery(''); setCategoria(''); setTropo(''); }}
            class="mt-4 btn-primary">
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
