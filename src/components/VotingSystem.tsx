import { useState, useEffect } from 'preact/hooks';
import { handleCoverError } from '../utils/cover-fallback-client';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  slug: string;
  categoria?: string;
  isbn?: string;
  portada?: string;
}

interface Props {
  libros: Libro[];
}

const CATEGORIAS = [
  { id: 'all', label: '🏆 Todos' },
  { id: 'historica', label: '🕰️ Romance histórico' },
  { id: 'romance-contemporaneo', label: '💫 Romance contemporáneo' },
  { id: 'romance-juvenil', label: '🌸 Romance juvenil' },
  { id: 'fantasia', label: '⚔️ Fantasía romántica' },
];

export default function VotingSystem({ libros }: Props) {
  const [categoriaActiva, setCategoriaActiva] = useState('all');
  const [votos, setVotos] = useState<Record<string, Record<number, number>>>({});
  const [miVoto, setMiVoto] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const savedVotos: Record<string, Record<number, number>> = {};
    const savedMiVoto: Record<string, number | null> = {};
    CATEGORIAS.forEach(cat => {
      try {
        const v = localStorage.getItem(`votos-${cat.id}`);
        if (v) savedVotos[cat.id] = JSON.parse(v);
        const mv = localStorage.getItem(`mi-voto-${cat.id}`);
        if (mv) savedMiVoto[cat.id] = parseInt(mv, 10);
        else savedMiVoto[cat.id] = null;
      } catch (_) {}
    });
    setVotos(savedVotos);
    setMiVoto(savedMiVoto);
  }, []);

  const librosFiltrados = categoriaActiva === 'all'
    ? libros
    : libros.filter(l => l.categoria === categoriaActiva);

  const votosCategoria = votos[categoriaActiva] || {};
  const miVotoCategoria = miVoto[categoriaActiva] ?? null;

  async function votar(libroId: number) {
    if (miVotoCategoria !== null) {
      setMensaje('Ya has votado en esta categoría.');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    setLoading(true);

    const nuevosVotos = { ...votosCategoria, [libroId]: (votosCategoria[libroId] || 0) + 1 };
    const newVotos = { ...votos, [categoriaActiva]: nuevosVotos };
    const newMiVoto = { ...miVoto, [categoriaActiva]: libroId };
    setVotos(newVotos);
    setMiVoto(newMiVoto);
    localStorage.setItem(`votos-${categoriaActiva}`, JSON.stringify(nuevosVotos));
    localStorage.setItem(`mi-voto-${categoriaActiva}`, String(libroId));

    try {
      await fetch('/api/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libroId, categoria: categoriaActiva }),
      });
    } catch (_) {}

    setMensaje('¡Voto registrado! Gracias por participar. 💕');
    setTimeout(() => setMensaje(''), 3000);
    setLoading(false);
  }

  const sorted = [...librosFiltrados].sort((a, b) => (votosCategoria[b.id] || 0) - (votosCategoria[a.id] || 0));
  const totalVotos = Object.values(votosCategoria).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Category selector */}
      <div class="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            class={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              categoriaActiva === cat.id
                ? 'bg-epoca-rosa text-white shadow-sm'
                : 'bg-white border border-epoca-violeta-claro text-epoca-marron hover:border-epoca-rosa'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {mensaje && (
        <div class="mb-4 p-3 bg-epoca-rosa bg-opacity-20 border border-epoca-rosa rounded-lg text-center text-sm text-epoca-marron">
          {mensaje}
        </div>
      )}

      {sorted.length === 0 && (
        <p class="text-center text-epoca-marron-medio py-8">No hay libros en esta categoría.</p>
      )}

      <div class="space-y-3">
        {sorted.map((libro, idx) => {
          const v = votosCategoria[libro.id] || 0;
          const pct = totalVotos > 0 ? Math.round((v / totalVotos) * 100) : 0;
          return (
            <div key={libro.id} class={`card-epoca flex items-center gap-3 ${miVotoCategoria === libro.id ? 'border-epoca-rosa' : ''}`}>
              <span class="text-2xl font-playfair font-bold text-epoca-violeta w-8 text-center">#{idx + 1}</span>
              <div class="w-10 h-14 bg-epoca-crema rounded overflow-hidden shrink-0">
                {libro.portada ? (
                  <img
                    src={libro.portada}
                    alt={libro.titulo}
                    class="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="40"
                    height="56"
                    onError={(e) => handleCoverError(e as unknown as Event, libro.isbn, libro.titulo, libro.autor)}
                  />
                ) : (
                  <div class="w-full h-full flex items-center justify-center text-xl">📚</div>
                )}
              </div>
              <div class="flex-1 min-w-0">
                <a href={`/libro/${libro.slug}`} class="font-semibold text-epoca-marron hover:text-epoca-rosa transition-colors text-sm block truncate">{libro.titulo}</a>
                <p class="text-xs text-epoca-marron-medio">{libro.autor}</p>
                <div class="mt-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-epoca-rosa h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-bold text-epoca-marron">{v}</p>
                <p class="text-xs text-epoca-marron-medio">votos</p>
                <button
                  onClick={() => votar(libro.id)}
                  disabled={loading || miVotoCategoria !== null}
                  class={`mt-1 text-xs px-3 py-1 rounded-full transition-colors ${
                    miVotoCategoria === libro.id ? 'bg-epoca-rosa text-white' :
                    miVotoCategoria !== null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    'bg-epoca-crema border border-epoca-rosa text-epoca-marron hover:bg-epoca-rosa hover:text-white'
                  }`}
                >
                  {miVotoCategoria === libro.id ? '✓ Votado' : '♥ Votar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
