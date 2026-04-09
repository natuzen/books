import { useState, useEffect } from 'preact/hooks';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  slug: string;
  portada?: string;
}

interface Props {
  libros: Libro[];
  categoria: string;
}

export default function VotingSystem({ libros, categoria }: Props) {
  const [votos, setVotos] = useState<Record<number, number>>({});
  const [miVoto, setMiVoto] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`votos-${categoria}`);
    if (saved) {
      try {
        setVotos(JSON.parse(saved));
      } catch (_) {}
    }
    const savedVoto = localStorage.getItem(`mi-voto-${categoria}`);
    if (savedVoto) setMiVoto(parseInt(savedVoto, 10));
  }, [categoria]);

  async function votar(libroId: number) {
    if (miVoto !== null) {
      setMensaje('Ya has votado en esta categoría.');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    setLoading(true);
    const nuevosVotos = { ...votos, [libroId]: (votos[libroId] || 0) + 1 };
    setVotos(nuevosVotos);
    setMiVoto(libroId);
    localStorage.setItem(`votos-${categoria}`, JSON.stringify(nuevosVotos));
    localStorage.setItem(`mi-voto-${categoria}`, String(libroId));

    try {
      await fetch('/api/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libroId, categoria }),
      });
    } catch (_) {}

    setMensaje('¡Voto registrado! Gracias por participar. 💕');
    setTimeout(() => setMensaje(''), 3000);
    setLoading(false);
  }

  const sorted = [...libros].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0));
  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);

  return (
    <div>
      {mensaje && (
        <div class="mb-4 p-3 bg-epoca-rosa bg-opacity-20 border border-epoca-rosa rounded-lg text-center text-sm text-epoca-marron">
          {mensaje}
        </div>
      )}
      <div class="space-y-3">
        {sorted.map((libro, idx) => {
          const v = votos[libro.id] || 0;
          const pct = totalVotos > 0 ? Math.round((v / totalVotos) * 100) : 0;
          return (
            <div key={libro.id} class={`card-epoca flex items-center gap-3 ${miVoto === libro.id ? 'border-epoca-rosa' : ''}`}>
              <span class="text-2xl font-playfair font-bold text-epoca-violeta w-8 text-center">#{idx + 1}</span>
              <div class="w-10 h-14 bg-epoca-crema rounded overflow-hidden shrink-0">
                {libro.portada ? (
                  <img src={libro.portada} alt={libro.titulo} class="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div class="w-full h-full flex items-center justify-center text-xl">📚</div>
                )}
              </div>
              <div class="flex-1">
                <a href={`/libro/${libro.slug}`} class="font-semibold text-epoca-marron hover:text-epoca-rosa transition-colors text-sm">{libro.titulo}</a>
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
                  disabled={loading || miVoto !== null}
                  class={`mt-1 text-xs px-3 py-1 rounded-full transition-colors ${
                    miVoto === libro.id ? 'bg-epoca-rosa text-white' :
                    miVoto !== null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    'bg-epoca-crema border border-epoca-rosa text-epoca-marron hover:bg-epoca-rosa hover:text-white'
                  }`}
                >
                  {miVoto === libro.id ? '♥ Votado' : '♡ Votar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
