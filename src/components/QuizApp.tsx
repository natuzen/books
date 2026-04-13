import { useState } from 'preact/hooks';

interface Opcion {
  texto: string;
  tags: string[];
}

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[] | Opcion[];
  respuesta_correcta?: number;
  explicacion?: string;
  resultado_tipo: string;
}

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  slug: string;
  isbn?: string;
  portada?: string;
  tropos?: string[];
  categoria?: string;
}

interface Props {
  preguntas: Pregunta[];
  libros?: Libro[];
}

const resultadoDescriptions: Record<string, { titulo: string; desc: string; emoji: string; tags: string[] }> = {
  'romantica-clasica': {
    titulo: 'Romántica Clásica',
    desc: 'Amas los romances con cortesía, bailes de salón y declaraciones apasionadas. Las historias de época y los clásicos literarios son tu debilidad.',
    emoji: '🕊️',
    tags: ['historica', 'slow-burn', 'sociedad-regencia', 'enemies-to-lovers'],
  },
  'aventurera': {
    titulo: 'Lectora Aventurera',
    desc: 'Buscas libros que te transporten a mundos nuevos y épicos con romance incluido. Las aventuras y los héroes intrépidos son lo tuyo.',
    emoji: '⚔️',
    tags: ['fantasia', 'fantasy-romance', 'adventure', 'forbidden-love'],
  },
  'soñadora': {
    titulo: 'Soñadora Romántica',
    desc: 'Te pierdes en historias contemporáneas llenas de sentimientos y finales felices. El romance moderno y las emociones intensas te atrapan.',
    emoji: '✨',
    tags: ['romance-contemporaneo', 'romance-juvenil', 'friends-to-lovers', 'second-chance'],
  },
  'apasionada': {
    titulo: 'Apasionada Intensa',
    desc: 'Los dramas y las pasiones desbordadas son tu fuerte. Las relaciones complejas, el slow burn y el dark romance te fascinan.',
    emoji: '🔥',
    tags: ['dark-romance', 'enemies-to-lovers', 'forbidden-love', 'obsessive-love'],
  },
};

export default function QuizApp({ preguntas, libros = [] }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const pregunta = preguntas[current];
  const progress = ((current) / preguntas.length) * 100;

  function getOpcionTexto(opcion: string | Opcion): string {
    if (typeof opcion === 'string') return opcion;
    return opcion.texto;
  }

  function getOpcionTags(idx: number): string[] {
    const opcion = pregunta.opciones[idx];
    if (typeof opcion === 'object' && 'tags' in opcion) return opcion.tags;
    return [pregunta.resultado_tipo];
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    
    const opcionTags = getOpcionTags(idx);
    const newTagCounts = { ...tagCounts };
    opcionTags.forEach(tag => {
      newTagCounts[tag] = (newTagCounts[tag] || 0) + 1;
    });
    setTagCounts(newTagCounts);
    setRespuestas([...respuestas, pregunta.resultado_tipo]);

    // Auto-advance after short delay
    setTimeout(() => {
      if (current + 1 >= preguntas.length) {
        setFinished(true);
      } else {
        setCurrent(current + 1);
        setSelected(null);
      }
    }, 600);
  }

  function getResultado() {
    const counts: Record<string, number> = {};
    respuestas.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'romantica-clasica';
  }

  function getLibrosRecomendados(resultado: string): Libro[] {
    const desc = resultadoDescriptions[resultado] || resultadoDescriptions['romantica-clasica'];
    const tags = desc.tags;
    
    const scored = libros.map(libro => {
      let score = 0;
      if (tags.includes(libro.categoria || '')) score += 3;
      (libro.tropos || []).forEach(t => {
        if (tags.includes(t)) score += 2;
      });
      return { libro, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || Math.random() - 0.5);
    
    return scored.slice(0, 3).map(x => x.libro);
  }

  if (finished) {
    const resultado = getResultado();
    const desc = resultadoDescriptions[resultado] || resultadoDescriptions['romantica-clasica'];
    const recomendados = getLibrosRecomendados(resultado);
    
    return (
      <div class="max-w-2xl mx-auto py-8">
        <div class="text-center mb-8">
          <p class="text-6xl mb-4">{desc.emoji}</p>
          <h2 class="font-playfair text-2xl text-epoca-marron mb-3">Eres una {desc.titulo}</h2>
          <p class="text-epoca-marron-medio max-w-md mx-auto leading-relaxed">{desc.desc}</p>
        </div>

        {recomendados.length > 0 && (
          <div class="mt-8">
            <h3 class="font-playfair text-xl text-epoca-marron mb-4 text-center">📚 Libros perfectos para ti</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recomendados.map(libro => (
                <a
                  key={libro.id}
                  href={`/libro/${libro.slug}`}
                  class="card-epoca text-center hover:border-epoca-rosa transition-all group block"
                >
                  <div class="aspect-[2/3] bg-epoca-crema rounded-lg overflow-hidden mb-3">
                    {libro.portada ? (
                      <img
                        src={libro.portada}
                        alt={libro.titulo}
                        class="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="150"
                        height="225"
                        data-isbn={libro.isbn}
                      />
                    ) : (
                      <div class="w-full h-full flex items-center justify-center text-3xl">📚</div>
                    )}
                  </div>
                  <h4 class="font-semibold text-sm text-epoca-marron group-hover:text-epoca-rosa transition-colors line-clamp-2">
                    {libro.titulo}
                  </h4>
                  <p class="text-xs text-epoca-marron-medio">{libro.autor}</p>
                  <span class="inline-block mt-2 text-xs text-epoca-rosa">Ver ficha →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div class="text-center mt-8">
          <button
            onClick={() => { setCurrent(0); setSelected(null); setRespuestas([]); setTagCounts({}); setFinished(false); }}
            class="btn-primary"
          >
            Repetir quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <div class="flex justify-between text-sm text-epoca-marron-medio mb-2">
          <span>Pregunta {current + 1} de {preguntas.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div class="w-full bg-epoca-violeta-claro rounded-full h-2">
          <div class="bg-epoca-rosa rounded-full h-2 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div class="card-epoca mb-6">
        <h2 class="font-playfair text-xl text-epoca-marron mb-6">{pregunta.pregunta}</h2>
        <div class="space-y-3">
          {pregunta.opciones.map((opcion, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              class={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selected === idx
                  ? 'border-epoca-rosa bg-epoca-rosa bg-opacity-15 text-epoca-marron scale-[1.01]'
                  : selected !== null
                  ? 'border-epoca-violeta-claro opacity-50 cursor-not-allowed'
                  : 'border-epoca-violeta-claro hover:border-epoca-rosa hover:bg-epoca-crema cursor-pointer'
              }`}
            >
              <span class="inline-flex items-center gap-2">
                {selected === idx && <span class="text-epoca-rosa">✓</span>}
                {getOpcionTexto(opcion)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
