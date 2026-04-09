import { useState } from 'preact/hooks';

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
  { id: 'apasionado', label: '🔥 Apasionado', tropos: ['enemies-to-lovers', 'forbidden-love'], intensidad_min: 4 },
  { id: 'tierno', label: '🌸 Tierno y dulce', tropos: ['friends-to-lovers', 'slow-burn'], intensidad_max: 3 },
  { id: 'aventurero', label: '⚔️ Aventurero', categorias: ['fantasia', 'historica'] },
  { id: 'melancolico', label: '🌧️ Melancólico', tropos: ['unrequited-love', 'tragedy'] },
  { id: 'clasico', label: '📜 Clásico literario', categorias: ['historica'] },
];

export default function MoodRecommender({ libros }: Props) {
  const [mood, setMood] = useState<string | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<Libro[]>([]);

  function getRecomendaciones(moodId: string): Libro[] {
    const selected = moods.find(m => m.id === moodId);
    if (!selected) return [];

    return libros.filter(libro => {
      let score = 0;
      if (selected.tropos?.some(t => libro.tropos.includes(t))) score += 2;
      if (selected.categorias?.includes(libro.categoria)) score += 1;
      if (selected.intensidad_min !== undefined && libro.intensidad >= selected.intensidad_min) score += 1;
      if (selected.intensidad_max !== undefined && libro.intensidad <= selected.intensidad_max) score += 1;
      return score > 0;
    }).sort(() => Math.random() - 0.5).slice(0, 6);
  }

  function handleMood(moodId: string) {
    setMood(moodId);
    setRecomendaciones(getRecomendaciones(moodId));
  }

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

      {mood && recomendaciones.length > 0 && (
        <div>
          <h2 class="font-playfair text-xl text-epoca-marron mb-4">
            Libros para tu estado de ánimo ✨
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recomendaciones.map(libro => (
              <article key={libro.id} class="bg-white border border-epoca-violeta-claro rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <a href={`/libro/${libro.slug}`} class="block">
                  <div class="aspect-[2/3] bg-epoca-crema rounded mb-2 overflow-hidden">
                    {libro.portada ? (
                      <img src={libro.portada} alt={libro.titulo} class="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div class="w-full h-full flex items-center justify-center text-3xl">📚</div>
                    )}
                  </div>
                  <h3 class="font-semibold text-sm text-epoca-marron line-clamp-2">{libro.titulo}</h3>
                  <p class="text-xs text-epoca-marron-medio">{libro.autor}</p>
                </a>
              </article>
            ))}
          </div>
        </div>
      )}

      {mood && recomendaciones.length === 0 && (
        <p class="text-center text-epoca-marron-medio py-8">No hay recomendaciones para ese estado de ánimo todavía.</p>
      )}
    </div>
  );
}
