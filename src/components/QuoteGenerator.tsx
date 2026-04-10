import { useState, useMemo } from 'preact/hooks';

interface Cita {
  id: number;
  texto: string;
  autor: string;
  obra: string;
  anio: number;
  era: string;
}

interface Props {
  citas: Cita[];
}

export default function QuoteGenerator({ citas }: Props) {
  const [filtroAutor, setFiltroAutor] = useState('');
  const [citaActual, setCitaActual] = useState<Cita>(citas[Math.floor(Math.random() * citas.length)]);

  const autores = useMemo(() => [...new Set(citas.map(c => c.autor))].sort(), [citas]);

  const filtradas = useMemo(() => {
    if (!filtroAutor) return citas;
    return citas.filter(c => c.autor === filtroAutor);
  }, [citas, filtroAutor]);

  function generarCita() {
    const pool = filtradas.length > 0 ? filtradas : citas;
    let random = pool[Math.floor(Math.random() * pool.length)];
    // Avoid showing the same quote consecutively
    if (pool.length > 1) {
      while (random.id === citaActual.id) {
        random = pool[Math.floor(Math.random() * pool.length)];
      }
    }
    setCitaActual(random);
  }

  function handleAutorChange(e: Event) {
    const autor = (e.target as HTMLSelectElement).value;
    setFiltroAutor(autor);
    // Immediately show a quote from the selected author
    const pool = autor ? citas.filter(c => c.autor === autor) : citas;
    if (pool.length > 0) {
      setCitaActual(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  return (
    <div>
      <div class="mb-6">
        <select
          value={filtroAutor}
          onChange={handleAutorChange}
          class="w-full md:w-auto px-4 py-2 border border-epoca-violeta-claro rounded-lg bg-white focus:outline-none focus:border-epoca-rosa"
        >
          <option value="">Todos los autores</option>
          {autores.map(a => <option value={a}>{a}</option>)}
        </select>
      </div>

      <div class="card-epoca bg-gradient-to-br from-epoca-crema to-white p-8 text-center mb-6 min-h-48">
        <span class="ornament text-4xl block mb-4">❝</span>
        <blockquote class="font-playfair text-xl italic text-epoca-marron leading-relaxed mb-4">
          {citaActual.texto}
        </blockquote>
        <footer class="text-sm text-epoca-marron-medio">
          — <cite class="not-italic font-medium">{citaActual.autor}</cite>
          {citaActual.obra && <span>, <em>{citaActual.obra}</em>{citaActual.anio ? ` (${citaActual.anio})` : ''}</span>}
        </footer>
      </div>

      <div class="text-center">
        <button onClick={generarCita} class="btn-primary">
          Nueva cita ✨
        </button>
      </div>
    </div>
  );
}
