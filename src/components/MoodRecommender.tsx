import { useState, useCallback } from 'preact/hooks';

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
  portada?: string;
}

interface Mood {
  id: string;
  label: string;
  tropos?: string[];
  categorias?: string[];
  intensidad_min?: number;
  intensidad_max?: number;
}

interface Props {
  libros: Libro[];
}

const moods: Mood[] = [
  { id: 'nostalgico', label: '🕰️ Nostálgico', tropos: ['second-chance', 'slow-burn'], categorias: ['historica'] },
  { id: 'apasionado', label: '🔥 Apasionado', tropos: ['enemies-to-lovers', 'forbidden-love', 'dark-romance'], intensidad_min: 4 },
  { id: 'tierno', label: '🌸 Tierno y dulce', tropos: ['friends-to-lovers', 'slow-burn', 'bookish-romance'], intensidad_max: 3 },
  { id: 'aventurero', label: '⚔️ Aventurero', categorias: ['fantasia', 'historica'], tropos: ['fantasy-romance'] },
  { id: 'melancolico', label: '🌧️ Melancólico', tropos: ['unrequited-love', 'tragedy', 'second-chance'] },
  { id: 'contemporaneo', label: '💫 Romance actual', categorias: ['romance-juvenil', 'romance-contemporaneo'] },
];

function getPool(moodId: string, libros: Libro[]): Libro[] {
  const selected = moods.find(m => m.id === moodId);
  if (!selected) return [];

  return libros.filter(libro => {
    let score = 0;
    if (selected.tropos?.some(t => libro.tropos.includes(t))) score += 2;
    if (selected.categorias?.includes(libro.categoria)) score += 1;
    if (selected.intensidad_min !== undefined && libro.intensidad >= selected.intensidad_min) score += 1;
    if (selected.intensidad_max !== undefined && libro.intensidad <= selected.intensidad_max) score += 1;
    return score > 0;
  });
}

export default function MoodRecommender({ libros }: Props) {
  const [mood, setMood] = useState<string | null>(null);
  const [pool, setPool] = useState<Libro[]>([]);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [recomendacion, setRecomendacion] = useState<Libro | null>(null);

  function pickRandom(candidates: Libro[], exclude: Set<number>): Libro | null {
    const available = candidates.filter(l => !exclude.has(l.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  function handleMood(moodId: string) {
    const newPool = getPool(moodId, libros);
    setMood(moodId);
    setPool(newPool);
    setShown(new Set());
    const first = pickRandom(newPool, new Set());
    setRecomendacion(first);
    if (first) setShown(new Set([first.id]));
  }

  function handleOtroMas() {
    const next = pickRandom(pool, shown);
    if (next) {
      setRecomendacion(next);
      setShown(prev => new Set([...prev, next.id]));
    } else {
      // All shown, reset
      const reset = pickRandom(pool, new Set());
      setRecomendacion(reset);
      if (reset) setShown(new Set([reset.id]));
    }
  }

  const remaining = pool.filter(l => !shown.has(l.id)).length;

  return (
    <div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {moods.map(m => (
          <button
            key={m.id}
            onClick={() => handleMood(m.id)}
            class={`p-4 rounded-xl border-2 text-left transition-all ${
              mood === m.id
                ? 'border-epoca-rosa bg-epoca-rosa bg-opacity-10 shadow-md'
                : 'border-epoca-violeta-claro hover:border-epoca-rosa hover:bg-epoca-crema'
            }`}
          >
            <span class="block text-2xl mb-1">{m.label.split(' ')[0]}</span>
            <span class="text-sm font-medium text-epoca-marron">{m.label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>

      {mood && recomendacion && (
        <div class="max-w-sm mx-auto">
          <h2 class="font-playfair text-xl text-epoca-marron mb-4 text-center">
            📖 Te recomendamos...
          </h2>
          <a
            href={`/libro/${recomendacion.slug}`}
            class="block card-epoca hover:border-epoca-rosa transition-all group"
          >
            <div class="aspect-[2/3] bg-epoca-crema rounded-lg overflow-hidden mb-4 max-w-[180px] mx-auto">
              {recomendacion.portada ? (
                <img
                  src={recomendacion.portada}
                  alt={recomendacion.titulo}
                  class="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width="180"
                  height="270"
                />
              ) : (
                <div class="w-full h-full flex items-center justify-center text-5xl">📚</div>
              )}
            </div>
            <h3 class="font-playfair font-bold text-lg text-epoca-marron group-hover:text-epoca-rosa transition-colors text-center mb-1">
              {recomendacion.titulo}
            </h3>
            <p class="text-sm text-epoca-marron-medio text-center mb-3">{recomendacion.autor} · {recomendacion.anio}</p>
            <p class="text-sm text-epoca-marron-medio leading-relaxed line-clamp-3 mb-3">{recomendacion.sinopsis}</p>
            <p class="text-xs text-epoca-rosa text-center">Ver ficha completa →</p>
          </a>

          <div class="text-center mt-4 space-y-2">
            <button
              onClick={handleOtroMas}
              class="btn-primary"
            >
              {remaining > 0 ? `Descubrir otro (${remaining} más)` : 'Otro más ✨'}
            </button>
          </div>
        </div>
      )}

      {mood && !recomendacion && (
        <p class="text-center text-epoca-marron-medio py-8">No hay recomendaciones para ese estado de ánimo todavía.</p>
      )}
    </div>
  );
}
