import { useState } from 'preact/hooks';

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
  explicacion: string;
  resultado_tipo: string;
}

interface Props {
  preguntas: Pregunta[];
}

export default function QuizApp({ preguntas }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  const [finished, setFinished] = useState(false);

  const pregunta = preguntas[current];
  const progress = (current / preguntas.length) * 100;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setMostrarExplicacion(true);
    setRespuestas([...respuestas, pregunta.resultado_tipo]);
  }

  function handleNext() {
    if (current + 1 >= preguntas.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setMostrarExplicacion(false);
    }
  }

  function getResultado() {
    const counts: Record<string, number> = {};
    respuestas.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'romantica-clasica';
  }

  const resultadoDescriptions: Record<string, {titulo: string; desc: string; emoji: string}> = {
    'romantica-clasica': { titulo: 'Romántica Clásica', desc: 'Amas los romances con cortesía, bailes de salón y declaraciones apasionadas. Jane Austen es tu escritora.', emoji: '🕊️' },
    'aventurera': { titulo: 'Lectora Aventurera', desc: 'Buscas libros que te transporten a aventuras épicas con romance incluido.', emoji: '⚔️' },
    'soñadora': { titulo: 'Soñadora Romántica', desc: 'Te pierdes en mundos fantásticos con amores imposibles y finales épicos.', emoji: '✨' },
    'apasionada': { titulo: 'Apasionada Intensa', desc: 'Los dramas y las pasiones desbordadas son tu fuerte. Cumbres Borrascosas es tu novela.', emoji: '🔥' },
  };

  if (finished) {
    const resultado = getResultado();
    const desc = resultadoDescriptions[resultado] || resultadoDescriptions['romantica-clasica'];
    return (
      <div class="text-center py-8">
        <p class="text-6xl mb-4">{desc.emoji}</p>
        <h2 class="font-playfair text-2xl text-epoca-marron mb-3">Eres una {desc.titulo}</h2>
        <p class="text-epoca-marron-medio max-w-md mx-auto">{desc.desc}</p>
        <button onClick={() => { setCurrent(0); setSelected(null); setRespuestas([]); setFinished(false); setMostrarExplicacion(false); }}
          class="mt-6 btn-primary">
          Repetir quiz
        </button>
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
              class={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selected === null ? 'border-epoca-violeta-claro hover:border-epoca-rosa hover:bg-epoca-crema' :
                idx === pregunta.respuesta_correcta ? 'border-epoca-verde bg-green-50 text-epoca-marron' :
                idx === selected ? 'border-red-300 bg-red-50 text-red-700' :
                'border-epoca-violeta-claro opacity-50'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
        {mostrarExplicacion && (
          <div class="mt-4 p-3 bg-epoca-crema rounded-lg text-sm text-epoca-marron-medio">
            {pregunta.explicacion}
          </div>
        )}
      </div>

      {selected !== null && (
        <div class="text-center">
          <button onClick={handleNext} class="btn-primary">
            {current + 1 >= preguntas.length ? 'Ver resultado' : 'Siguiente pregunta'}
          </button>
        </div>
      )}
    </div>
  );
}
